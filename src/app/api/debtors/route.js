import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Debtor from '@/services/models/debtor';

export async function GET(request) {
  try {
    await dbConnect();
    const debtors = await Debtor.find({}).sort({ createdAt: -1 });
    return NextResponse.json(debtors);
  } catch (error) {
    console.error('Error fetching debtors:', error);
    return NextResponse.json(
      { error: error.message || 'Error al cargar deudores' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    console.log('Datos recibidos:', data);
    
    // Validación y limpieza de datos
    const nombre = data.nombre?.trim();
    const apellido = data.apellido?.trim();
    
    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }
    
    if (!apellido) {
      return NextResponse.json(
        { error: 'El apellido es obligatorio' },
        { status: 400 }
      );
    }
    
    // Crear el objeto con los datos del deudor
    const debtorData = {
      nombre,
      apellido,
      telefono: data.telefono?.trim() || '',
      direccion: data.direccion?.trim() || '',
      email: data.email?.trim() || 'cliente@sistemaventas.com',
      deudas: []
    };

    console.log('Datos del deudor:', debtorData);
    
    // Crear y guardar el deudor
    const debtor = new Debtor(debtorData);
    const savedDebtor = await debtor.save();
    
    // Verificar que se guardó correctamente
    if (!savedDebtor._id) {
      throw new Error('Error al guardar el deudor');
    }
    
    // Log para debugging
    console.log('Deudor guardado en la base de datos:', savedDebtor);
    
    return NextResponse.json(savedDebtor);
    
  } catch (error) {
    console.error('Error al crear deudor:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear deudor' },
      { status: 500 }
    );
  }
}

// Archivo: src/app/api/debtors/[id]/route.js
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