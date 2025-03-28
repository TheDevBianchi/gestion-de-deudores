'use client';

import { useEffect, useState, memo, useCallback } from 'react';
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
import { useCategories } from '@/hooks/categories/useCategories';
import { useDollarPrice } from '@/hooks/dollar/useDollarPrice';
import { Label } from '@/components/ui/label';

// Esquema para validar el formulario
const productSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  precioCompra: z.coerce.number().positive('El precio debe ser un valor positivo'),
  precioVenta: z.coerce.number().positive('El precio debe ser un valor positivo'),
  cantidadPaquetes: z.coerce.number().int().min(0, 'La cantidad no puede ser negativa'),
  cantidadUnidadesSueltas: z.coerce.number().int().min(0, 'La cantidad no puede ser negativa'),
  porcentajeGanancia: z.coerce.number().min(0, 'El porcentaje no puede ser negativo'),
  cantidadPorPaquete: z.coerce.number().int().min(1, 'Debe ser al menos 1'),
  categoria: z.string().optional(),
});

// Añadimos memo para optimizar rendimiento
const ProductForm = memo(function ProductForm({ product, onSuccess, onClose }) {
  // Añadimos el estado isSubmitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalUnidades, setTotalUnidades] = useState(0);
  
  const { createProduct, updateProduct } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const { price: dollarPrice } = useDollarPrice();
  
  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: product?.nombre || '',
      descripcion: product?.descripcion || '',
      precioCompra: product?.precioCompra || '',
      precioVenta: product?.precioVenta || '',
      cantidadPaquetes: product?.cantidadPaquetes || 0,
      cantidadUnidadesSueltas: product?.cantidadUnidadesSueltas || 0,
      porcentajeGanancia: product?.porcentajeGanancia || 20,
      cantidadPorPaquete: product?.cantidadPorPaquete || 1,
      categoria: product?.categoria || '',
    },
  });

  // Calcular el total de unidades
  useEffect(() => {
    const cantidadPaquetes = parseInt(form.watch('cantidadPaquetes')) || 0;
    const cantidadPorPaquete = parseInt(form.watch('cantidadPorPaquete')) || 1;
    const cantidadUnidadesSueltas = parseInt(form.watch('cantidadUnidadesSueltas')) || 0;
    
    const total = (cantidadPaquetes * cantidadPorPaquete) + cantidadUnidadesSueltas;
    setTotalUnidades(total);
  }, [form, form.watch('cantidadPaquetes'), form.watch('cantidadPorPaquete'), form.watch('cantidadUnidadesSueltas')]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      if (product) {
        // Actualizar producto existente
        await updateProduct(product._id, data);
        toast.success('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        await createProduct(data);
        toast.success('Producto creado correctamente');
      }
      
      onSuccess?.();
      form.reset();
    } catch (error) {
      toast.error(error.message || 'Ha ocurrido un error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular precio unitario y precio en BsF
  const [precioUnitario, setPrecioUnitario] = useState('0.00');
  const [precioBsF, setPrecioBsF] = useState('0.00');
  
  // Actualizar precios calculados cuando cambian los valores relevantes
  useEffect(() => {
    const precioCompra = parseFloat(form.watch('precioCompra')) || 0;
    const porcentajeGanancia = parseFloat(form.watch('porcentajeGanancia')) || 0;
    const cantidadPorPaquete = parseInt(form.watch('cantidadPorPaquete')) || 1;
    
    // Calcular precio unitario incluyendo el porcentaje de ganancia
    if (cantidadPorPaquete > 0) {
      const precioConGanancia = precioCompra * (1 + porcentajeGanancia / 100);
      const unitario = (precioConGanancia / cantidadPorPaquete).toFixed(2);
      setPrecioUnitario(unitario);
    } else {
      setPrecioUnitario('0.00');
    }
    
    // Calcular precio de venta
    const precioVenta = precioCompra * (1 + porcentajeGanancia / 100);
    form.setValue('precioVenta', precioVenta.toFixed(2), { shouldValidate: true });
    
    // Calcular precio en BsF usando la tasa dinámica
    if (dollarPrice) {
      setPrecioBsF((precioVenta * dollarPrice).toFixed(2));
    }
  }, [form, form.watch('precioCompra'), form.watch('porcentajeGanancia'), form.watch('cantidadPorPaquete'), dollarPrice]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Producto</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ingrese el nombre del producto" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select
                  value={field.value || "none"}
                  onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción del producto"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="precioCompra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de Compra ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    disabled={isSubmitting}
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
                <FormLabel>Porcentaje de Ganancia (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="20"
                    {...field}
                    disabled={isSubmitting}
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
                <FormLabel>Precio de Venta ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    disabled={true}
                  />
                </FormControl>
                <FormDescription>
                  Calculado automáticamente
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cantidadPaquetes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad de Paquetes</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Número de paquetes completos en inventario
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cantidadUnidadesSueltas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidades Sueltas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Unidades individuales (fuera de paquetes)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cantidadPorPaquete"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad por Paquete</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Número de unidades que contiene cada paquete
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="bg-muted/30 p-4 border rounded-md">
            <label className="font-medium">Total de Unidades:</label>
            <p className="text-lg font-bold">{totalUnidades}</p>
            <p className="text-xs text-muted-foreground">
              ({form.watch('cantidadPaquetes') || 0} paquetes × {form.watch('cantidadPorPaquete') || 1} unidades) + {form.watch('cantidadUnidadesSueltas') || 0} unidades sueltas
            </p>
          </div>
        </div>
        
        <div className="bg-muted/30 p-4 border rounded-md mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Precio Unitario:</label>
              <p className="text-xl font-bold">${precioUnitario}</p>
              <p className="text-xs text-muted-foreground">
                Precio por unidad individual
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Precio Unitario en Bs.F:</label>
              <p className="text-xl font-bold">Bs. {(parseFloat(precioUnitario) * dollarPrice).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                Tasa: {dollarPrice?.toFixed(2) || 0} Bs.F/USD
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          {onClose && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Guardando...' 
              : product 
                ? 'Actualizar Producto' 
                : 'Crear Producto'
            }
          </Button>
        </div>
      </form>
    </Form>
  );
});

export default ProductForm; 