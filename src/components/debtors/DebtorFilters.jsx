'use client';

import { memo } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ListFilter, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const DebtorFilters = memo(function DebtorFilters({ onFilterChange, filters }) {
  const resetFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      sortBy: 'recent',
      dateRange: null
    });
  };
  
  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64">
          <label className="text-sm font-medium mb-1 block">Estado</label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFilterChange({ status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Con deudas pendientes</SelectItem>
              <SelectItem value="paid">Al día</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-64">
          <label className="text-sm font-medium mb-1 block">Ordenar por</label>
          <Select
            value={filters.sortBy || 'recent'}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
              <SelectItem value="name">Nombre (A-Z)</SelectItem>
              <SelectItem value="debt_high">Mayor deuda</SelectItem>
              <SelectItem value="debt_low">Menor deuda</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-64">
          <label className="text-sm font-medium mb-1 block">Fecha</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange ? (
                  format(new Date(filters.dateRange), 'PPP', { locale: es })
                ) : (
                  "Seleccionar fecha"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateRange ? new Date(filters.dateRange) : undefined}
                onSelect={(date) => onFilterChange({ dateRange: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-end">
          <Button
            variant="ghost"
            className="gap-1"
            onClick={resetFilters}
          >
            <XCircle className="h-4 w-4" />
            Limpiar filtros
          </Button>
        </div>
      </div>
    </Card>
  );
});

export default DebtorFilters; 