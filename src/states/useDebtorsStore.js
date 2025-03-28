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
      
      addDebtor: (newDebtor) => 
        set((state) => {
          // Validar que el deudor tenga un ID válido
          if (!newDebtor?._id) {
            console.error('Intento de añadir deudor sin ID:', newDebtor);
            return state;
          }
          
          // Asegurarse de que debtors sea siempre un array
          const currentDebtors = Array.isArray(state.debtors) ? state.debtors : [];
          
          // Evitar duplicados
          const debtorExists = currentDebtors.some(d => d._id === newDebtor._id);
          if (debtorExists) {
            return state;
          }
          
          return {
            debtors: [newDebtor, ...currentDebtors]
          };
        }),
      
      fetchDebtorById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/debtors/${id}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cargar deudor');
          }
          const debtorData = await response.json();
          
          // Normalizar los datos del deudor
          const normalizedDebtor = {
            _id: debtorData._id || id,
            nombre: debtorData.nombre || '',
            apellido: debtorData.apellido || '',
            telefono: debtorData.telefono || '',
            direccion: debtorData.direccion || '',
            email: debtorData.email || '',
            deudas: Array.isArray(debtorData.deudas) ? debtorData.deudas.map(deuda => {
              // Solo mostrar deudas con ID real de MongoDB
              if (!deuda._id) return null;
              
              return {
                _id: deuda._id,
                montoTotal: deuda.montoTotal || 0,
                montoPendiente: deuda.montoPendiente || 0,
                estado: deuda.estado || 'pendiente',
                fecha: deuda.fecha || new Date().toISOString(),
                productos: Array.isArray(deuda.productos) ? deuda.productos : [],
                // Agregar propiedad para identificar si es temporal
                esLocal: false
              };
            }).filter(Boolean) : []
          };
          
          set(state => ({
            selectedDebtor: normalizedDebtor,
            debtors: state.debtors.map(d => 
              d._id === normalizedDebtor._id ? normalizedDebtor : d
            ),
            isLoading: false
          }));
          return normalizedDebtor;
        } catch (error) {
          set({ 
            error: error.message, 
            isLoading: false,
            selectedDebtor: null // Asegurarnos de limpiar el selectedDebtor en caso de error
          });
          console.error("Error en fetchDebtorById:", error);
          throw error;
        }
      },
      
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