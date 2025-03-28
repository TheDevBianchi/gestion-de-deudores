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
  selectedProducts = [],
  disabled = false
}) {
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Productos disponibles (con stock)
  const availableProducts = useMemo(() => {
    return products.filter(p => p.cantidadInventario > 0);
  }, [products]);
  
  // Productos filtrados por búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return availableProducts;
    
    const lowerSearchQuery = searchQuery.toLowerCase();
    return availableProducts.filter(product => 
      product.nombre.toLowerCase().includes(lowerSearchQuery) ||
      product.descripcion?.toLowerCase().includes(lowerSearchQuery) ||
      product.categoria?.toLowerCase().includes(lowerSearchQuery)
    );
  }, [availableProducts, searchQuery]);

  const handleSelectProduct = (productId) => {
    const product = products.find(p => p._id === productId);
    setSelectedProduct(product);
    // Resetear la cantidad a 1 cuando se selecciona un nuevo producto
    setQuantity(1);
  };

  const handleAddToSale = () => {
    if (selectedProduct) {
      // Pasar el ID del producto y la cantidad actual al controlador
      onProductSelect(selectedProduct._id, quantity);
      // Limpiar después de agregar
      setSelectedProduct(null);
      setSearchQuery('');
      // No reseteamos la cantidad para mantener el comportamiento deseado
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
        <div className="space-y-2 w-full">
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
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="pl-8 pr-8"
                  disabled={disabled}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedProduct(null);
                    }}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedProduct ? (
          <div className="border p-4 rounded-md">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h3 className="font-medium">Producto seleccionado: {selectedProduct.nombre}</h3>
                <p className="text-sm text-muted-foreground">
                  Precio unitario: ${(selectedProduct.precioCompra * (1 + selectedProduct.porcentajeGanancia / 100)).toFixed(2)} | Stock disponible: {selectedProduct.cantidadInventario}
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <div className="w-24">
                  <Label htmlFor="add-quantity">Cantidad a vender</Label>
                  <Input
                    id="add-quantity"
                    type="number"
                    min="1"
                    max={selectedProduct.cantidadInventario}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    disabled={disabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo disponible: {selectedProduct.cantidadInventario}
                  </p>
                </div>

                <Button
                  onClick={handleAddToSale}
                  disabled={disabled || quantity < 1 || quantity > selectedProduct.cantidadInventario}
                  className="mt-6"
                >
                  Agregar a la venta
                </Button>
              </div>
            </div>
          </div>
        ) : (
          searchQuery.trim().length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted px-4 py-2 font-medium">
                Resultados
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No se encontraron productos
                  </div>
                ) : (
                  <div>
                    {filteredProducts.map(product => (
                      <div
                        key={product._id}
                        className={`
                          p-3 border-b last:border-0 flex justify-between items-center
                          hover:bg-muted/50 cursor-pointer transition-colors
                          ${selectedProducts.includes(product._id) ? 'opacity-50 pointer-events-none' : ''}
                        `}
                        onClick={() => handleSelectProduct(product._id)}
                        disabled={selectedProducts.includes(product._id) || disabled}
                      >
                        <div>
                          <div className="font-medium">{product.nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            Stock: {product.cantidadInventario} | 
                            Precio: ${(product.precioCompra * (1 + product.porcentajeGanancia / 100)).toFixed(2)}
                          </div>
                        </div>
                        {selectedProducts.includes(product._id) ? (
                          <Badge variant="outline">
                            Ya agregado
                          </Badge>
                        ) : (
                          <Button variant="ghost" size="sm">
                            Seleccionar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
});

export default ProductSearchSelector; 