'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todas las ventas
  const fetchSales = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sales');
      if (!response.ok) throw new Error('Error al cargar ventas');
      
      const data = await response.json();
      setSales(data);
    } catch (error) {
      setError(error.message);
      toast.error('Error al cargar ventas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear nueva venta
  const createSale = useCallback(async (saleData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la venta');
      }
      
      const newSale = await response.json();
      setSales(prev => [newSale, ...prev]);
      return newSale;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener ventas al montar
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    isLoading,
    error,
    fetchSales,
    createSale
  };
}; 