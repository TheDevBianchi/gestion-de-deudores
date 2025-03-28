'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ErrorDisplay from '@/components/common/ErrorDisplay';

const RecentSalesComponent = () => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/sales/recent');
        
        if (!response.ok) {
          throw new Error('Error al cargar ventas recientes');
        }
        
        const data = await response.json();
        setSales(data);
      } catch (err) {
        console.error('Error fetching recent sales:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSales();
  }, []);

  // Componente optimizado de elementos de venta
  const SaleItem = useMemo(() => React.memo(({ sale }) => (
    <div className="flex items-center space-x-4 py-3">
      <Avatar className="h-9 w-9 bg-primary/10">
        <span className="text-xs font-medium">{sale.cliente?.charAt(0) || 'C'}</span>
      </Avatar>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{sale.cliente || 'Cliente no registrado'}</p>
        <p className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(sale.fecha), { 
            addSuffix: true, 
            locale: es 
          })}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-sm font-medium">${sale.montoTotal.toFixed(2)}</p>
        <Badge variant={sale.esCredito ? "outline" : "secondary"} className="text-xs">
          {sale.esCredito ? 'Crédito' : 'Efectivo'}
        </Badge>
      </div>
    </div>
  )), []);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas Recientes</CardTitle>
        <CardDescription>Se han registrado {sales.length} ventas recientemente</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4 py-3">
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </div>
                <div className="space-y-2 flex flex-col items-end">
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-14 bg-muted animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : sales.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No hay ventas recientes</p>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <SaleItem key={sale._id} sale={sale} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Exportamos el componente usando React.memo para optimizar rendimiento
export const RecentSales = React.memo(RecentSalesComponent); 