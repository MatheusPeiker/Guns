import { MercadoPagoConfig, Preference } from 'mercadopago';

// Instancia o cliente Mercado Pago (A chave vai ficar protegida na Vercel)
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-00000000-0000-0000-0000-000000000000' });

export default async function handler(req: any, res: any) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST required' });
  }

  try {
    const { items, shippingCost, metadata } = req.body;

    const mpItems = items.map((item: any) => ({
      title: item.title,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      currency_id: 'BRL'
    }));

    // Se tiver frete calculado, embutimos no checkout
    if (shippingCost && Number(shippingCost) > 0) {
      mpItems.push({
        title: 'Envio (PAC/SEDEX)',
        unit_price: Number(shippingCost),
        quantity: 1,
        currency_id: 'BRL'
      });
    }

    // Cria a preferência no Mercado Pago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: mpItems,
        metadata: metadata, // Podemos enviar order_id aqui para bater no webhook
        // Para onde volta depois de pagar
        back_urls: {
          success: `${req.headers.origin || 'http://localhost:3000'}/perfil?status=success`,
          failure: `${req.headers.origin || 'http://localhost:3000'}/perfil?status=failure`,
          pending: `${req.headers.origin || 'http://localhost:3000'}/perfil?status=pending`,
        },
        auto_return: 'approved'
      }
    });

    // Retorna a URL de checkout e o ID pro carrinho
    return res.status(200).json({ id: result.id, init_point: result.init_point });
    
  } catch (error: any) {
    console.error('Erro ao criar preferência:', error);
    return res.status(500).json({ error: 'Erro gerando checkout', details: error.message });
  }
}
