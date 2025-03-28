'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, User, Package, Calendar, DollarSign } from 'lucide-react';

function SaleDetails({ sale }) {
  const formattedDate = new Date(sale.fecha).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  
  const timeAgo = formatDistanceToNow(new Date(sale.fecha), { 
    addSuffix: true, 
    locale: es 
  });

  return (
    <div className="space-y-6 py-4 overflow-y-auto max-h-[calc(100vh-120px)]">
      <div className="grid grid-cols-2 gap-4 px-1">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 shadow-sm">
          <div className="flex items-center text-muted-foreground mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            <h3 className="text-sm font-medium">Fecha de Venta</h3>
          </div>
          <p className="text-lg font-semibold">{formattedDate}</p>
          <p className="text-sm text-muted-foreground">{timeAgo}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 shadow-sm">
          <div className="flex items-center text-muted-foreground mb-2">
            <User className="h-4 w-4 mr-2" />
            <h3 className="text-sm font-medium">Cliente</h3>
          </div>
          <p className="text-lg font-semibold">
            {sale.clienteNombre || 'Comprador anónimo'}
          </p>
          <Badge variant={sale.esCredito ? "warning" : "success"} className="mt-1">
            {sale.esCredito ? 'A Crédito' : 'Contado'}
          </Badge>
        </div>
      </div>

      <div className="px-1">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center text-muted-foreground mb-4">
            <Package className="h-4 w-4 mr-2" />
            <h3 className="text-sm font-medium">Productos</h3>
          </div>
          
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
            {sale.productos?.map((item, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-3 rounded-md bg-gray-50 dark:bg-gray-900 border"
              >
                <div>
                  <p className="font-medium">{item.producto?.nombre || 'Producto'}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'} × ${item.precioUnitario?.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.subtotal?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="px-1">
        <div className="rounded-lg bg-primary/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              <h3 className="font-medium">Total</h3>
            </div>
            <p className="text-xl font-bold">${sale.montoTotal?.toFixed(2)}</p>
          </div>
          
          <div className="mt-2 text-sm text-muted-foreground">
            {sale.productos?.length || 0} {sale.productos?.length === 1 ? 'producto' : 'productos'}
          </div>
        </div>
      </div>

      <div className="px-1 mt-4">
        <div className="text-xs text-muted-foreground text-center">
          ID de venta: {sale._id}
        </div>
      </div>
    </div>
  );
}

export default SaleDetails; 