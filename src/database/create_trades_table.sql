-- Pastikan ekstensi uuid-ossp sudah aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Buat fungsi update_updated_at_column jika belum ada
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Buat tabel trades
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  broker_id INTEGER NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  
  -- Data transaksi trading
  pair TEXT NOT NULL, -- Instrumen trading (EUR/USD, BTC/USDT, dll)
  direction TEXT NOT NULL, -- BUY/SELL (arah transaksi)
  lot_size DECIMAL(10, 2) NOT NULL, -- Ukuran posisi dalam lot/unit
  
  -- Harga dan level
  entry_price DECIMAL(18, 8) NOT NULL, -- Harga masuk posisi
  stop_loss DECIMAL(18, 8), -- Level stop loss
  take_profit DECIMAL(18, 8), -- Level take profit
  exit_price DECIMAL(18, 8), -- Harga keluar posisi
  
  -- Metrik dan analisis
  risk_reward DECIMAL(5, 2), -- Rasio risk:reward
  profit_loss DECIMAL(10, 2), -- Keuntungan/kerugian
  
  -- Tanggal transaksi
  open_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), -- Tanggal buka posisi
  close_date TIMESTAMP WITH TIME ZONE, -- Tanggal tutup posisi
  
  -- Informasi analisis
  strategy TEXT, -- Strategi yang digunakan
  comment TEXT, -- Komentar/catatan transaksi
  images TEXT[], -- Array URL gambar/screenshot chart
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
) TABLESPACE pg_default;

-- Tambahkan indeks untuk meningkatkan performa query
CREATE INDEX IF NOT EXISTS trades_broker_id_idx ON trades(broker_id);
CREATE INDEX IF NOT EXISTS trades_pair_idx ON trades(pair);
CREATE INDEX IF NOT EXISTS trades_open_date_idx ON trades(open_date);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS tanpa fungsi kustom (keamanan ditangani di aplikasi)
DROP POLICY IF EXISTS trades_broker_isolation_policy ON trades;
CREATE POLICY trades_broker_isolation_policy ON trades
  USING (TRUE);

-- Tambahkan trigger untuk update kolom updated_at
CREATE TRIGGER update_trades_updated_at 
BEFORE UPDATE ON trades 
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Penjelasan tabel dan kolom
COMMENT ON TABLE trades IS 'Menyimpan data transaksi trading';
COMMENT ON COLUMN trades.id IS 'ID unik untuk setiap transaksi';
COMMENT ON COLUMN trades.broker_id IS 'ID akun broker yang digunakan';
COMMENT ON COLUMN trades.pair IS 'Pair/instrumen trading';
COMMENT ON COLUMN trades.direction IS 'Arah transaksi: BUY atau SELL';
COMMENT ON COLUMN trades.lot_size IS 'Ukuran posisi dalam lot/unit';
COMMENT ON COLUMN trades.entry_price IS 'Harga masuk posisi';
COMMENT ON COLUMN trades.stop_loss IS 'Level stop loss';
COMMENT ON COLUMN trades.take_profit IS 'Level take profit';
COMMENT ON COLUMN trades.exit_price IS 'Harga keluar posisi';
COMMENT ON COLUMN trades.risk_reward IS 'Rasio risk:reward';
COMMENT ON COLUMN trades.profit_loss IS 'Keuntungan/kerugian dari transaksi';
COMMENT ON COLUMN trades.open_date IS 'Tanggal dan waktu pembukaan posisi';
COMMENT ON COLUMN trades.close_date IS 'Tanggal dan waktu penutupan posisi';
COMMENT ON COLUMN trades.strategy IS 'Strategi trading yang digunakan';
COMMENT ON COLUMN trades.comment IS 'Komentar atau catatan tambahan';
COMMENT ON COLUMN trades.images IS 'Kumpulan URL screenshot chart';
COMMENT ON COLUMN trades.created_at IS 'Tanggal dan waktu pencatatan transaksi';
COMMENT ON COLUMN trades.updated_at IS 'Tanggal dan waktu terakhir update transaksi';