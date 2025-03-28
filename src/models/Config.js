import mongoose from 'mongoose';

// Definir el esquema para el historial de precios
const historyEntrySchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Definir el esquema para la configuración
const configSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  history: [historyEntrySchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Crear o recuperar el modelo
const Config = mongoose.models.Config || mongoose.model('Config', configSchema);

export default Config; 