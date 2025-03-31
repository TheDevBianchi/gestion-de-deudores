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
    setError,
    fetchDebtorById
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
      setError(null);
      
      // Validar datos requeridos
      if (!debtorData.nombre?.trim() || !debtorData.apellido?.trim()) {
        throw new Error('Nombre y apellido son requeridos');
      }
      
      // Preparar datos para enviar
      const cleanData = {
        nombre: debtorData.nombre.trim(),
        apellido: debtorData.apellido.trim(),
        telefono: debtorData.telefono?.trim() || '',
        direccion: debtorData.direccion?.trim() || '',
        email: debtorData.email?.trim() || 'cliente@sistemaventas.com',
        deudas: []
      };
      
      // Log para debugging
      console.log('Enviando datos al servidor:', cleanData);
      
      const response = await fetch('/api/debtors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear deudor');
      }
      
      const newDebtor = await response.json();
      console.log('Respuesta del servidor:', newDebtor);
      
      if (!newDebtor._id) {
        throw new Error('El servidor no devolvió un ID válido');
      }
      
      // Actualizar el estado local
      addDebtor(newDebtor);
      
      return newDebtor;
    } catch (error) {
      console.error('Error al crear deudor:', error);
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

  const addPaymentToDebt = useCallback(async (debtorId, debtId, paymentData) => {
    try {
      // Verificar si es un ID temporal
      if (debtId.startsWith('temp-')) {
        throw new Error('No se puede registrar abonos en deudas temporales. Espere a que se sincronice la información.');
      }
      
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
      // Asegurarse de que tenga fecha
      const dataWithDate = {
        ...debtData,
        fecha: debtData.fecha || new Date().toISOString()
      };
      
      console.log("Agregando deuda con fecha:", dataWithDate.fecha);
      
      // Enviar a la API
      const response = await fetch(`/api/debtors/${debtorId}/debts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithDate)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al agregar deuda');
      }
      
      // Actualizar el estado con la respuesta
      const updatedDebtor = await response.json();
      
      // Actualizar el deudor seleccionado
      setSelectedDebtor(updatedDebtor);
      
      return updatedDebtor;
    } catch (error) {
      console.error("Error en addDebtToDebtor:", error);
      throw error;
    }
  }, [setSelectedDebtor]);

  return {
    debtors: Array.isArray(debtors) ? debtors : [],
    isLoading,
    error,
    selectedDebtor,
    fetchDebtors,
    fetchDebtorById,
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