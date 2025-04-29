-- Solusi RLS tanpa auth.uuid (gunakan ini untuk sistem autentikasi kustom)

-- 1. Hapus kebijakan yang ada terlebih dahulu
DROP POLICY IF EXISTS brokers_insert_policy ON brokers;
DROP POLICY IF EXISTS brokers_select_policy ON brokers;
DROP POLICY IF EXISTS brokers_update_policy ON brokers;
DROP POLICY IF EXISTS brokers_delete_policy ON brokers;

-- 2. Aktifkan RLS pada tabel brokers
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;

-- 3. Buat kebijakan INSERT yang mengizinkan semua tanpa syarat
CREATE POLICY brokers_insert_policy ON brokers
    FOR INSERT
    WITH CHECK (true);

-- 4. Kebijakan SELECT yang hanya memeriksa user_id (tanpa auth.uuid)
CREATE POLICY brokers_select_policy ON brokers
    FOR SELECT
    USING (true);  -- Atau USING (user_id::text = current_setting('app.user_id', true)) jika ingin membatasi

-- 5. Kebijakan UPDATE yang hanya memeriksa user_id (tanpa auth.uuid)
CREATE POLICY brokers_update_policy ON brokers
    FOR UPDATE
    USING (true);  -- Atau USING (user_id::text = current_setting('app.user_id', true)) jika ingin membatasi

-- 6. Kebijakan DELETE yang hanya memeriksa user_id (tanpa auth.uuid)
CREATE POLICY brokers_delete_policy ON brokers
    FOR DELETE
    USING (true);  -- Atau USING (user_id::text = current_setting('app.user_id', true)) jika ingin membatasi

-- CATATAN: Kebijakan di atas mengizinkan akses TANPA BATASAN keamanan di level database.
-- Ini berarti keamanan harus ditangani di level aplikasi.
-- Di lingkungan PRODUKSI, gunakan pendekatan yang lebih ketat dengan 
-- menyetel parameter user_id pada setiap koneksi:

-- Contoh untuk mengaktifkan pembatasan di masa mendatang:
-- CREATE POLICY restrict_brokers ON brokers
--    USING (user_id::text = current_setting('app.user_id', true)); 