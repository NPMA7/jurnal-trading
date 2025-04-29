-- Hapus kebijakan RLS yang membatasi insert/update ke admin saja
DROP POLICY IF EXISTS "Hanya admin yang bisa mengubah kurs" ON public.exchange_rates;
DROP POLICY IF EXISTS "Hanya admin yang bisa memperbarui kurs" ON public.exchange_rates;

-- Buat kebijakan baru yang mengizinkan semua pengguna untuk insert/update
CREATE POLICY "Semua pengguna dapat mengubah kurs" 
  ON public.exchange_rates 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Semua pengguna dapat memperbarui kurs" 
  ON public.exchange_rates 
  FOR UPDATE 
  USING (true);

-- Pastikan kebijakan select tetap ada
DROP POLICY IF EXISTS "Semua pengguna dapat membaca kurs" ON public.exchange_rates;
CREATE POLICY "Semua pengguna dapat membaca kurs" 
  ON public.exchange_rates 
  FOR SELECT 
  USING (true);

-- Tambahkan komentar
COMMENT ON TABLE public.exchange_rates IS 'Menyimpan data kurs mata uang untuk kalkulasi profit/loss tanpa batasan RLS'; 