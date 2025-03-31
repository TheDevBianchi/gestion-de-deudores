import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';

const formatDate = (debtData) => {
  // Intentar obtener la fecha de la deuda en este orden de prioridad
  const fechaPosible = debtData.fecha || debtData.createdAt || debtData.date;
  console.log(fechaPosible);
  
  if (!fechaPosible) return "Fecha desconocida";
  
  try {
    const date = new Date(fechaPosible);
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) return "Fecha inválida";
    
    // Formato español: día/mes/año hora:minutos
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Error al formatear fecha:", error, "para el valor:", fechaPosible);
    return "Error en formato";
  }
};

const DebtCard = memo(({ debt, index, onPayment }) => {
  // Utilizamos directamente la función de formateo con el objeto completo
  const fechaFormateada = formatDate(debt);
  console.log(fechaFormateada);
  
  return (
    <div className="border rounded-md p-4 mb-4" key={debt._id || index}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">Deuda #{index + 1}</h3>
          <p className="text-sm text-muted-foreground">
            Creada el {fechaFormateada}
          </p>
        </div>
        <div>
          <Badge variant={debt.estado === 'pagada' ? 'success' : 'secondary'}>
            {debt.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
          </Badge>
        </div>
      </div>
      
      {/* Resto del código */}
    </div>
  );
});

export default DebtCard; 