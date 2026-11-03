
const BASE = process.env.API_URL || 'http://localhost:3000/api';

// clientes e itens -> servidor copia esse preco 
const vendas = [
  { cliente: 'Arthur',  itens: [['Notebook 14', 1], ['Mouse sem fio', 2]] },
  { cliente: 'Matheus', itens: [['SSD 1TB', 1]] },
  { cliente: 'Lucas',   itens: [['Headset USB', 2], ['Hub USB-C', 1]] }
];

async function api(caminho, opcoes) {
  const res = await fetch(`${BASE}${caminho}`, opcoes);
  const corpo = await res.json();
  if (!res.ok) throw new Error(`${res.status} em ${caminho}: ${corpo.erro}`);
  return corpo;
}

try {
  const idPorNome = new Map((await api('/produtos')).map((p) => [p.nome, p._id]));

  // Confere todos os nomes antes de gravar qualquer venda, para não parar no meio.
  const faltando = vendas.flatMap((v) => v.itens.map(([nome]) => nome)).filter((nome) => !idPorNome.has(nome));
  if (faltando.length) throw new Error(`Produtos não cadastrados: ${faltando.join(', ')} (rode npm run seed)`);

  for (const { cliente, itens } of vendas) {
    const corpo = {
      cliente,
      data: new Date(),
      itens: itens.map(([nome, quantidade]) => ({ produto: idPorNome.get(nome), quantidade }))
    };

    const venda = await api('/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo)
    });
    const total = venda.itens.reduce((s, i) => s + i.quantidade * i.precoUnitario, 0);
    console.log(`Venda para ${cliente}: ${venda.itens.length} itens, R$ ${total.toFixed(2)}`);
  }

  console.log('Relatório:', await api('/relatorios/vendas'));
} catch (e) {
  console.error('Falha:', e.cause?.code === 'ECONNREFUSED' ? 'servidor não está rodando (npm run dev)' : e.message);
  process.exitCode = 1;
}

// locallhost:3000/api/vendas
// locallhost:3000/api/relatorios/vendas