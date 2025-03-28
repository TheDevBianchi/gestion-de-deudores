import mongoose from 'mongoose';

const dollarPriceSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: [true, 'El precio del dólar es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware para actualizar updatedAt antes de cada actualización
dollarPriceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const DollarPrice = mongoose.models.DollarPrice || mongoose.model('DollarPrice', dollarPriceSchema);

export default DollarPrice; 