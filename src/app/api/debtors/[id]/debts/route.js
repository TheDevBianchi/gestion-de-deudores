import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Debtor from '@/services/models/debtor';
import Product from '@/services/models/product';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const debtData = await request.json();
    
    // Asegurarse de que tiene una fecha
    if (!debtData.fecha) {
      debtData.fecha = new Date();
    }
    
    console.log("API recibiendo datos de deuda con fecha:", debtData.fecha);
    
    const debtor = await Debtor.findById(id);
    if (!debtor) {
      return NextResponse.json(
        { message: 'Deudor no encontrado' },
        { status: 404 }
      );
    }

    // Calcular montos y validar stock
    const debtProducts = [];
    let montoTotal = 0;

    for (const item of debtData.productos) {
      const product = await Product.findById(item.productoId);
      if (!product) {
        return NextResponse.json(
          { message: `Producto ${item.productoId} no encontrado` },
          { status: 404 }
        );
      }

      if (product.cantidadInventario < item.cantidad) {
        return NextResponse.json(
          { message: `Stock insuficiente para ${product.nombre}` },
          { status: 400 }
        );
      }

      const precioUnitario = product.precioCompra * (1 + product.porcentajeGanancia / 100);
      const subtotal = precioUnitario * item.cantidad;

      debtProducts.push({
        producto: item.productoId,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal
      });

      montoTotal += subtotal;

      // Actualizar inventario
      product.cantidadInventario -= item.cantidad;
      await product.save();
    }

    // Crear nueva deuda
    const newDebt = {
      ...debtData,
      fecha: debtData.fecha,
      estado: 'pendiente',
      productos: debtProducts,
      montoTotal,
      montoPendiente: montoTotal
    };
    
    debtor.deudas.push(newDebt);
    await debtor.save();
    await debtor.populate('deudas.productos.producto');

    return NextResponse.json(debtor);
  } catch (error) {
    console.error('Error en POST /api/debtors/[id]/debts:', error);
    return NextResponse.json(
      { message: 'Error al crear la deuda' },
      { status: 500 }
    );
  }
} 