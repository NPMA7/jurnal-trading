'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Terms() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-10 md:pt-16 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 z-0">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-indigo-100"
              style={{
                width: `${Math.random() * 5 + 2}px`,
                height: `${Math.random() * 5 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1
              }}
              animate={{
                y: [0, -Math.random() * 100 - 50],
                x: [0, (Math.random() - 0.5) * 30],
                opacity: [0.1, 0.8, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <motion.div 
        className="z-10 flex items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-xl shadow-lg flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Syarat dan Ketentuan</h1>
      </motion.div>
      
      {/* Content */}
      <motion.div 
        className="z-10 max-w-4xl w-full mx-auto bg-white/90 backdrop-blur-md shadow-xl rounded-xl border border-indigo-100/40 p-6 md:p-8 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="prose prose-indigo max-w-none">
          <p className="text-gray-600 mb-6">
            Terakhir diperbarui: 27 April 2023
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Ketentuan Umum</h2>
          <p className="text-gray-600 mb-4">
            Dengan mengakses dan menggunakan aplikasi Jurnal Trading ini, Anda menyetujui untuk terikat oleh syarat dan ketentuan yang tercantum di bawah ini. Apabila Anda tidak menyetujui salah satu, sebagian, atau seluruh isi dari syarat dan ketentuan ini, maka Anda tidak diperkenankan untuk menggunakan layanan kami.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Deskripsi Layanan</h2>
          <p className="text-gray-600 mb-4">
            Aplikasi Jurnal Trading adalah platform untuk mencatat, menganalisis, dan mendapatkan insight dari aktivitas trading Anda. Aplikasi ini menyediakan alat untuk membantu dalam pengelolaan portofolio trading dan pengambilan keputusan.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Akun Pengguna</h2>
          <p className="text-gray-600 mb-4">
            Untuk menggunakan layanan kami, Anda harus membuat akun dengan memberikan informasi yang akurat dan lengkap. Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi akun Anda dan sepenuhnya bertanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Penggunaan yang Dilarang</h2>
          <p className="text-gray-600 mb-4">
            Anda dilarang menggunakan aplikasi ini untuk tujuan yang melanggar hukum atau peraturan yang berlaku. Anda juga dilarang melakukan tindakan yang dapat merusak, menonaktifkan, membebani, atau mengganggu fungsi aplikasi.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Keamanan Data</h2>
          <p className="text-gray-600 mb-4">
            Kami mengimplementasikan langkah-langkah keamanan yang sesuai untuk melindungi data pribadi Anda dari akses yang tidak sah. Namun, tidak ada metode transmisi atau penyimpanan elektronik yang 100% aman. Oleh karena itu, kami tidak dapat menjamin keamanan absolut.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Disclaimer Investasi</h2>
          <p className="text-gray-600 mb-4">
            Informasi yang disediakan dalam aplikasi ini hanya untuk tujuan informasi dan tidak dimaksudkan sebagai saran investasi. Keputusan trading dan investasi adalah tanggung jawab Anda sepenuhnya. Kami tidak bertanggung jawab atas kerugian yang mungkin timbul dari penggunaan informasi yang disediakan.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Batasan Tanggung Jawab</h2>
          <p className="text-gray-600 mb-4">
            Dalam batas maksimal yang diizinkan oleh hukum, kami tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan kami.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Perubahan pada Syarat dan Ketentuan</h2>
          <p className="text-gray-600 mb-4">
            Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan efektif segera setelah posting syarat dan ketentuan yang direvisi di aplikasi. Penggunaan berkelanjutan Anda atas layanan kami setelah posting perubahan akan dianggap sebagai penerimaan Anda terhadap perubahan tersebut.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9. Hukum yang Berlaku</h2>
          <p className="text-gray-600 mb-4">
            Ketentuan ini akan diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia, tanpa memperhatikan konflik ketentuan hukum.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10. Kontak</h2>
          <p className="text-gray-600 mb-4">
            Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami di support@jurnaltrading.com.
          </p>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all"
            >
              Kembali ke Pendaftaran
            </motion.button>
          </Link>
        </div>
      </motion.div>
      
      {/* Footer */}
      <motion.div
        className="z-10 text-center text-sm text-gray-500 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p>© {new Date().getFullYear()} Jurnal Trading. Hak Cipta Dilindungi.</p>
      </motion.div>
    </div>
  );
} 