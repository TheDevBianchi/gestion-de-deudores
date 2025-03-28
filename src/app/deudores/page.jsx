'use client';

import { useState, useEffect, memo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebtors } from '@/hooks/debtors/useDebtors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, UserPlus } from 'lucide-react';
import DebtorList from '@/components/debtors/DebtorList';
import DebtorStats from '@/components/debtors/DebtorStats';
import DebtorFormModal from '@/components/debtors/DebtorFormModal';
import DebtorFilters from '@/components/debtors/DebtorFilters';

const DebtorsPageContent = memo(function DebtorsPageContent() {
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const [selectedTab, setSelectedTab] = useState('all');
  const [editingDebtor, setEditingDebtor] = useState(null);
  
  const { 
    debtors, 
    isLoading, 
    fetchDebtors, 
    updateDebtorById,
    deleteDebtorById
  } = useDebtors();

  useEffect(() => {
    fetchDebtors();
  }, [fetchDebtors]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleAddDebtor = () => {
    setEditingDebtor(null);
    setShowModal(true);
  };

  const handleEditDebtor = (debtor) => {
    setEditingDebtor(debtor);
    setShowModal(true);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    fetchDebtors();
  };

  // Filtrar deudores según criterios
  const filteredDebtors = debtors.filter(debtor => {
    // Filtro de búsqueda
    const matchesSearch = 
      debtor.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
      (debtor.telefono && debtor.telefono.includes(filters.search));
    
    // Filtro por estado/tab
    let matchesTab = true;
    if (selectedTab === 'pendientes') {
      matchesTab = debtor.deudas?.some(deuda => deuda.estado === 'pendiente');
    } else if (selectedTab === 'pagados') {
      // Al menos una deuda y todas están pagadas
      matchesTab = 
        debtor.deudas?.length > 0 && 
        debtor.deudas?.every(deuda => deuda.estado === 'pagada');
    }
    
    return matchesSearch && matchesTab;
  });

  return (
    <>
      <DebtorFormModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        debtor={editingDebtor}
        onSuccess={handleFormSuccess}
      />
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar deudores..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
          </div>
          <Button 
            onClick={handleAddDebtor}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Deudor
          </Button>
        </div>
        
        <DebtorFilters onFilterChange={handleFilterChange} filters={filters} />
        
        <Tabs 
          defaultValue="all" 
          className="w-full"
          onValueChange={setSelectedTab}
          value={selectedTab}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pendientes">Con Deudas Pendientes</TabsTrigger>
            <TabsTrigger value="pagados">Al Día</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {isLoading ? (
              <div className="py-10 text-center">Cargando deudores...</div>
            ) : (
              <DebtorList 
                debtors={filteredDebtors}
                onEditDebtor={handleEditDebtor}
                deleteDebtorById={deleteDebtorById}
              />
            )}
          </TabsContent>
          
          <TabsContent value="pendientes" className="mt-0">
            {isLoading ? (
              <div className="py-10 text-center">Cargando deudores...</div>
            ) : (
              <DebtorList 
                debtors={filteredDebtors}
                onEditDebtor={handleEditDebtor}
                deleteDebtorById={deleteDebtorById}
              />
            )}
          </TabsContent>
          
          <TabsContent value="pagados" className="mt-0">
            {isLoading ? (
              <div className="py-10 text-center">Cargando deudores...</div>
            ) : (
              <DebtorList 
                debtors={filteredDebtors}
                onEditDebtor={handleEditDebtor}
                deleteDebtorById={deleteDebtorById}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
});

// Componente principal de la página
function DeudoresPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 space-y-6"
    >
      <h1 className="text-3xl font-bold">Gestión de Deudores</h1>
      
      <Suspense fallback={<div>Cargando estadísticas...</div>}>
        <DebtorStats />
      </Suspense>
      
      <Suspense fallback={<div>Cargando contenido...</div>}>
        <DebtorsPageContent />
      </Suspense>
    </motion.div>
  );
}

export default DeudoresPage; 