import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Sale from '@/services/models/sale';
import Product from '@/services/models/product';
import Debtor from '@/services/models/debtor';

export async function GET() {
  try {
    await dbConnect();
    
    // Obtener todas las ventas y popular los productos
    const sales = await Sale.find({})
      .populate('productos.producto')
      .sort({ fecha: -1 });
    
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Procesar productos y validar stock
    const saleProducts = [];
    let montoTotal = 0;
    
    // Si es venta a crédito, validar que el cliente exista
    let clienteNombre = 'Comprador';
    if (data.esCredito && data.clienteId !== 'default') {
      const debtor = await Debtor.findById(data.clienteId);
      if (!debtor) {
        return NextResponse.json(
          { error: 'Cliente no encontrado' },
          { status: 404 }
        );
      }
      clienteNombre = `${debtor.nombre} ${debtor.apellido}`;
    }

    // Validar y actualizar inventario
    for (const item of data.productos) {
      const product = await Product.findById(item.productoId);
      
      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productoId}` },
          { status: 404 }
        );
      }
      
      if (product.cantidadInventario < item.cantidad) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.nombre}` },
          { status: 400 }
        );
      }

      const precioUnitario = product.precioCompra * (1 + product.porcentajeGanancia / 100);
      const subtotal = precioUnitario * item.cantidad;

      // Agregar a la lista de productos de venta
      saleProducts.push({
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

    // Crear la venta
    const sale = await Sale.create({
      productos: saleProducts,
      montoTotal,
      clienteId: data.clienteId || 'default',
      clienteNombre,
      esCredito: data.esCredito,
      estado: data.esCredito ? 'pendiente' : 'completada',
      fecha: new Date()
    });

    // Si es venta a crédito, agregar deuda automáticamente al cliente
    if (data.esCredito && data.clienteId !== 'default') {
      const debtor = await Debtor.findById(data.clienteId);
      
      // Agregar deuda con los productos ya seleccionados
      debtor.deudas.push({
        productos: saleProducts,
        montoTotal,
        montoPendiente: montoTotal,
        estado: 'pendiente',
        fechaCreacion: new Date()
      });
      
      await debtor.save();
    }

    // Retornar venta con productos populados
    await sale.populate('productos.producto');
    return NextResponse.json(sale);
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 