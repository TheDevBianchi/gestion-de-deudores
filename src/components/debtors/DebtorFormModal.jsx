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
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  apellido: z.string().min(2, 'El apellido es obligatorio'),
  telefono: z.string().min(5, 'El teléfono es obligatorio'),
  direccion: z.string().min(5, 'La dirección es obligatoria'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  descripcion: z.string().optional().or(z.literal(''))
});

const DebtorFormModal = memo(function DebtorFormModal({ isOpen, onClose, debtor, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createDebtor, updateDebtorById } = useDebtors();
  
  const form = useForm({
    resolver: zodResolver(debtorSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: '',
      email: 'cliente@sistemaventas.com', // Email genérico predeterminado
      descripcion: '',
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
      
      if (debtor) {
        await updateDebtorById(debtor._id, data);
        toast.success('Deudor actualizado correctamente');
      } else {
        await createDebtor(data);
        toast.success('Deudor creado correctamente');
      }
      
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Ha ocurrido un error');
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
                  <FormLabel>Teléfono</FormLabel>
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
                  <FormLabel>Dirección</FormLabel>
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