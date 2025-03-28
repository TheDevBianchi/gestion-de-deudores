import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useDebtorsStore = create(
  devtools(
    (set) => ({
      debtors: [],
      isLoading: false,
      error: null,
      selectedDebtor: null,

      setDebtors: (debtors) => set({ debtors }),
      
      addDebtor: (debtor) => 
        set((state) => ({ 
          debtors: [...state.debtors, debtor] 
        })),
      
      updateDebtor: (updatedDebtor) =>
        set((state) => ({
          debtors: state.debtors.map((debtor) =>
            debtor._id === updatedDebtor._id ? updatedDebtor : debtor
          ),
          selectedDebtor: updatedDebtor._id === state.selectedDebtor?._id 
            ? updatedDebtor 
            : state.selectedDebtor
        })),
      
      deleteDebtor: (debtorId) =>
        set((state) => ({
          debtors: state.debtors.filter((debtor) => debtor._id !== debtorId),
          selectedDebtor: state.selectedDebtor?._id === debtorId 
            ? null 
            : state.selectedDebtor
        })),
      
      setSelectedDebtor: (debtor) => 
        set({ selectedDebtor: debtor }),
      
      setLoading: (isLoading) => 
        set({ isLoading }),
      
      setError: (error) => 
        set({ error }),
      
      addDebtToDebtor: (debtorId, debt) =>
        set(state => ({
          debtors: state.debtors.map(d =>
            d._id === debtorId
              ? { ...d, deudas: [...d.deudas, debt] }
              : d
          )
        })),

      addPaymentToDebt: (debtorId, debtId, payment) =>
        set(state => ({
          debtors: state.debtors.map(d =>
            d._id === debtorId
              ? {
                  ...d,
                  deudas: d.deudas.map(debt =>
                    debt._id === debtId
                      ? {
                          ...debt,
                          abonos: [...debt.abonos, payment],
                          montoPendiente: debt.montoPendiente - payment.monto
                        }
                      : debt
                  )
                }
              : d
          )
        }))
    }),
    {
      name: 'debtors-store'
    }
  )
);

export default useDebtorsStore; 