// Erros de validação/ID viram 400; o resto é logado e vira 500 sem vazar detalhes.
export const erro = (res, e) => {
  if (e.name === 'ValidationError' || e.name === 'CastError') return res.status(400).json({ erro: e.message });
  console.error(e); return res.status(500).json({ erro: 'Erro interno' });
};
