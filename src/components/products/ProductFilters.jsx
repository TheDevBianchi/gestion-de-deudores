'use client';

import { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

const ProductFilters = memo(function ProductFilters({ onFilterChange, filters }) {
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
              <SelectItem value="electronica">Electrónica</SelectItem>
              <SelectItem value="ropa">Ropa</SelectItem>
              <SelectItem value="hogar">Hogar</SelectItem>
              <SelectItem value="alimentos">Alimentos</SelectItem>
              <SelectItem value="otros">Otros</SelectItem>
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
              <SelectItem value="precioAsc">Precio (menor a mayor)</SelectItem>
              <SelectItem value="precioDesc">Precio (mayor a menor)</SelectItem>
              <SelectItem value="stockAsc">Stock (menor a mayor)</SelectItem>
              <SelectItem value="stockDesc">Stock (mayor a menor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
});

export default ProductFilters; 