import { supabase } from './supabase';

/**
 * CATATAN PENTING:
 * File ini mengelola akun trading meskipun nama variabel dan fungsinya masih menggunakan "broker".
 * Dalam konteks aplikasi, "broker" mengacu pada akun trading individual pengguna.
 * Satu broker sebenarnya dapat memiliki banyak akun trading, dan nama-nama fungsi ini
 * akan diperbarui di masa mendatang untuk mencerminkan terminologi yang lebih akurat.
 */

// Fungsi untuk mendapatkan semua broker milik user
export async function getBrokers(userId) {
  try {
    const { data, error } = await supabase
      .from('brokers')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting brokers:', error);
    throw error;
  }
}

// Fungsi untuk menambah broker baru
export async function addBroker(userId, brokerData) {
  try {
    console.log('Mencoba menambahkan akun trading dengan data:', { userId, ...brokerData });
    
    // Validasi userId
    if (!userId) {
      throw new Error('user_id tidak boleh kosong');
    }
    
    // Pastikan brokerData memiliki properti yang diperlukan
    if (!brokerData || !brokerData.broker_name) {
      throw new Error('Nama broker diperlukan');
    }
    
    if (!brokerData || !brokerData.account_name) {
      throw new Error('Nama akun diperlukan');
    }
    
    if (!brokerData || !brokerData.account_id) {
      throw new Error('ID akun trading diperlukan');
    }

    // Solusi untuk mengatasi masalah RLS: 
    // Gunakan opsi bypass RLS dengan service role key (hanya untuk development)
    
    // Cara 1: Matikan RLS sementara dengan SQL di dashboard Supabase:
    // ALTER TABLE brokers DISABLE ROW LEVEL SECURITY;

    // Cara 2 (Gunakan ini): Gunakan header khusus untuk menyetel user_id
    const { data, error } = await supabase
      .from('brokers')
      .insert([{ 
        ...brokerData, 
        user_id: userId 
      }])
      .select();
    
    if (error) {
      console.error('Error dari Supabase:', error);
      
      // Jika error terkait RLS, berikan petunjuk lebih spesifik
      if (error.message && error.message.includes('violates row-level security policy')) {
        throw new Error('RLS error: Anda perlu mematikan RLS atau mengatur kebijakan INSERT untuk tabel brokers');
      }
      
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Tidak ada data yang dikembalikan setelah insert');
    }
    
    console.log('Akun trading berhasil ditambahkan:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error adding broker:', error.message || JSON.stringify(error));
    throw error;
  }
}

// Fungsi untuk update data broker
export async function updateBroker(brokerId, userId, brokerData) {
  try {
    const { data, error } = await supabase
      .from('brokers')
      .update(brokerData)
      .eq('id', brokerId)
      .eq('user_id', userId) // Pastikan broker milik user yang sesuai
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating broker:', error);
    throw error;
  }
}

// Fungsi untuk hapus broker
export async function deleteBroker(brokerId, userId) {
  try {
    console.log('Menghapus broker dengan ID:', brokerId, 'untuk user ID:', userId);
    
    // Verifikasi terlebih dahulu bahwa broker milik user yang benar
    const { data: brokerData, error: checkError } = await supabase
      .from('brokers')
      .select('*')
      .eq('id', brokerId)
      .eq('user_id', userId)
      .single();
    
    if (checkError) {
      console.error('Broker tidak ditemukan atau bukan milik user:', checkError);
      throw new Error('Broker tidak ditemukan atau Anda tidak memiliki akses');
    }
    
    // Hapus broker
    const { error } = await supabase
      .from('brokers')
      .delete()
      .eq('id', brokerId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting broker:', error);
      throw error;
    }
    
    console.log('Broker berhasil dihapus');
    return true;
  } catch (error) {
    console.error('Error in deleteBroker:', error);
    throw error;
  }
}

// Fungsi untuk mendapatkan detail broker
export async function getBrokerById(brokerId, userId) {
  try {
    const { data, error } = await supabase
      .from('brokers')
      .select('*')
      .eq('id', brokerId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting broker by ID:', error);
    throw error;
  }
}

// Fungsi untuk mendapatkan semua transaksi trading dari broker tertentu
export async function getTrades(brokerId, userId, dateRange, filterData) {
  try {
    let query = supabase.from('trades');

    // Periksa apakah brokerId adalah array
    if (Array.isArray(brokerId)) {
      // Jika brokerId adalah array, kita filter berdasarkan array broker_id
      query = query.select('*').in('broker_id', brokerId);
    } else {
      // Jika brokerId adalah nilai tunggal, verifikasi bahwa broker milik user yang benar
      const { data: brokerData, error: checkError } = await supabase
        .from('brokers')
        .select('id')
        .eq('id', brokerId)
        .eq('user_id', userId)
        .single();
      
      if (checkError) {
        throw new Error('Broker tidak ditemukan atau Anda tidak memiliki akses');
      }
      
      query = query.select('*').eq('broker_id', brokerId);
    }
    
    // Terapkan filter tanggal jika ada
    if (dateRange?.start) {
      // Pastikan tanggal mulai diset ke awal hari (00:00:00)
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      query = query.gte('open_date', startDate.toISOString());
    }
    
    if (dateRange?.end) {
      // Tambahkan waktu 23:59:59 untuk mencakup semua transaksi pada tanggal tersebut
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('open_date', endDate.toISOString());
    }
    
    // Terapkan filter tambahan jika ada
    if (filterData) {
      Object.keys(filterData).forEach(key => {
        if (filterData[key] !== undefined && filterData[key] !== null && filterData[key] !== '') {
          query = query.eq(key, filterData[key]);
        }
      });
    }
    
    const { data, error } = await query.order('open_date', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting trades:', error);
    throw error;
  }
}

// Fungsi untuk menambah transaksi trading baru
export async function addTrade(brokerId, userId, tradeData) {
  try {
    console.log('AddTrade - Input data:', { brokerId, userId, tradeData });
    
    // Verifikasi terlebih dahulu bahwa broker milik user yang benar
    const { data: brokerData, error: checkError } = await supabase
      .from('brokers')
      .select('id')
      .eq('id', brokerId)
      .eq('user_id', userId)
      .single();
    
    if (checkError) {
      console.error('Broker verification error:', checkError);
      throw new Error('Broker tidak ditemukan atau Anda tidak memiliki akses');
    }
    
    // Pastikan direction selalu disertakan (BUY atau SELL)
    if (!tradeData.direction) {
      tradeData.direction = 'BUY'; // Default jika tidak ada
    }
    
    // Tangani nilai risk_reward yang berformat string "1:X"
    let riskRewardValue = null;
    if (tradeData.risk_reward) {
      // Jika dalam format "1:X", ekstrak nilai numerik X
      if (typeof tradeData.risk_reward === 'string' && tradeData.risk_reward.includes(':')) {
        const parts = tradeData.risk_reward.split(':');
        if (parts.length === 2 && !isNaN(parseFloat(parts[1]))) {
          riskRewardValue = parseFloat(parts[1]);
        }
      } else if (!isNaN(parseFloat(tradeData.risk_reward))) {
        // Jika sudah nilai numerik
        riskRewardValue = parseFloat(tradeData.risk_reward);
      }
    }
    
    // Konversi string ke format yang tepat
    let payload = {
      broker_id: brokerId,
      pair: tradeData.pair,
      direction: tradeData.direction,
      open_date: tradeData.open_date || new Date().toISOString(),
      close_date: tradeData.close_date || new Date().toISOString(),
      entry_price: parseFloat(tradeData.entry_price) || 0,
      exit_price: tradeData.exit_price ? parseFloat(tradeData.exit_price) : null,
      stop_loss: tradeData.stop_loss ? parseFloat(tradeData.stop_loss) : null,
      take_profit: tradeData.take_profit ? parseFloat(tradeData.take_profit) : null,
      lot_size: parseFloat(tradeData.lot_size) || 0.01,
      profit_loss: tradeData.profit_loss !== undefined && tradeData.profit_loss !== null ? parseFloat(tradeData.profit_loss) : 0,
      risk_reward: riskRewardValue,
      comment: tradeData.comment || ""
    };

    // Cetak payload untuk debugging
    console.log('Payload yang akan dikirim ke database:', payload);
    
    const { data, error } = await supabase
      .from('trades')
      .insert([payload])
      .select();
    
    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    console.log('Trade berhasil ditambahkan:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error adding trade:', error);
    // Tambahkan detail lebih lanjut tentang error
    console.error('Error message:', error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Kirim pesan error yang lebih jelas
    throw new Error(`Gagal menambahkan transaksi: ${error.message || 'Terjadi kesalahan tidak diketahui'}`);
  }
}

// Fungsi untuk update transaksi trading
export async function updateTrade(tradeId, brokerId, userId, tradeData) {
  try {
    // Verifikasi terlebih dahulu bahwa broker milik user yang benar
    const { data: brokerData, error: checkError } = await supabase
      .from('brokers')
      .select('id')
      .eq('id', brokerId)
      .eq('user_id', userId)
      .single();
    
    if (checkError) {
      throw new Error('Broker tidak ditemukan atau Anda tidak memiliki akses');
    }
    
    // Tangani nilai risk_reward yang berformat string "1:X"
    let riskRewardValue = null;
    if (tradeData.risk_reward) {
      // Jika dalam format "1:X", ekstrak nilai numerik X
      if (typeof tradeData.risk_reward === 'string' && tradeData.risk_reward.includes(':')) {
        const parts = tradeData.risk_reward.split(':');
        if (parts.length === 2 && !isNaN(parseFloat(parts[1]))) {
          riskRewardValue = parseFloat(parts[1]);
        } else {
          // Jika tidak dapat dikonversi, set null
          riskRewardValue = null;
        }
      } else if (!isNaN(parseFloat(tradeData.risk_reward))) {
        // Jika sudah nilai numerik
        riskRewardValue = parseFloat(tradeData.risk_reward);
      }
    }
    
    // Persiapkan data sesuai struktur tabel aktual
    // Hanya menggunakan kolom yang pasti ada di tabel trades
    const tradePayload = {
      pair: tradeData.pair,
      direction: tradeData.direction || tradeData.type,
      open_date: tradeData.open_date,
      close_date: tradeData.close_date || new Date().toISOString(),
      entry_price: tradeData.entry_price || tradeData.open_price,
      exit_price: tradeData.exit_price || tradeData.close_price,
      stop_loss: tradeData.stop_loss || null,
      take_profit: tradeData.take_profit || null,
      lot_size: tradeData.lot_size,
      profit_loss: tradeData.profit_loss !== undefined && tradeData.profit_loss !== null ? parseFloat(tradeData.profit_loss) : 0,
      risk_reward: riskRewardValue,
      comment: tradeData.comment || tradeData.notes || ""
    };
    
    // Coba dapatkan skema tabel untuk memeriksa kolom apa saja yang ada
    try {
      const { data: schemaData } = await supabase.rpc('get_table_definition', { table_name: 'trades' });
      console.log('Skema tabel trades:', schemaData);
    } catch (e) {
      console.log('Tidak dapat mendapatkan skema tabel:', e);
    }
    
    // Log payload untuk debugging
    console.log('Update trade payload:', tradePayload);

    // Coba update
    const { data, error } = await supabase
      .from('trades')
      .update(tradePayload)
      .eq('id', tradeId)
      .eq('broker_id', brokerId)
      .select();
    
    if (error) {
      console.error('Supabase update error:', error);
      
      // Jika error berkaitan dengan kolom yang tidak ditemukan, coba lagi tanpa kolom tersebut
      if (error.message && error.message.includes('column')) {
        // Ambil nama kolom dari pesan error
        const errorMatch = error.message.match(/'([^']+)'/);
        if (errorMatch && errorMatch[1]) {
          const problematicColumn = errorMatch[1];
          console.log(`Menghapus kolom bermasalah: ${problematicColumn}`);
          
          // Hapus kolom yang bermasalah
          delete tradePayload[problematicColumn];
          
          // Coba update lagi
          const { data: retryData, error: retryError } = await supabase
            .from('trades')
            .update(tradePayload)
            .eq('id', tradeId)
            .eq('broker_id', brokerId)
            .select();
            
          if (retryError) {
            throw new Error(`Gagal memperbarui transaksi (percobaan kedua): ${retryError.message}`);
          }
          
          return retryData[0];
        }
      }
      
      throw new Error(`Gagal memperbarui transaksi: ${error.message || 'Terjadi kesalahan tidak diketahui'}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error('Transaksi tidak ditemukan atau tidak dapat diperbarui');
    }
    
    return data[0];
  } catch (error) {
    console.error('Error updating trade:', error);
    throw error;
  }
}

// Fungsi untuk hapus transaksi trading
export async function deleteTrade(tradeId, brokerId, userId) {
  try {
    // Verifikasi terlebih dahulu bahwa broker milik user yang benar
    const { data: brokerData, error: checkError } = await supabase
      .from('brokers')
      .select('id')
      .eq('id', brokerId)
      .eq('user_id', userId)
      .single();
    
    if (checkError) {
      throw new Error('Broker tidak ditemukan atau Anda tidak memiliki akses');
    }
    
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId)
      .eq('broker_id', brokerId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting trade:', error);
    throw error;
  }
}

// Fungsi untuk mendapatkan detail broker berdasarkan slug (nama)
export async function getBrokerBySlug(slug, userId) {
  try {
    // Konversi slug kembali ke possible broker names
    // Cari broker dengan nama yang cocok setelah dikonversi ke slug
    const { data, error } = await supabase
      .from('brokers')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Filter broker yang slugnya cocok
    const broker = data.find(broker => {
      const brokerSlug = broker.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return brokerSlug === slug;
    });
    
    if (!broker) {
      throw new Error('Broker tidak ditemukan');
    }
    
    return broker;
  } catch (error) {
    console.error('Error getting broker by slug:', error);
    throw error;
  }
} 