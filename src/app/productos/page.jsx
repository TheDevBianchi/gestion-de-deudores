'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useProducts } from '@/hooks/products/useProducts';
import { useCategories } from '@/hooks/categories/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PlusIcon, Search } from 'lucide-react';
import ProductFormModal from '@/components/products/ProductFormModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/custom-select';
import useDollarPrice from '@/hooks/dollar/useDollarPrice';
import { toast } from 'sonner';

const ProductosPage = memo(function ProductosPage() {
  const { products, isLoading, error, fetchProducts, deleteProductById } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [stockFilter, setStockFilter] = useState('todos');
  const [sortOrder, setSortOrder] = useState('nombre');
  
  const { price: dollarPrice } = useDollarPrice();
  
  // Cargar productos y categorías al iniciar
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);
  
  // Filtrar productos
  const filteredProducts = useCallback(() => {
    if (!products || !products.length) return [];
    
    return products.filter(product => {
      // Filtro por búsqueda
      const matchesSearch = !searchTerm || 
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro por categoría
      let matchesCategory = categoryFilter === 'todas';
      if (categoryFilter === 'none') {
        matchesCategory = !product.categoria || product.categoria === '';
      } else if (categoryFilter !== 'todas') {
        matchesCategory = product.categoria === categoryFilter;
      }
      
      // Filtro por stock
      let matchesStock = stockFilter === 'todos';
      if (stockFilter === 'disponibles') {
        matchesStock = product.cantidadInventario > 0;
      } else if (stockFilter === 'agotados') {
        matchesStock = product.cantidadInventario <= 0;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
    }).sort((a, b) => {
      // Ordenamiento
      if (sortOrder === 'nombre') return a.nombre.localeCompare(b.nombre);
      if (sortOrder === 'precio') return a.precioVenta - b.precioVenta;
      if (sortOrder === 'stock') return b.cantidadInventario - a.cantidadInventario;
      return 0;
    });
  }, [products, searchTerm, categoryFilter, stockFilter, sortOrder]);
  
  // Calcular estadísticas
  const stats = useCallback(() => {
    if (!products) return { 
      total: 0, 
      lowStock: 0, 
      outOfStock: 0, 
      value: 0, 
      dollarValue: 0,
      totalProfit: 0
    };
    
    return products.reduce((acc, product) => {
      acc.total += 1;
      if (product.cantidadInventario <= 0) acc.outOfStock += 1;
      else if (product.cantidadInventario < 5) acc.lowStock += 1;
      
      const precioCompra = product.precioCompra || 0;
      const precioVenta = product.precioVenta || (precioCompra * (1 + (product.porcentajeGanancia || 0) / 100));
      const inventory = product.cantidadInventario || 0;
      
      // Valor total del inventario (precio de venta x cantidad)
      const productValue = precioVenta * inventory;
      acc.value += productValue;
      
      // Valor en dólares
      acc.dollarValue += productValue / dollarPrice;
      
      // Cálculo de la ganancia total
      const costo = precioCompra * inventory;
      const ganancia = productValue - costo;
      acc.totalProfit += ganancia;
      
      return acc;
    }, { 
      total: 0, 
      lowStock: 0, 
      outOfStock: 0, 
      value: 0, 
      dollarValue: 0,
      totalProfit: 0 
    });
  }, [products, dollarPrice]);
  
  // Funciones de manejo
  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setShowModal(true);
  }, []);
  
  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setShowModal(true);
  }, []);
  
  const handleDeleteProduct = useCallback(async (productId) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await deleteProductById(productId);
        toast.success('Producto eliminado correctamente');
      } catch (error) {
        toast.error(error.message || 'Error al eliminar producto');
      }
    }
  }, [deleteProductById]);
  
  const handleFormSuccess = useCallback(() => {
    setShowModal(false);
    setEditingProduct(null);
    fetchProducts();
  }, [fetchProducts]);
  
  // Obtener estadísticas calculadas
  const statsData = stats();
  const filteredProductsList = filteredProducts();
  
  // Obtener nombre de categoría
  const getCategoryName = useCallback((categoryId) => {
    if (!categoryId) return 'Sin categoría';
    
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.nombre : 'Categoría desconocida';
  }, [categories]);
  
    return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Productos</h1>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm text-muted-foreground">Total Productos</h3>
          <p className="text-3xl font-bold">{statsData.total}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm text-muted-foreground">Bajo Stock</h3>
          <p className="text-3xl font-bold text-orange-500">{statsData.lowStock}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm text-muted-foreground">Agotados</h3>
          <p className="text-3xl font-bold text-red-500">{statsData.outOfStock}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm text-muted-foreground">Valor Total en USD</h3>
          <p className="text-3xl font-bold">${statsData.value.toFixed(2)}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm text-muted-foreground">Ganancia Total</h3>
          <p className="text-3xl font-bold text-green-600">${statsData.totalProfit.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Basado en % de ganancia</p>
        </Card>
      </div>
      
      {/* Barra de búsqueda y botón de añadir */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative w-full md:w-auto md:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={handleAddProduct} className="w-full md:w-auto">
          <PlusIcon className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>
      
      {/* Filtros */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-full md:w-auto">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              <SelectItem value="none">Sin categoría</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={stockFilter}
            onValueChange={setStockFilter}
          >
            <SelectTrigger className="w-full md:w-auto">
              <SelectValue placeholder="Todos los productos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los productos</SelectItem>
              <SelectItem value="disponibles">En stock</SelectItem>
              <SelectItem value="agotados">Agotados</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortOrder}
            onValueChange={setSortOrder}
          >
            <SelectTrigger className="w-full md:w-auto">
              <SelectValue placeholder="Nombre (A-Z)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nombre">Nombre (A-Z)</SelectItem>
              <SelectItem value="precio">Precio (menor a mayor)</SelectItem>
              <SelectItem value="stock">Stock (mayor a menor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
      
      {/* Tabla de productos */}
      <div className="border rounded-md">
        <table className="w-full bg-white rounded-md">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Costo</th>
              <th className="text-left p-3">Precio de venta</th>
              <th className="text-left p-3">Categoría</th>
              <th className="text-center p-3">Stock</th>
              <th className="text-center p-3">Estado</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center p-4">Cargando productos...</td>
              </tr>
            ) : filteredProductsList.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4">No hay productos que coincidan con los filtros.</td>
              </tr>
            ) : (
              filteredProductsList.map((product) => (
                <tr key={product._id} className="border-b">
                  <td className="p-3">{product.nombre}</td>
                  <td className="p-3">
                    <div>${product.precioCompra?.toFixed(2) || "0.00"}</div>
                  </td>
                  <td className="p-3">
                    <div>${product.precioVenta?.toFixed(2) || "0.00"}</div>
                    <div className="text-sm text-muted-foreground">Bs. {((product.precioVenta || 0) * dollarPrice).toFixed(2)}</div>
                  </td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {getCategoryName(product.categoria)}
                    </span>
                  </td>
                  <td className="text-center p-3">{product.cantidadInventario}</td>
                  <td className="text-center p-3">
                    {product.cantidadInventario > 0 ? (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        Agotado
                      </span>
                    )}
                  </td>
                  <td className="text-right p-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product._id)}>
                        Eliminar
        </Button>
      </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal para crear/editar productos */}
      <div className='mt-4'>
        <ProductFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          product={editingProduct}
          onSuccess={handleFormSuccess}
        />
      </div>
      </div>
  );
});

export default ProductosPage; 