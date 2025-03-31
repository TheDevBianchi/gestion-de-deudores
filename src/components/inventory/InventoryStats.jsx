'use client';

import { useMemo } from 'react';
import { useProducts } from '@/hooks/products/useProducts';
import { Card } from '@/components/ui/card';

const InventoryStats = () => {
  const { products } = useProducts();

  const stats = useMemo(() => {
    return {
      totalProducts: products.length,
      lowStock: products.filter(p => p.cantidadInventario < 5).length,
      outOfStock: products.filter(p => p.cantidadInventario === 0).length,
      totalValue: products.reduce((acc, p) => acc + (p.precioCompra * p.cantidadInventario), 0),
      totalGanancia: products.reduce((acc, p) => acc + (p.precioVenta * p.cantidadInventario) - (p.precioCompra * p.cantidadInventario), 0)
    };
  }, [products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Total Productos</h3>
        <p className="text-2xl font-bold">{stats.totalProducts}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Bajo Stock</h3>
        <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Sin Stock</h3>
        <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Valor Total</h3>
        <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Ganancia Total</h3>
        <p className="text-2xl font-bold text-green-600">${stats.totalGanancia.toFixed(2)}</p>
      </Card>
    </div>
  );
};

export default InventoryStats; 