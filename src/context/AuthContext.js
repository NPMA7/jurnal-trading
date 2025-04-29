import { createContext, useContext, useEffect, useState } from 'react';
import { userOperations, hashPassword } from '../lib/db';

const AuthContext = createContext();

// Fungsi untuk menyimpan informasi user ke localStorage
const saveUserToStorage = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Fungsi untuk mendapatkan informasi user dari localStorage
const getUserFromStorage = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

// Fungsi untuk menghapus informasi user dari localStorage
const removeUserFromStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek apakah user sudah login (dari localStorage)
    const checkUserAuth = () => {
      const storedUser = getUserFromStorage();
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    };
    
    checkUserAuth();
  }, []);

  const signUp = async (email, password, fullName = null) => {
    try {
      // 1. Cek apakah email sudah terdaftar
      const { data: existingUser } = await userOperations.getUserByEmail(email);
      
      if (existingUser) {
        return { 
          error: { 
            message: 'Email sudah terdaftar' 
          } 
        };
      }
      
      // 2. Hash password
      const password_hash = await hashPassword(password);
      
      // 3. Simpan user ke tabel users
      const { data: userData, error: userError } = await userOperations.createUser({
        email,
        password_hash,
        full_name: fullName
      });
      
      if (userError) {
        return { error: userError };
      }

      // 4. Kembalikan data user (tanpa password_hash)
      const user = userData[0];
      delete user.password_hash;
      
      return { data: user, error: null };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error };
    }
  };

  const signIn = async (email, password) => {
    try {
      // Login user menggunakan userOperations.loginUser
      const { data: userData, error } = await userOperations.loginUser(email, password);
      
      if (error) {
        return { error };
      }
      
      // Set user state
      setUser(userData);
      
      // Simpan ke localStorage
      saveUserToStorage(userData);
      
      return { data: userData, error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { error };
    }
  };

  const signOut = async () => {
    // Hapus user dari state
    setUser(null);
    
    // Hapus dari localStorage
    removeUserFromStorage();
    
    return { error: null };
  };

  const updateProfile = async (userId, updates) => {
    try {
      const { data, error } = await userOperations.updateUser(userId, updates);
      
      if (error) {
        return { error };
      }
      
      // Update user state dengan data terbaru
      const updatedUser = { ...user, ...data[0] };
      setUser(updatedUser);
      
      // Update localStorage
      saveUserToStorage(updatedUser);
      
      return { data: updatedUser, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signUp, 
      signIn, 
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 