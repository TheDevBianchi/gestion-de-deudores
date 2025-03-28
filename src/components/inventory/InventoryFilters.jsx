'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

const InventoryFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    stockStatus: 'all',
    sortBy: 'nombre'
  });

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar productos..."
          className="pl-10"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>

      <Select
        value={filters.stockStatus}
        onValueChange={(value) => handleFilterChange('stockStatus', value)}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Estado del stock" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los productos</SelectItem>
          <SelectItem value="inStock">En stock</SelectItem>
          <SelectItem value="lowStock">Bajo stock</SelectItem>
          <SelectItem value="outOfStock">Sin stock</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sortBy}
        onValueChange={(value) => handleFilterChange('sortBy', value)}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nombre">Nombre (A-Z)</SelectItem>
          <SelectItem value="stock">Stock (Mayor-Menor)</SelectItem>
          <SelectItem value="precio">Precio (Mayor-Menor)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default InventoryFilters; 