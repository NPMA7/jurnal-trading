-- Update struktur tabel brokers untuk menampung informasi akun trading

-- Tambahkan kolom baru
ALTER TABLE brokers 
ADD COLUMN IF NOT EXISTS broker_name text,
ADD COLUMN IF NOT EXISTS account_id text;

-- Renamakan kolom 'name' menjadi 'account_name' untuk kejelasan
ALTER TABLE brokers 
RENAME COLUMN name TO account_name;

-- Renamakan kolom 'description' menjadi 'comments' untuk konsistensi
ALTER TABLE brokers 
RENAME COLUMN description TO comments;

-- Komentar pada tabel
COMMENT ON TABLE brokers IS 'Menyimpan informasi akun trading pengguna';
COMMENT ON COLUMN brokers.id IS 'ID unik untuk setiap akun trading';
COMMENT ON COLUMN brokers.account_name IS 'Nama akun trading';
COMMENT ON COLUMN brokers.broker_name IS 'Nama broker (XM, Binance, dll)';
COMMENT ON COLUMN brokers.account_id IS 'ID akun dari broker';
COMMENT ON COLUMN brokers.comments IS 'Komentar atau catatan tentang akun';
COMMENT ON COLUMN brokers.user_id IS 'ID pengguna yang memiliki akun trading';
COMMENT ON COLUMN brokers.created_at IS 'Tanggal dan waktu pembuatan akun'; 