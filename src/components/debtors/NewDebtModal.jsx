'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProducts } from '@/hooks/products/useProducts';
import { useDebtors } from '@/hooks/debtors/useDebtors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CalendarIcon, Loader2, Trash2, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Esquema de validación
const debtSchema = z.object({
  descripcion: z.string().optional(),
  fechaVencimiento: z.date().optional(),
  productos: z.array(
    z.object({
      productoId: z.string().min(1, 'Seleccione un producto'),
      cantidad: z.coerce.number().min(1, 'Mínimo 1'),
    })
  ).min(1, 'Agregue al menos un producto'),
});

const ProductItem = memo(function ProductItem({ 
  index, 
  control, 
  products,
  onRemove,
  disabled = false,
  errors,
  watch,
  setValue
}) {
  const productoId = watch(`productos.${index}.productoId`);
  const cantidad = watch(`productos.${index}.cantidad`);
  
  // Encuentra el producto seleccionado
  const selectedProduct = products.find(p => p._id === productoId);
  
  // Calcula el precio
  const price = selectedProduct ? 
    (selectedProduct.precioCompra * (1 + selectedProduct.porcentajeGanancia / 100)).toFixed(2) : 
    '0.00';
  
  // Calcula el subtotal
  const subtotal = selectedProduct && cantidad ? 
    (selectedProduct.precioCompra * (1 + selectedProduct.porcentajeGanancia / 100) * cantidad).toFixed(2) : 
    '0.00';
  
  return (
    <div className="grid grid-cols-12 gap-2 items-start mb-4 pb-4 border-b">
      <div className="col-span-5">
        <FormField
          control={control}
          name={`productos.${index}.productoId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={index !== 0 ? "sr-only" : ""}>
                Producto
              </FormLabel>
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.nombre} - ${(product.precioCompra * (1 + product.porcentajeGanancia / 100)).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.productos?.[index]?.productoId && (
                <p className="text-sm font-medium text-destructive">
                  {errors.productos[index].productoId.message}
                </p>
              )}
            </FormItem>
          )}
        />
      </div>
      
      <div className="col-span-2">
        <FormField
          control={control}
          name={`productos.${index}.cantidad`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={index !== 0 ? "sr-only" : ""}>
                Cantidad
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  disabled={disabled}
                  onChange={(e) => {
                    // Asegúrate de que la cantidad no sea mayor que el stock disponible
                    if (selectedProduct && parseInt(e.target.value) > selectedProduct.cantidadInventario) {
                      toast.warning(`Solo hay ${selectedProduct.cantidadInventario} unidades disponibles`);
                      field.onChange(selectedProduct.cantidadInventario);
                    } else {
                      field.onChange(e.target.value);
                    }
                  }}
                />
              </FormControl>
              {errors?.productos?.[index]?.cantidad && (
                <p className="text-sm font-medium text-destructive">
                  {errors.productos[index].cantidad.message}
                </p>
              )}
            </FormItem>
          )}
        />
      </div>
      
      <div className="col-span-2">
        <FormItem>
          <FormLabel className={index !== 0 ? "sr-only" : ""}>
            Precio
          </FormLabel>
          <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 text-right">
            ${price}
          </div>
        </FormItem>
      </div>
      
      <div className="col-span-2">
        <FormItem>
          <FormLabel className={index !== 0 ? "sr-only" : ""}>
            Subtotal
          </FormLabel>
          <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 text-right font-medium">
            ${subtotal}
          </div>
        </FormItem>
      </div>
      
      <div className="col-span-1 pt-8">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
});

const NewDebtModal = memo(function NewDebtModal({ isOpen, onClose, debtorId, debtorName, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { products, isLoading: productsLoading } = useProducts();
  const { addDebtToDebtor } = useDebtors();
  
  const form = useForm({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      descripcion: '',
      fechaVencimiento: undefined,
      productos: [{ productoId: '', cantidad: 1 }],
    },
  });
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    reset,
    watch,
    setValue
  } = form;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "productos",
  });
  
  // Calcular el total
  const calculateTotal = useCallback(() => {
    let total = 0;
    const productFields = watch('productos');
    
    productFields.forEach(field => {
      if (field.productoId && field.cantidad) {
        const product = products.find(p => p._id === field.productoId);
        if (product) {
          const price = product.precioCompra * (1 + product.porcentajeGanancia / 100);
          total += price * field.cantidad;
        }
      }
    });
    
    return total.toFixed(2);
  }, [watch, products]);
  
  // Resetear formulario al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      reset({
        descripcion: '',
        fechaVencimiento: undefined,
        productos: [{ productoId: '', cantidad: 1 }],
      });
    }
  }, [isOpen, reset]);
  
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Asegurarnos de que la fecha esté explícitamente en la data
      // Esto es crucial para que se almacene correctamente en la base de datos
      const formattedData = {
        ...data,
        fecha: new Date().toISOString() // Formato ISO para fechas
      };
      
      console.log("Enviando datos de deuda con fecha:", formattedData.fecha);
      
      // Usar estos datos actualizados para crear la deuda
      await addDebtToDebtor(debtorId, formattedData);
      
      toast.success('Deuda registrada exitosamente');
      onSuccess?.();
    } catch (error) {
      console.error('Error al registrar deuda:', error);
      toast.error(error.message || 'Error al registrar deuda');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddProduct = () => {
    append({ productoId: '', cantidad: 1 });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Deuda</DialogTitle>
          <DialogDescription>
            Registrar deuda para {debtorName}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Descripción de la deuda"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="fechaVencimiento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Vencimiento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Productos</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddProduct}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Producto
                </Button>
              </div>
              
              {productsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {fields.map((field, index) => (
                    <ProductItem
                      key={field.id}
                      index={index}
                      control={control}
                      products={products}
                      onRemove={remove}
                      disabled={isSubmitting}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                    />
                  ))}
                  
                  <div className="flex justify-end mt-4 pr-12">
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="text-xl font-bold">${calculateTotal()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || productsLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Registrar Deuda'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

export default NewDebtModal;