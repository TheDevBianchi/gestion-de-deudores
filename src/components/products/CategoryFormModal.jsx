'use client';

import { useState, useEffect, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/categories/useCategories';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// Esquema de validación
const categorySchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  color: z.string().optional(),
  icono: z.string().optional(),
});

const CategoryFormModal = memo(function CategoryFormModal({ isOpen, onClose, category, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createCategory, updateCategoryById } = useCategories();
  
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      color: '#3b82f6',
      icono: 'category',
    },
  });
  
  // Cargar datos de la categoría si estamos editando
  useEffect(() => {
    if (category) {
      form.reset({
        nombre: category.nombre || '',
        descripcion: category.descripcion || '',
        color: category.color || '#3b82f6',
        icono: category.icono || 'category',
      });
    } else {
      form.reset({
        nombre: '',
        descripcion: '',
        color: '#3b82f6',
        icono: 'category',
      });
    }
  }, [category, form]);
  
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      let response;
      
      if (category) {
        response = await updateCategoryById(category._id, data);
        toast.success('Categoría actualizada correctamente');
      } else {
        response = await createCategory(data);
        toast.success('Categoría creada correctamente');
      }
      
      if (response && response._id) {
        onSuccess?.(response);
        onClose();
      } else {
        console.error('Respuesta inválida:', response);
        toast.error('Error: La respuesta no contiene un ID de categoría válido');
      }
    } catch (error) {
      console.error('Error en formulario de categoría:', error);
      toast.error(error.message || 'Error al procesar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nombre de categoría" 
                      {...field} 
                      disabled={isSubmitting}
                      autoFocus 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción de la categoría" 
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input 
                        type="color" 
                        {...field} 
                        disabled={isSubmitting}
                        className="w-12 h-10 p-1" 
                      />
                    </FormControl>
                    <span className="text-sm text-gray-500">{field.value}</span>
                  </div>
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
                {isSubmitting ? 'Guardando...' : category ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

export default CategoryFormModal; 