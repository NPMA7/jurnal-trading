-- Setup Database Jurnal Trading Forex
-- File SQL untuk inisialisasi struktur database di Supabase

-- Aktifkan ekstensi yang dibutuhkan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============= TABEL USERS =============
-- Tabel users sudah otomatis dibuat oleh Supabase Auth, tapi kita tambahkan kolom ekstra
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS full_name TEXT;

-- ============= TABEL BROKERS =============
CREATE TABLE IF NOT EXISTS brokers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    initial_deposit DECIMAL(15, 2) DEFAULT 0,
    description TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true
);

-- ============= TABEL TRADES =============
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pair TEXT NOT NULL,
    direction TEXT NOT NULL, -- 'BUY' atau 'SELL'
    open_date TIMESTAMPTZ,
    close_date TIMESTAMPTZ,
    entry_price DECIMAL(15, 5),
    exit_price DECIMAL(15, 5),
    stop_loss DECIMAL(15, 5),
    take_profit DECIMAL(15, 5),
    lot_size DECIMAL(15, 5),
    profit_loss DECIMAL(15, 2),
    risk_reward DECIMAL(10, 2),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    images TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- ============= TABEL EXCHANGE RATES =============
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    base_currency TEXT NOT NULL,
    target_currency TEXT NOT NULL,
    rate DECIMAL(15, 5) NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (base_currency, target_currency)
);

-- ============= TRIGGER UNTUK UPDATE TIMESTAMP =============
-- Untuk otomatis mengupdate kolom updated_at ketika ada perubahan
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for brokers table
CREATE TRIGGER set_timestamp_brokers
BEFORE UPDATE ON brokers
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Trigger for trades table
CREATE TRIGGER set_timestamp_trades
BEFORE UPDATE ON trades
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- ============= Row Level Security (RLS) =============
-- Aktifkan RLS pada semua tabel
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk tabel brokers
CREATE POLICY "Brokers bisa diakses pemiliknya saja" 
ON brokers 
FOR ALL 
USING (auth.uid() = user_id);

-- Kebijakan untuk tabel trades
CREATE POLICY "Trades bisa diakses pemiliknya saja" 
ON trades 
FOR ALL 
USING (auth.uid() = user_id);

-- Kebijakan untuk tabel exchange_rates (dapat diakses semua pengguna)
CREATE POLICY "Exchange rates diakses semua" 
ON exchange_rates 
FOR SELECT 
TO authenticated 
USING (true);

-- Kebijakan untuk INSERT pada exchange_rates (hanya admin)
CREATE POLICY "Admin bisa update exchange rates"
ON exchange_rates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id AND is_admin = true
  )
);

-- ============= FUNGSI HELPER =============
-- Fungsi untuk menambahkan trade baru
CREATE OR REPLACE FUNCTION add_trade(
    _broker_id UUID,
    _user_id UUID,
    _pair TEXT,
    _direction TEXT,
    _open_date TIMESTAMPTZ,
    _close_date TIMESTAMPTZ,
    _entry_price DECIMAL,
    _exit_price DECIMAL,
    _stop_loss DECIMAL,
    _take_profit DECIMAL,
    _lot_size DECIMAL,
    _profit_loss DECIMAL,
    _risk_reward DECIMAL,
    _comment TEXT,
    _images TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID AS $$
DECLARE
    _trade_id UUID;
BEGIN
    -- Verifikasi user
    IF NOT EXISTS (SELECT 1 FROM brokers WHERE id = _broker_id AND user_id = _user_id) THEN
        RAISE EXCEPTION 'Broker tidak ditemukan atau tidak dimiliki oleh pengguna';
    END IF;

    -- Tambahkan trade
    INSERT INTO trades (
        broker_id, user_id, pair, direction, open_date, close_date,
        entry_price, exit_price, stop_loss, take_profit, lot_size,
        profit_loss, risk_reward, comment, images
    ) VALUES (
        _broker_id, _user_id, _pair, _direction, _open_date, _close_date,
        _entry_price, _exit_price, _stop_loss, _take_profit, _lot_size,
        _profit_loss, _risk_reward, _comment, _images
    )
    RETURNING id INTO _trade_id;

    RETURN _trade_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fungsi untuk update trade
CREATE OR REPLACE FUNCTION update_trade(
    _trade_id UUID,
    _broker_id UUID,
    _user_id UUID,
    _pair TEXT,
    _direction TEXT,
    _open_date TIMESTAMPTZ,
    _close_date TIMESTAMPTZ,
    _entry_price DECIMAL,
    _exit_price DECIMAL,
    _stop_loss DECIMAL,
    _take_profit DECIMAL,
    _lot_size DECIMAL,
    _profit_loss DECIMAL,
    _risk_reward DECIMAL,
    _comment TEXT,
    _images TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID AS $$
DECLARE
    _updated_id UUID;
BEGIN
    -- Verifikasi user
    IF NOT EXISTS (SELECT 1 FROM trades WHERE id = _trade_id AND user_id = _user_id) THEN
        RAISE EXCEPTION 'Trade tidak ditemukan atau tidak dimiliki oleh pengguna';
    END IF;

    -- Update trade
    UPDATE trades
    SET
        pair = _pair,
        direction = _direction,
        open_date = _open_date,
        close_date = _close_date,
        entry_price = _entry_price,
        exit_price = _exit_price,
        stop_loss = _stop_loss,
        take_profit = _take_profit,
        lot_size = _lot_size,
        profit_loss = _profit_loss,
        risk_reward = _risk_reward,
        comment = _comment,
        images = _images,
        updated_at = NOW()
    WHERE id = _trade_id AND user_id = _user_id
    RETURNING id INTO _updated_id;

    RETURN _updated_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fungsi untuk menghapus trade
CREATE OR REPLACE FUNCTION delete_trade(
    _trade_id UUID,
    _broker_id UUID,
    _user_id UUID
)
RETURNS boolean AS $$
BEGIN
    -- Verifikasi user
    IF NOT EXISTS (SELECT 1 FROM trades WHERE id = _trade_id AND broker_id = _broker_id AND user_id = _user_id) THEN
        RAISE EXCEPTION 'Trade tidak ditemukan atau tidak dimiliki oleh pengguna';
    END IF;

    -- Hapus trade
    DELETE FROM trades
    WHERE id = _trade_id AND user_id = _user_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fungsi untuk menyimpan/mengupdate exchange rate
CREATE OR REPLACE FUNCTION save_exchange_rate(
    _base_currency TEXT,
    _target_currency TEXT,
    _rate DECIMAL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO exchange_rates (base_currency, target_currency, rate, last_updated)
    VALUES (_base_currency, _target_currency, _rate, NOW())
    ON CONFLICT (base_currency, target_currency)
    DO UPDATE SET
        rate = _rate,
        last_updated = NOW();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= MENAMBAHKAN ADMIN PERTAMA =============
-- Fungsi untuk menambahkan admin pertama
CREATE OR REPLACE FUNCTION create_first_admin(
    _user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE auth.users
    SET is_admin = true
    WHERE id = _user_id
    AND NOT EXISTS (
        SELECT 1 FROM auth.users WHERE is_admin = true
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= INDEX UNTUK PERFORMA =============
-- Membuat index untuk kolom yang sering dicari
CREATE INDEX IF NOT EXISTS idx_brokers_user_id ON brokers(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_broker_id ON trades(broker_id);
CREATE INDEX IF NOT EXISTS idx_trades_pair ON trades(pair);
CREATE INDEX IF NOT EXISTS idx_trades_open_date ON trades(open_date);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(base_currency, target_currency);

-- ============= CONTOH DATA (OPSIONAL) =============
-- Anda dapat menghapus bagian ini jika tidak ingin contoh data
/*
-- Contoh data exchange rates
INSERT INTO exchange_rates (base_currency, target_currency, rate, last_updated)
VALUES 
    ('USD', 'JPY', 143.0, NOW()),
    ('USD', 'EUR', 0.92, NOW()),
    ('USD', 'GBP', 0.78, NOW())
ON CONFLICT (base_currency, target_currency)
DO NOTHING;
*/ 