import { useMemo } from 'react';

export const useInventoryFilters = (products, filters) => {
  return useMemo(() => {
    let filteredProducts = [...products];

    // Aplicar búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.nombre.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar filtro de stock
    switch (filters.stockStatus) {
      case 'lowStock':
        filteredProducts = filteredProducts.filter(p => p.cantidadInventario < 5 && p.cantidadInventario > 0);
        break;
      case 'outOfStock':
        filteredProducts = filteredProducts.filter(p => p.cantidadInventario === 0);
        break;
      case 'inStock':
        filteredProducts = filteredProducts.filter(p => p.cantidadInventario > 0);
        break;
    }

    // Aplicar ordenamiento
    filteredProducts.sort((a, b) => {
      switch (filters.sortBy) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'stock':
          return b.cantidadInventario - a.cantidadInventario;
        case 'precio':
          return b.precioCompra - a.precioCompra;
        default:
          return 0;
      }
    });

    return filteredProducts;
  }, [products, filters]);
}; 