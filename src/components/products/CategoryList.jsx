'use client';

import { useState, useEffect, memo } from 'react';
import { useCategories } from '@/hooks/categories/useCategories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import CategoryFormModal from './CategoryFormModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, 
         AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
         AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
       } from '@/components/ui/alert-dialog';

const CategoryList = memo(function CategoryList() {
  const { categories, isLoading, error, fetchCategories, deleteCategoryById } = useCategories();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };
  
  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategoryById(categoryId);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
    }
  };
  
  const handleCategoryCreated = () => {
    fetchCategories();
    setShowCategoryModal(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categorías</h2>
        <Button 
          onClick={() => {
            setSelectedCategory(null);
            setShowCategoryModal(true);
          }}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>
      
      {isLoading && <p>Cargando categorías...</p>}
      
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!isLoading && !error && categories.length === 0 && (
        <p className="text-gray-500">No hay categorías disponibles. Crea tu primera categoría.</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category._id} className="relative">
            <div 
              className="absolute top-0 left-0 h-full w-2 rounded-l-lg" 
              style={{ backgroundColor: category.color }}
            />
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between">
                <span>{category.nombre}</span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEditCategory(category)}
                  >
                    <Pencil1Icon className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará la categoría &quot;{category.nombre}&quot; permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category._id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {category.descripcion && (
                <p className="text-gray-500 text-sm mb-2">{category.descripcion}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <CategoryFormModal 
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        category={selectedCategory}
        onSuccess={handleCategoryCreated}
      />
    </div>
  );
});

export default CategoryList; 