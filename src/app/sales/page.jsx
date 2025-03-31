'use client';

import { useState, useEffect, Suspense, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SalesList from '@/components/sales/SalesList';
import SaleForm from '@/components/sales/SaleForm';
import NewDebtModal from '@/components/debtors/NewDebtModal';
import { useDebtors } from '@/hooks/debtors/useDebtors';
import { useSales } from '@/hooks/sales/useSales';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  CreditCard,
  Calendar
} from 'lucide-react';

const SalesStats = memo(function SalesStats() {
  const { sales } = useSales();
  
  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!sales || sales.length === 0) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        creditSales: 0,
        regularSales: 0,
        salesThisMonth: 0
      };
    }
    
    // Obtener fecha del primer día del mes actual
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return sales.reduce((acc, sale) => {
      // Acumular ventas totales
      acc.totalSales++;
      
      // Acumular ingresos totales
      const totalSale = parseFloat(sale.montoTotal) || 0;
      acc.totalRevenue += totalSale;
      
      // Contar ventas a crédito
      if (sale.esCredito) {
        acc.creditSales++;
      } else {
        acc.regularSales++;
      }
      
      // Contar ventas de este mes
      const saleDate = new Date(sale.fecha);
      if (saleDate >= firstDayOfMonth) {
        acc.salesThisMonth++;
      }
      
      return acc;
    }, {
      totalSales: 0,
      totalRevenue: 0,
      creditSales: 0,
      regularSales: 0,
      salesThisMonth: 0
    });
  }, [sales]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ventas Totales</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalSales}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.salesThisMonth} ventas este mes
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ingresos</p>
              <h3 className="text-2xl font-bold mt-1">${stats.totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Ventas a crédito: {stats.creditSales}
          </p>
        </CardContent>
      </Card>

      <Card className={`bg-white ${stats.regularSales > 0 ? 'bg-green-100' : ''}`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ventas al Contado</p>
              <h3 className="text-2xl font-bold mt-1">{stats.regularSales}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
          </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.regularSales > 0 ? 
                `${((stats.regularSales / stats.totalSales) * 100).toFixed(1)}% de ventas` : 
                'Sin ventas al contado'}
            </p>
        </CardContent>
      </Card>
      
      <Card className={`bg-white ${stats.creditSales > 0 ? 'bg-amber-100' : ''}`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Créditos</p>
              <h3 className="text-2xl font-bold mt-1">{stats.creditSales}</h3>
            </div>
            <div className="p-2 bg-amber-100 rounded-full">
              <CreditCard className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.creditSales > 0 ? 
              `${((stats.creditSales / stats.totalSales) * 100).toFixed(1)}% de ventas` : 
              'Sin ventas a crédito'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

const SalesPageContent = memo(function SalesPageContent() {
  const [showNewSaleForm, setShowNewSaleForm] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const { debtors, fetchDebtors } = useDebtors();

  useEffect(() => {
    fetchDebtors();
  }, [fetchDebtors]);

  const handleCreditSale = (debtor) => {
    setSelectedDebtor(debtor);
    // No abrimos el modal de deuda, solo mantenemos el estilo visual
    setShowDebtModal(false);
  };

  const handleDebtSuccess = () => {
    setShowDebtModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ventas</h1>
        <Button 
          onClick={() => setShowNewSaleForm(!showNewSaleForm)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showNewSaleForm ? 'Cancelar' : 'Nueva Venta'}
        </Button>
      </div>
      
      <SalesStats />
      
      {showNewSaleForm ? (
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle>Nueva Venta</CardTitle>
            <CardDescription>
              Selecciona los productos para esta venta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SaleForm 
              onSuccess={() => setShowNewSaleForm(false)} 
              onCreditSale={handleCreditSale}
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="todas" className="w-full">
          <TabsList>
            <TabsTrigger value="todas">Todas las Ventas</TabsTrigger>
            <TabsTrigger value="contado">Ventas al Contado</TabsTrigger>
            <TabsTrigger value="credito">Ventas a Crédito</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todas">
            <SalesList filterType="all" />
          </TabsContent>
          
          <TabsContent value="contado">
            <SalesList filterType="contado" />
          </TabsContent>
          
          <TabsContent value="credito">
            <SalesList filterType="credito" />
          </TabsContent>
        </Tabs>
      )}
      
      {/* Mantenemos el modal en el DOM por compatibilidad, pero no lo mostraremos */}
      {selectedDebtor && (
        <NewDebtModal
          isOpen={false}  // Lo mantenemos cerrado siempre
          onClose={() => setShowDebtModal(false)}
          debtorId={selectedDebtor._id}
          debtorName={selectedDebtor.nombre}
          onSuccess={handleDebtSuccess}
        />
      )}
    </div>
  );
});

// Componente principal de la página
function SalesPage() {
  return (
    <SalesPageContent />
  );
}

export default SalesPage;
