import axios from 'axios';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST required' });
  }

  try {
    const { cep, weight = 1 } = req.body;
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return res.status(400).json({ error: 'CEP inválido' });
    }

    // Como integrações diretas oficiais do Correios requerem SOAP + IdCorreios hoje em dia,
    // E serviços de frete precisam de Tokens (Frete Fácil / Melhor Envios),
    // Usamos uma aproximação baseada em tabela do CEP base + Viacep para UX perfeita por enquanto.
    const viaCepResponse = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = viaCepResponse.data;

    if (data.erro) {
      return res.status(400).json({ error: 'CEP não encontrado' });
    }

    const uf = data.uf;
    
    // Tabela estática aproximada (Preços base de mercado) baseada em estado destino 
    // SP/Sudeste é mais barato, Norte/Nordeste mais caro
    const isSudeste = ['SP', 'RJ', 'MG', 'ES'].includes(uf);
    const isSul = ['PR', 'SC', 'RS'].includes(uf);
    const isCentroOeste = ['GO', 'MT', 'MS', 'DF'].includes(uf);
    const isNordeste = ['BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA'].includes(uf);
    
    // Multiplicador com base no peso (ex: acima de 1kg, 2kg etc adiciona um markup)
    const weightMarkup = weight > 1 ? weight * 5 : 0; 

    let pacPrice = 30 + weightMarkup;
    let sedexPrice = 55 + (weightMarkup * 1.5);
    let pacTempo = "7 a 12 dias úteis";
    let sedexTempo = "2 a 4 dias úteis";

    if (isSudeste) {
      pacPrice = 22 + weightMarkup;
      sedexPrice = 40 + (weightMarkup * 1.2);
      pacTempo = "4 a 7 dias úteis";
      sedexTempo = "1 a 2 dias úteis";
    } else if (isSul || isCentroOeste) {
      pacPrice = 35 + weightMarkup;
      sedexPrice = 65 + (weightMarkup * 1.5);
    } else if (isNordeste) {
      pacPrice = 45 + weightMarkup;
      sedexPrice = 85 + (weightMarkup * 1.8);
      pacTempo = "9 a 15 dias úteis";
      sedexTempo = "3 a 6 dias úteis";
    } else {
      // Norte (Amazonas, Acre, Roraima, Amapá, Pará, Tocantins, Rondônia)
      pacPrice = 55 + weightMarkup;
      sedexPrice = 110 + (weightMarkup * 2);
      pacTempo = "12 a 20 dias úteis";
      sedexTempo = "4 a 8 dias úteis";
    }

    return res.status(200).json({
      address: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${uf}`,
      options: [
        { type: 'PAC', price: Number(pacPrice.toFixed(2)), duration: pacTempo },
        { type: 'SEDEX', price: Number(sedexPrice.toFixed(2)), duration: sedexTempo }
      ]
    });

  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao calcular frete' });
  }
}
