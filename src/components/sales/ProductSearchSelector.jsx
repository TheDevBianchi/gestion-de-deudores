'use client';

import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/hooks/products/useProducts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProductSearchSelector = memo(function ProductSearchSelector({ 
  onProductSelect, 
  onQuantityChange,
  selectedProducts = [],
  disabled = false
}) {
  const { products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const searchRef = useRef(null);

  // Productos disponibles (con stock)
  const availableProducts = useMemo(() => {
    return products.filter(p => p.cantidadInventario > 0);
  }, [products]);
  
  // Productos filtrados por búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return availableProducts;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return availableProducts.filter(product => 
      product.nombre.toLowerCase().includes(lowerSearchTerm) ||
      product.descripcion?.toLowerCase().includes(lowerSearchTerm) ||
      product.categoria?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [availableProducts, searchTerm]);

  // Manejar clicks fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Manejar selección de producto
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchTerm(product.nombre);
    setIsDropdownOpen(false);
    
    // Reset cantidad a 1 al seleccionar un nuevo producto
    setQuantity(1);
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0 && selectedProduct && newQuantity <= selectedProduct.cantidadInventario) {
      setQuantity(newQuantity);
    }
  };

  // Añadir producto a la venta
  const handleAddProduct = () => {
    if (selectedProduct && quantity > 0) {
      onProductSelect(selectedProduct._id);
      onQuantityChange(quantity);
      
      // Limpiar selección
      setSelectedProduct(null);
      setSearchTerm('');
      setQuantity(1);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md font-medium flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Agregar Productos a la Venta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 w-full" ref={searchRef}>
          <Label htmlFor="product-search" className="font-medium">
            Buscar Producto
            <span className="ml-1 text-sm text-muted-foreground">
              (Escribe para buscar por nombre, descripción o categoría)
            </span>
          </Label>
          
          <div className="relative">
            <div className="flex items-center relative">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="product-search"
                  placeholder="Ej: Doritos, Glup, Caramelos"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="pl-8 pr-8"
                  disabled={disabled}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedProduct(null);
                    }}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={disabled}
                title={isDropdownOpen ? "Cerrar lista" : "Ver lista de productos"}
              >
                {isDropdownOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Dropdown de resultados */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  {isLoading ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Cargando productos...
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No se encontraron productos disponibles
                    </div>
                  ) : (
                    <ul className="py-1">
                      {filteredProducts.map((product) => {
                        // Verificar si el producto ya está en la lista de seleccionados
                        const isAlreadySelected = selectedProducts.some(
                          id => id === product._id
                        );
                        
                        return (
                          <li
                            key={product._id}
                            className={`px-3 py-2 hover:bg-muted cursor-pointer flex justify-between items-center ${
                              isAlreadySelected ? 'opacity-50' : ''
                            }`}
                            onClick={() => !isAlreadySelected && handleSelectProduct(product)}
                          >
                            <div>
                              <p className="font-medium">{product.nombre}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Precio: ${product.precioVenta?.toFixed(2) || product.precioCompra.toFixed(2)}</span>
                                <span>•</span>
                                <span>Stock: {product.cantidadInventario}</span>
                              </div>
                            </div>
                            {isAlreadySelected ? (
                              <Badge variant="outline">Ya agregado</Badge>
                            ) : (
                              <Badge variant="secondary">Disponible</Badge>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input de cantidad */}
          {selectedProduct && (
            <div className="mt-4 border p-3 rounded-md bg-muted/20">
              <div className="font-medium mb-2">Producto seleccionado: {selectedProduct.nombre}</div>
              <div className="text-sm mb-3">
                <span className="text-muted-foreground">Precio unitario:</span> ${(selectedProduct.precioVenta || selectedProduct.precioCompra * (1 + selectedProduct.porcentajeGanancia / 100)).toFixed(2)} | 
                <span className="text-muted-foreground ml-2">Stock disponible:</span> {selectedProduct.cantidadInventario}
              </div>
              
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="product-quantity" className="mb-1 block">
                    Cantidad a vender
                  </Label>
                  <Input
                    id="product-quantity"
                    type="number"
                    min="1"
                    max={selectedProduct.cantidadInventario}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-full"
                    placeholder="Ej: 1, 2, 3..."
                    disabled={disabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo disponible: {selectedProduct.cantidadInventario}
                  </p>
                </div>
                <Button 
                  onClick={handleAddProduct}
                  disabled={!selectedProduct || quantity < 1 || disabled}
                  className="mb-1"
                >
                  Agregar a la venta
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default ProductSearchSelector; 