import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

// Fungsi-fungsi operasi pengguna
export const userOperations = {
  // Simpan data pengguna ke tabel users
  async createUser({ email, password_hash, full_name = null }) {
    try {
      // Cek dulu apakah email sudah ada
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        return { data: null, error: { message: 'Email sudah terdaftar' } };
      }
      
      // Buat user baru
      const { data, error } = await supabase
        .from('users')
        .insert([{ 
          email,
          password_hash,
          full_name
        }])
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating user:', error);
      return { data: null, error };
    }
  },

  // Dapatkan pengguna berdasarkan email
  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return { data: null, error };
    }
  },

  // Dapatkan pengguna berdasarkan ID
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return { data: null, error };
    }
  },

  // Update informasi pengguna
  async updateUser(userId, updates) {
    try {
      updates.updated_at = new Date();
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user:', error);
      return { data: null, error };
    }
  },

  // Login user
  async loginUser(email, password) {
    try {
      // 1. Dapatkan user berdasarkan email
      const { data: user, error: userError } = await this.getUserByEmail(email);
      
      if (userError || !user) {
        return { data: null, error: { message: 'Email tidak terdaftar' } };
      }
      
      // 2. Periksa password
      const isValidPassword = await verifyPassword(password, user.password_hash);
      
      if (!isValidPassword) {
        return { data: null, error: { message: 'Password salah' } };
      }
      
      // 3. Kembalikan data pengguna (tanpa password_hash)
      const userData = { ...user };
      delete userData.password_hash;
      
      return { data: userData, error: null };
    } catch (error) {
      console.error('Error during login:', error);
      return { data: null, error };
    }
  },

  // Hapus pengguna
  async deleteUser(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { data: null, error };
    }
  }
};

// Fungsi hash password dengan bcrypt
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Fungsi untuk memverifikasi password dengan bcrypt
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
}; 