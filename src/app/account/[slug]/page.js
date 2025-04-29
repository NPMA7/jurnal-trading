'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getBrokers, getTrades, addTrade, deleteTrade, updateTrade } from '../../../lib/brokerService';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import TradeForm from '../../../components/TradeForm';
export default function AccountDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const [broker, setBroker] = useState(null);
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;
  const [isTradeFormOpen, setIsTradeFormOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && slug) {
      loadAccountData();
    }
  }, [user, authLoading, slug, router]);

  // Fungsi untuk mengurai slug dan mendapatkan data akun
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
      
      // Setelah mendapatkan data akun, ambil transaksinya
      const tradesData = await getTrades(account.id, user.id);
      setTrades(tradesData || []);
    } catch (error) {
      console.error('Error loading account data:', error);
      showNotification('Gagal memuat data akun: ' + (error.message || 'Terjadi kesalahan'), 'error');
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

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fungsi untuk menangani submit form
  const handleTradeSubmit = async (tradeData) => {
    try {
      let result;
      if (isEditMode && selectedTrade) {
        // Mode edit
        result = await updateTrade(selectedTrade.id, broker.id, user.id, tradeData);
        showNotification('Transaksi berhasil diupdate', 'success');
      } else {
        // Mode tambah
        result = await addTrade(broker.id, user.id, tradeData);
        showNotification('Transaksi berhasil ditambahkan', 'success');
      }
      
      // Update daftar transaksi
      if (isEditMode) {
        setTrades(trades.map(t => t.id === result.id ? result : t));
      } else {
        setTrades([result, ...trades]);
      }
      
      // Reset state
      setSelectedTrade(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error submitting trade:', error);
      showNotification('Gagal menyimpan transaksi: ' + (error.message || 'Terjadi kesalahan'), 'error');
    }
  };

  // Fungsi untuk menangani hapus transaksi
  const handleDeleteTrade = async (tradeId) => {
    
    try {
      await deleteTrade(tradeId, broker.id, user.id);
      setTrades(trades.filter(t => t.id !== tradeId));
      showNotification('Transaksi berhasil dihapus', 'success');
    } catch (error) {
      console.error('Error deleting trade:', error);
      showNotification('Gagal menghapus transaksi: ' + (error.message || 'Terjadi kesalahan'), 'error');
    }
  };

  // Fungsi untuk menangani klik pada tombol edit
  const handleEditTrade = (trade) => {
    setSelectedTrade(trade);
    setIsEditMode(true);
    setIsTradeFormOpen(true);
  };

  // Fungsi untuk menangani klik pada tombol tambah transaksi
  const handleAddTrade = () => {
    setSelectedTrade(null);
    setIsEditMode(false);
    setIsTradeFormOpen(true);
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Jurnal Trading Forex</h1>
                <p className="text-xs text-gray-500 dark:text-gray-300">Detail Akun Trading {broker?.account_name}</p>
              </div>
            </div>
           <div className='flex flex-row gap-x-4'>
            
            {broker && (
              <Link
                href={`/account/${slug}/analysis`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
                Lihat Analisis
              </Link>
            )} 
            <button 
              onClick={handleBackToDashboard}
              className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors flex items-center mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Kembali ke Dashboard
            </button>
          </div> 
              </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {broker ? (
          <div className="space-y-8">
            {/* Akun Trading Info Card */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600 dark:text-indigo-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{broker.account_name || broker.name || '-'}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{broker.comments || broker.description || 'Tidak ada komentar'}</p>
                  </div>
                </div>
                <div className="bg-indigo-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Broker</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{broker.broker_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID Akun</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{broker.account_id || broker.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaksi Trading Card */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Transaksi Trading</h3>
                <button 
                  onClick={handleAddTrade}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tambah Transaksi
                </button>
              </div>

              {trades.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 mb-4 bg-indigo-50 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-500 dark:text-indigo-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Belum Ada Transaksi</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Anda belum memiliki catatan transaksi trading untuk akun ini.</p>
                    <button 
                      onClick={handleAddTrade}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Buat Transaksi Pertama
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pair</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Arah</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lot</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">R:R</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profit/Loss</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {trades.map((trade) => (
                          <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">{trade.pair}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                (trade.direction || trade.type) === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {trade.direction || trade.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {trade.lot_size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {trade.risk_reward ? `1:${parseFloat(trade.risk_reward).toFixed(1)}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`font-medium ${trade.profit_loss > 0 ? 'text-green-600 dark:text-green-400' : trade.profit_loss < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                {trade.profit_loss > 0 ? '+' : ''}{trade.profit_loss}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditTrade(trade)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTrade(trade.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 bg-red-50 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500 dark:text-red-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Akun Trading Tidak Ditemukan</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Maaf, akun trading yang Anda cari tidak tersedia atau Anda tidak memiliki akses.</p>
              <button 
                onClick={handleBackToDashboard}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <div className="w-full flex justify-center py-6">
        <div className="bg-white dark:bg-gray-800 px-5 py-2.5 rounded-full shadow-md">
          <p className="text-xs text-gray-600 dark:text-gray-300">Transaksi: <span className="font-semibold">{trades.length}</span> | Terakhir update: <span className="font-semibold">{new Date().toLocaleDateString('id-ID')}</span></p>
        </div>
      </div>

      {/* Form Transaksi Modal */}
      {broker && (
        <TradeForm
          isOpen={isTradeFormOpen}
          onClose={() => setIsTradeFormOpen(false)}
          onSubmit={handleTradeSubmit}
          initialData={selectedTrade}
          brokerId={broker.id}
          isEdit={isEditMode}
        />
      )}
    </div>
  );
} 