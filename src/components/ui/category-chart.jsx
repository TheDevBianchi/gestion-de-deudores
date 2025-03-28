'use client';
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';

const CategoryChartComponent = ({ data }) => {
  // Memoizamos los colores para evitar recálculos innecesarios
  const COLORS = useMemo(() => ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'], []);

  // Memoizamos el componente para evitar re-renderizados innecesarios
  const MemoizedChart = useMemo(() => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}`, 'Cantidad']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }, [data, COLORS]);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Ventas por Categoría</CardTitle>
        <CardDescription>Distribución de ventas por categoría de producto</CardDescription>
      </CardHeader>
      <CardContent>
        {MemoizedChart}
      </CardContent>
    </Card>
  );
};

// Exportamos el componente usando React.memo para optimizar rendimiento
export const CategoryChart = React.memo(CategoryChartComponent); 