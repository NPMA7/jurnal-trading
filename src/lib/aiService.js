import { supabase } from './supabase';

// Fungsi untuk menganalisis trading history dan memberikan insight
export async function analyzeTrading(trades) {
  if (!trades || trades.length === 0) {
    return {
      insight: "Belum ada data trading yang cukup untuk dianalisis. Tambahkan minimal 5 transaksi trading untuk mendapatkan insight."
    };
  }

  // Menghitung statistik dasar
  const profitTrades = trades.filter(trade => trade.profit > 0);
  const lossTrades = trades.filter(trade => trade.profit < 0);
  const breakEvenTrades = trades.filter(trade => trade.profit === 0);
  
  const totalTrades = trades.length;
  const winRate = (profitTrades.length / totalTrades) * 100;
  
  const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit > 0 ? trade.profit : 0), 0);
  const totalLoss = Math.abs(trades.reduce((sum, trade) => sum + (trade.profit < 0 ? trade.profit : 0), 0));
  
  // Menghitung risk-reward ratio
  const avgProfit = profitTrades.length > 0 ? totalProfit / profitTrades.length : 0;
  const avgLoss = lossTrades.length > 0 ? totalLoss / lossTrades.length : 0;
  const riskRewardRatio = avgLoss > 0 ? avgProfit / avgLoss : 0;
  
  // Menghitung drawdown maksimal
  let runningBalance = 0;
  let maxBalance = 0;
  let maxDrawdown = 0;
  
  trades.forEach(trade => {
    runningBalance += trade.profit;
    maxBalance = Math.max(maxBalance, runningBalance);
    const currentDrawdown = maxBalance - runningBalance;
    maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
  });
  
  // Analisis hari terbaik dan terburuk
  const tradesByDay = trades.reduce((acc, trade) => {
    const day = new Date(trade.close_date).toLocaleDateString('id-ID', { weekday: 'long' });
    if (!acc[day]) acc[day] = [];
    acc[day].push(trade);
    return acc;
  }, {});
  
  const dayStats = Object.entries(tradesByDay).map(([day, dayTrades]) => {
    const dayProfit = dayTrades.reduce((sum, trade) => sum + trade.profit, 0);
    const dayWinRate = (dayTrades.filter(t => t.profit > 0).length / dayTrades.length) * 100;
    return { day, profit: dayProfit, winRate: dayWinRate, trades: dayTrades.length };
  });
  
  const bestDay = [...dayStats].sort((a, b) => b.profit - a.profit)[0];
  const worstDay = [...dayStats].sort((a, b) => a.profit - b.profit)[0];
  
  // Analisis pair terbaik dan terburuk
  const tradesByPair = trades.reduce((acc, trade) => {
    if (!acc[trade.pair]) acc[trade.pair] = [];
    acc[trade.pair].push(trade);
    return acc;
  }, {});
  
  const pairStats = Object.entries(tradesByPair).map(([pair, pairTrades]) => {
    const pairProfit = pairTrades.reduce((sum, trade) => sum + trade.profit, 0);
    const pairWinRate = (pairTrades.filter(t => t.profit > 0).length / pairTrades.length) * 100;
    return { pair, profit: pairProfit, winRate: pairWinRate, trades: pairTrades.length };
  });
  
  const bestPair = [...pairStats].sort((a, b) => b.profit - a.profit)[0];
  const worstPair = [...pairStats].sort((a, b) => a.profit - b.profit)[0];

  // Membuat rekomendasi berdasarkan analisis
  let recommendations = [];
  let insight = "";
  
  // Rekomendasi berdasarkan win rate
  if (winRate < 40) {
    recommendations.push("Win rate Anda rendah. Pertimbangkan untuk mereview strategi entry dan perbaiki manajemen risiko.");
  } else if (winRate > 60) {
    recommendations.push("Win rate Anda tinggi. Pertimbangkan untuk meningkatkan posisi untuk memaksimalkan profit.");
  }
  
  // Rekomendasi berdasarkan risk-reward ratio
  if (riskRewardRatio < 1) {
    recommendations.push("Risk-reward ratio Anda kurang optimal. Usahakan target profit lebih besar dari stop loss.");
  } else if (riskRewardRatio > 2) {
    recommendations.push("Risk-reward ratio Anda sangat baik. Pertahankan strategi ini.");
  }
  
  // Rekomendasi berdasarkan pair
  if (bestPair) {
    recommendations.push(`Pair ${bestPair.pair} memberikan hasil terbaik dengan win rate ${bestPair.winRate.toFixed(2)}%. Pertimbangkan untuk lebih fokus pada pair ini.`);
  }
  
  if (worstPair && worstPair.profit < 0) {
    recommendations.push(`Hindari atau kurangi trading di pair ${worstPair.pair} yang menghasilkan kerugian konsisten.`);
  }
  
  // Rekomendasi berdasarkan hari trading
  if (bestDay) {
    recommendations.push(`Hari ${bestDay.day} adalah hari terbaik untuk trading Anda dengan profit rata-rata positif.`);
  }
  
  if (worstDay && worstDay.profit < 0) {
    recommendations.push(`Hindari atau kurangi trading di hari ${worstDay.day} yang cenderung menghasilkan kerugian.`);
  }
  
  // Membuat insight lengkap
  insight = `
Berdasarkan analisis ${totalTrades} transaksi trading:

- Win Rate: ${winRate.toFixed(2)}% (${profitTrades.length} profit, ${lossTrades.length} loss, ${breakEvenTrades.length} breakeven)
- Total Profit: ${totalProfit.toFixed(2)}
- Total Loss: ${totalLoss.toFixed(2)}
- Profit Factor: ${(totalProfit / (totalLoss || 1)).toFixed(2)}
- Risk-Reward Ratio: ${riskRewardRatio.toFixed(2)}
- Drawdown Maksimal: ${maxDrawdown.toFixed(2)}

REKOMENDASI:
${recommendations.join('\n')}

Teruslah mencatat trading Anda dan evaluasi secara berkala untuk meningkatkan performa.
  `;
  
  return {
    stats: {
      totalTrades,
      winRate,
      totalProfit,
      totalLoss,
      profitFactor: totalProfit / (totalLoss || 1),
      riskRewardRatio,
      maxDrawdown,
      bestDay,
      worstDay,
      bestPair,
      worstPair
    },
    recommendations,
    insight
  };
} 