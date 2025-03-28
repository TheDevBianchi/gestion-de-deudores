'use client';

import { useState, useEffect, Suspense, memo } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SalesList from '@/components/sales/SalesList';
import SaleForm from '@/components/sales/SaleForm';
import NewDebtModal from '@/components/debtors/NewDebtModal';
import { useDebtors } from '@/hooks/debtors/useDebtors';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';

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
