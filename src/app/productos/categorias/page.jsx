'use client';

import { memo } from 'react';
import CategoryList from '@/components/products/CategoryList';
import { Card, CardContent } from '@/components/ui/card';

const CategoriesPage = memo(function CategoriesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Gestión de Categorías</h1>
      
      <Card>
        <CardContent className="p-6">
          <CategoryList />
        </CardContent>
      </Card>
    </div>
  );
});

export default CategoriesPage; 