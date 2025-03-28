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
import { RefreshCw, Save, Check, Clipboard } from 'lucide-react';

// Esquema para validación
const priceSchema = z.object({
  price: z.coerce
    .number()
    .positive('El precio debe ser un valor positivo')
    .min(0.01, 'El precio mínimo es 0.01')
});

// Historial de precios
const PriceHistory = memo(function PriceHistory({ history }) {
  if (!history || history.length === 0) {
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
    price, 
    isLoading, 
    error, 
    fetchDollarPrice, 
    updateDollarPrice,
    priceHistory
  } = useDollarPrice();
  
  const [updating, setUpdating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Configurar formulario con React Hook Form
  const form = useForm({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      price: ''
    }
  });
  
  // Actualizar el formulario cuando cambia el precio
  useEffect(() => {
    if (price) {
      form.reset({ price });
    }
  }, [price, form]);
  
  // Manejar envío del formulario
  const onSubmit = useCallback(async (data) => {
    try {
      setUpdating(true);
      await updateDollarPrice(data.price);
    } catch (error) {
      // El error ya se maneja en el hook
    } finally {
      setUpdating(false);
    }
  }, [updateDollarPrice]);
  
  // Manejar copia al portapapeles
  const handleCopyToClipboard = useCallback(() => {
    if (price) {
      navigator.clipboard.writeText(price.toString())
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(() => {});
    }
  }, [price]);
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Precio Actual del Dólar</CardTitle>
          <CardDescription>
            Este valor se utiliza para calcular conversiones de moneda en toda la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio del Dólar</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0.01"
                          disabled={isLoading || updating}
                          placeholder="Ingrese el precio del dólar"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={handleCopyToClipboard}
                        disabled={!price}
                      >
                        {copySuccess ? <Check size={16} /> : <Clipboard size={16} />}
                      </Button>
                    </div>
                    {error ? (
                      <FormMessage>{error}</FormMessage>
                    ) : (
                      <FormDescription>
                        Ingrese el valor actual del dólar en moneda local.
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={isLoading || updating}
                  className="gap-2"
                >
                  <Save size={16} />
                  Guardar Cambios
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchDollarPrice}
                  disabled={isLoading || updating}
                  className="gap-2"
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                  Actualizar
                </Button>
              </div>
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
          <PriceHistory history={priceHistory} />
        </CardContent>
      </Card>
    </div>
  );
});

export default DollarPriceConfig; 