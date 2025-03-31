'use client';

import { create } from 'zustand';

const useDollarStore = create((set) => ({
  averagePrice: 0,
  centralBankPrice: 0,
  parallelPrice: 0,
  isLoading: false,
  error: null,
  
  setPrices: ({ average, centralBank, parallel }) => 
    set({ 
      averagePrice: average, 
      centralBankPrice: centralBank, 
      parallelPrice: parallel 
    }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Método para resetear el estado
  reset: () => set({ 
    averagePrice: 0, 
    centralBankPrice: 0, 
    parallelPrice: 0, 
    isLoading: false, 
    error: null 
  }),
}));

export default useDollarStore; 