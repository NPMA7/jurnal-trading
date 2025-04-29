'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Komponen form transaksi untuk menambahkan atau mengedit transaksi trading
 */
export default function TradeForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  brokerId, 
  isEdit = false 
}) {
  // Styles untuk menghilangkan tanda panah pada input numerik - versi yang lebih lengkap
  const noArrowsInputStyle = `
    /* Chrome, Safari, Edge, Opera */
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }

    /* Firefox */
    input[type=number] {
      -moz-appearance: textfield;
    }
  `;

  const modalRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // State untuk mode input (pips atau harga)
  const [inputMode, setInputMode] = useState({
    sl: 'price', // 'price' atau 'pips'
    tp: 'price'  // 'price' atau 'pips'
  });
  
  // State untuk form data
  const [formData, setFormData] = useState({
    pair: 'XAUUSD',
    direction: 'BUY',
    position_type: 'open',
    open_date: '',
    close_date: '',
    entry_price: '',
    exit_price: '',
    stop_loss: '',
    take_profit: '',
    sl_pips: '',
    tp_pips: '',
    lot_size: '0.01',
    profit_loss: '0.00',
    risk_reward: '',
    comment: '',
    images: []
  });
  
  // Effect untuk mengatur ulang form saat modal dibuka atau initialData berubah
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Hitung pips dari harga SL dan TP jika tersedia
        let slPips = '';
        let tpPips = '';
        
        if (initialData.entry_price && initialData.stop_loss) {
          slPips = calculatePipsFromPrice(
            initialData.entry_price, 
            initialData.stop_loss, 
            initialData.direction || 'BUY',
            initialData.pair || 'XAUUSD'
          );
        }
        
        if (initialData.entry_price && initialData.take_profit) {
          tpPips = calculatePipsFromPrice(
            initialData.entry_price, 
            initialData.take_profit, 
            initialData.direction || 'BUY',
            initialData.pair || 'XAUUSD'
          );
        }
        
        // Tentukan position_type berdasarkan exit_price atau close_date
        const positionType = (initialData.exit_price || initialData.close_date) ? 'close' : 'open';
        
        setFormData({
          pair: initialData.pair || 'XAUUSD',
          direction: initialData.direction || 'BUY',
          position_type: positionType,
          open_date: initialData.open_date ? new Date(initialData.open_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          close_date: initialData.close_date ? new Date(initialData.close_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          entry_price: initialData.entry_price || '',
          exit_price: initialData.exit_price || '',
          stop_loss: initialData.stop_loss || '',
          take_profit: initialData.take_profit || '',
          sl_pips: slPips,
          tp_pips: tpPips,
          lot_size: initialData.lot_size || '0.01',
          profit_loss: initialData.profit_loss || '0.00',
          risk_reward: initialData.risk_reward || '',
          comment: initialData.comment || initialData.strategy || '',
          images: initialData.images || []
        });
      } else {
        // Reset form saat mode tambah
        setFormData({
          pair: 'XAUUSD',
          direction: 'BUY',
          position_type: 'open',
          open_date: new Date().toISOString().split('T')[0],
          close_date: new Date().toISOString().split('T')[0],
          entry_price: '',
          exit_price: '',
          stop_loss: '',
          take_profit: '',
          sl_pips: '',
          tp_pips: '',
          lot_size: '0.01',
          profit_loss: '0.00',
          risk_reward: '',
          comment: '',
          images: []
        });
      }
      // Reset input mode ke harga
      setInputMode({
        sl: 'price',
        tp: 'price'
      });
      setError('');
    }
  }, [isOpen, initialData]);
  
  // Effect untuk menangani klik di luar modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Effect untuk menentukan arah (direction) berdasarkan entry price dan stop loss
  useEffect(() => {
    // Hanya lakukan ini jika dalam mode harga, bukan mode pips
    if (inputMode.sl === 'price' && formData.entry_price && formData.stop_loss) {
      const entryPrice = parseFloat(formData.entry_price);
      const stopLoss = parseFloat(formData.stop_loss);
      
      if (!isNaN(entryPrice) && !isNaN(stopLoss) && entryPrice !== stopLoss) {
        // Jika entry price lebih besar dari stop loss, artinya BUY (LONG)
        // Jika entry price lebih kecil dari stop loss, artinya SELL (SHORT)
        const newDirection = entryPrice > stopLoss ? 'BUY' : 'SELL';
        
        if (newDirection !== formData.direction) {
          setFormData(prev => ({
            ...prev,
            direction: newDirection
          }));
        }
      }
    }
  }, [formData.entry_price, formData.stop_loss, inputMode.sl]);
  
  // Fungsi untuk mengubah mode input (pips atau harga)
  const toggleInputMode = (field) => {
    // Simpan nilai mode saat ini sebelum diubah
    const currentMode = inputMode[field];
    
    setInputMode(prev => ({
          ...prev,
      [field]: prev[field] === 'price' ? 'pips' : 'price'
    }));
    
    // Gunakan currentMode yang sudah disimpan sebelumnya
    if (field === 'sl' && currentMode === 'price') {
      // Tidak perlu menghapus, cukup tampilkan selector arah
    }
  };
  
  // Fungsi untuk menghitung pip multiplier berdasarkan pair
  const getPipMultiplier = (pair) => {
    if (!pair) return 0.0001; // Default untuk sebagian besar pair
    
    const pairUpper = pair.toUpperCase();
    
    // Untuk pasangan dengan JPY
    if (pairUpper.includes('JPY')) {
      return 0.01;
    }
    
    // Khusus untuk XAUUSD (Gold)
    if (pairUpper.includes('XAU')) {
      return 0.01;
    }
    
    // Untuk crypto biasanya 1.0 (BTC, ETH, dll)
    if (
      pairUpper.includes('BTC') || 
      pairUpper.includes('ETH') || 
      pairUpper.includes('XRP') || 
      pairUpper.includes('LTC') || 
      pairUpper.includes('BCH') ||
      pairUpper.includes('DOT') ||
      pairUpper.includes('ADA') ||
      pairUpper.includes('SOL')
    ) {
      return 1.0;
    }
    
    // Untuk pair exotics dengan pip value yang berbeda
    if (
      pairUpper.includes('HUF') || 
      pairUpper.includes('KRW')
    ) {
      return 0.01;
    }
    
    // Default untuk Forex standar (EUR/USD, GBP/USD, dll)
    return 0.0001;
  };
  
  // Fungsi untuk mendapatkan nilai pip berdasarkan pair dan lot size
  const getPipValue = (pair, lotSize) => {
    if (!pair || !lotSize) return 0;
    
    const pairUpper = pair.toUpperCase();
    const lot = parseFloat(lotSize);
    
    if (isNaN(lot)) return 0;
    
    // Rumus dasar: lotSize * pipValue
    if (pairUpper.includes('JPY')) {
      // Untuk pair JPY, nilai 1 pip (0.01) dengan lot 1.0 sekitar $10
      return lot * 10;
    } else if (pairUpper.includes('XAU')) {
      // Untuk XAUUSD (Gold), 1 pip (0.01) dengan lot 1.0 sekitar $1
      return lot * 1;
    } else if (
      pairUpper.includes('BTC') || 
      pairUpper.includes('ETH') || 
      pairUpper.includes('XRP') || 
      pairUpper.includes('LTC') || 
      pairUpper.includes('BCH') ||
      pairUpper.includes('DOT') ||
      pairUpper.includes('ADA') ||
      pairUpper.includes('SOL')
    ) {
      // Untuk crypto, ini tergantung pada eksposur kontrak
      // Contoh: Jika 1 lot BTC = 1 BTC, maka 1 pip (1.0) = $1 dalam nilai USD
      return lot * 1;
        } else {
      // Untuk forex standar, 1 pip (0.0001) dengan lot 1.0 sekitar $10
      return lot * 10;
    }
  };
  
  // Fungsi untuk menghitung profit/loss berdasarkan pair, arah, entry, exit, dan lot size
  const calculateProfitLoss = (pair, direction, entryPrice, exitPrice, lotSize) => {
    if (!pair || !direction || !entryPrice || !exitPrice || !lotSize) return 0;
    
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const lot = parseFloat(lotSize);
    
    if (isNaN(entry) || isNaN(exit) || isNaN(lot)) return 0;
    
    // Hitung perbedaan harga
    let priceDiff = 0;
    if (direction === 'BUY') {
      priceDiff = exit - entry; // Untuk BUY, profit jika exit > entry
    } else {
      priceDiff = entry - exit; // Untuk SELL, profit jika entry > exit
    }
    
    // Daftar indeks yang dikenal
    const indices = ['NASDAQ', 'SP500', 'SPX', 'S&P', 'SP', 'DOW', 'DOWJONES', 'DJI', 'DAX', 'FTSE', 'NIKKEI', 'HANGSENG', 'HSI'];
    const pairUpper = pair.toUpperCase();
    
    // Khusus untuk XAUUSD, nilai profitnya perlu disesuaikan
    if (pairUpper.includes('XAU')) {
      // Profit untuk Gold dihitung secara langsung: perbedaan * lot size * 100
      return (priceDiff * lot * 100).toFixed(2);
    }
    // Khusus untuk indeks, gunakan perhitungan yang berbeda
    else if (indices.some(index => pairUpper.includes(index))) {
      // Untuk indeks, profit dihitung dengan: perbedaan * lot size * 10
      return (priceDiff * lot * 10).toFixed(2);
    }
    
    // Hitung berapa pip pergerakan harga
    const pipMultiplier = getPipMultiplier(pair);
    const pips = priceDiff / pipMultiplier;
    
    // Hitung nilai per pip
    const pipValue = getPipValue(pair, lotSize);
    
    // Hitung profit/loss
    const profitLoss = pips * pipValue;
    
    return profitLoss.toFixed(2);
  };
  
  // Fungsi untuk menghitung pips dari harga
  const calculatePipsFromPrice = (entryPrice, targetPrice, direction, pair) => {
    if (!entryPrice || !targetPrice) return '';
    
    const entry = parseFloat(entryPrice);
    const target = parseFloat(targetPrice);
    const pipMultiplier = getPipMultiplier(pair);
    
    if (isNaN(entry) || isNaN(target)) return '';
    
    let pips = 0;
    if (direction === 'BUY') {
      // Untuk BUY: SL di bawah entry, TP di atas entry
      pips = Math.abs((target - entry) / pipMultiplier);
        } else {
      // Untuk SELL: SL di atas entry, TP di bawah entry
      pips = Math.abs((entry - target) / pipMultiplier);
    }
    
    return pips.toFixed(1);
  };
  
  // Fungsi untuk menghandle perubahan pips
  const handlePipsChange = (e) => {
    const { name, value } = e.target;
    const entryPrice = formData.entry_price;
    const isStopLoss = name === 'sl_pips';
    
    // Update state pips
          setFormData(prev => ({
            ...prev,
      [name]: value
    }));
    
    if (entryPrice && value) {
      // Konversi pips ke harga dan update SL atau TP
      const priceField = isStopLoss ? 'stop_loss' : 'take_profit';
      const price = calculatePriceFromPips(
        entryPrice, 
        value, 
        isStopLoss, 
        formData.direction,
        formData.pair
      );
      
      if (price) {
        setFormData(prev => ({
          ...prev,
          [priceField]: price
        }));
      }
    }
  };

  // Fungsi untuk menghandle perubahan harga SL/TP langsung
  const handleSLTPPriceChange = (e) => {
    const { name, value } = e.target;
    const entryPrice = formData.entry_price;
    const isStopLoss = name === 'stop_loss';
    
    // Update state harga
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (entryPrice && value) {
      // Konversi harga ke pips dan update sl_pips atau tp_pips
      const pipsField = isStopLoss ? 'sl_pips' : 'tp_pips';
      const pips = calculatePipsFromPrice(
        entryPrice,
        value,
        formData.direction,
        formData.pair
      );
      
      if (pips) {
          setFormData(prev => ({
            ...prev,
          [pipsField]: pips
        }));
      }
    }
  };
  
  // Fungsi untuk menghandle perubahan form
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Khusus untuk pair, hapus semua karakter slash dan konversi ke uppercase
    if (name === 'pair') {
      // Hapus semua slash dari nilai input dan konversi ke uppercase
      const cleanedValue = value.replace(/\//g, '').toUpperCase();
      
      setFormData(prev => ({
        ...prev,
        pair: cleanedValue
      }));
      return;
    }
    
    // Penanganan khusus untuk field numerik (normalisasi format angka)
    if (['entry_price', 'exit_price', 'stop_loss', 'take_profit', 'lot_size', 'profit_loss', 'sl_pips', 'tp_pips'].includes(name)) {
      // Hilangkan semua koma ribuan untuk pemrosesan
      let processedValue = value.replace(/,/g, '');
      
      // Ganti koma yang berfungsi sebagai desimal menjadi titik (jika ada)
      // Kita deteksi jika ada koma yang diikuti angka dan tidak diikuti oleh titik lain
      if (/,\d+$/.test(processedValue)) {
        processedValue = processedValue.replace(/,(\d+)$/, '.$1');
      }
    
    // Jika ini perubahan manual pada direction, simpan nilai tanpa menjalankan logika otomatis
    if (name === 'direction') {
      setFormData(prev => ({
        ...prev,
        direction: value,
        _manualDirection: true // Flag untuk menandai bahwa user telah mengubah direction secara manual
      }));
        
        // Perbarui nilai SL dan TP berdasarkan pips jika ada
        if (formData.entry_price) {
          if (formData.sl_pips) {
            const newSL = calculatePriceFromPips(
              formData.entry_price,
              formData.sl_pips,
              true,
              value,
              formData.pair
            );
            
            if (newSL) {
              setFormData(prev => ({
                ...prev,
                stop_loss: newSL
              }));
            }
          }
          
          if (formData.tp_pips) {
            const newTP = calculatePriceFromPips(
              formData.entry_price,
              formData.tp_pips,
              false,
              value,
              formData.pair
            );
            
            if (newTP) {
              setFormData(prev => ({
                ...prev,
                take_profit: newTP
              }));
            }
          }
        }
        
      return;
    }
    
      // Jika ini perubahan pada entry_price, update SL dan TP berdasarkan pips jika ada
      if (name === 'entry_price') {
        setFormData(prev => ({
          ...prev,
          [name]: processedValue
        }));
        
        if (processedValue) {
          // Update SL jika ada sl_pips
          if (formData.sl_pips) {
            const newSL = calculatePriceFromPips(
              processedValue,
              formData.sl_pips,
              true,
              formData.direction,
              formData.pair
            );
            
            if (newSL) {
              setFormData(prev => ({
                ...prev,
                stop_loss: newSL
              }));
            }
          }
          
          // Update TP jika ada tp_pips
          if (formData.tp_pips) {
            const newTP = calculatePriceFromPips(
              processedValue,
              formData.tp_pips,
              false,
              formData.direction,
              formData.pair
            );
            
            if (newTP) {
              setFormData(prev => ({
                ...prev,
                take_profit: newTP
              }));
            }
          }
        }
        
        return;
      }
      
      // Jika ini perubahan pada stop_loss
      if (name === 'stop_loss') {
        const e = { target: { name, value: processedValue } };
        handleSLTPPriceChange(e);
        return;
      }
      
      // Jika ini perubahan pada take_profit
      if (name === 'take_profit') {
        const e = { target: { name, value: processedValue } };
        handleSLTPPriceChange(e);
        return;
      }
      
      // Jika ini perubahan pada sl_pips
      if (name === 'sl_pips') {
        const e = { target: { name, value: processedValue } };
        handlePipsChange(e);
        return;
      }
      
      // Jika ini perubahan pada tp_pips
      if (name === 'tp_pips') {
        const e = { target: { name, value: processedValue } };
        handlePipsChange(e);
        return;
      }
      
      // Untuk field numerik lainnya
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
      return;
    }
    
    // Untuk field lainnya yang bukan numerik atau special case
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fungsi untuk handle gambar/screenshot
  const handleImageChange = (e) => {
    const imageUrl = e.target.value;
    if (imageUrl && imageUrl.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
      e.target.value = '';
    }
  };

  // Fungsi untuk menghapus gambar
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Fungsi untuk handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validasi form
    if (!formData.pair) {
      setError('Pasangan trading (pair) harus diisi');
      return;
    }
    
    if (!formData.entry_price) {
      setError('Harga entry harus diisi');
      return;
    }
    
    if (!formData.lot_size) {
      setError('Ukuran lot harus diisi');
      return;
    }

    // Validasi nilai tidak boleh negatif
    if (parseFloat(formData.entry_price) < 0) {
      setError('Harga entry tidak boleh negatif');
      return;
    }

    if (formData.exit_price && parseFloat(formData.exit_price) < 0) {
      setError('Harga exit tidak boleh negatif');
      return;
    }

    if (formData.stop_loss && parseFloat(formData.stop_loss) < 0) {
      setError('Stop loss tidak boleh negatif');
      return;
    }

    if (formData.take_profit && parseFloat(formData.take_profit) < 0) {
      setError('Take profit tidak boleh negatif');
      return;
    }

    if (parseFloat(formData.lot_size) < 0) {
      setError('Ukuran lot tidak boleh negatif');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Pastikan profit_loss selalu berupa angka, bahkan jika nilainya 0
      const profitLossValue = formData.profit_loss !== undefined && formData.profit_loss !== "" ? 
        parseFloat(formData.profit_loss) : 0;
      
      // Gunakan nilai numerik risk_reward jika tersedia
      let riskRewardValue = formData._risk_reward_numeric;
      
      // Panggil fungsi onSubmit yang diberikan dari parent component
      await onSubmit({
        ...formData,
        broker_id: brokerId,
        entry_price: parseFloat(formData.entry_price),
        exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
        stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
        take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
        lot_size: parseFloat(formData.lot_size),
        profit_loss: profitLossValue,
        risk_reward: riskRewardValue,
        _display_risk_reward: formData.risk_reward // Untuk tampilan saja
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting trade:', error);
      setError(error.message || 'Terjadi kesalahan saat menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Effect untuk menghitung profit/loss ketika exit_price berubah
  useEffect(() => {
    if (formData.entry_price && formData.exit_price && formData.lot_size) {
      const profitLoss = calculateProfitLoss(
        formData.pair,
        formData.direction,
        formData.entry_price,
        formData.exit_price,
        formData.lot_size
      );
      
      setFormData(prev => ({
        ...prev,
        profit_loss: profitLoss
      }));
    }
  }, [formData.entry_price, formData.exit_price, formData.lot_size, formData.direction, formData.pair]);
  
  // Fungsi untuk menghitung harga dari pips
  const calculatePriceFromPips = (entryPrice, pips, isStopLoss, direction, pair) => {
    if (!entryPrice || !pips) return '';
    
    const entry = parseFloat(entryPrice);
    const pipsValue = parseFloat(pips);
    const pipMultiplier = getPipMultiplier(pair);
      
    if (isNaN(entry) || isNaN(pipsValue)) return '';
    
    let price = 0;
    if (direction === 'BUY') {
      if (isStopLoss) {
        // SL di bawah entry untuk BUY
        price = entry - (pipsValue * pipMultiplier);
      } else {
        // TP di atas entry untuk BUY
        price = entry + (pipsValue * pipMultiplier);
      }
    } else {
      if (isStopLoss) {
        // SL di atas entry untuk SELL
        price = entry + (pipsValue * pipMultiplier);
      } else {
        // TP di bawah entry untuk SELL
        price = entry - (pipsValue * pipMultiplier);
      }
    }
    
    // Format berdasarkan jenis pair
    if (pair && pair.toUpperCase().includes('JPY')) {
      return price.toFixed(3);  // JPY pairs biasanya 3 desimal
    } else if (
      pair && (
        pair.toUpperCase().includes('BTC') || 
        pair.toUpperCase().includes('ETH')
      )
    ) {
      return price.toFixed(2);  // Crypto biasanya 2 desimal
    } else {
      return price.toFixed(pipMultiplier < 0.01 ? 5 : 2);  // Forex standar biasanya 5 desimal
    }
  };
  
  // Effect untuk menghitung risk/reward ratio ketika SL atau TP berubah
  useEffect(() => {
    if (formData.entry_price && formData.stop_loss && formData.take_profit) {
      const entry = parseFloat(formData.entry_price);
      const sl = parseFloat(formData.stop_loss);
      const tp = parseFloat(formData.take_profit);
      
      if (isNaN(entry) || isNaN(sl) || isNaN(tp)) return;
      
      // Hitung jarak dalam pips dari entry ke SL dan dari entry ke TP
      const slPips = Math.abs(calculatePipsFromPrice(
        formData.entry_price, 
        formData.stop_loss, 
        formData.direction,
        formData.pair
      ));
      
      const tpPips = Math.abs(calculatePipsFromPrice(
        formData.entry_price, 
        formData.take_profit, 
        formData.direction,
        formData.pair
      ));
      
      if (slPips && tpPips && slPips > 0) {
        // Format: "1:2.5" (Risk : Reward)
        const ratio = (tpPips / slPips).toFixed(1);
        const riskRewardRatio = `1:${ratio}`;
        
        setFormData(prev => ({
          ...prev,
          risk_reward: riskRewardRatio,
          _risk_reward_numeric: ratio // Simpan nilai numerik untuk keperluan perhitungan
        }));
      }
    }
  }, [formData.entry_price, formData.stop_loss, formData.take_profit, formData.direction, formData.pair]);
  
  // Format angka dengan koma sebagai pemisah ribuan dan titik sebagai desimal
  const formatNumber = (value) => {
    if (!value && value !== 0) return '';
    
    // Konversi value ke string jika belum
    const stringValue = value.toString();
    
    // Pisahkan bagian bilangan bulat dan desimal
    const parts = stringValue.split('.');
    
    // Format bagian bilangan bulat dengan koma setiap 3 digit
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Gabungkan kembali dengan bagian desimal jika ada
    return parts.length === 1 ? parts[0] : parts[0] + '.' + parts[1];
  };
  
  // Fungsi untuk menangani perubahan tipe posisi
  const handlePositionTypeChange = (e) => {
    const positionType = e.target.value;
    setFormData(prev => ({
      ...prev,
      position_type: positionType
    }));
    
    // Jika tipe posisi adalah 'close', tetapkan tanggal penutupan ke hari ini jika belum ada
    if (positionType === 'close' && !formData.close_date) {
      setFormData(prev => ({
        ...prev,
        close_date: new Date().toISOString().split('T')[0]
      }));
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <style jsx global>{noArrowsInputStyle}</style>
      
      <motion.div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
              </h2>
              {formData.direction && (
                <div className={`ml-3 px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                  formData.direction === 'BUY' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {formData.direction === 'BUY' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  {formData.direction}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* Tanggal Buka */}
              <div className="mb-2">
                <label htmlFor="open_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tanggal Buka <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="open_date"
                  name="open_date"
                  value={formData.open_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              {/* Tanggal Tutup */}
              <div className="mb-2">
                <label htmlFor="close_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tanggal Tutup
                </label>
                <input
                  type="date"
                  id="close_date"
                  name="close_date"
                  value={formData.close_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* Pasangan Trading */}
              <div className="mb-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Pair Trading <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pair"
                  value={formData.pair}
                  onChange={handleChange}
                  placeholder="XAUUSD"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              {/* Harga Entry */}
              <div className="mb-2">
                <label htmlFor="entry_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Harga Entry <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="entry_price"
                  name="entry_price"
                  value={formData.entry_price ? formatNumber(formData.entry_price) : ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Contoh: 3,555.55"
                  required
                />
              </div>
              
              {/* Harga Exit */}
              <div className="mb-2">
                <label htmlFor="exit_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Harga Exit
                </label>
                <input
                  type="text"
                  id="exit_price"
                  name="exit_price"
                  value={formData.exit_price ? formatNumber(formData.exit_price) : ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Contoh: 3,800"
                />
              </div>

              {/* Direction selector - tampilkan jika menggunakan mode pips pada SL */}
              {inputMode.sl === 'pips' && (
              <div className="mb-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Arah Transaksi <span className="text-red-500">*</span>
                </label>
                  <select
                    name="direction"
                    value={formData.direction}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="BUY">BUY (LONG)</option>
                    <option value="SELL">SELL (SHORT)</option>
                  </select>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Tentukan arah transaksi secara manual saat menggunakan mode pips
                </p>
              </div>
              )}

              {/* Stop Loss - dengan toggle mode */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="stop_loss" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {inputMode.sl === 'price' ? 'Stop Loss' : 'Stop Loss (Pips)'}
                </label>
                  <button
                    type="button"
                    onClick={() => toggleInputMode('sl')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    {inputMode.sl === 'price' ? 'Ubah ke Pips' : 'Ubah ke Harga'}
                  </button>
                </div>
                
                {inputMode.sl === 'price' ? (
                <input
                    type="text"
                    id="stop_loss"
                  name="stop_loss"
                    value={formData.stop_loss ? formatNumber(formData.stop_loss) : ''}
                  onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Contoh: 3,450"
                  />
                ) : (
                  <input
                    type="text"
                    id="sl_pips"
                    name="sl_pips"
                    value={formData.sl_pips ? formatNumber(formData.sl_pips) : ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Contoh: 45"
                  />
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {inputMode.sl === 'price' ? 'Cut Loss / Cut Profit' : 'Menentukan arah trading secara otomatis'}
                </p>
              </div>

              {/* Take Profit - dengan toggle mode */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="take_profit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {inputMode.tp === 'price' ? 'Take Profit' : 'Take Profit (Pips)'}
                </label>
                  <button
                    type="button"
                    onClick={() => toggleInputMode('tp')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    {inputMode.tp === 'price' ? 'Ubah ke Pips' : 'Ubah ke Harga'}
                  </button>
                </div>
                
                {inputMode.tp === 'price' ? (
                <input
                    type="text"
                    id="take_profit"
                  name="take_profit"
                    value={formData.take_profit ? formatNumber(formData.take_profit) : ''}
                  onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Contoh: 4,567.89"
                  />
                ) : (
                  <input
                    type="text"
                    id="tp_pips"
                    name="tp_pips"
                    value={formData.tp_pips ? formatNumber(formData.tp_pips) : ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Contoh: 100"
                  />
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Harga untuk menutup posisi dengan profit
                </p>
              </div>
              
              {/* Ukuran Lot */}
              <div className="mb-2">
                <label htmlFor="lot_size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ukuran Lot <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lot_size"
                  name="lot_size"
                  value={formData.lot_size ? formatNumber(formData.lot_size) : ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Contoh: 0.01"
                  required
                />
              </div>
              
              {/* Profit/Loss */}
              <div className="mb-2">
                <label htmlFor="profit_loss" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Profit/Loss
                </label>
                <input
                  type="text"
                  id="profit_loss"
                  name="profit_loss"
                  value={formData.profit_loss ? formatNumber(formData.profit_loss) : '0.00'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-800"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Dihitung otomatis berdasarkan harga entry, exit, dan ukuran lot
                </p>
              </div>
              
              {/* Risk/Reward Ratio */}
              <div className="mb-2">
                <label htmlFor="risk_reward" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Risk/Reward Ratio
                </label>
                <input
                  type="text"
                  id="risk_reward"
                  name="risk_reward"
                  value={formData.risk_reward ? formatNumber(formData.risk_reward) : ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-800"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Dihitung otomatis dari stop loss dan take profit
                </p>
              </div>
            </div>
            
            {/* Komentar */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Komentar/Catatan
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows="3"
                placeholder="Masukkan strategi, analisis, alasan entry/exit, pelajaran dari trade ini..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              ></textarea>
            </div>
            
            {/* Hidden field untuk menyimpan direction yang ditentukan otomatis */}
            <input type="hidden" name="direction" value={formData.direction} />
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Menyimpan...' : isEdit ? 'Update Transaksi' : 'Simpan Transaksi'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
} 