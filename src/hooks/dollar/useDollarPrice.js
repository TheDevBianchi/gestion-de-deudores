'use client';

import { useState, useCallback, useEffect } from 'react';
import useDollarStore from '@/states/useDollarStore';
import { toast } from 'sonner';

export const useDollarPrice = () => {
  const {
    price,
    isLoading,
    error,
    setPrice,
    setLoading,
    setError
  } = useDollarStore();
  
  const [priceHistory, setPriceHistory] = useState([]);

  // Función para obtener el precio actual
  const fetchDollarPrice = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config/dollar');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar el precio del dólar');
      }
      
      const data = await response.json();
      
      setPrice(data.price);
      if (data.history) {
        setPriceHistory(data.history);
      }
      
      setError(null);
    } catch (error) {
      setError(error.message);
      toast.error('Error al cargar el precio del dólar');
    } finally {
      setLoading(false);
    }
  }, [setPrice, setError, setLoading]);

  // Función para actualizar el precio
  const updateDollarPrice = useCallback(async (newPrice) => {
    try {
      setLoading(true);
      const response = await fetch('/api/config/dollar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el precio del dólar');
      }
      
      const data = await response.json();
      
      setPrice(data.price);
      if (data.history) {
        setPriceHistory(data.history);
      }
      
      toast.success('Precio del dólar actualizado exitosamente');
      return data;
    } catch (error) {
      setError(error.message);
      toast.error('Error al actualizar el precio del dólar');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setPrice, setError, setLoading]);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDollarPrice();
  }, [fetchDollarPrice]);

  return {
    price,
    isLoading,
    error,
    priceHistory,
    fetchDollarPrice,
    updateDollarPrice
  };
};

export default useDollarPrice; 