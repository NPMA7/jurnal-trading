 -- Membuat tabel untuk menyimpan data kurs mata uang
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_currency TEXT NOT NULL,  -- Mata uang dasar (misalnya USD)
  target_currency TEXT NOT NULL, -- Mata uang target (misalnya JPY)
  rate DECIMAL(18,6) NOT NULL,  -- Nilai kurs (misalnya 143.5)
  last_updated TIMESTAMPTZ NOT NULL, -- Tanggal/waktu terakhir diperbarui
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- Tanggal/waktu record dibuat
  
  -- Unique constraint untuk memastikan tidak ada duplikasi
  CONSTRAINT unique_currency_pair UNIQUE (base_currency, target_currency)
);

-- Tambahkan komentar pada tabel
COMMENT ON TABLE public.exchange_rates IS 'Menyimpan data kurs mata uang untuk kalkulasi profit/loss';

-- Tambahkan RLS (Row Level Security)
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Buat kebijakan untuk membaca data: semua pengguna dapat membaca
CREATE POLICY "Semua pengguna dapat membaca kurs" 
  ON public.exchange_rates FOR SELECT USING (true);

-- Buat kebijakan untuk insert/update: hanya admin yang bisa
CREATE POLICY "Hanya admin yang bisa mengubah kurs" 
  ON public.exchange_rates FOR INSERT WITH CHECK (auth.role() = 'admin');
CREATE POLICY "Hanya admin yang bisa memperbarui kurs" 
  ON public.exchange_rates FOR UPDATE USING (auth.role() = 'admin');

-- Buat indeks untuk mempercepat pencarian
CREATE INDEX IF NOT EXISTS exchange_rates_currency_pair_idx 
  ON public.exchange_rates (base_currency, target_currency);
CREATE INDEX IF NOT EXISTS exchange_rates_last_updated_idx 
  ON public.exchange_rates (last_updated);