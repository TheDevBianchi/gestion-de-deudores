 import connectToDB from '@/lib/dbConnect';
import Config from '@/models/Config';
import { NextResponse } from 'next/server';

// GET - Obtener el precio actual del dólar
export async function GET() {
  try {
    await connectToDB();
    
    // Buscar o crear configuración
    let config = await Config.findOne({ key: 'dollarPrice' });
    
    if (!config) {
      config = new Config({
        key: 'dollarPrice',
        value: 1,
        history: [{ price: 1, date: new Date() }]
      });
      await config.save();
    }
    
    return NextResponse.json({
      price: config.value,
      history: config.history || []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener el precio del dólar', message: error.message },
      { status: 500 }
    );
  }
}

// POST - Actualizar el precio del dólar
export async function POST(request) {
  try {
    const data = await request.json();
    const newPrice = parseFloat(data.price);
    
    if (isNaN(newPrice) || newPrice <= 0) {
      return NextResponse.json(
        { error: 'Precio inválido' },
        { status: 400 }
      );
    }
    
    await connectToDB();
    
    // Buscar o crear configuración
    let config = await Config.findOne({ key: 'dollarPrice' });
    
    if (!config) {
      config = new Config({
        key: 'dollarPrice',
        value: newPrice,
        history: []
      });
    }
    
    // Actualizar valor y añadir al historial
    config.value = newPrice;
    
    // Añadir al historial si el precio es diferente al último
    const historyEntry = {
      price: newPrice,
      date: new Date()
    };
    
    if (!config.history) {
      config.history = [historyEntry];
    } else {
      config.history.unshift(historyEntry);
      
      // Limitar el historial a los últimos 50 registros
      if (config.history.length > 50) {
        config.history = config.history.slice(0, 50);
      }
    }
    
    await config.save();
    
    return NextResponse.json({
      price: config.value,
      history: config.history
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar el precio del dólar', message: error.message },
      { status: 500 }
    );
  }
} 