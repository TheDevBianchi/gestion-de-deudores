'use client';

import { useState, useEffect, Suspense, memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Cell
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowUp,
  ArrowDown,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Clock
} from 'lucide-react';

// Componente para mostrar estadísticas diarias
const DailyStats = memo(function DailyStats({ salesData, productsData }) {
  const totalSalesToday = salesData?.todaySales?.length || 0;
  const totalRevenue = salesData?.todayRevenue || 0;
  const salesGrowth = salesData?.growthRate || 0;
  const lowStockCount = productsData?.filter(p => p.cantidadInventario > 0 && p.cantidadInventario < 3)?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Ventas Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{totalSalesToday}</span>
              <span className="text-xs text-blue-600/70">
                {salesGrowth >= 0 ? (
                  <span className="flex items-center text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {salesGrowth}% respecto a ayer
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    {Math.abs(salesGrowth)}% respecto a ayer
                  </span>
                )}
              </span>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <ShoppingBag className="h-5 w-5 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Ingresos Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">${totalRevenue.toFixed(2)}</span>
              <span className="text-xs text-green-600/70">
                Total facturado del día
              </span>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-5 w-5 text-green-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700">Stock Bajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{lowStockCount}</span>
              <span className="text-xs text-amber-600/70">
                Productos con menos de 3 unidades
              </span>
            </div>
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Tiempo Promedio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">12 min</span>
              <span className="text-xs text-purple-600/70">
                Tiempo promedio por venta
              </span>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <Clock className="h-5 w-5 text-purple-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// Componente para mostrar el gráfico de ventas por día
const SalesChart = memo(function SalesChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Ventas por Día</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Ventas por Día</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
              formatter={(value) => [`${value} ventas`]}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <Bar dataKey="sales" name="Ventas" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

// Componente para mostrar las categorías más vendidas
const CategoryChart = memo(function CategoryChart({ data }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF'];

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categorías Más Vendidas</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías Más Vendidas</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} unidades`]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

// Componente para mostrar las ventas recientes
const RecentSales = memo(function RecentSales({ sales }) {
  if (!sales || sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No hay ventas recientes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sales.map((sale, index) => (
            <motion.div
              key={sale._id}
              className="flex items-center justify-between p-3 rounded-lg border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex-1">
                <p className="font-medium">{sale.clienteNombre || 'Cliente anónimo'}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(sale.fecha), { addSuffix: true, locale: es })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${sale.montoTotal.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {sale.productos?.length || 0} productos
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Componente principal de la página de Dashboard
function Dashboard() {
  const [salesData, setSalesData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de ventas y productos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener ventas
        const salesResponse = await fetch('/api/sales');
        const sales = await salesResponse.json();
        
        // Obtener productos
        const productsResponse = await fetch('/api/products');
        const products = await productsResponse.json();
        
        // Procesar datos para estadísticas
        const today = new Date().toDateString();
        const todaySales = sales.filter(sale => 
          new Date(sale.fecha).toDateString() === today
        );
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdaySales = sales.filter(sale => 
          new Date(sale.fecha).toDateString() === yesterday.toDateString()
        );
        
        // Calcular tasa de crecimiento
        const growthRate = yesterdaySales.length > 0
          ? Math.round((todaySales.length - yesterdaySales.length) / yesterdaySales.length * 100)
          : 100;
        
        // Calcular ingresos de hoy
        const todayRevenue = todaySales.reduce((acc, sale) => acc + sale.montoTotal, 0);
        
        // Procesar datos para gráfico de barras
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
          
          const daySales = sales.filter(sale => 
            new Date(sale.fecha).toDateString() === date.toDateString()
          );
          
          last7Days.push({
            date: dateStr,
            sales: daySales.length
          });
        }
        
        // Procesar datos para gráfico de categorías
        // Esto es una simulación, reemplazar con datos reales
        const categories = [
          { name: 'Electrónica', value: 45 },
          { name: 'Ropa', value: 30 },
          { name: 'Hogar', value: 20 },
          { name: 'Comida', value: 15 },
          { name: 'Otros', value: 10 }
        ];
        
        setSalesData({
          allSales: sales,
          todaySales,
          todayRevenue,
          growthRate,
          recentSales: sales.slice(0, 5)
        });
        
        setProductsData(products);
        setChartData(last7Days);
        setCategoryData(categories);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-96">
          <div className="space-y-4 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Cargando información del panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6 space-y-6"
    >
      <h1 className="text-3xl font-bold">Panel de Control</h1>
      
      <Suspense fallback={<div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>}>
        <DailyStats salesData={salesData} productsData={productsData} />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<div className="col-span-2 h-80 bg-gray-100 animate-pulse rounded-lg"></div>}>
          <SalesChart data={chartData} />
        </Suspense>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Suspense fallback={<div className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>}>
          <RecentSales sales={salesData?.recentSales} />
        </Suspense>
      </div>
    </motion.div>
  );
}

export default Dashboard;