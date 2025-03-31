import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';

// Función mejorada para formatear fechas con depuración
const formatDate = (debt) => {
  console.log("Intentando formatear fecha para:", debt);
  
  // Verificamos si el objeto deuda tiene el campo fecha
  const fechaValue = debt?.fecha;
  console.log("Campo fecha encontrado:", fechaValue);
  
  if (!fechaValue) {
    console.log("Campo fecha no encontrado, revisando alternativas");
    return "Fecha desconocida";
  }
  
  try {
    const date = new Date(fechaValue);
    
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      console.log("Fecha inválida:", fechaValue);
      return "Fecha inválida";
    }
    
    // Formato español: día/mes/año hora:minutos
    const formattedDate = date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log("Fecha formateada correctamente:", formattedDate);
    return formattedDate;
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "Error en formato de fecha";
  }
};

const DebtList = memo(function DebtList({ debts, debtorId, onAddPayment }) {
  console.log("Renderizando DebtList con deudas:", debts);
  
  if (!debts || debts.length === 0) {
    return (
      <div className="text-center p-6 bg-muted/30 rounded-md">
        <p className="text-muted-foreground">No hay deudas registradas</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {debts.map((debt, index) => (
        <div 
          key={debt._id || index} 
          className="border rounded-md p-4"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">Deuda #{index + 1}</h3>
              <p className="text-sm text-muted-foreground">
                Creada el {formatDate(debt)}
              </p>
            </div>
            <div>
              <Badge variant={debt.estado === 'pagada' ? 'success' : 'secondary'}>
                {debt.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
              </Badge>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Monto Total:</span>
              <span className="font-medium">${debt.montoTotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="text-sm text-muted-foreground">Monto Pendiente:</span>
              <span className="font-medium">${debt.montoPendiente?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          
          {debt.estado !== 'pagada' && onAddPayment && (
            <div className="mt-4 text-right">
              <button
                onClick={() => onAddPayment(debt._id, debt.montoPendiente)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Registrar Pago
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

export default DebtList; 