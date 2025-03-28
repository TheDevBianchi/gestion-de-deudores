'use client';

import { useState, useEffect } from 'react';
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
import { useSaleStore } from '@/hooks/sales/useSaleStore';
import { Trash2, Plus, UserPlus } from 'lucide-react';
import DebtorFormModal from '../debtors/DebtorFormModal';
import ProductSearchSelector from './ProductSearchSelector';
import { useDollarPrice } from '@/hooks/dollar/useDollarPrice';

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
function ProductListItem({ product, index, register, onRemove, disabled, errors, watch, setValue, form, dollarPrice = 0 }) {
  const cantidad = parseInt(watch(`productos.${index}.cantidad`)) || 0;
  const updateItem = useSaleStore(state => state.updateItem);
  const recalculateTotal = useSaleStore(state => state.recalculateTotal);
  
  // Establecer tipoVenta fijo como 'unidad'
  const tipoVenta = 'unidad';
  
  // Calcular precios base
  const precioCompraPaquete = product?.precioCompra || 0;
  const porcentajeGanancia = product?.porcentajeGanancia || 0;
  const cantidadPorPaquete = product?.cantidadPorPaquete || 1;
  
  // Calcular precio de venta por paquete y por unidad
  const precioVentaPaquete = precioCompraPaquete * (1 + porcentajeGanancia / 100);
  const precioVentaUnitario = (precioVentaPaquete / cantidadPorPaquete);
  
  // Calcular subtotal basado en el precio unitario
  const precioUnitarioSegunTipo = precioVentaUnitario;
  const subtotal = (precioUnitarioSegunTipo * cantidad).toFixed(2);
  const subtotalBsF = (parseFloat(subtotal) * dollarPrice).toFixed(2);
  
  // DEFINIR stockUnidades
  const cantidadPaquetes = product?.cantidadPaquetes || 0;
  const cantidadUnidadesSueltas = product?.cantidadUnidadesSueltas || 0;
  const stockUnidades = (cantidadPaquetes * cantidadPorPaquete) + cantidadUnidadesSueltas;
  const stockDisponible = stockUnidades;
  const exceedsStock = cantidad > stockDisponible;
  
  // Actualizar valores en el formulario y en Zustand cuando cambia cualquier dependencia relevante
  useEffect(() => {
    if (!form) return;
    
    // Para debug
    console.log(`Actualizando formulario para producto ${index}, tipoVenta=${tipoVenta}`);
    
    form.setValue(`productos.${index}.tipoVenta`, tipoVenta);
    form.setValue(`productos.${index}.precioUnitario`, precioUnitarioSegunTipo);
    form.setValue(`productos.${index}.subtotal`, parseFloat(subtotal));
    
    // Actualizar el store de Zustand
    updateItem(index, {
      productoId: product._id,
      cantidad,
      tipoVenta,
      precioUnitario: precioUnitarioSegunTipo,
      subtotal: parseFloat(subtotal)
    }, product);
    
    // Forzar recálculo inmediato
    recalculateTotal();
    
  }, [cantidad, index, form, precioUnitarioSegunTipo, subtotal, product, updateItem, recalculateTotal]);

  return (
    <div key={index} className={`flex items-center gap-4 p-3 rounded-md border ${exceedsStock ? 'border-red-500 bg-red-50' : 'bg-card'}`}>
      <div className="flex-1">
        <p className="font-medium">{product?.nombre || 'Producto'}</p>
        <p className="text-sm text-muted-foreground">
          Stock: {stockUnidades} unidades
        </p>
        {cantidadPorPaquete > 1 && (
          <p className="text-xs text-muted-foreground">
            {cantidadPorPaquete} unidades por paquete
          </p>
        )}
        
        {exceedsStock && (
          <p className="text-xs text-red-500 font-medium mt-1">
            ¡Stock insuficiente!
          </p>
        )}
      </div>
      
      <div className="w-24">
        <Label htmlFor={`cantidad-${index}`}>Cantidad</Label>
        <Input
          id={`cantidad-${index}`}
          type="number"
          min="1"
          max={stockDisponible}
          {...register(`productos.${index}.cantidad`, {
            valueAsNumber: true,
            min: {
              value: 1,
              message: 'Mínimo 1'
            },
            max: {
              value: stockDisponible,
              message: `Máximo ${stockDisponible} unidades`
            }
          })}
          disabled={disabled}
          className={exceedsStock ? 'border-red-500' : ''}
        />
        {errors?.productos?.[index]?.cantidad && (
          <p className="text-xs text-red-500 mt-1">
            {errors.productos[index].cantidad.message}
          </p>
        )}
      </div>
      
      <div className="w-28">
        <Label>Tipo de venta</Label>
        <div className="mt-2 text-sm text-muted-foreground">
          Solo unidades
        </div>
      </div>
      
      <div className="w-32 text-right">
        <Label>Precio</Label>
        <div className="mt-2 font-semibold">
          ${subtotal}
          <div className="text-xs text-muted-foreground">
            Bs. {subtotalBsF}
          </div>
          <div className="text-xs text-muted-foreground">
            {`${cantidad} unidad(es)`}
          </div>
          <div className="text-xs text-blue-600 font-medium">
            ${precioVentaUnitario.toFixed(2)}/unidad
          </div>
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

function SaleForm({ onSuccess, onCreditSale }) {
  const { products } = useProducts();
  const { debtors = [], fetchDebtors, addDebtor } = useDebtors();
  const { createSale } = useSales();
  const { price: dollarPrice } = useDollarPrice();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebtorModal, setShowDebtorModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [esCredito, setEsCredito] = useState(false);
  
  // Zustand state
  const { 
    total, 
    totalBsF, 
    clearItems, 
    removeItem, 
    updateItem, 
    syncWithForm,
    recalculateTotal,
    setDollarPrice: setStoreDollarPrice 
  } = useSaleStore();

  // Actualizar precio del dólar en el store
  useEffect(() => {
    setStoreDollarPrice(dollarPrice);
  }, [dollarPrice, setStoreDollarPrice]);

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
    trigger,
    getValues,
    setError,
    clearErrors,
    form
  } = useForm({
    resolver: zodResolver(createSaleSchema(esCredito)),
    defaultValues: {
      productos: [],
      clienteId: '',
      esCredito: false
    }
  });

  // Sincronizar el formulario con Zustand cuando cambia
  useEffect(() => {
    const subscription = watch((value) => {
      syncWithForm(value, products);
    });
    
    return () => subscription.unsubscribe();
  }, [watch, syncWithForm, products]);

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
  function handleAddProduct(productId, cantidad) {
    // Verificar si el producto ya existe
    const existingIndex = fields.findIndex(f => f.productoId === productId);
    
    if (existingIndex >= 0) {
      // Si existe, usamos la cantidad proporcionada o incrementamos en 1
      const currentQty = parseInt(watch(`productos.${existingIndex}.cantidad`)) || 0;
      setValue(`productos.${existingIndex}.cantidad`, cantidad || currentQty + 1);
    } else {
      // Si no existe, agregar con la cantidad especificada o 1 por defecto
      append({ 
        productoId: productId,
        cantidad: cantidad || 1,
        tipoVenta: 'unidad'  // Tipo de venta fijo como unidad
      });
    }
    
    // Actualizar la lista de productos seleccionados para el buscador
    setSelectedProducts(prev => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  }

  function handleRemoveProduct(index) {
    const productId = fields[index].productoId;
    remove(index);
    removeItem(index);
    
    // Actualizar la lista de productos seleccionados
    setSelectedProducts(prev => prev.filter(id => id !== productId));
  }

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Calcular unidades a descontar del inventario
      const productsToUpdate = data.productos.map(item => {
        const product = products.find(p => p._id === item.productoId);
        const tipoVenta = item.tipoVenta || 'unidad';
        const cantidadPorPaquete = product?.cantidadPorPaquete || 1;
        
        return {
          ...item,
          tipoVenta,
          cantidadPorPaquete
        };
      });
      
      // Reemplazar productos con la información actualizada
      const dataNormalizada = {
        ...data,
        productos: productsToUpdate
      };
      
      // Para ventas a crédito
      if (data.esCredito) {
        if (data.clienteId) {
          const debtor = debtors.find(d => d._id === data.clienteId);
          if (!debtor) {
            toast.error('Cliente no encontrado');
            return;
          }
          
          // Crear venta a crédito directamente, sin abrir el modal de deuda
          const ventaResponse = await createSale(dataNormalizada);
          toast.success('Venta a crédito registrada exitosamente');
          
          // Limpiar estado
          clearItems();
          reset();
          setSelectedProducts([]);
          onSuccess?.();
          return;
        }
      }
      
      // Proceder con venta normal
      await createSale(dataNormalizada);
      toast.success('Venta registrada exitosamente');
      
      // Limpiar estado
      clearItems();
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
  function handleDebtorCreated(newDebtor) {
    if (!newDebtor) {
      console.error('Error: No se recibió información del deudor');
      toast.error('Error al procesar información del nuevo deudor');
      return;
    }
    
    if (!newDebtor._id) {
      console.error('Error: Deudor sin ID válido', newDebtor);
      toast.error('Error: El deudor creado no tiene un ID válido');
      return;
    }
    
    // Establecer el ID del deudor en el formulario
    setValue('clienteId', newDebtor._id);
    
    // Cerrar el modal
    setShowDebtorModal(false);
    
    // Actualizar la lista de deudores usando ambos métodos
    // 1. Añadir directamente al estado de Zustand
    addDebtor(newDebtor);
    
    // 2. Refrescar desde la API para garantizar consistencia
    fetchDebtors();
    
    // Notificar éxito
    toast.success(`Deudor ${newDebtor.nombre} ${newDebtor.apellido} creado exitosamente`);
  }

  // Asegurarnos de que el total se actualice cuando cambian los productos
  useEffect(() => {
    if (productosFields && productosFields.length > 0) {
      // Forzar recálculo del total cuando cambian los productos
      recalculateTotal();
    }
  }, [productosFields, recalculateTotal]);

  // Formatear correctamente los valores de total para la interfaz
  const formattedTotal = typeof total === 'string' ? total : total.toFixed(2);
  const formattedTotalBsF = typeof totalBsF === 'string' ? totalBsF : totalBsF.toFixed(2);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Paso 1: Selección de productos */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
          Selección de Productos
        </h2>
        
        <ProductSearchSelector
          onProductSelect={(productId, cantidad) => {
            handleAddProduct(productId, cantidad);
          }}
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
                    setValue={setValue}
                    form={form}
                    onRemove={() => handleRemoveProduct(index)}
                    disabled={isSubmitting}
                    errors={errors}
                    watch={watch}
                    dollarPrice={dollarPrice || 0}
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
                                {Array.isArray(debtors) && debtors.length > 0 ? (
                                  debtors.map(debtor => (
                                    <SelectItem key={debtor._id} value={debtor._id}>
                                      {debtor.nombre} {debtor.apellido}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no_clients" disabled>
                                    No hay clientes disponibles
                                  </SelectItem>
                                )}
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
                    <div className="text-2xl font-bold">${formattedTotal}</div>
                    <div className="text-sm text-muted-foreground">
                      Bs. {formattedTotalBsF}
                    </div>
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
            <>Completar Venta (${formattedTotal} / Bs. {formattedTotalBsF})</>
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
}

export default SaleForm; 