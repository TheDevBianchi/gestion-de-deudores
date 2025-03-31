'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import { useDollarPrice } from '@/hooks/dollar/useDollarPrice';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form,
  FormControl,
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RefreshCw, Save, Check, Clipboard, Loader2 } from 'lucide-react';

// Esquema para validación
const priceSchema = z.object({
  price: z.coerce
    .number()
    .positive('El precio debe ser un valor positivo')
    .min(0.01, 'El precio mínimo es 0.01')
});

// Historial de precios
const PriceHistory = memo(function PriceHistory({ history }) {
  if (!history || !Array.isArray(history) || history.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay historial disponible.</p>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-md font-medium">Historial de Precios</h3>
      <div className="text-sm max-h-40 overflow-y-auto border rounded-md">
        <table className="min-w-full">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-right">Precio</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">
                  {new Date(item.date).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  ${item.price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const DollarPriceConfig = memo(function DollarPriceConfig() {
  const { 
    averagePrice, 
    centralBankPrice, 
    parallelPrice,
    isLoading, 
    error, 
    fetchDollarPrice, 
    updateDollarPrice,
    priceHistory
  } = useDollarPrice();
  
  const [updating, setUpdating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Esquema actualizado para los tres precios
  const priceSchema = z.object({
    average: z.string().min(1, 'El precio es requerido')
      .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Debe ser un número mayor que 0'
      }),
    centralBank: z.string().min(1, 'El precio es requerido')
      .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Debe ser un número mayor que 0'
      }),
    parallel: z.string().min(1, 'El precio es requerido')
      .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Debe ser un número mayor que 0'
      })
  });
  
  // Configurar formulario con React Hook Form
  const form = useForm({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      average: '',
      centralBank: '',
      parallel: ''
    }
  });
  
  // Actualizar el formulario cuando cambian los precios
  useEffect(() => {
    if (averagePrice && centralBankPrice && parallelPrice) {
      form.reset({ 
        average: averagePrice.toString(),
        centralBank: centralBankPrice.toString(),
        parallel: parallelPrice.toString()
      });
    }
  }, [averagePrice, centralBankPrice, parallelPrice, form]);
  
  // Manejar envío del formulario
  const onSubmit = useCallback(async (data) => {
    try {
      setUpdating(true);
      await updateDollarPrice({
        average: data.average,
        centralBank: data.centralBank,
        parallel: data.parallel
      });
    } catch (error) {
      // El error ya se maneja en el hook
    } finally {
      setUpdating(false);
    }
  }, [updateDollarPrice]);
  
  // Manejar copia al portapapeles
  const handleCopyToClipboard = useCallback(() => {
    if (averagePrice || centralBankPrice || parallelPrice) {
      navigator.clipboard.writeText(
        [averagePrice, centralBankPrice, parallelPrice].join(', ')
      )
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(() => {});
    }
  }, [averagePrice, centralBankPrice, parallelPrice]);
  
  // Asegurarse de que el historial sea siempre un array para cada tipo de precio
  const safeHistory = {
    average: Array.isArray(priceHistory?.average) ? priceHistory.average : [],
    centralBank: Array.isArray(priceHistory?.centralBank) ? priceHistory.centralBank : [],
    parallel: Array.isArray(priceHistory?.parallel) ? priceHistory.parallel : []
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Precios del Dólar</CardTitle>
          <CardDescription>
            Actualiza los valores de las diferentes tasas del dólar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="average"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio del Dólar Promedio</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Ingrese el precio promedio"
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="centralBank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio del Dólar en Banco Central</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Ingrese el precio del banco central"
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="parallel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio del Dólar Paralelo</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Ingrese el precio paralelo"
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={isLoading || updating}
                className="w-full"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Precios'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Historial de Cambios</CardTitle>
          <CardDescription>
            Registro de cambios históricos en el precio del dólar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-6">
            <h3 className="font-medium text-lg mb-2">Historial de Precios</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Precio Promedio</h4>
                <PriceHistory history={safeHistory.average} />
              </div>
              
              <div>
                <h4 className="font-medium">Precio Banco Central</h4>
                <PriceHistory history={safeHistory.centralBank} />
              </div>
              
              <div>
                <h4 className="font-medium">Precio Paralelo</h4>
                <PriceHistory history={safeHistory.parallel} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default DollarPriceConfig; 