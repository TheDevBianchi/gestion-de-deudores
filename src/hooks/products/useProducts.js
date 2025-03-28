'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los productos
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products?populate=categoria');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar productos');
      }
      
      const data = await response.json();
      
      // Asegurar que todos los campos necesarios estén presentes
      const normalizedProducts = data.map(product => ({
        ...product,
        precioVenta: product.precioVenta || (product.precioCompra * (1 + (product.porcentajeGanancia || 0) / 100)),
        cantidadPorPaquete: product.cantidadPorPaquete || 1,
        // Extraer ID de categoría si es un objeto
        categoria: product.categoria?._id || product.categoria || ''
      }));
      
      setProducts(normalizedProducts);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error al cargar productos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear un nuevo producto
  const createProduct = useCallback(async (productData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear producto');
      }
      
      const newProduct = await response.json();
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar un producto
  const updateProduct = useCallback(async (productId, productData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar producto');
      }
      
      const updatedProduct = await response.json();
      setProducts(prev => 
        prev.map(product => 
          product._id === productId ? updatedProduct : product
        )
      );
      return updatedProduct;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Eliminar un producto
  const deleteProductById = useCallback(async (productId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar producto');
      }
      
      setProducts(prev => 
        prev.filter(product => product._id !== productId)
      );
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProductById
  };
}; 