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

export async function POST(req) {
  try {
    await dbConnect();
    
    const body = await req.json();
    
    // Cargar todos los productos de una vez para evitar múltiples consultas
    const productIds = body.productos.map(item => item.productoId);
    const productos = await Product.find({ _id: { $in: productIds } });
    
    // Crear un mapa para acceso rápido
    const productosMap = {};
    productos.forEach(producto => {
      productosMap[producto._id.toString()] = producto;
    });
    
    // Verificar productos disponibles
    for (const item of body.productos) {
      const producto = productosMap[item.productoId];
      
      if (!producto) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productoId}` },
          { status: 404 }
        );
      }
      
      // Verificar stock según tipo de venta
      const tipoVenta = item.tipoVenta || 'unidad';
      const cantidadPorPaquete = producto.cantidadPorPaquete || 1;
      
      if (tipoVenta === 'paquete') {
        // Verificar si hay suficientes paquetes
        if (producto.cantidadPaquetes < item.cantidad) {
          return NextResponse.json(
            { error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.cantidadPaquetes} paquetes, Solicitado: ${item.cantidad} paquetes` },
            { status: 400 }
          );
        }
      } else {
        // Verificar si hay suficientes unidades (paquetes + sueltas)
        const totalUnidades = (producto.cantidadPaquetes * cantidadPorPaquete) + producto.cantidadUnidadesSueltas;
        if (totalUnidades < item.cantidad) {
          return NextResponse.json(
            { error: `Stock insuficiente para ${producto.nombre}. Disponible: ${totalUnidades} unidades, Solicitado: ${item.cantidad} unidades` },
            { status: 400 }
          );
        }
      }
    }
    
    // Preparar productos para la venta
    const productosVenta = body.productos.map(item => {
      const producto = productosMap[item.productoId];
      // Obtener tipoVenta del formulario
      const tipoVenta = item.tipoVenta || 'unidad';
      const cantidadPorPaquete = producto.cantidadPorPaquete || 1;
      
      // Calcular precios
      const precioVentaPaquete = producto.precioCompra * (1 + producto.porcentajeGanancia / 100);
      const precioVentaUnitario = precioVentaPaquete / cantidadPorPaquete;
      
      // Precio según tipo de venta
      const precioUnitario = tipoVenta === 'paquete' ? precioVentaPaquete : precioVentaUnitario;
      
      return {
        producto: item.productoId,
        cantidad: item.cantidad,
        tipoVenta: tipoVenta,
        cantidadPorPaquete,
        precioUnitario,
        subtotal: precioUnitario * item.cantidad
      };
    });
    
    // Calcular el monto total
    const montoTotal = productosVenta.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Crear venta
    const venta = new Sale({
      productos: productosVenta,
      cliente: body.clienteId || null,
      esCredito: body.esCredito || false,
      montoTotal
    });
    
    // Guardar venta
    await venta.save();
    
    // Actualizar inventario
    for (const item of body.productos) {
      const producto = productosMap[item.productoId];
      const tipoVenta = item.tipoVenta || 'unidad';
      const cantidadPorPaquete = producto.cantidadPorPaquete || 1;
      
      if (tipoVenta === 'paquete') {
        // Si se venden paquetes completos, simplemente restar de cantidadPaquetes
        await Product.findByIdAndUpdate(
          item.productoId,
          { $inc: { cantidadPaquetes: -item.cantidad } }
        );
      } else {
        // Si se venden unidades, la lógica es más compleja
        // Primero intentamos descontar de unidades sueltas
        const unidadesSueltasDisponibles = producto.cantidadUnidadesSueltas || 0;
        const cantidadSolicitada = item.cantidad;
        
        if (unidadesSueltasDisponibles >= cantidadSolicitada) {
          // Si hay suficientes unidades sueltas, simplemente las restamos
          await Product.findByIdAndUpdate(
            item.productoId,
            { $inc: { cantidadUnidadesSueltas: -cantidadSolicitada } }
          );
        } else {
          // Si no hay suficientes unidades sueltas, tenemos que "abrir" paquetes
          const unidadesFaltantes = cantidadSolicitada - unidadesSueltasDisponibles;
          const paquetesNecesarios = Math.ceil(unidadesFaltantes / cantidadPorPaquete);
          const nuevasUnidadesSueltas = (paquetesNecesarios * cantidadPorPaquete) - unidadesFaltantes;
          
          await Product.findByIdAndUpdate(
            item.productoId,
            {
              $set: { cantidadUnidadesSueltas: nuevasUnidadesSueltas },
              $inc: { cantidadPaquetes: -paquetesNecesarios }
            }
          );
        }
      }
    }
    
    // Si es venta a crédito, crear deuda
    if (body.esCredito && body.clienteId) {
      const debtor = await Debtor.findById(body.clienteId);
      if (debtor) {
        debtor.deudas.push({
          venta: venta._id,
          productos: productosVenta,
          montoTotal,
          montoPendiente: montoTotal,
          estado: 'pendiente',
          fecha: new Date()
        });
        await debtor.save();
      }
    }
    
    return NextResponse.json(venta);
  } catch (error) {
    console.error('Error en API de ventas:', error);
    return NextResponse.json(
      { error: 'Error al crear venta', message: error.message },
      { status: 500 }
    );
  }
} 