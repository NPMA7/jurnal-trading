'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBrokers, addBroker, deleteBroker } from '../../lib/brokerService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [brokers, setBrokers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBroker, setNewBroker] = useState({ 
    account_name: '', 
    broker_name: '', 
    account_id: '', 
    comments: '' 
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const router = useRouter();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadBrokers();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    }

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const loadBrokers = async () => {
    try {
      setIsLoading(true);
      const data = await getBrokers(user.id);
      setBrokers(data);
    } catch (error) {
      console.error('Error loading brokers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddBroker = async () => {
    try {
      if (!newBroker.broker_name) {
        showNotification('Nama broker tidak boleh kosong', 'error');
        return;
      }

      if (!newBroker.account_id) {
        showNotification('ID akun trading tidak boleh kosong', 'error');
        return;
      }
      
      if (!newBroker.account_name) {
        showNotification('Nama akun tidak boleh kosong', 'error');
        return;
      }
      
      // Cek apakah kombinasi nama broker dan ID akun sudah ada
      const duplicateBroker = brokers.find(
        broker => broker.broker_name?.toLowerCase() === newBroker.broker_name.toLowerCase() && 
                  broker.account_id === newBroker.account_id
      );
      
      if (duplicateBroker) {
        showNotification('Kombinasi nama broker dan ID akun sudah digunakan', 'error');
        return;
      }
      
      if (!user || !user.id) {
        console.error('User ID tidak valid:', user);
        showNotification('Sesi pengguna tidak valid. Silakan login ulang.', 'error');
        return;
      }
      
      console.log('Mencoba menambahkan akun trading dengan user ID:', user.id);
      
      const broker = await addBroker(user.id, newBroker);
      setBrokers([...brokers, broker]);
      setNewBroker({ account_name: '', broker_name: '', account_id: '', comments: '' });
      closeModal();
      showNotification('Akun trading berhasil ditambahkan', 'success');
    } catch (error) {
      console.error('Error adding broker:', error);
      showNotification('Gagal menambahkan akun trading: ' + (error.message || 'Terjadi kesalahan'), 'error');
    }
  };

  const handleDeleteBroker = async (brokerId) => {
    try {
      if (!brokerId) {
        console.error('ID broker tidak valid');
        return;
      }


      
      // Tampilkan indikator loading
      showNotification('Sedang menghapus broker...', 'info');
      
      // Gunakan user.id langsung
      const result = await deleteBroker(brokerId, user.id);
      
      if (result === true) {
        // Update state setelah penghapusan berhasil
        setBrokers(brokers.filter(broker => broker.id !== brokerId));
        
        // Tampilkan notifikasi sukses
        showNotification('Broker berhasil dihapus', 'success');
      } else {
        throw new Error('Gagal menghapus broker: Tidak ada konfirmasi dari server');
      }
    } catch (error) {
      console.error('Error menghapus broker:', error);
      // Tampilkan pesan error
      showNotification('Gagal menghapus broker: ' + (error.message || 'Terjadi kesalahan'), 'error');
    }
  };

  const handleBrokerClick = (broker) => {
    // Ubah nama broker menjadi format URL yang aman (slug)
    const brokerSlug = broker.broker_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'unknown';
    const accountIdSlug = broker.account_id?.toString().replace(/\s+/g, '-') || broker.id;
    router.push(`/account/${brokerSlug}-${accountIdSlug}`);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50">
        <div className="p-8 rounded-xl bg-white shadow-lg border border-gray-100">
          <div className="w-12 h-12 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-tr from-indigo-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Notifikasi */}
      {notification && (
        <motion.div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'error' 
              ? 'bg-red-500 text-white' 
              : notification.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
          }`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          {notification.message}
        </motion.div>
      )}
      
      {/* Header */}
      <header className="py-4 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Jurnal Trading Forex</h1>
                <p className="text-xs text-gray-500 dark:text-gray-300">Dashboard Akun Trading</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900 px-3 py-1.5 rounded-full">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {user?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    {user?.full_name ? user?.email : 'User'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
           
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Akun Trading Anda
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Kelola akun trading untuk mencatat transaksi trading
            </p>
          </div>
          <button 
            onClick={openModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Akun
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
            </div>
          </div>
        ) : brokers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 rounded-xl p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 mb-6 bg-indigo-50 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-indigo-500 dark:text-indigo-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9.75m18 0V6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Belum Ada Akun Trading</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">Anda belum memiliki akun trading. Tambahkan akun untuk mulai mencatat transaksi trading Anda.</p>
              <button 
                onClick={openModal}
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-base transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Tambah Akun Trading Pertama
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {brokers.map((broker, index) => (
              <div key={broker.id} className="relative">
                <div 
                  className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleBrokerClick(broker)}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{broker.account_name || broker.name || '-'}</h3>
                        <p className="text-gray-500 dark:text-gray-300 text-sm">{broker.comments || broker.description || 'Tidak ada komentar'}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBroker(broker.id);
                        }}
                        className="p-1.5 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-md hover:bg-red-100"
                        title="Hapus Akun"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 mt-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-indigo-600 dark:text-indigo-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Broker</p>
                          <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                            {broker.broker_name || '-'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 mt-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-indigo-600 dark:text-indigo-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID Akun</p>
                          <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                            {broker.account_id || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg flex justify-between items-center">
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Dibuat: {new Date(broker.created_at || Date.now()).toLocaleDateString('id-ID')}
                      </p>
                      <div className="text-xs text-indigo-600 dark:text-indigo-300 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Lihat Detail
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Bottom stats info */}
      <div className="w-full flex justify-center py-6">
        <div className="bg-white dark:bg-gray-800 px-5 py-2.5 rounded-full shadow-md">
          <p className="text-xs text-gray-600 dark:text-gray-300">Total akun: <span className="font-semibold">{brokers.length}</span> | Terakhir update: <span className="font-semibold">{new Date().toLocaleDateString('id-ID')}</span></p>
        </div>
      </div>
      
      {/* Add Broker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-5">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Tambah Akun Trading Baru</h3>
              <p className="text-xs text-gray-500 dark:text-gray-300">Masukkan informasi akun trading Anda</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nama Broker</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 dark:text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                    </svg>
                  </div>
                  <input
                    value={newBroker.broker_name}
                    onChange={(e) => setNewBroker({ ...newBroker, broker_name: e.target.value })}
                    placeholder="Contoh: XM, Binance, MetaTrader, dsb."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-indigo-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ID Akun Trading</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 dark:text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                  </div>
                  <input
                    value={newBroker.account_id}
                    onChange={(e) => setNewBroker({ ...newBroker, account_id: e.target.value })}
                    placeholder="Contoh: 12345678, MT4-001, dsb."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-indigo-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nama Akun</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 dark:text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    value={newBroker.account_name}
                    onChange={(e) => setNewBroker({ ...newBroker, account_name: e.target.value })}
                    placeholder="Contoh: Trading Forex Harian, Investasi Jangka Panjang, dsb."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-indigo-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Komentar (Opsional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 dark:text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                  </div>
                  <input
                    value={newBroker.comments}
                    onChange={(e) => setNewBroker({ ...newBroker, comments: e.target.value })}
                    placeholder="Contoh: Akun untuk trading jangka pendek"
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-indigo-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddBroker}
                disabled={!newBroker.broker_name || !newBroker.account_id || !newBroker.account_name}
                className={`px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg transition-colors ${newBroker.broker_name && newBroker.account_id && newBroker.account_name ? 'hover:bg-indigo-700' : 'opacity-50 cursor-not-allowed'}`}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 