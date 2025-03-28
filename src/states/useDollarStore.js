'use client';

import { create } from 'zustand';

const useDollarStore = create((set) => ({
  // Estado inicial
  price: null,
  isLoading: false,
  error: null,
  
  // Acciones
  setPrice: (price) => set({ price }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Método para resetear el estado
  reset: () => set({ 
    price: null, 
    isLoading: false, 
    error: null 
  }),
}));

export default useDollarStore; 