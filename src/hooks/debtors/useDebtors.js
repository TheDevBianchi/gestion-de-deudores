'use client';

import { useCallback } from 'react';
import useDebtorsStore from '@/states/useDebtorsStore';
import { toast } from 'sonner';

export const useDebtors = () => {
  const {
    debtors,
    isLoading,
    error,
    selectedDebtor,
    setDebtors,
    addDebtor,
    updateDebtor,
    deleteDebtor,
    setSelectedDebtor,
    setLoading,
    setError
  } = useDebtorsStore();

  const fetchDebtors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/debtors');
      
      if (!response.ok) {
        throw new Error('Error al cargar deudores');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setDebtors(data);
      } else {
        setDebtors([]);
        console.error('La API no devolvió un array de deudores:', data);
      }
    } catch (err) {
      console.error('Error fetching debtors:', err);
      setError(err.message);
      setDebtors([]);
      toast.error('Error al cargar deudores');
    } finally {
      setLoading(false);
    }
  }, [setDebtors, setError, setLoading]);

  const createDebtor = useCallback(async (debtorData) => {
    try {
      setLoading(true);
      
      if (!debtorData.deudas) {
        debtorData.deudas = [];
      }
      
      const response = await fetch('/api/debtors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(debtorData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear deudor');
      }
    
      const newDebtor = await response.json();
      
      if (!newDebtor.deudas) {
        newDebtor.deudas = [];
      }
      
      addDebtor(newDebtor);
      
      return newDebtor;
    } catch (error) {
      console.error('Error creating debtor:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addDebtor, setError, setLoading]);

  const updateDebtorById = useCallback(async (id, debtorData) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/debtors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debtorData)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      updateDebtor(data);
      toast.success('Deudor actualizado exitosamente');
      return data;
    } catch (error) {
      setError(error.message);
      toast.error('Error al actualizar el deudor');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateDebtor, setError, setLoading]);

  const deleteDebtorById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/debtors/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      deleteDebtor(id);
      toast.success('Deudor eliminado exitosamente');
    } catch (error) {
      setError(error.message);
      toast.error('Error al eliminar el deudor');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [deleteDebtor, setError, setLoading]);

  const fetchDebtorById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/debtors/${id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setSelectedDebtor(data);
      setError(null);
    } catch (error) {
      setError(error.message);
      toast.error('Error al cargar los datos del deudor');
    } finally {
      setLoading(false);
    }
  }, [setSelectedDebtor, setError, setLoading]);

  const addPaymentToDebt = useCallback(async (debtorId, debtId, paymentData) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/debtors/${debtorId}/debts/${debtId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSelectedDebtor(data);
      updateDebtor(data);
      return data;
    } catch (error) {
      console.error('Error al agregar abono:', error);
      throw new Error(error.message || 'Error al registrar el abono');
    } finally {
      setLoading(false);
    }
  }, [setSelectedDebtor, updateDebtor, setLoading]);

  const addDebtToDebtor = useCallback(async (debtorId, debtData) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/debtors/${debtorId}/debts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debtData)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setSelectedDebtor(data);
      updateDebtor(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setSelectedDebtor, updateDebtor, setError, setLoading]);

  return {
    debtors: Array.isArray(debtors) ? debtors : [],
    isLoading,
    error,
    selectedDebtor,
    fetchDebtors,
    createDebtor,
    updateDebtorById,
    deleteDebtorById,
    addDebtToDebtor,
    addPaymentToDebt,
    setSelectedDebtor,
    addDebtor
  };
};

export default useDebtors; 