'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [activeQuestion, setActiveQuestion] = useState(null);

  const features = [
    {
      title: "Catat Transaksi",
      description: "Dokumentasikan semua transaksi trading dengan detail lengkap",
      icon: "📊"
    },
    {
      title: "Analisis Performa",
      description: "Lihat grafik dan statistik untuk evaluasi strategi trading",
      icon: "📈"
    },
    {
      title: "Catatan Strategi",
      description: "Buat dan simpan strategi trading untuk referensi",
      icon: "📝"
    }
  ];

  const howItWorks = [
    {
      title: "Daftar Akun",
      description: "Buat akun gratis dalam hitungan detik dan mulai perjalanan trading Anda",
      icon: "👤"
    },
    {
      title: "Catat Trading Anda",
      description: "Masukkan detail transaksi: pasangan mata uang, lot size, entry & exit price, screenshot",
      icon: "✏️"
    },
    {
      title: "Analisis Performa",
      description: "Lihat statistik, grafik, dan identifikasi kekuatan serta kelemahan strategi Anda",
      icon: "🔍"
    },
    {
      title: "Tingkatkan Hasil",
      description: "Gunakan insight dari data untuk meningkatkan strategi dan keputusan trading",
      icon: "🚀"
    }
  ];

  const testimonials = [
    {
      name: "Ahmad Syafiq",
      role: "Trader Forex",
      text: "Sejak menggunakan Jurnal Trading, win rate saya meningkat dari 45% menjadi 68%. Saya bisa dengan mudah melihat pola dan kebiasaan trading yang perlu diperbaiki.",
      avatar: "/testimonial-1.png"
    },
    {
      name: "Siti Rahma",
      role: "Day Trader",
      text: "Aplikasi yang sangat user-friendly dan lengkap. Fitur analisis statistik membantu saya memahami kapan waktu terbaik untuk entry dan exit.",
      avatar: "/testimonial-2.png"
    },
    {
      name: "Budi Santoso",
      role: "Swing Trader",
      text: "Saya sekarang bisa melihat dengan jelas pair dan setup yang paling menguntungkan. Tampilan dashboard sangat informatif dan mudah dipahami.",
      avatar: "/testimonial-3.png"
    }
  ];

  const faqItems = [
    {
      question: "Apakah ada biaya untuk menggunakan platform ini?",
      answer: "Tidak, platform ini sepenuhnya gratis untuk digunakan. Kami berkomitmen untuk menyediakan alat jurnal trading yang berkualitas tanpa biaya apapun."
    },
    {
      question: "Bagaimana cara mengekspor data trading saya?",
      answer: "Data trading Anda dapat diekspor dengan mudah dalam format CSV, Excel, atau PDF melalui menu Pengaturan > Ekspor Data. Semua riwayat transaksi dan statistik dapat diunduh kapan saja."
    },
    {
      question: "Apakah platform ini mendukung semua jenis trading?",
      answer: "Ya, platform kami mendukung berbagai jenis trading termasuk Forex, Saham, Cryptocurrency, Komoditas dan Indeks. Anda dapat menyesuaikan kategori sesuai kebutuhan Anda."
    },
    {
      question: "Bagaimana keamanan data saya dijamin?",
      answer: "Kami menggunakan enkripsi end-to-end untuk melindungi data Anda. Server kami dijamin dengan standar keamanan industri terbaru dan kami tidak pernah membagikan data pribadi kepada pihak ketiga."
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-700">
      {/* Hero section */}
      <div className="relative h-screen flex items-center justify-center">
        {/* Background animation */}
        <div className="absolute inset-0 z-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${Math.random() * 15 + 5}px`,
                height: `${Math.random() * 15 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * -100 - 50],
                x: [0, (Math.random() - 0.5) * 50],
                scale: [1, Math.random() + 0.5, 0],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 z-10">
          <motion.div
            className="flex flex-col lg:flex-row items-center justify-between gap-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Left content */}
            <motion.div 
              className="max-w-xl"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center mb-6">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center"
                  animate={{ 
                    rotateZ: [0, 10, 0, -10, 0],
                    scale: [1, 1.05, 1, 1.05, 1] 
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </motion.div>
                <h2 className="text-2xl font-bold text-white ml-3">Jurnal Trading</h2>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Tingkatkan Performa <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">Trading Anda</span>
              </h1>
              
              <p className="text-lg text-white/80 mb-8">
                Platform jurnal trading yang membantu Anda mencatat, menganalisis, dan memperbaiki strategi trading secara efektif dan intuitif
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto py-3 px-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-pink-500/30 transition-all"
                  >
                    Masuk
                  </motion.button>
                </Link>
                
                <Link href="/register" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto py-3 px-8 bg-white/10 text-white font-semibold rounded-lg shadow-md hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all"
                  >
                    Daftar
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </div>

      {/* Features section */}
      <div className="container mx-auto px-4 py-16">
        <motion.h2 
          className="text-3xl font-bold text-center text-white mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Fitur Unggulan
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How it works section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">Cara Kerjanya</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Mulai perjalanan Anda menuju hasil trading yang lebih baik hanya dengan beberapa langkah mudah
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-1/2 top-12 bottom-0 w-1 bg-gradient-to-b from-pink-500/50 to-indigo-600/50 rounded-full"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                className={`relative ${index % 2 === 0 ? 'md:text-right md:mr-8' : 'md:ml-8'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                {/* Step number for larger screens */}
                <div className={`hidden md:flex absolute top-0 ${index % 2 === 0 ? 'right-0 -translate-x-1/2' : 'left-0 translate-x-1/2'} -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg text-white font-bold text-xl items-center justify-center z-10`}>
                  {index + 1}
                </div>
                
                {/* Step content */}
                <div className="bg-white/10 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-white/10">
                  <div className="flex md:block items-center mb-4">
                    <span className="text-3xl mr-4 md:mr-0 md:mb-3">{step.icon}</span>
                    <div className="md:hidden w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg text-white font-bold flex items-center justify-center mr-4">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-white/70">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials section */}
      <div className="py-20 bg-gradient-to-b from-transparent to-indigo-950/70">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Kata Mereka</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Trader seperti Anda yang telah meningkatkan performa tradingnya dengan jurnal kami
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="absolute -top-3 -left-3 text-4xl">"</div>
                <p className="text-white/90 mb-6 relative z-10">{testimonial.text}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">Pertanyaan Umum</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Jawaban untuk pertanyaan yang sering ditanyakan
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqItems.map((faq, index) => (
            <motion.div
              key={index}
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <button
                className={`w-full text-left p-5 rounded-lg ${activeQuestion === index ? 'bg-white/15' : 'bg-white/5'} backdrop-blur-sm border border-white/10 transition-all duration-300`}
                onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-white transition-transform duration-300 ${activeQuestion === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {activeQuestion === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 text-white/70"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Mulai Tingkatkan Performa Trading Anda Hari Ini</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Bergabunglah dengan ribuan trader yang telah meningkatkan strategi trading mereka dengan bantuan Jurnal Trading - sepenuhnya gratis!
          </p>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="py-3 px-8 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:shadow-white/20 transition-all mx-auto"
            >
              Daftar Sekarang - Gratis
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-auto py-8 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-lg shadow-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <span className="text-white font-medium ml-2">Jurnal Trading</span>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Jurnal Trading. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
