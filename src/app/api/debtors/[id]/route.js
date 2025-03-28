import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Debtor from '@/services/models/debtor';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const debtor = await Debtor.findById(id)
      .populate('deudas.productos.producto');
    
    if (!debtor) {
      return NextResponse.json(
        { message: 'Deudor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(debtor);
  } catch (error) {
    console.error('Error en GET /api/debtors/[id]:', error);
    return NextResponse.json(
      { message: 'Error al obtener el deudor' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await request.json();
    
    const debtor = await Debtor.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    
    if (!debtor) {
      return NextResponse.json(
        { message: 'Deudor no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(debtor);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al actualizar el deudor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const debtor = await Debtor.findByIdAndDelete(id);
    
    if (!debtor) {
      return NextResponse.json(
        { message: 'Deudor no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Deudor eliminado correctamente' }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al eliminar el deudor' },
      { status: 500 }
    );
  }
} 