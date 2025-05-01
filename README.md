# Jurnal Trading Forex

Aplikasi berbasis web untuk mencatat, menganalisis, dan memperbaiki strategi trading secara efektif dan intuitif.

## Deskripsi

Jurnal Trading Forex adalah platform yang membantu trader untuk mendokumentasikan transaksi trading mereka, menganalisis performa, dan mendapatkan insight untuk meningkatkan strategi trading. Aplikasi ini dibangun dengan NextJS dan Supabase untuk memberikan pengalaman yang cepat dan responsif.

## Fitur Utama

- **Manajemen Akun Broker**: Tambahkan dan kelola beberapa akun broker dalam satu tempat
- **Pencatatan Transaksi**: Catat detail transaksi trading seperti pasangan mata uang, harga entry/exit, stop loss, take profit, dll
- **Perhitungan Otomatis**: Profit/loss dan risk/reward ratio dihitung secara otomatis
- **Mode Input Fleksibel**: Input stop loss dan take profit dalam harga atau pips
- **Perhitungan Risk/Reward yang Cerdas**:
  - Jika take profit diisi: Dihitung dari stop loss dan take profit
  - Jika take profit kosong tapi ada stop loss dan exit price: Dihitung dari stop loss dan harga exit
  - Jika tidak ada stop loss: Dihitung dari harga exit dengan asumsi risiko = 1%
- **Analisis Performa**: Lihat statistik trading seperti win rate, profit factor, dan drawdown maksimal
- **Autentikasi Pengguna**: Login dan registrasi dengan aman menggunakan Supabase Auth
- **Mode Gelap/Terang**: Antarmuka yang nyaman untuk digunakan di berbagai kondisi pencahayaan

## Teknologi

- **Frontend**: NextJS, React, TailwindCSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Deployment**: Vercel
- **API Eksternal**: Exchange Rate API untuk data kurs mata uang

## Instalasi

### Persyaratan

- Node.js (v14.x atau lebih baru)
- npm atau yarn
- Akun Supabase

### Langkah Instalasi

1. Clone repositori
   ```bash
   git clone https://github.com/NPMA7/jurnal-trading.git
   cd jurnal-trading
   ```

2. Instal dependensi
   ```bash
   npm install
   # atau
   yarn install
   ```

3. Buat file `.env.local` dan tambahkan variabel lingkungan:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
   ```

4. Setup database Supabase
   - Buat project baru di Supabase
   - Jalankan script setup database dari `src/lib/setup_db.sql` di SQL Editor Supabase

5. Jalankan server pengembangan:
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000) di browser Anda

## Penggunaan

### Registrasi dan Login

1. Daftar akun baru dengan mengisi formulir registrasi
2. Login dengan email dan password yang telah didaftarkan

### Menambahkan Broker

1. Setelah login, klik tombol "Tambah Broker"
2. Isi detail broker seperti nama, platform, dan deposit awal
3. Simpan broker

### Mencatat Transaksi

1. Pilih broker dari daftar
2. Klik tombol "Tambah Transaksi"
3. Isi detail transaksi:
   - Pasangan mata uang (pair)
   - Tanggal buka dan tutup
   - Harga entry dan exit
   - Stop loss dan take profit (opsional)
   - Ukuran lot
   - Komentar/Catatan
4. Profit/loss dan risk/reward ratio akan dihitung otomatis
5. Simpan transaksi

### Melihat Analisis

1. Lihat ringkasan statistik di halaman utama
2. Buka halaman analisis untuk metrik yang lebih detail

## Kontribusi

Kontribusi selalu diterima! Silakan buat pull request atau buka issue untuk perbaikan atau fitur baru.

## Lisensi

[MIT](LICENSE)

## Kontak

Untuk pertanyaan atau bantuan, silakan hubungi [pashamalik9371@email.com](mailto:pashamalik9371@email.com) 