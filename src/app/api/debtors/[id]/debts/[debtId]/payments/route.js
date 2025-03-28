import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Debtor from '@/services/models/debtor';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id, debtId } = await params;
    const paymentData = await request.json();

    // Validar el monto
    if (!paymentData.monto || paymentData.monto <= 0) {
      return NextResponse.json(
        { message: 'El monto del abono debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const debtor = await Debtor.findById(id);
    if (!debtor) {
      return NextResponse.json(
        { message: 'Deudor no encontrado' },
        { status: 404 }
      );
    }

    // Encontrar la deuda específica
    const deuda = debtor.deudas.find(d => {
      if (!d._id) return false;
      return d._id.toString ? d._id.toString() === debtId : d._id === debtId;
    });
    
    if (!deuda) {
      return NextResponse.json(
        { message: 'Deuda no encontrada' },
        { status: 404 }
      );
    }

    // Validar que el abono no exceda el monto pendiente
    if (paymentData.monto > deuda.montoPendiente) {
      return NextResponse.json(
        { message: `El abono (${paymentData.monto}) excede el monto pendiente (${deuda.montoPendiente})` },
        { status: 400 }
      );
    }

    // Agregar el abono y actualizar el monto pendiente
    deuda.abonos.push({
      monto: paymentData.monto,
      descripcion: paymentData.descripcion,
      fecha: new Date()
    });
    deuda.montoPendiente -= paymentData.monto;

    // Si el monto pendiente llega a 0, marcar como pagada
    if (deuda.montoPendiente === 0) {
      deuda.estado = 'pagada';
    }

    await debtor.save();
    
    // Poblar los datos del producto antes de enviar la respuesta
    await debtor.populate('deudas.productos.producto');

    return NextResponse.json(debtor);
  } catch (error) {
    console.error('Error en POST /api/debtors/[id]/debts/[debtId]/payments:', error);
    return NextResponse.json(
      { message: 'Error al registrar el abono' },
      { status: 500 }
    );
  }
} 