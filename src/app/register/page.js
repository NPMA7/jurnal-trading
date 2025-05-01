'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { signUp, emailVerificationStatus } = useAuth();
  const router = useRouter();

  // Membuat nilai acak untuk animasi yang tidak berubah setiap render
  const backgroundElements = useMemo(() => {
    return {
      circles: Array(5).fill(0).map((_, i) => ({
        key: `circle-${i}`,
        width: Math.random() * 300 + 50,
        height: Math.random() * 300 + 50,
        left: Math.random() * 100,
        top: Math.random() * 100,
        color: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 50 + 100}, ${Math.random() * 255}, 0.05)`,
        animX: Math.random() * 50 - 25,
        animY: Math.random() * 50 - 25,
        rotate: Math.random() * 180 - 90,
        scale: Math.random() * 0.2 + 0.9,
        duration: Math.random() * 10 + 15
      })),
      squares: Array(3).fill(0).map((_, i) => ({
        key: `square-${i}`,
        width: Math.random() * 200 + 100,
        height: Math.random() * 200 + 100,
        left: Math.random() * 100,
        top: Math.random() * 100,
        color: `rgba(${Math.random() * 100 + 50}, ${Math.random() * 50 + 100}, ${Math.random() * 200 + 50}, 0.04)`,
        animX: Math.random() * 70 - 35,
        animY: Math.random() * 70 - 35,
        rotate: Math.random() * 90 - 45,
        scale: Math.random() * 0.3 + 0.8,
        duration: Math.random() * 15 + 20
      })),
      particles: Array(30).fill(0).map((_, i) => ({
        key: `particle-${i}`,
        width: Math.random() * 4 + 1,
        height: Math.random() * 4 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.1,
        animY: -Math.random() * 200 - 100,
        animX: (Math.random() - 0.5) * 50,
        duration: Math.random() * 10 + 10
      }))
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    
    // Validasi form
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sesuai');
      setIsLoading(false);
      return;
    }
    
    try {
      // Hindari penggunaan fullName, sesuai permintaan
      const response = await signUp(email, password);
      
      if (response.error) {
        setError(response.error.message || 'Gagal mendaftar. Silakan coba lagi.');
      } else {
        // Langsung redirect ke halaman login tanpa menampilkan layar sukses
        router.push('/login');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Terjadi kesalahan saat pendaftaran. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 z-0">
          {/* Moving geometric shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {backgroundElements.circles.map((circle) => (
              <motion.div
                key={circle.key}
                className="absolute rounded-full"
                style={{
                  width: `${circle.width}px`,
                  height: `${circle.height}px`,
                  left: `${circle.left}%`,
                  top: `${circle.top}%`,
                  backgroundColor: circle.color,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  zIndex: 0
                }}
                animate={{
                  x: [0, circle.animX],
                  y: [0, circle.animY],
                  rotate: [0, circle.rotate],
                  scale: [1, circle.scale],
                }}
                transition={{
                  duration: circle.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
            ))}
            
            {backgroundElements.squares.map((square) => (
              <motion.div
                key={square.key}
                className="absolute rounded-lg"
                style={{
                  width: `${square.width}px`,
                  height: `${square.height}px`,
                  left: `${square.left}%`,
                  top: `${square.top}%`,
                  backgroundColor: square.color,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  zIndex: 0
                }}
                animate={{
                  x: [0, square.animX],
                  y: [0, square.animY],
                  rotate: [0, square.rotate],
                  scale: [1, square.scale],
                }}
                transition={{
                  duration: square.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          {/* Flying particles */}
          <div className="absolute inset-0 overflow-hidden">
            {backgroundElements.particles.map((particle) => (
              <motion.div
                key={particle.key}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${particle.width}px`,
                  height: `${particle.height}px`,
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  opacity: particle.opacity
                }}
                animate={{
                  y: [0, particle.animY],
                  x: [0, particle.animX],
                  opacity: [0.1, 0.6, 0]
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col md:flex-row-reverse w-full max-w-5xl z-10 px-4 md:px-8 gap-8 md:gap-12 items-center py-14">
          {/* Left side - Text content */}
          <motion.div 
            className="w-full md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-6 inline-block">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center mb-4"
                animate={{ 
                  rotateZ: [0, -10, 0, 10, 0],
                  scale: [1, 1.05, 1, 1.05, 1] 
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
                </svg>
              </motion.div>
            </div>
            
            <motion.h1 
              className="text-3xl md:text-4xl font-bold mb-4 text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Mulai Perjalanan Trading Anda
            </motion.h1>
            
            <motion.p 
              className="text-gray-600 text-lg mb-8 max-w-lg mx-auto md:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Daftar dan dapatkan akses ke platform jurnal trading dengan analisis AI, statistik, dan insight untuk meningkatkan performa trading Anda.
            </motion.p>
            
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-indigo-100">
                <h3 className="font-medium text-indigo-800 mb-2">Keuntungan menggunakan jurnal trading:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-500">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    Pantau perkembangan trading secara terstruktur
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-500">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    Dapatkan rekomendasi AI berdasarkan data trading Anda
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-500">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    Analisis performa dan tingkatkan strategi trading
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right side - Register form */}
          <motion.div 
            className="w-full md:w-1/2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-xl border border-purple-100/40 overflow-hidden">
              {/* Header */}
              <div className="flex flex-col items-center gap-3 p-6 pb-0">
                <h2 className="text-2xl font-bold text-center text-gray-800">Daftar Akun Baru</h2>
                <p className="text-gray-500 text-sm text-center">
                  Jurnal Trading Forex | Statistik | AI Insights
                </p>
                <div className="h-px w-full bg-gray-200 my-3"></div>
              </div>
              
              {/* Body */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                          </svg>
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-2 border-2 border-indigo-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white shadow-sm text-gray-800"
                          placeholder="Masukkan email anda"
                        />
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                        </div>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-2 border-2 border-indigo-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white shadow-sm text-gray-800"
                          placeholder="Masukkan password anda"
                        />
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">
                        Konfirmasi Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                          </svg>
                        </div>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className={`w-full pl-10 pr-4 py-2 border-2 rounded-md focus:outline-none focus:ring-2 transition-colors bg-white shadow-sm text-gray-800 ${
                            confirmPassword && password !== confirmPassword
                              ? "border-red-200 focus:ring-red-500 focus:border-red-500"
                              : "border-indigo-100 focus:ring-indigo-500 focus:border-indigo-500"
                          }`}
                          placeholder="Masukkan ulang password anda"
                        />
                        {confirmPassword && password !== confirmPassword && (
                          <p className="mt-1 text-sm text-red-500">Password tidak sama</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  
                  {error && (
                    <motion.div 
                      className="text-red-500 text-sm p-2 bg-red-50 rounded-lg border border-red-100"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                  >
                    <div className="flex items-start mb-4">
                      <div className="flex items-center h-5">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                        Saya menyetujui <Link href="/terms" className="font-medium text-indigo-600 hover:underline">syarat dan ketentuan</Link>
                      </label>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-2"
                  >
                    <button 
                      type="submit" 
                      className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      disabled={isLoading || !agreeTerms}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Memproses...
                        </div>
                      ) : 'Daftar Sekarang'}
                    </button>
                  </motion.div>
                </form>
              </div>
              
              {/* Footer */}
              <div className="flex flex-col items-center gap-2 p-6 pt-2">
                <div className="h-px w-full bg-gray-200 mb-2"></div>
                <motion.p 
                  className="text-sm text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                >
                  Sudah punya akun?{' '}
                  <Link 
                    href="/login" 
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    Login
                  </Link>
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom floating element */}
        <motion.div
          className="absolute bottom-4 left-0 right-0 flex justify-center z-10 pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="bg-white/30 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white/40">
            <p className="text-xs text-gray-600">Aplikasi aman dengan enkripsi data end-to-end</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 