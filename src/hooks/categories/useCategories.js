'use client';

import { useCallback } from 'react';
import useCategoriesStore from '@/states/useCategoriesStore';
import { toast } from 'sonner';

export const useCategories = () => {
  const {
    categories,
    isLoading,
    error,
    selectedCategory,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    setSelectedCategory,
    setLoading,
    setError
  } = useCategoriesStore();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
        console.error('La API no devolvió un array de categorías:', data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      setCategories([]);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, [setCategories, setError, setLoading]);

  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear categoría');
      }
    
      const newCategory = await response.json();
      
      addCategory(newCategory);
      
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addCategory, setError, setLoading]);

  const updateCategoryById = useCallback(async (id, categoryData) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      updateCategory(data);
      toast.success('Categoría actualizada exitosamente');
      return data;
    } catch (error) {
      setError(error.message);
      toast.error('Error al actualizar la categoría');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateCategory, setError, setLoading]);

  const deleteCategoryById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      deleteCategory(id);
      toast.success('Categoría eliminada exitosamente');
    } catch (error) {
      setError(error.message);
      toast.error('Error al eliminar la categoría');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [deleteCategory, setError, setLoading]);

  const fetchCategoryById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setSelectedCategory(data);
      setError(null);
    } catch (error) {
      setError(error.message);
      toast.error('Error al cargar los datos de la categoría');
    } finally {
      setLoading(false);
    }
  }, [setSelectedCategory, setError, setLoading]);

  return {
    categories: Array.isArray(categories) ? categories : [],
    isLoading,
    error,
    selectedCategory,
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategoryById,
    deleteCategoryById,
    setSelectedCategory
  };
}; 