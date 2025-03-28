import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Por favor define la variable de entorno MONGODB_URI dentro de .env.local'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('Usando conexión existente a MongoDB');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    mongoose.set('strictQuery', true);

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Nueva conexión a MongoDB establecida');
        return mongoose;
      })
      .catch((error) => {
        console.error('Error conectando a MongoDB:', error);
        cached.promise = null;
        throw error;
      });
  } else {
    console.log('Usando promesa de conexión existente');
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Error esperando la conexión a MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

// Manejador de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('MongoDB conectado exitosamente');
});

mongoose.connection.on('error', (err) => {
  console.error('Error en la conexión de MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB desconectado');
});

// Manejador de cierre de la aplicación
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default dbConnect; 