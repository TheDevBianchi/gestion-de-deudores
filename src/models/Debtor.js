import mongoose from 'mongoose';

const DebtorSchema = new mongoose.Schema({
  // ... otros campos ...
  deudas: [{
    productos: [{
      producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product' // Asegúrate de que esto coincida con el nombre del modelo
      },
      cantidad: Number,
      precioUnitario: Number
    }],
    // ... otros campos de deudas ...
  }]
});

const Debtor = mongoose.models.Debtor || mongoose.model('Debtor', DebtorSchema);

export default Debtor; 