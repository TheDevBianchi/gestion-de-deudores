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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

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
  const { averagePrice, centralBankPrice, parallelPrice } = useDollarPrice();
  
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

  // Estados para los precios calculados
  const [precioUnitario, setPrecioUnitario] = useState('0.00');
  const [precioBsF, setPrecioBsF] = useState({
    promedio: '0.00',
    bancoCentral: '0.00',
    paralelo: '0.00'
  });
  const [precioUnitarioBsF, setPrecioUnitarioBsF] = useState({
    promedio: '0.00',
    bancoCentral: '0.00',
    paralelo: '0.00'
  });
  
  // Actualizar precios calculados cuando cambian los valores relevantes
  useEffect(() => {
    const precioCompra = parseFloat(form.watch('precioCompra')) || 0;
    const porcentajeGanancia = parseFloat(form.watch('porcentajeGanancia')) || 0;
    const cantidadPorPaquete = parseInt(form.watch('cantidadPorPaquete')) || 1;
    
    // Calcular precio de venta por paquete
    const precioVenta = precioCompra * (1 + porcentajeGanancia / 100);
    form.setValue('precioVenta', precioVenta.toFixed(2), { shouldValidate: true });
    
    // Calcular precio unitario
    let unitario = "0.00";
    if (cantidadPorPaquete > 0) {
      unitario = (precioVenta / cantidadPorPaquete).toFixed(2);
    }
    setPrecioUnitario(unitario);
    
    // Importante: convertir el string a número para los cálculos
    const precioUnitarioNum = parseFloat(unitario);
    
    // Calcular precios en bolívares usando las diferentes tasas
    const preciosBolivares = {
      promedio: (precioVenta * averagePrice).toFixed(2),
      bancoCentral: (precioVenta * centralBankPrice).toFixed(2),
      paralelo: (precioVenta * parallelPrice).toFixed(2)
    };
    
    // Calcular precios unitarios en bolívares asegurándonos de usar el valor numérico
    const preciosUnitariosBolivares = {
      promedio: (precioUnitarioNum * averagePrice).toFixed(2),
      bancoCentral: (precioUnitarioNum * centralBankPrice).toFixed(2),
      paralelo: (precioUnitarioNum * parallelPrice).toFixed(2)
    };
    
    console.log("Precio unitario en USD:", precioUnitarioNum);
    console.log("Precio unitario en Bs. (Promedio):", preciosUnitariosBolivares.promedio);
    
    setPrecioBsF(preciosBolivares);
    setPrecioUnitarioBsF(preciosUnitariosBolivares);
    
  }, [form, form.watch('precioCompra'), form.watch('porcentajeGanancia'), form.watch('cantidadPorPaquete'), averagePrice, centralBankPrice, parallelPrice]);

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
          <h3 className="text-lg font-medium mb-3">Resumen de Precios</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Precio por Paquete ($):</label>
                <p className="text-xl font-bold">${form.watch('precioVenta') || "0.00"}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Precio por Paquete en Bolívares:</label>
                
                <TooltipProvider>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasa Promedio:</span>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center">
                        <span className="font-medium">Bs. {precioBsF.promedio}</span>
                        <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Calculado con la tasa promedio: {averagePrice} Bs/$</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                
                <TooltipProvider>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasa BCV:</span>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center">
                        <span className="font-medium">Bs. {precioBsF.bancoCentral}</span>
                        <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Calculado con la tasa del BCV: {centralBankPrice} Bs/$</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                
                <TooltipProvider>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasa Paralelo:</span>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center">
                        <span className="font-medium">Bs. {precioBsF.paralelo}</span>
                        <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Calculado con la tasa paralela: {parallelPrice} Bs/$</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="space-y-4">
            <div>
                <label className="text-sm font-medium">Precio Unitario ($):</label>
              <p className="text-xl font-bold">${precioUnitario}</p>
              <p className="text-xs text-muted-foreground">
                Precio por unidad individual
              </p>
            </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Precio Unitario en Bolívares:</label>
                
                <TooltipProvider>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasa Promedio:</span>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center">
                        <span className="font-medium">Bs. {precioUnitarioBsF.promedio}</span>
                        <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Calculado con la tasa promedio: {averagePrice} Bs/$</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                
                <TooltipProvider>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasa BCV:</span>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center">
                        <span className="font-medium">Bs. {precioUnitarioBsF.bancoCentral}</span>
                        <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Calculado con la tasa del BCV: {centralBankPrice} Bs/$</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                
                <TooltipProvider>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasa Paralelo:</span>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center">
                        <span className="font-medium">Bs. {precioUnitarioBsF.paralelo}</span>
                        <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Calculado con la tasa paralela: {parallelPrice} Bs/$</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
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