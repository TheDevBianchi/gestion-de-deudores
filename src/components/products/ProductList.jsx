'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

const ProductRow = memo(function ProductRow({ 
  product, 
  onEditProduct, 
  onDeleteProduct, 
  dollarPrice 
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleDelete = async () => {
    try {
      await onDeleteProduct(product._id);
      toast.success(`Producto "${product.nombre}" eliminado correctamente`);
    } catch (error) {
      toast.error(`Error al eliminar el producto: ${error.message}`);
    }
  };
  
  // Calcular precio en dólares
  const precioUSD = (product.precioCompra / dollarPrice).toFixed(2);
  
  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="font-medium">{product.nombre}</TableCell>
        <TableCell>
          ${product.precioCompra.toFixed(2)} <br/>
          <span className="text-xs text-muted-foreground">(${precioUSD} USD)</span>
        </TableCell>
        <TableCell>{product.cantidadInventario}</TableCell>
        <TableCell>
          <Badge
            variant={product.cantidadInventario > 0 ? "success" : "destructive"}
          >
            {product.cantidadInventario > 0 ? "Disponible" : "Agotado"}
          </Badge>
        </TableCell>
        <TableCell className="text-right space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEditProduct(product)}
          >
            <Edit className="h-4 w-4 mr-1" /> Editar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
          </Button>
        </TableCell>
      </TableRow>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el producto "{product.nombre}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

const ProductList = memo(function ProductList({ 
  products, 
  onEditProduct, 
  deleteProductById, 
  dollarPrice 
}) {
  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground text-center">
            No se encontraron productos. Intenta cambiar los filtros o añade nuevos productos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <ProductRow
                  key={product._id}
                  product={product}
                  onEditProduct={onEditProduct}
                  onDeleteProduct={deleteProductById}
                  dollarPrice={dollarPrice}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default ProductList; 