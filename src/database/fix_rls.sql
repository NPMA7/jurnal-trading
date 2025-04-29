-- Opsi 1: Matikan RLS untuk tabel brokers (HANYA UNTUK PENGEMBANGAN)
-- Gunakan ini jika Anda mau akses langsung tanpa RLS untuk sementara
ALTER TABLE brokers DISABLE ROW LEVEL SECURITY;

-- ATAU --

-- Opsi 2: Buat kebijakan RLS yang benar (REKOMENDASI UNTUK PRODUKSI)
-- Gunakan ini jika Anda ingin mempertahankan keamanan RLS

-- Hapus kebijakan yang ada jika sudah ada
DROP POLICY IF EXISTS brokers_insert_policy ON brokers;
DROP POLICY IF EXISTS brokers_select_policy ON brokers;
DROP POLICY IF EXISTS brokers_update_policy ON brokers;
DROP POLICY IF EXISTS brokers_delete_policy ON brokers;

-- Aktifkan RLS pada tabel brokers
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk SELECT: bisa melihat baris milik user sendiri
CREATE POLICY brokers_select_policy ON brokers
    FOR SELECT
    USING (user_id = auth.uid() OR user_id = COALESCE(current_setting('user.id', TRUE)::UUID, '00000000-0000-0000-0000-000000000000'));

-- Kebijakan untuk INSERT: user bisa menambahkan baris
CREATE POLICY brokers_insert_policy ON brokers
    FOR INSERT
    WITH CHECK (true);  -- Izinkan semua INSERT, kita bisa memastikan user_id yang benar di aplikasi

-- Kebijakan untuk UPDATE: hanya bisa update baris milik user sendiri
CREATE POLICY brokers_update_policy ON brokers
    FOR UPDATE
    USING (user_id = auth.uid() OR user_id = COALESCE(current_setting('user.id', TRUE)::UUID, '00000000-0000-0000-0000-000000000000'));

-- Kebijakan untuk DELETE: hanya bisa hapus baris milik user sendiri
CREATE POLICY brokers_delete_policy ON brokers
    FOR DELETE
    USING (user_id = auth.uid() OR user_id = COALESCE(current_setting('user.id', TRUE)::UUID, '00000000-0000-0000-0000-000000000000'));

-- ATAU --

-- Opsi 3: Set role user_id secara manual untuk setiap koneksi
SELECT set_config('user.id', '{{USER_ID_SAAT_INI}}', FALSE);

-- Lalu gunakan kebijakan ini
DROP POLICY IF EXISTS brokers_insert_policy ON brokers;
CREATE POLICY brokers_insert_policy ON brokers
    FOR INSERT
    WITH CHECK (user_id = COALESCE(current_setting('user.id', TRUE)::UUID, '00000000-0000-0000-0000-000000000000')); 