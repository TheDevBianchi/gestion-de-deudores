'use client';

import { Suspense, lazy, useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/products/useProducts';
import { useProductFilters } from '@/hooks/products/useProductFilters';
import { useDollarPrice } from '@/hooks/dollar/useDollarPrice';

// Importaciones lazy para mejorar el rendimiento
const ProductFormModal = lazy(() => import('@/components/products/ProductFormModal'));
const ProductList = lazy(() => import('@/components/products/ProductList'));
const ProductStats = lazy(() => import('@/components/products/ProductStats'));
const ProductFilters = lazy(() => import('@/components/products/ProductFilters'));

// Contenido principal optimizado con memo
const ProductPageContent = memo(function ProductPageContent() {
  const { products, isLoading, error, fetchProducts, deleteProductById } = useProducts();
  const { price: dollarPrice = 1 } = useDollarPrice();
  
  const [filters, setFilters] = useState({
    search: '',
    categoria: 'todas',
    disponibilidad: 'todos',
    sortBy: 'nombre'
  });
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Usar hook personalizado para filtrar productos
  const filteredProducts = useProductFilters(products || [], filters);
  
  // Manejadores de eventos con useCallback
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setShowModal(true);
  }, []);
  
  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setShowModal(true);
  }, []);
  
  const handleFormSuccess = useCallback(() => {
    setShowModal(false);
    setEditingProduct(null);
    fetchProducts();
  }, [fetchProducts]);
  
  // Manejo de errores
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
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
          </div>
          <Button onClick={handleAddProduct} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </Button>
        </div>
        
        <ProductFilters onFilterChange={handleFilterChange} filters={filters} />
        
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
      </div>
    </>
  );
});

// Componente principal de la página
function ProductosPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 space-y-6"
    >
      <h1 className="text-3xl font-bold">Gestión de Productos</h1>
      
      <Suspense fallback={<div>Cargando estadísticas...</div>}>
        <ProductStats />
      </Suspense>
      
      <Suspense fallback={<div>Cargando contenido...</div>}>
        <ProductPageContent />
      </Suspense>
    </motion.div>
  );
}

export default ProductosPage; 