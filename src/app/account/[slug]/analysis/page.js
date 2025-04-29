'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getBrokers, getTrades, getBrokerBySlug } from '../../../../lib/brokerService';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

export default function AccountAnalysisPage() {
  const { user, loading: authLoading } = useAuth();
  const [broker, setBroker] = useState(null);
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0], // 3 bulan terakhir
    end: new Date().toISOString().split('T')[0]
  });
  const [activePeriod, setActivePeriod] = useState('3m'); // Default 3 bulan
  const [notification, setNotification] = useState(null);
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && slug) {
      loadAccountData();
    }
  }, [user, authLoading, slug, router]);

  useEffect(() => {
    if (broker) {
      loadTrades();
    }
  }, [broker, dateRange]);

  const loadAccountData = async () => {
    try {
      setIsLoading(true);
      
      // Parse slug (format: namabroker-idakun)
      let brokerName = '';
      let accountId = '';
      
      const parts = slug.split('-');
      if (parts.length > 1) {
        // Bagian terakhir adalah ID akun, sisanya adalah nama broker
        accountId = parts[parts.length - 1];
        brokerName = parts.slice(0, -1).join('-');
      } else {
        // Jika hanya ada satu bagian, gunakan sebagai nama broker
        brokerName = slug;
      }
      
      // Ambil semua akun trading pengguna
      const accounts = await getBrokers(user.id);
      
      // Cari akun yang cocok berdasarkan nama broker dan ID akun
      const account = accounts.find(acc => {
        const formattedBrokerName = acc.broker_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
        const formattedAccountId = acc.account_id?.toString().replace(/\s+/g, '-') || acc.id;
        
        return formattedBrokerName === brokerName && formattedAccountId.toString() === accountId;
      });
      
      if (!account) {
        throw new Error('Akun trading tidak ditemukan');
      }
      
      setBroker(account);
    } catch (error) {
      console.error('Error loading broker data:', error);
      showNotification('Gagal memuat data akun: ' + (error.message || 'Terjadi kesalahan'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrades = async () => {
    try {
      setIsLoading(true);
      if (!broker || !broker.id) {
        throw new Error('Data akun trading tidak tersedia');
      }
      
      // Mengambil data trades berdasarkan broker ID dan filter tanggal
      const tradesData = await getTrades(broker.id, user.id, dateRange);
      setTrades(tradesData || []);
    } catch (error) {
      console.error('Error loading trades:', error);
      showNotification('Gagal memuat data transaksi: ' + (error.message || 'Terjadi kesalahan'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    setActivePeriod('custom');
  };

  const handlePeriodChange = (period) => {
    let start = new Date();
    const end = new Date();
    
    switch(period) {
      case '1d': // 1 hari
        start = new Date(end);
        start.setDate(end.getDate() - 1);
        break;
      case '1w': // 1 minggu
        start = new Date(end);
        start.setDate(end.getDate() - 7);
        break;
      case '1m': // 1 bulan
        start = new Date(end);
        start.setMonth(end.getMonth() - 1);
        break;
      case '3m': // 3 bulan
        start = new Date(end);
        start.setMonth(end.getMonth() - 3);
        break;
      case '1y': // 1 tahun
        start = new Date(end);
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        break;
    }
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
    
    setActivePeriod(period);
  };

  // Hitung statistik trading
  const statistics = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        winTrades: 0,
        lossTrades: 0,
        winRate: 0,
        totalProfit: 0,
        averageProfit: 0,
        averageLoss: 0,
        profitFactor: 0,
        bestTrade: null,
        worstTrade: null,
        consecutiveWins: 0,
        maxConsecutiveWins: 0,
        consecutiveLosses: 0,
        maxConsecutiveLosses: 0,
        cumulativeProfit: 0,
        profitByPair: {},
        profitByDirection: { BUY: 0, SELL: 0 },
        tradesByMonth: {},
        tradesByDay: {
          'Senin': 0, 'Selasa': 0, 'Rabu': 0, 'Kamis': 0, 'Jumat': 0, 'Sabtu': 0, 'Minggu': 0,
        },
        cumulativeProfitData: [],
        profitByPairData: [],
        profitByDirectionData: [],
        tradesByMonthData: [],
        tradesByDayData: []
      };
    }

    // Urutkan transaksi berdasarkan tanggal open_date
    const sortedTrades = [...trades].sort((a, b) => new Date(a.open_date) - new Date(b.open_date));
    
    let totalProfit = 0;
    let totalWinProfit = 0;
    let totalLossProfit = 0;
    let winTrades = 0;
    let lossTrades = 0;
    let consecutiveWins = 0;
    let maxConsecutiveWins = 0;
    let consecutiveLosses = 0;
    let maxConsecutiveLosses = 0;
    let bestTrade = null;
    let worstTrade = null;
    const profitByPair = {};
    const profitByDirection = { BUY: 0, SELL: 0 };
    const tradesByMonth = {};
    const tradesByDay = {
      'Senin': 0, 'Selasa': 0, 'Rabu': 0, 'Kamis': 0, 'Jumat': 0, 'Sabtu': 0, 'Minggu': 0
    };
    const cumulativeProfitData = [];
    let runningTotal = 0;

    // Hari dalam bahasa Indonesia
    const daysIndonesian = [
      'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ];
    
    // Bulan dalam bahasa Indonesia
    const monthsIndonesian = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    sortedTrades.forEach((trade, index) => {
      const profit = parseFloat(trade.profit_loss) || 0;
      totalProfit += profit;
      runningTotal += profit;
      
      // Data untuk grafik profit kumulatif
      cumulativeProfitData.push({
        date: new Date(trade.open_date).toLocaleDateString('id-ID'),
        profit: parseFloat(runningTotal.toFixed(2))
      });
      
      // Win/Loss count
      if (profit > 0) {
        winTrades++;
        totalWinProfit += profit;
        consecutiveWins++;
        consecutiveLosses = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, consecutiveWins);
        
        // Cek apakah ini trade terbaik
        if (!bestTrade || profit > parseFloat(bestTrade.profit_loss)) {
          bestTrade = trade;
        }
      } else if (profit < 0) {
        lossTrades++;
        totalLossProfit += Math.abs(profit);
        consecutiveLosses++;
        consecutiveWins = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
        
        // Cek apakah ini trade terburuk
        if (!worstTrade || profit < parseFloat(worstTrade.profit_loss)) {
          worstTrade = trade;
        }
      }
      
      // Profit by pair
      const pair = trade.pair || 'Unknown';
      if (!profitByPair[pair]) {
        profitByPair[pair] = 0;
      }
      profitByPair[pair] += profit;
      
      // Profit by direction
      const direction = trade.direction || 'Unknown';
      if (profitByDirection[direction] !== undefined) {
        profitByDirection[direction] += profit;
      }
      
      // Trades by month
      const date = new Date(trade.open_date);
      const month = monthsIndonesian[date.getMonth()];
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;
      
      if (!tradesByMonth[monthYear]) {
        tradesByMonth[monthYear] = {
          count: 0,
          profit: 0,
          wins: 0,
          losses: 0
        };
      }
      
      tradesByMonth[monthYear].count++;
      tradesByMonth[monthYear].profit += profit;
      
      if (profit > 0) {
        tradesByMonth[monthYear].wins++;
      } else if (profit < 0) {
        tradesByMonth[monthYear].losses++;
      }
      
      // Trades by day of week
      const dayOfWeek = daysIndonesian[date.getDay()];
      tradesByDay[dayOfWeek]++;
    });

    // Hitung profit factor dan win rate
    const winRate = trades.length > 0 ? (winTrades / trades.length) * 100 : 0;
    const profitFactor = totalLossProfit > 0 ? totalWinProfit / totalLossProfit : totalWinProfit > 0 ? Infinity : 0;
    
    // Format profit by pair untuk chart
    const profitByPairData = Object.keys(profitByPair).map(pair => ({
      pair,
      profit: parseFloat(profitByPair[pair].toFixed(2))
    }));
    
    // Format profit by direction untuk chart
    const profitByDirectionData = Object.keys(profitByDirection).map(direction => ({
      direction,
      profit: parseFloat(profitByDirection[direction].toFixed(2))
    }));
    
    // Format trades by month untuk chart
    const tradesByMonthData = Object.keys(tradesByMonth).map(month => ({
      month,
      count: tradesByMonth[month].count,
      profit: parseFloat(tradesByMonth[month].profit.toFixed(2)),
      winRate: tradesByMonth[month].count > 0 
        ? parseFloat((tradesByMonth[month].wins / tradesByMonth[month].count * 100).toFixed(1)) 
        : 0
    }));
    
    // Format trades by day untuk chart
    const tradesByDayData = Object.keys(tradesByDay).map(day => ({
      day,
      count: tradesByDay[day]
    }));

    return {
      totalTrades: trades.length,
      winTrades,
      lossTrades,
      winRate: parseFloat(winRate.toFixed(1)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      averageProfit: winTrades > 0 ? parseFloat((totalWinProfit / winTrades).toFixed(2)) : 0,
      averageLoss: lossTrades > 0 ? parseFloat((totalLossProfit / lossTrades).toFixed(2)) : 0,
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      bestTrade,
      worstTrade,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      profitByPairData,
      profitByDirectionData,
      tradesByMonthData,
      tradesByDayData,
      cumulativeProfitData
    };
  }, [trades]);

  // Warna untuk chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ff7300'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50">
        <div className="p-8 rounded-xl bg-white shadow-lg border border-gray-100">
          <div className="w-12 h-12 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const backToAccountUrl = `/account/${slug}`;

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-tr from-indigo-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Notifikasi */}
      {notification && (
        <motion.div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'error' 
              ? 'bg-red-500 text-white' 
              : notification.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
          }`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          {notification.message}
        </motion.div>
      )}
      
      {/* Header */}
      <header className="py-4 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Analisis Trading Akun</h1>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  {broker?.broker_name} - {broker?.account_name}
                </p>
              </div>
            </div>
            <Link 
              href={backToAccountUrl}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Kembali ke Akun
            </Link>
          </div>
        </div>
      </header>
      
      {/* Filter Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="w-full mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Periode:</span>
            </div>
            <button 
              onClick={() => handlePeriodChange('1d')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activePeriod === '1d' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              1 Hari
            </button>
            <button 
              onClick={() => handlePeriodChange('1w')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activePeriod === '1w' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              1 Minggu
            </button>
            <button 
              onClick={() => handlePeriodChange('1m')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activePeriod === '1m' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              1 Bulan
            </button>
            <button 
              onClick={() => handlePeriodChange('3m')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activePeriod === '3m' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              3 Bulan
            </button>
            <button 
              onClick={() => handlePeriodChange('1y')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activePeriod === '1y' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              1 Tahun
            </button>
            <button 
              onClick={() => setActivePeriod('custom')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activePeriod === 'custom' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Custom
            </button>
          </div>
          {activePeriod === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateRangeChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateRangeChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-12 h-12 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Transaksi</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{statistics.totalTrades}</p>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-green-500">{statistics.winTrades} Profit</span>
                  <span className="text-red-500">{statistics.lossTrades} Loss</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Win Rate</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{statistics.winRate}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${statistics.winRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Profit/Loss</h3>
                <p className={`text-2xl font-bold mt-2 ${statistics.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(statistics.totalProfit)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Profit Factor: {statistics.profitFactor}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Avg. Profit/Loss</h3>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-green-500 font-medium">
                    +{formatCurrency(statistics.averageProfit)} profit
                  </span>
                  <span className="text-red-500 font-medium">
                    -{formatCurrency(statistics.averageLoss)} loss
                  </span>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Cumulative Profit Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-md font-bold text-gray-800 dark:text-white mb-4">Profit Kumulatif</h3>
                {statistics.cumulativeProfitData && statistics.cumulativeProfitData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={statistics.cumulativeProfitData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{fontSize: 10}}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="profit" 
                          name="Profit Kumulatif"
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan</p>
                  </div>
                )}
              </div>
              
              {/* Win Rate by Month */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-md font-bold text-gray-800 dark:text-white mb-4">Win Rate Per Bulan</h3>
                {statistics.tradesByMonthData && statistics.tradesByMonthData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statistics.tradesByMonthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{fontSize: 10}}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="winRate" name="Win Rate (%)" fill="#4ade80" />
                        <Bar dataKey="count" name="Jumlah Transaksi" fill="#60a5fa" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan</p>
                  </div>
                )}
              </div>
              
              {/* Profit by Trading Pair */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-md font-bold text-gray-800 dark:text-white mb-4">Profit Berdasarkan Pair</h3>
                {statistics.profitByPairData && statistics.profitByPairData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statistics.profitByPairData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="pair" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar 
                          dataKey="profit" 
                          name="Profit/Loss" 
                          fill="#8884d8"
                          // Warna berbeda untuk profit vs loss
                          shape={(props) => {
                            const { x, y, width, height, payload } = props;
                            return (
                              <rect
                                fill={payload.profit >= 0 ? '#4ade80' : '#f87171'}
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                              />
                            );
                          }} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan</p>
                  </div>
                )}
              </div>
              
              {/* Trading Activity by Day of Week */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-md font-bold text-gray-800 dark:text-white mb-4">Aktivitas Trading berdasarkan Hari</h3>
                {statistics.tradesByDayData && statistics.tradesByDayData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statistics.tradesByDayData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Jumlah Transaksi" fill="#60a5fa" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Best and Worst Trades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-md font-bold text-gray-800 dark:text-white mb-4">Trade Terbaik</h3>
                {statistics.bestTrade ? (
                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pair</p>
                        <p className="font-medium text-gray-800 dark:text-white">{statistics.bestTrade.pair}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Arah</p>
                        <p className={`font-medium ${statistics.bestTrade.direction === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                          {statistics.bestTrade.direction}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Entry Price</p>
                        <p className="font-medium text-gray-800 dark:text-white">{statistics.bestTrade.entry_price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Exit Price</p>
                        <p className="font-medium text-gray-800 dark:text-white">{statistics.bestTrade.exit_price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Profit</p>
                        <p className="font-medium text-green-500">{formatCurrency(statistics.bestTrade.profit_loss)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Lot Size</p>
                        <p className="font-medium text-gray-800 dark:text-white">{statistics.bestTrade.lot_size}</p>
                      </div>
                    </div>
                    {statistics.bestTrade.comment && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Catatan</p>
                        <p className="text-sm text-gray-800 dark:text-white">{statistics.bestTrade.comment}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan</p>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-md font-bold text-gray-800 dark:text-white mb-4">Trade Terburuk</h3>
                {statistics.worstTrade ? (
                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pair</p>
                        <p className="font-medium text-gray-800 dark:text-white">{statistics.worstTrade.pair}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Arah</p>
                        <p className={`font-medium ${statistics.worstTrade.direction === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                          {statistics.worstTrade.direction}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Entry Price</p>
                        <p className="font-medium text-gray-800 dark:text-white">{statistics.worstTrade.entry_price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Exit Price</p>
                        <p className="font-medium text-gray-800 dark:text-white">{statistics.worstTrade.exit_price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loss</p>
                        <p className="font-medium text-red-500">{formatCurrency(statistics.worstTrade.profit_loss)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Lot Size</p>
                        <p className="font-medium text-gray-800 dark:text-white">{statistics.worstTrade.lot_size}</p>
                      </div>
                    </div>
                    {statistics.worstTrade.comment && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Catatan</p>
                        <p className="text-sm text-gray-800 dark:text-white">{statistics.worstTrade.comment}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan</p>
                )}
              </div>
            </div>
            
            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Max Win Streak</h3>
                <p className="text-2xl font-bold text-green-500 mt-2">{statistics.maxConsecutiveWins}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Max Loss Streak</h3>
                <p className="text-2xl font-bold text-red-500 mt-2">{statistics.maxConsecutiveLosses}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Transaksi BUY vs SELL</h3>
                <div className="flex justify-between mt-2">
                  <span className="text-green-500 font-medium">
                    BUY: {formatCurrency(statistics.profitByDirectionData?.find(d => d.direction === 'BUY')?.profit || 0)}
                  </span>
                  <span className="text-red-500 font-medium">
                    SELL: {formatCurrency(statistics.profitByDirectionData?.find(d => d.direction === 'SELL')?.profit || 0)}
                  </span>
                </div>
              </div>
            
            </div>
          </>
        )}
      </div>
    </div>
  );
} 