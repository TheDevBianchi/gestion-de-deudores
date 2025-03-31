import connectToDB from '@/lib/dbConnect';
import Config from '@/models/Config';
import { NextResponse } from 'next/server';

// GET - Obtener los precios del dólar
export async function GET() {
  try {
    await connectToDB();
    
    const dollarTypes = ['dollarPriceAverage', 'dollarPriceCentralBank', 'dollarPriceParallel'];
    const configs = {};
    
    for (const key of dollarTypes) {
      const config = await Config.findOne({ key });
      if (config) {
        const simpleKey = key.replace('dollarPrice', '').toLowerCase();
        configs[simpleKey] = {
          price: config.value,
          history: Array.isArray(config.history) ? config.history : []
        };
      } else {
        // Si no existe, inicializar con valor por defecto
        const defaultConfig = new Config({
          key,
          value: 0,
          history: []
        });
        await defaultConfig.save();
        
        const simpleKey = key.replace('dollarPrice', '').toLowerCase();
        configs[simpleKey] = {
          price: 0,
          history: []
        };
      }
    }
    
    return NextResponse.json({
      average: configs.average?.price || 0,
      centralBank: configs.centralbank?.price || 0,
      parallel: configs.parallel?.price || 0,
      history: {
        average: configs.average?.history || [],
        centralBank: configs.centralbank?.history || [],
        parallel: configs.parallel?.history || []
      }
    });
  } catch (error) {
    console.error("Error en GET dollar:", error);
    return NextResponse.json(
      { error: 'Error al obtener los precios del dólar', message: error.message },
      { status: 500 }
    );
  }
}

// POST - Actualizar el precio del dólar
export async function POST(request) {
  try {
    const data = await request.json();
    const newPrices = {
      average: parseFloat(data.average),
      centralBank: parseFloat(data.centralBank),
      parallel: parseFloat(data.parallel)
    };
    
    // Validar todos los precios
    if (Object.values(newPrices).some(price => isNaN(price) || price <= 0)) {
      return NextResponse.json(
        { error: 'Precios inválidos' },
        { status: 400 }
      );
    }
    
    await connectToDB();
    
    // Actualizar cada configuración
    const dollarTypes = [
      { key: 'dollarPriceAverage', value: newPrices.average },
      { key: 'dollarPriceCentralBank', value: newPrices.centralBank },
      { key: 'dollarPriceParallel', value: newPrices.parallel }
    ];
    
    // Recopilar historiales para la respuesta
    const histories = {
      average: [],
      centralBank: [],
      parallel: []
    };
    
    for (const type of dollarTypes) {
      let config = await Config.findOne({ key: type.key });
      
      if (!config) {
        config = new Config({
          key: type.key,
          value: type.value,
          history: []
        });
      }
      
      // Actualizar valor y añadir al historial
      config.value = type.value;
      
      // Añadir al historial si el precio es diferente al último
      const historyEntry = {
        price: type.value,
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
      
      // Guardar historial para la respuesta
      const keyMap = {
        'dollarPriceAverage': 'average',
        'dollarPriceCentralBank': 'centralBank',
        'dollarPriceParallel': 'parallel'
      };
      
      if (config.history && Array.isArray(config.history)) {
        histories[keyMap[type.key]] = config.history;
      }
      
      await config.save();
    }
    
    return NextResponse.json({
      average: newPrices.average,
      centralBank: newPrices.centralBank,
      parallel: newPrices.parallel,
      history: histories
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar los precios del dólar', message: error.message },
      { status: 500 }
    );
  }
} 