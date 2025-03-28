'use client';

import { memo, useMemo } from 'react';
import { useDebtors } from '@/hooks/debtors/useDebtors';
import { Card } from '@/components/ui/card';
import { Users, AlertTriangle, Wallet, CheckCircle } from 'lucide-react';

const DebtorStats = memo(function DebtorStats() {
  const { debtors } = useDebtors();
  
  const stats = useMemo(() => {
    if (!debtors || debtors.length === 0) {
      return {
        totalDebtors: 0,
        debtorsWithPendingDebt: 0,
        totalPendingDebt: 0,
        paidDebt: 0
      };
    }
    
    let totalPendingDebt = 0;
    let totalPaidDebt = 0;
    let debtorsWithPending = 0;
    
    debtors.forEach(debtor => {
      let debtorHasPending = false;
      
      if (debtor.deudas && debtor.deudas.length > 0) {
        debtor.deudas.forEach(deuda => {
          if (deuda.estado === 'pendiente') {
            totalPendingDebt += deuda.montoPendiente;
            debtorHasPending = true;
          }
          
          totalPaidDebt += (deuda.montoTotal - deuda.montoPendiente);
        });
      }
      
      if (debtorHasPending) {
        debtorsWithPending++;
      }
    });
    
    return {
      totalDebtors: debtors.length,
      debtorsWithPendingDebt: debtorsWithPending,
      totalPendingDebt,
      paidDebt: totalPaidDebt
    };
  }, [debtors]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Deudores</h3>
            <p className="text-2xl font-bold">{stats.totalDebtors}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </Card>
      
      <Card className="p-4 border-l-4 border-l-amber-500">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Con Deudas Pendientes</h3>
            <p className="text-2xl font-bold text-amber-600">{stats.debtorsWithPendingDebt}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-full">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </Card>
      
      <Card className="p-4 border-l-4 border-l-red-500">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Pendiente</h3>
            <p className="text-2xl font-bold text-red-600">${stats.totalPendingDebt.toFixed(2)}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-full">
            <Wallet className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </Card>
      
      <Card className="p-4 border-l-4 border-l-green-500">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Cobrado</h3>
            <p className="text-2xl font-bold text-green-600">${stats.paidDebt.toFixed(2)}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>
    </div>
  );
});

export default DebtorStats; 