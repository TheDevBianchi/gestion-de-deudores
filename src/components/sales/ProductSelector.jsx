'use client';

import { memo, useMemo } from 'react';
import { useProducts } from '@/hooks/products/useProducts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const ProductSelector = memo(({ onProductSelect, onQuantityChange, selectedProducts }) => {
  const { products } = useProducts();

  const availableProducts = useMemo(() => {
    return products.filter(p => p.cantidadInventario > 0);
  }, [products]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Select onValueChange={onProductSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar producto" />
        </SelectTrigger>
        <SelectContent>
          {availableProducts.map(product => (
            <SelectItem key={product._id} value={product._id}>
              {product.nombre} - Stock: {product.cantidadInventario}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Input
        type="number"
        min="1"
        onChange={(e) => onQuantityChange(parseInt(e.target.value))}
        placeholder="Cantidad"
      />
    </div>
  );
});

ProductSelector.displayName = 'ProductSelector';
export default ProductSelector; 