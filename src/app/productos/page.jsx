'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useProducts } from '@/hooks/products/useProducts';
import { useCategories } from '@/hooks/categories/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  PlusIcon, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  HelpCircle
} from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Definir constantes
const PRODUCTS_PER_PAGE = 10;

// Columnas con nombres abreviados y sus tooltips
const tableColumns = [
  { id: 'nombre', abbr: 'Nombre', full: 'Nombre del Producto' },
  { id: 'costo', abbr: 'Costo', full: 'Precio de Compra' },
  { id: 'precioVenta', abbr: 'P. Paq', full: 'Precio por Paquete' },
  { id: 'precioUnitario', abbr: 'P. Unit', full: 'Precio Unitario' },
  { id: 'precioBs', abbr: 'Precio en Bs', full: 'Precio en Bolívares con diferentes tasas' },
  { id: 'categoria', abbr: 'Cat', full: 'Categoría' },
  { id: 'stock', abbr: 'Stock', full: 'Unidades Disponibles' },
  { id: 'estado', abbr: 'Estado', full: 'Estado del Producto' },
  { id: 'acciones', abbr: 'Acciones', full: 'Acciones Disponibles' }
];

// Estilos optimizados para la tabla - Actualizados para fondos blancos
const tableStyles = {
  container: "w-full overflow-x-auto rounded-md border",
  table: "w-full border-collapse min-w-full divide-y divide-gray-200 text-xs bg-white",
  th: "px-1.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-white",
  td: "px-1.5 py-2 whitespace-nowrap border-t border-gray-100",
  tdPrice: "text-xs font-medium",
  badge: "inline-block px-1.5 py-0.5 text-xs font-medium rounded-full",
  smallText: "text-[10px] text-muted-foreground",
  paginationContainer: "flex items-center justify-between mt-4",
  paginationInfo: "text-xs text-gray-500",
  paginationControls: "flex items-center space-x-1"
};

// Componente principal - Página de Productos
const ProductosPage = memo(function ProductosPage() {
  const { products, isLoading, error, fetchProducts, deleteProductById } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [stockFilter, setStockFilter] = useState('todos');
  const [sortOrder, setSortOrder] = useState('nombre');
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  
  const { averagePrice, centralBankPrice, parallelPrice } = useDollarPrice();
  
  // Cargar productos y categorías al iniciar
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);
  
  // Función para obtener el nombre de la categoría
  const getCategoryName = useCallback((categoryId) => {
    if (!categoryId) return 'Sin categoría';
    const category = categories.find(c => c._id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  }, [categories]);
  
  // Filtrar y ordenar productos - Implementación de búsqueda global
  const filteredProductsList = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      // Filtro de búsqueda
      const searchMatch = searchTerm === '' || 
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de categoría
      const categoryMatch = 
        categoryFilter === 'todas' || 
        (categoryFilter === 'sin-categoria' && !product.categoria) ||
        product.categoria === categoryFilter;
      
      // Filtro de stock
      const stockMatch = 
        stockFilter === 'todos' || 
        (stockFilter === 'disponible' && product.cantidadInventario > 0) ||
        (stockFilter === 'agotado' && product.cantidadInventario <= 0);
        
      return searchMatch && categoryMatch && stockMatch;
    }).sort((a, b) => {
      // Ordenamiento
      if (sortOrder === 'nombre') {
        return a.nombre.localeCompare(b.nombre);
      } else if (sortOrder === 'precio-asc') {
        return a.precioVenta - b.precioVenta;
      } else if (sortOrder === 'precio-desc') {
        return b.precioVenta - a.precioVenta;
      } else if (sortOrder === 'stock-asc') {
        return a.cantidadInventario - b.cantidadInventario;
      } else if (sortOrder === 'stock-desc') {
        return b.cantidadInventario - a.cantidadInventario;
      }
      return 0;
    });
  }, [products, searchTerm, categoryFilter, stockFilter, sortOrder]);
  
  // Calcular el número total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProductsList.length / PRODUCTS_PER_PAGE);
  }, [filteredProductsList]);
  
  // Obtener productos para la página actual
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProductsList.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProductsList, currentPage]);
  
  // Ajustar página actual cuando cambian los filtros o el total de páginas
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  
  // Funciones de navegación de páginas
  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);
  
  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);
  
  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);
  
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  // Stats de inventario
  const stats = useMemo(() => {
    if (!products) return { 
      total: 0, 
      lowStock: 0, 
      outOfStock: 0, 
      value: 0
    };
    
    return products.reduce((acc, product) => {
      // Stats básicos
      acc.total += 1;
      if (product.cantidadInventario <= 0) acc.outOfStock += 1;
      else if (product.cantidadInventario < 5) acc.lowStock += 1;
      
      // Valor total
      const precioVenta = product.precioVenta || 0;
      const inventory = product.cantidadInventario || 0;
      acc.value += precioVenta * inventory;
      
      return acc;
    }, { 
      total: 0, 
      lowStock: 0, 
      outOfStock: 0, 
      value: 0 
    });
  }, [products]);
  
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
  
  // Función para renderizar controles de paginación
  const renderPagination = () => {
    // No mostrar paginación si hay muy pocos productos
    if (filteredProductsList.length <= PRODUCTS_PER_PAGE) return null;
    
    const pageNumbers = [];
    // Determinar qué números de página mostrar
    const totalPageButtons = 5; // Ajustar según sea necesario
    let startPage = Math.max(1, currentPage - Math.floor(totalPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + totalPageButtons - 1);
    
    if (endPage - startPage + 1 < totalPageButtons) {
      startPage = Math.max(1, endPage - totalPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className={tableStyles.paginationContainer}>
        <div className={tableStyles.paginationInfo}>
          Mostrando {((currentPage - 1) * PRODUCTS_PER_PAGE) + 1} - {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProductsList.length)} de {filteredProductsList.length} productos
        </div>
        
        <div className={tableStyles.paginationControls}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToFirstPage} 
            disabled={currentPage === 1}
            className="h-7 w-7 p-0 bg-white"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPrevPage} 
            disabled={currentPage === 1}
            className="h-7 w-7 p-0 bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {pageNumbers.map(number => (
            <Button
              key={number}
              variant={currentPage === number ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(number)}
              className={`h-7 w-7 p-0 ${currentPage !== number ? "bg-white" : ""}`}
            >
              {number}
            </Button>
          ))}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages}
            className="h-7 w-7 p-0 bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToLastPage} 
            disabled={currentPage === totalPages}
            className="h-7 w-7 p-0 bg-white"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Button onClick={handleAddProduct}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>
      
      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Productos</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Bajo Stock (&lt;5)</div>
          <div className="text-2xl font-bold text-amber-500">{stats.lowStock}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Agotados</div>
          <div className="text-2xl font-bold text-red-500">{stats.outOfStock}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Valor en Inventario</div>
          <div className="text-2xl font-bold">${stats.value.toFixed(2)}</div>
        </Card>
      </div>
      
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        
        <div>
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              <SelectItem value="sin-categoria">Sin categoría</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select
            value={stockFilter}
            onValueChange={setStockFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado de stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los productos</SelectItem>
              <SelectItem value="disponible">Disponibles</SelectItem>
              <SelectItem value="agotado">Agotados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select
            value={sortOrder}
            onValueChange={setSortOrder}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nombre">Nombre (A-Z)</SelectItem>
              <SelectItem value="precio-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="precio-desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="stock-asc">Stock: menor a mayor</SelectItem>
              <SelectItem value="stock-desc">Stock: mayor a menor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Tabla de productos */}
      <TooltipProvider>
        <div className={tableStyles.container}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                {tableColumns.map(column => (
                  <th key={column.id} className={tableStyles.th}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          {column.abbr}
                          <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{column.full}</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={tableColumns.length} className="p-4 text-center">
                    Cargando productos...
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length} className="p-4 text-center">
                    No se encontraron productos que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className={tableStyles.td}>{product.nombre}</td>
                    <td className={tableStyles.td}>
                      <div className={tableStyles.tdPrice}>${product.precioCompra?.toFixed(2) || "0.00"}</div>
                    </td>
                    <td className={tableStyles.td}>
                      <div className={tableStyles.tdPrice}>${product.precioVenta?.toFixed(2) || "0.00"}</div>
                    </td>
                    <td className={tableStyles.td}>
                      <div className={tableStyles.tdPrice}>${product.precioUnitario?.toFixed(2) || "0.00"}</div>
                    </td>
                    {/* Columna combinada de precios en bolívares */}
                    <td className={tableStyles.td}>
                      <div className="space-y-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <div className={tableStyles.tdPrice}>Bs. {((product.precioVenta || 0) * averagePrice).toFixed(2)}</div>
                                <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>Precio con Tasa Promedio</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <div className={tableStyles.tdPrice}>Bs. {((product.precioVenta || 0) * centralBankPrice).toFixed(2)}</div>
                                <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>Precio con Tasa BCV</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <div className={tableStyles.tdPrice}>Bs. {((product.precioVenta || 0) * parallelPrice).toFixed(2)}</div>
                                <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>Precio con Tasa Paralelo</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                    <td className={tableStyles.td}>
                      <span className={`${tableStyles.badge} bg-blue-100 text-blue-800`}>
                        {getCategoryName(product.categoria)}
                      </span>
                    </td>
                    <td className={`${tableStyles.td} text-center`}>{product.cantidadInventario}</td>
                    <td className={tableStyles.td}>
                      {product.cantidadInventario > 0 ? (
                        <span className={`${tableStyles.badge} bg-green-100 text-green-800`}>
                          Disp
                        </span>
                      ) : (
                        <span className={`${tableStyles.badge} bg-red-100 text-red-800`}>
                          Agot
                        </span>
                      )}
                    </td>
                    <td className={tableStyles.td}>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-1.5 text-xs"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-6 px-1.5 text-xs"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Elim
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TooltipProvider>
      
      {/* Controles de paginación */}
      {renderPagination()}
      
      {/* Modal de producto */}
      {showModal && (
        <ProductFormModal
          product={editingProduct}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
});

export default ProductosPage; 