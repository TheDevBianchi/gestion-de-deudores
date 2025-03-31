'use client';

import { useState, useCallback, useEffect } from 'react';
import useDollarStore from '@/states/useDollarStore';
import { toast } from 'sonner';

export const useDollarPrice = () => {
  const {
    averagePrice,
    centralBankPrice,
    parallelPrice,
    isLoading,
    error,
    setPrices,
    setLoading,
    setError
  } = useDollarStore();
  
  const [priceHistory, setPriceHistory] = useState({
    average: [],
    centralBank: [],
    parallel: []
  });

  // Función para obtener los precios actuales
  const fetchDollarPrice = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config/dollar');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar los precios del dólar');
      }
      
      const data = await response.json();
      
      setPrices({
        average: data.average,
        centralBank: data.centralBank,
        parallel: data.parallel
      });
      
      if (data.history) {
        setPriceHistory(data.history);
      }
      
      setError(null);
    } catch (error) {
      setError(error.message);
      toast.error('Error al cargar los precios del dólar');
    } finally {
      setLoading(false);
    }
  }, [setPrices, setError, setLoading]);

  // Función para actualizar los precios
  const updateDollarPrice = useCallback(async (prices) => {
    try {
      setLoading(true);
      const response = await fetch('/api/config/dollar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prices)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar los precios del dólar');
      }
      
      const data = await response.json();
      
      setPrices({
        average: data.average,
        centralBank: data.centralBank,
        parallel: data.parallel
      });
      
      // Actualizar inmediatamente el historial
      if (data.history) {
        setPriceHistory(data.history);
      } else {
        // Si no hay historial en la respuesta, obtenerlo explícitamente
        fetchDollarPrice();
      }
      
      toast.success('Precios del dólar actualizados exitosamente');
      return data;
    } catch (error) {
      setError(error.message);
      toast.error('Error al actualizar los precios del dólar');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setPrices, setError, setLoading, fetchDollarPrice]);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDollarPrice();
  }, [fetchDollarPrice]);

  return {
    averagePrice,
    centralBankPrice,
    parallelPrice,
    isLoading,
    error,
    priceHistory,
    fetchDollarPrice,
    updateDollarPrice
  };
};

export default useDollarPrice; 