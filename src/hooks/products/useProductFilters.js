'use client';

import { useMemo } from 'react';

export const useProductFilters = (products, filters) => {
  return useMemo(() => {
    if (!products || !products.length) return [];
    
    let filtered = [...products];
    
    // Filtro por búsqueda de texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.descripcion?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtro por categoría
    if (filters.categoria) {
      if (filters.categoria === 'none') {
        // Productos sin categoría
        filtered = filtered.filter(product => 
          !product.categoria || product.categoria === ''
        );
      } else if (filters.categoria !== 'todas') {
        // Categoría específica
        filtered = filtered.filter(product => 
          product.categoria === filters.categoria
        );
      }
    }
    
    // Filtro por disponibilidad
    if (filters.disponibilidad === 'disponibles') {
      filtered = filtered.filter(product => product.cantidadInventario > 0);
    } else if (filters.disponibilidad === 'agotados') {
      filtered = filtered.filter(product => product.cantidadInventario <= 0);
    }
    
    // Ordenamiento
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'nombre':
            return a.nombre.localeCompare(b.nombre);
          case 'precioAsc':
            return a.precioCompra - b.precioCompra;
          case 'precioDesc':
            return b.precioCompra - a.precioCompra;
          case 'stockAsc':
            return a.cantidadInventario - b.cantidadInventario;
          case 'stockDesc':
            return b.cantidadInventario - a.cantidadInventario;
          default:
            return 0;
        }
      });
    }
    
    return filtered;
  }, [products, filters]);
}; 