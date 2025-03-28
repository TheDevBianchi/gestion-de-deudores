'use client';

import { memo, useEffect } from 'react';
import { useCategories } from '@/hooks/categories/useCategories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/custom-select';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

const ProductFilters = memo(function ProductFilters({ onFilterChange, filters }) {
  const { categories, fetchCategories, isLoading } = useCategories();
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  return (
    <Card>
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Select 
            value={filters.categoria} 
            onValueChange={(value) => onFilterChange({ categoria: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              <SelectItem value="none">Sin categoría</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select 
            value={filters.disponibilidad} 
            onValueChange={(value) => onFilterChange({ disponibilidad: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Disponibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los productos</SelectItem>
              <SelectItem value="disponibles">En stock</SelectItem>
              <SelectItem value="agotados">Agotados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nombre">Nombre (A-Z)</SelectItem>
              <SelectItem value="nombreDesc">Nombre (Z-A)</SelectItem>
              <SelectItem value="precioAsc">Precio (menor a mayor)</SelectItem>
              <SelectItem value="precioDesc">Precio (mayor a menor)</SelectItem>
              <SelectItem value="stock">Stock (mayor a menor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
});

export default ProductFilters; 