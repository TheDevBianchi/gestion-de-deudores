'use client';

import { memo, useMemo } from 'react';
import { useProducts } from '@/hooks/products/useProducts';
import { useDollarPrice } from '@/hooks/dollar/useDollarPrice';
import { Card } from '@/components/ui/card';

const ProductStats = memo(function ProductStats() {
  const { products } = useProducts();
  const { price: dollarPrice = 1 } = useDollarPrice();

  const stats = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        totalProducts: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
        totalValueUSD: 0
      };
    }

    const totalValue = products.reduce(
      (acc, p) => acc + (p.precioCompra * p.cantidadInventario),
      0
    );

    return {
      totalProducts: products.length,
      lowStock: products.filter(p => p.cantidadInventario > 0 && p.cantidadInventario < 5).length,
      outOfStock: products.filter(p => p.cantidadInventario === 0).length,
      totalValue: totalValue,
      totalValueUSD: totalValue / dollarPrice
    };
  }, [products, dollarPrice]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Total Productos</h3>
        <p className="text-2xl font-bold">{stats.totalProducts}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Bajo Stock</h3>
        <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Agotados</h3>
        <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Valor Total</h3>
        <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Valor en USD</h3>
        <p className="text-2xl font-bold">${stats.totalValueUSD.toFixed(2)}</p>
      </Card>
    </div>
  );
});

export default ProductStats; 