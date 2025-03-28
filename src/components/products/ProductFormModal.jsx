'use client';

import { lazy, Suspense, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ProductForm = lazy(() => import('@/components/products/ProductForm'));

const ProductFormModal = memo(function ProductFormModal({ 
  isOpen, 
  onClose, 
  product, 
  onSuccess 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Crear Producto'}
          </DialogTitle>
        </DialogHeader>
        <Suspense fallback={<div>Cargando formulario...</div>}>
          <ProductForm 
            product={product} 
            onSuccess={onSuccess} 
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
});

export default ProductFormModal; 