'use client';

import { useState, useEffect, Suspense, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDebtors } from '@/hooks/debtors/useDebtors';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import DebtorDetails from '@/components/debtors/DebtorDetails';
import DebtorFormModal from '@/components/debtors/DebtorFormModal';
import NewDebtModal from '@/components/debtors/NewDebtModal';
import PaymentForm from '@/components/debtors/PaymentForm';
import DebtorList from '@/components/debtors/DebtorList';

// Componente principal
const DebtorDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('deudas');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  
  const {
    selectedDebtor,
    fetchDebtorById,
    isLoading,
    error
  } = useDebtors();
  
  useEffect(() => {
    fetchDebtorById(id);
  }, [id, fetchDebtorById]);
  
  const handleEditDebtor = () => {
    setShowEditModal(true);
  };
  
  const handleAddDebt = () => {
    setShowDebtModal(true);
  };
  
  const handleAddPayment = (debtId, pendingAmount) => {
    setSelectedDebt({ debtId, pendingAmount });
    setShowPaymentModal(true);
  };
  
  const handleEditSuccess = () => {
    setShowEditModal(false);
    fetchDebtorById(id);
    toast.success('Deudor actualizado correctamente');
  };
  
  const handleDebtSuccess = () => {
    setShowDebtModal(false);
    if (id) {
      fetchDebtorById(id);
    }
    toast.success('Deuda registrada correctamente');
  };
  
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchDebtorById(id);
    toast.success('Pago registrado correctamente');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <h2 className="text-lg font-medium text-red-600 mb-2">Ocurrió un error</h2>
          <p className="text-red-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/deudores')}
          >
            Volver a Deudores
          </Button>
        </div>
      </div>
    );
  }
  
  if (!selectedDebtor) {
    return (
      <div className="container mx-auto py-8">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <h2 className="text-lg font-medium text-amber-600 mb-2">Deudor no encontrado</h2>
          <p className="text-amber-500">No se encontró el deudor con ID: {id}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/deudores')}
          >
            Volver a Deudores
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 space-y-8"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/deudores">
            <Button variant="ghost" className="gap-1 mr-4">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{selectedDebtor.nombre}</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleEditDebtor}
            className="gap-1"
          >
            <UserPlus className="h-4 w-4" />
            Editar
          </Button>
          <Button 
            onClick={handleAddDebt}
            className="gap-1 bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva Deuda
          </Button>
        </div>
      </div>
      
      <DebtorFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        debtor={selectedDebtor}
        onSuccess={handleEditSuccess}
      />
      
      <NewDebtModal
        isOpen={showDebtModal}
        onClose={() => setShowDebtModal(false)}
        debtorId={selectedDebtor._id}
        debtorName={selectedDebtor.nombre}
        onSuccess={handleDebtSuccess}
      />
      
      {showPaymentModal && selectedDebt && (
        <PaymentForm
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          debtorId={selectedDebtor._id}
          debtId={selectedDebt.debtId}
          pendingAmount={selectedDebt.pendingAmount}
          onSuccess={handlePaymentSuccess}
        />
      )}
      
      <Suspense fallback={<div>Cargando detalles...</div>}>
        <DebtorDetails 
          debtor={{
            ...selectedDebtor,
            deudas: Array.isArray(selectedDebtor?.deudas) ? selectedDebtor.deudas : []
          }}
          onAddPayment={handleAddPayment} 
          onAddDebt={handleAddDebt}
        />
      </Suspense>
    </motion.div>
  );
};

export default DebtorDetailsPage; 