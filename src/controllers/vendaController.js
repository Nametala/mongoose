import mongoose from 'mongoose';
import Produto from '../models/Produto.js';
import Venda from '../models/Venda.js';
import { erro } from './erro.js';

export async function criar(req, res) {
  const { cliente, data, itens } = req.body;
  if (!Array.isArray(itens) || itens.length === 0)
    return res.status(400).json({ erro: 'Informe itens: [{ produto, quantidade }]' });

  for (const item of itens) {
    if (!mongoose.isValidObjectId(item?.produto))
      return res.status(400).json({ erro: `ID de produto inválido: ${item?.produto}` });
    if (!Number.isInteger(item.quantidade) || item.quantidade < 1)
      return res.status(400).json({ erro: 'Quantidade deve ser um inteiro maior que zero' });
  }

  try {
    const ids = itens.map((i) => String(i.produto));
    const produtos = await Produto.find({ _id: { $in: ids } });
    const precoPorId = new Map(produtos.map((p) => [p.id, p.preco]));

    const faltando = ids.filter((id) => !precoPorId.has(id));
    if (faltando.length) return res.status(400).json({ erro: 'Produto não encontrado', ids: faltando });

    // Preço vem do catálogo, nunca do cliente.
    const venda = await Venda.create({
      cliente,
      data,
      itens: itens.map((i) => ({ produto: i.produto, quantidade: i.quantidade, precoUnitario: precoPorId.get(String(i.produto)) }))
    });
    res.status(201).json(venda);
  }
  catch(e) { erro(res,e); }
}

export async function listar(req, res) {
  try {
    res.json(await Venda.find().sort({ data: -1 }).populate('itens.produto'));
  }
  catch(e) { erro(res,e); }
}

// Consolida em JavaScript usando o precoUnitario gravado na venda (não o preço atual).
export async function relatorio(req, res) {
  try {
    const vendas = await Venda.find();
    let faturamento = 0, unidadesVendidas = 0;
    for (const venda of vendas)
      for (const item of venda.itens) {
        faturamento += item.quantidade * item.precoUnitario;
        unidadesVendidas += item.quantidade;
      }
    res.json({ totalVendas: vendas.length, faturamento: Math.round(faturamento * 100) / 100, unidadesVendidas });
  }
  catch(e) { erro(res,e); }
}
