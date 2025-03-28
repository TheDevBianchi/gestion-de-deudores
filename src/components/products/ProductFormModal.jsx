'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductForm from './ProductForm';

const ProductFormModal = ({ isOpen, onClose, product, onSuccess }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{product ? 'Editar Producto' : 'Crear Producto'}</DialogTitle>
        </DialogHeader>
        
        {/* Contenedor scrolleable */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">
          <ProductForm
            product={product}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal; 