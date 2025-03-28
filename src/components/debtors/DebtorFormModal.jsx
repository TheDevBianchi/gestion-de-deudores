'use client';

import { useState, useEffect, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Esquema de validación
const debtorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  deudas: z.array(z.any()).optional()
});

const DebtorFormModal = memo(function DebtorFormModal({ isOpen, onClose, debtor, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createDebtor, updateDebtorById, fetchDebtors } = useDebtors();
  
  const form = useForm({
    resolver: zodResolver(debtorSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: '',
      email: 'cliente@sistemaventas.com', // Email genérico predeterminado
      descripcion: '',
      deudas: [] // Añadido para inicializar deudas como array vacío
    },
  });
  
  // Cargar datos del deudor si estamos editando
  useEffect(() => {
    if (debtor) {
      form.reset({
        nombre: debtor.nombre || '',
        apellido: debtor.apellido || '',
        telefono: debtor.telefono || '',
        direccion: debtor.direccion || '',
        email: debtor.email || 'cliente@sistemaventas.com',
        descripcion: debtor.descripcion || '',
      });
    } else {
      form.reset({
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: '',
        email: 'cliente@sistemaventas.com',
        descripcion: '',
      });
    }
  }, [debtor, form]);
  
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Validar datos antes de enviar
      if (!data.nombre?.trim()) {
        throw new Error('El nombre es requerido');
      }
      
      const dataToSubmit = {
        nombre: data.nombre.trim(),
        apellido: data.apellido?.trim() || '',
        telefono: data.telefono?.trim() || '',
        direccion: data.direccion?.trim() || '',
        email: data.email?.trim() || 'cliente@sistemaventas.com',
        deudas: [] // Inicializar array de deudas
      };
      
      let result;
      if (debtor?._id) {
        result = await updateDebtorById(debtor._id, dataToSubmit);
      } else {
        result = await createDebtor(dataToSubmit);
      }
      
      if (!result?._id) {
        throw new Error('Error al procesar el deudor: respuesta inválida del servidor');
      }
      
      onSuccess?.(result);
      onClose();
      form.reset();
      
    } catch (error) {
      console.error('Error al procesar deudor:', error);
      toast.error(error.message || 'Error al procesar el deudor');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {debtor ? 'Editar Deudor' : 'Nuevo Deudor'}
          </DialogTitle>
          <DialogDescription>
            {debtor 
              ? 'Actualiza la información del deudor' 
              : 'Completa la información para registrar un nuevo deudor'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nombre" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Apellido - Nuevo campo */}
              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Apellido" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Teléfono */}
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Teléfono" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Dirección */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Dirección" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Email (opcional, precargado) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="cliente@sistemaventas.com" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Descripción */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas adicionales (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional sobre el cliente" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>{debtor ? 'Actualizar' : 'Crear'} Deudor</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

export default DebtorFormModal; 