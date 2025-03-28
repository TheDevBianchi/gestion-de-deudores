'use client';

import { useState, useEffect, memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Eye, CheckCircle, Clock } from 'lucide-react';
import SaleDetails from './SaleDetails';
import { useSales } from '@/hooks/sales/useSales';

const SaleStatus = memo(function SaleStatus({ status }) {
  const statusConfig = {
    'completada': { 
      label: 'Completada', 
      variant: 'success',
      icon: <CheckCircle className="h-4 w-4 mr-1" />
    },
    'pendiente': { 
      label: 'A Crédito', 
      variant: 'warning',
      icon: <Clock className="h-4 w-4 mr-1" />
    },
  };

  const config = statusConfig[status] || { label: status, variant: 'default' };

  return (
    <Badge variant={config.variant} className="capitalize flex items-center">
      {config.icon}
      {config.label}
    </Badge>
  );
});

const SalesList = memo(function SalesList({ filterType = 'all' }) {
  const { sales, isLoading, error, fetchSales } = useSales();
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Filtrar ventas según el tipo seleccionado
  const filteredSales = sales.filter(sale => {
    if (filterType === 'all') return true;
    if (filterType === 'contado') return !sale.esCredito;
    if (filterType === 'credito') return sale.esCredito;
    return true;
  });

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          Error al cargar ventas: {error}
        </div>
      </Card>
    );
  }

  if (filteredSales.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No hay ventas {filterType !== 'all' ? `de tipo ${filterType}` : ''} registradas
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.map((sale) => (
              <TableRow key={sale._id}>
                <TableCell>
                  <div className="font-medium">
                    {new Date(sale.fecha).toLocaleString('es-ES', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(sale.fecha), { addSuffix: true, locale: es })}
                  </div>
                </TableCell>
                <TableCell>{sale.clienteNombre || 'Cliente sin registrar'}</TableCell>
                <TableCell>${sale.montoTotal.toFixed(2)}</TableCell>
                <TableCell>
                  <SaleStatus status={sale.estado} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewDetails(sale)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent className="sm:max-w-md overflow-hidden">
          <SheetHeader className="px-1">
            <SheetTitle>Detalles de Venta</SheetTitle>
          </SheetHeader>
          {selectedSale && <SaleDetails sale={selectedSale} />}
        </SheetContent>
      </Sheet>
    </>
  );
});

export default SalesList; 