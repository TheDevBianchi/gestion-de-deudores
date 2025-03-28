'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/products/useProducts';
import { useDebtors } from '@/hooks/debtors/useDebtors';
import { useSales } from '@/hooks/sales/useSales';
import { Trash2, Plus, UserPlus } from 'lucide-react';
import DebtorFormModal from '../debtors/DebtorFormModal';
import ProductSearchSelector from './ProductSearchSelector';

// Schema base para validar el formulario
const createSaleSchema = (esCredito) => {
  return z.object({
    productos: z.array(z.object({
      productoId: z.string().min(1, 'Producto requerido'),
      cantidad: z.number()
        .min(1, 'Cantidad mínima es 1')
        .max(1000, 'Cantidad máxima es 1000'),
    })).min(1, 'Agregue al menos un producto'),
    clienteId: esCredito 
      ? z.string().min(1, 'Debe seleccionar un cliente para ventas a crédito')
      : z.string().optional(),
    esCredito: z.boolean().default(false),
  });
};

// Componente para cada producto en la lista
function ProductListItem({ product, index, register, onRemove, disabled, errors }) {
  return (
    <div key={index} className="flex items-center gap-4 p-3 rounded-md border bg-card">
      <div className="flex-1">
        <p className="font-medium">{product?.nombre || 'Producto'}</p>
        <p className="text-sm text-muted-foreground">
          Stock: {product?.cantidadInventario || 0} unidades
        </p>
      </div>
      
      <div className="w-24">
        <Label htmlFor={`cantidad-${index}`}>Cantidad</Label>
        <Input
          id={`cantidad-${index}`}
          type="number"
          min="1"
          max={product?.cantidadInventario || 999}
          {...register(`productos.${index}.cantidad`, {
            valueAsNumber: true,
            max: {
              value: product?.cantidadInventario || 999,
              message: `Máximo ${product?.cantidadInventario} unidades`
            }
          })}
          disabled={disabled}
        />
        {errors?.productos?.[index]?.cantidad && (
          <p className="text-xs text-red-500 mt-1">
            {errors.productos[index].cantidad.message}
          </p>
        )}
      </div>
      
      <div className="w-20 text-right">
        <Label>Precio</Label>
        <div className="mt-2 font-semibold">
          ${product ? (product.precioCompra * (1 + product.porcentajeGanancia / 100)).toFixed(2) : '0.00'}
        </div>
      </div>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        disabled={disabled}
        title="Eliminar producto"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}

const SaleForm = memo(function SaleForm({ onSuccess, onCreditSale }) {
  const { products } = useProducts();
  const { debtors, fetchDebtors } = useDebtors();
  const { createSale } = useSales();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebtorModal, setShowDebtorModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [esCredito, setEsCredito] = useState(false);

  // Cargar deudores al montar el componente
  useEffect(() => {
    fetchDebtors();
  }, [fetchDebtors]);

  // Crear formulario con validación dinámica basada en esCredito
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    trigger
  } = useForm({
    resolver: zodResolver(createSaleSchema(esCredito)),
    defaultValues: {
      productos: [],
      clienteId: '',
      esCredito: false
    }
  });

  // Actualizar el resolver cuando cambia esCredito
  useEffect(() => {
    trigger('clienteId');
  }, [esCredito, trigger]);

  // Watch values
  const watchEsCredito = watch('esCredito');
  const watchClienteId = watch('clienteId');
  const productosFields = watch('productos');

  // Actualizar estado local cuando cambia el valor en el formulario
  useEffect(() => {
    setEsCredito(watchEsCredito);
  }, [watchEsCredito]);

  // UseFieldArray para manejar arreglo de productos
  const { fields, append, remove } = useFieldArray({
    control,
    name: "productos",
  });

  // Funciones para manejar productos
  const handleAddProduct = useCallback((productId, cantidad) => {
    // Verificar si el producto ya existe
    const existingIndex = fields.findIndex(f => f.productoId === productId);
    
    if (existingIndex >= 0) {
      // Si existe, mantener la cantidad existente
      // No hacemos nada ya que el producto ya está en la lista
      return;
    } else {
      // Si no existe, agregar con la cantidad especificada
      append({ 
        productoId: productId,
        cantidad: cantidad
      });
    }
    
    // Actualizar la lista de productos seleccionados para el buscador
    setSelectedProducts(prev => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  }, [fields, append, setSelectedProducts]);

  const handleRemoveProduct = useCallback((index) => {
    const productId = fields[index].productoId;
    remove(index);
    
    // Actualizar la lista de productos seleccionados
    setSelectedProducts(prev => prev.filter(id => id !== productId));
  }, [fields, remove, setSelectedProducts]);

  // Calcular total
  const total = useMemo(() => {
    return fields.reduce((sum, field, index) => {
      const product = products.find(p => p._id === field.productoId);
      const cantidad = productosFields[index]?.cantidad || 0;
      
      if (!product) return sum;
      
      const precio = product.precioCompra * (1 + product.porcentajeGanancia / 100);
      return sum + (precio * cantidad);
    }, 0);
  }, [fields, products, productosFields]);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Para ventas a crédito
      if (data.esCredito) {
        if (data.clienteId) {
          const debtor = debtors.find(d => d._id === data.clienteId);
          if (!debtor) {
            toast.error('Cliente no encontrado');
            return;
          }
          
          // Crear venta a crédito directamente, sin abrir el modal de deuda
          const ventaResponse = await createSale(data);
          toast.success('Venta a crédito registrada exitosamente');
          
          // Opcional: Puedes notificar del éxito
          onSuccess?.();
          reset();
          setSelectedProducts([]);
          return;
        }
      }
      
      // Proceder con venta normal
      await createSale(data);
      toast.success('Venta registrada exitosamente');
      reset();
      setSelectedProducts([]);
      onSuccess?.();
    } catch (error) {
      console.error('Error al crear venta:', error);
      toast.error(error.message || 'Error al registrar la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar creación de deudor
  const handleDebtorCreated = useCallback((newDebtor) => {
    setValue('clienteId', newDebtor._id);
    setShowDebtorModal(false);
    toast.success(`Deudor ${newDebtor.nombre} ${newDebtor.apellido} creado exitosamente`);
  }, [setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Paso 1: Selección de productos */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
          Selección de Productos
        </h2>
        
        <ProductSearchSelector
          onProductSelect={(productId) => {
            handleAddProduct(productId, 1);
          }}
          onQuantityChange={() => {}} // Este callback no se usa directamente aquí
          selectedProducts={selectedProducts}
          disabled={isSubmitting}
        />
        
        {errors.productos && (
          <p className="text-sm text-red-500 mt-2">{errors.productos.message}</p>
        )}

        {/* Lista de productos seleccionados */}
        {fields.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Productos en esta venta</h3>
              <div className="text-sm text-muted-foreground">
                Total: {fields.length} {fields.length === 1 ? 'producto' : 'productos'}
              </div>
            </div>
            
            <div className="space-y-2">
              {fields.map((field, index) => {
                const product = products.find(p => p._id === field.productoId);
                return (
                  <ProductListItem
                    key={field.id}
                    product={product}
                    index={index}
                    register={register}
                    onRemove={() => handleRemoveProduct(index)}
                    disabled={isSubmitting}
                    errors={errors}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Paso 2: Tipo de venta */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
          Tipo de Venta
        </h2>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="font-semibold">Venta a crédito</div>
                  <div className="text-sm text-muted-foreground">
                    El cliente pagará en un futuro
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="esCredito"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              </div>
              
              {esCredito && (
                <div className="bg-slate-50 p-4 rounded-lg border mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Datos de Crédito</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="clienteId">Cliente</Label>
                      <div className="flex gap-2">
                        <Controller
                          name="clienteId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger id="clienteId" className="w-full">
                                <SelectValue placeholder="Seleccionar cliente" />
                              </SelectTrigger>
                              <SelectContent>
                                {debtors.map(debtor => (
                                  <SelectItem key={debtor._id} value={debtor._id}>
                                    {debtor.nombre} {debtor.apellido}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        
                        {/* Botón para abrir el modal de nuevo deudor */}
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => setShowDebtorModal(true)}
                          disabled={isSubmitting}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.clienteId && (
                        <p className="text-sm text-red-500 mt-1">{errors.clienteId.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total a pagar</div>
                    <div className="text-2xl font-bold">${total.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Tipo de venta</div>
                    <div className="font-semibold">
                      {watchEsCredito ? "Crédito" : "Contado"}
                      <div className="text-xs text-muted-foreground mt-1">
                        {watchEsCredito ? "A crédito" : "Pago al contado"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paso 3: Completar venta */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
          Finalizar Venta
        </h2>
        
        <Button 
          type="submit" 
          className="w-full py-6 text-lg"
          disabled={
            fields.length === 0 || 
            isSubmitting || 
            (watchEsCredito && (!watchClienteId || watchClienteId === ''))
          }
        >
          {isSubmitting ? (
            <>Procesando venta...</>
          ) : (
            <>Completar Venta por ${total.toFixed(2)}</>
          )}
        </Button>
        
        {fields.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            Añade al menos un producto para completar la venta
          </p>
        )}
        
        {watchEsCredito && (!watchClienteId || watchClienteId === '') && (
          <p className="text-center text-sm text-amber-500 mt-2">
            Para ventas a crédito, debes seleccionar un cliente
          </p>
        )}
      </div>

      {/* Modal para crear nuevo deudor */}
      <DebtorFormModal 
        isOpen={showDebtorModal}
        onClose={() => setShowDebtorModal(false)}
        onSuccess={handleDebtorCreated}
      />
    </form>
  );
});

export default SaleForm; 