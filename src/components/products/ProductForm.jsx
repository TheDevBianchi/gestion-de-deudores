'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/products/useProducts';

// Esquema para validar el formulario
const productSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  precioCompra: z.coerce.number().positive('El precio debe ser un valor positivo'),
  precioVenta: z.coerce.number().positive('El precio debe ser un valor positivo'),
  cantidadInventario: z.coerce.number().int().min(0, 'La cantidad no puede ser negativa'),
  porcentajeGanancia: z.coerce.number().min(0, 'El porcentaje no puede ser negativo'),
});

function ProductForm({ product, onSuccess }) {
  const { createProduct, updateProduct } = useProducts();
  
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      precioCompra: 0,
      precioVenta: 0,
      cantidadInventario: 0,
      porcentajeGanancia: 0,
    }
  });
  
  // Cargar datos del producto si es edición
  useEffect(() => {
    if (product) {
      form.reset({
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        precioCompra: product.precioCompra,
        precioVenta: product.precioVenta || 0,
        cantidadInventario: product.cantidadInventario,
        porcentajeGanancia: product.porcentajeGanancia || 0,
      });
    }
  }, [product, form]);

  // Calcular precio de venta basado en precio de compra y porcentaje
  const calculateSellPrice = (buyPrice, percentage) => {
    const sellPrice = buyPrice * (1 + percentage / 100);
    form.setValue('precioVenta', sellPrice);
    return sellPrice;
  };
  
  // Manejar envío del formulario
  const onSubmit = async (data) => {
    try {
      if (product) {
        // Actualizar producto existente
        await updateProduct(product._id, data);
        toast.success('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        await createProduct(data);
        toast.success('Producto creado correctamente');
      }
      
      // Notificar éxito para cerrar modal y refrescar lista
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del producto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
        </div>
        
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción del producto" 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="precioCompra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de Compra</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      // Actualizar precio venta si cambia precio compra
                      const percentage = form.getValues('porcentajeGanancia');
                      calculateSellPrice(parseFloat(e.target.value), percentage);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="porcentajeGanancia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% Ganancia</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="1"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      // Actualizar precio venta si cambia porcentaje
                      const buyPrice = form.getValues('precioCompra');
                      calculateSellPrice(buyPrice, parseFloat(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="precioVenta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de Venta</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    {...field}
                    readOnly
                  />
                </FormControl>
                <FormDescription>
                  Calculado automáticamente
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="cantidadInventario"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad en Inventario</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="1"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="submit">
            {product ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ProductForm; 