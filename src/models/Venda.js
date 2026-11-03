import mongoose from 'mongoose';

// Item incorporado: guarda o preço do momento da venda (preço histórico).
const itemSchema = new mongoose.Schema({
  produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
  quantidade: { type: Number, required: true, min: 1, validate: Number.isInteger },
  precoUnitario: { type: Number, required: true, min: 0 }
}, { _id: false });

const vendaSchema = new mongoose.Schema({
  cliente: { type: String, required: true, trim: true },
  data: { type: Date, default: Date.now },
  itens: {
    type: [itemSchema],
    validate: { validator: (itens) => itens.length > 0, message: 'A venda precisa de ao menos um item' }
  }
}, { timestamps: true });

export default mongoose.model('Venda', vendaSchema);
