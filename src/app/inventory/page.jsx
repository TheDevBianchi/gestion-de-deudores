'use client';

import { Suspense, lazy, useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useInventoryFilters } from '@/hooks/inventory/useInventoryFilters';
import { useProducts } from '@/hooks/products/useProducts';
import ProductFormModal from '@/components/products/ProductFormModal';
import { useDollarPrice } from '@/hooks/dollar/useDollarPrice';

const InventoryStats = lazy(() => import('@/components/inventory/InventoryStats'));
const InventoryFilters = lazy(() => import('@/components/inventory/InventoryFilters'));
const ProductList = lazy(() => import('@/components/products/ProductList'));
const ProductForm = lazy(() => import('@/components/products/ProductForm'));

// Componente optimizado para manejar los productos
const InventoryContent = memo(function InventoryContent() {
  const { products, isLoading, error, fetchProducts, deleteProductById } = useProducts();
  const { price: dollarPrice = 1 } = useDollarPrice();
  
  const [filters, setFilters] = useState({
    search: '',
    stockStatus: 'all',
    sortBy: 'nombre'
  });
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Usar useInventoryFilters con memo para optimizar el filtrado
  const filteredProducts = useInventoryFilters(products || [], filters);
  
  console.log('Estado actual - Productos:', products);
  console.log('Productos filtrados:', filteredProducts);
  
  // Manejadores de eventos
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setShowModal(true);
  }, []);
  
  const handleFormSuccess = useCallback(() => {
    setShowModal(false);
    setEditingProduct(null);
    fetchProducts();
  }, [fetchProducts]);
  
  // Si hay error o está cargando, mostrar estados apropiados
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>Error al cargar los productos: {error}</p>
        <Button onClick={fetchProducts} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <ProductFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={editingProduct}
        onSuccess={handleFormSuccess}
      />
      
      <InventoryFilters onFilterChange={handleFilterChange} />
      
      {isLoading ? (
        <div className="py-10 text-center">Cargando productos...</div>
      ) : (
        <ProductList 
          products={filteredProducts}
          onEditProduct={handleEditProduct}
          deleteProductById={deleteProductById}
          dollarPrice={dollarPrice}
        />
      )}
    </>
  );
});

// Componente principal con layout y suspense
function InventoryPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Button>
      </div>
      
      <Suspense fallback={<div>Cargando estadísticas...</div>}>
        <InventoryStats />
      </Suspense>

      <Suspense fallback={<div>Cargando contenido...</div>}>
        <InventoryContent />
      </Suspense>
    </motion.div>
  );
}

export default InventoryPage;
