'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useProducts } from '@/hooks/products/useProducts';
import { useCategories } from '@/hooks/categories/useCategories';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/custom-select';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';
import ProductFormModal from './ProductFormModal';
import { Badge } from '@/components/ui/badge';

const ProductList = memo(function ProductList() {
  const { products, isLoading, error, fetchProducts, deleteProduct } = useProducts();
  const { categories, isLoading: categoriesLoading, fetchCategories } = useCategories();
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Tasa de cambio (ajustar según necesidades)
  const [tasaCambio, setTasaCambio] = useState(35.5);
  
  // Cargar productos y categorías al montar
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);
  
  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filtro por texto de búsqueda
      const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro por categoría
      let matchesCategory = categoryFilter === 'all';
      if (categoryFilter === 'none') {
        // Productos sin categoría
        matchesCategory = !product.categoria || product.categoria === '';
      } else if (categoryFilter !== 'all') {
        // Categoría específica
        matchesCategory = product.categoria === categoryFilter;
      }
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);
  
  // Obtener nombre de categoría
  const getCategoryName = useCallback((categoryId) => {
    if (!categoryId) return 'Sin categoría';
    
    // Buscar la categoría por ID
    const category = categories.find(cat => cat._id === categoryId);
    
    // Verificar si se encontró la categoría
    if (category) {
      return category.nombre;
    }
    
    // Si llegamos aquí, la categoría existe pero no se encontró en nuestra lista
    return 'Categoría desconocida';
  }, [categories]);
  
  // Funciones para manejar productos
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };
  
  const handleDeleteProduct = async (productId) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await deleteProduct(productId);
        toast.success('Producto eliminado correctamente');
      } catch (error) {
        toast.error(error.message || 'Error al eliminar producto');
      }
    }
  };
  
  const handleProductSaved = () => {
    fetchProducts();
    setShowProductModal(false);
    setSelectedProduct(null);
  };
  
  // Calcular precio en bolívares
  const calcularPrecioBsF = (precioUSD) => {
    return (parseFloat(precioUSD) * tasaCambio).toFixed(2);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Productos</h2>
        <Button 
          onClick={() => {
            setSelectedProduct(null);
            setShowProductModal(true);
          }}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/3">
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="none">Sin categoría</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <p>Cargando productos...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : filteredProducts.length === 0 ? (
        <p>No hay productos que coincidan con los filtros.</p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow  className="bg-gray-100">
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio Compra</TableHead>
                <TableHead className="text-right">Precio Venta</TableHead>
                <TableHead className="text-right">Precio en Bs.</TableHead>
                <TableHead className="text-right">Inventario</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}  className="bg-white">
                  <TableCell className="font-medium">{product.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {getCategoryName(product.categoria)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${product.precioCompra.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    ${(product.precioCompra * (1 + product.porcentajeGanancia / 100)).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    Bs. {calcularPrecioBsF(product.precioCompra * (1 + product.porcentajeGanancia / 100))}
                  </TableCell>
                  <TableCell className="text-right">{product.cantidadInventario}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={selectedProduct}
        onSuccess={handleProductSaved}
      />
    </div>
  );
});

export default ProductList; 