import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Shield, Package, Users, TrendingUp, Search, ChevronDown, ChevronUp, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_document: string;
  total_amount: number;
  shipping_cost: number;
  shipping_method: string;
  shipping_address: Record<string, string>;
  status: string;
  mp_payment_id: string;
  created_at: string;
  order_items: OrderItem[];
}

const statusColors: Record<string, string> = {
  pendente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  pago: 'bg-green-500/20 text-green-400 border-green-500/30',
  enviado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  pendente: 'Aguardando Pagamento',
  pago: 'Pagamento Confirmado',
  enviado: 'Em Rota',
  cancelado: 'Cancelado',
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (!error) {
      setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord));
    }
  };

  const formatMoney = (val: number) => `R$ ${(val || 0).toFixed(2).replace('.', ',')}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filtered = orders.filter(o =>
    o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_document?.includes(search) ||
    o.id?.includes(search)
  );

  const totalRevenue = orders.filter(o => o.status === 'pago').reduce((acc, o) => acc + o.total_amount, 0);
  const pendingCount = orders.filter(o => o.status === 'pendente').length;

  return (
    <div className="min-h-screen bg-[#050505] pt-20 pb-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Central de Logística</h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Admin · Pedidos e Clientes</p>
          </div>
          <Link to="/" className="ml-auto text-sm text-slate-500 hover:text-white transition-colors">← Voltar ao Site</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total de Pedidos', value: orders.length.toString(), icon: Package, color: 'text-white', bg: 'bg-white/5' },
            { label: 'Receita Confirmada', value: formatMoney(totalRevenue), icon: TrendingUp, color: 'text-[#00FF00]', bg: 'bg-[#00FF00]/5' },
            { label: 'Aguardando Pagamento', value: pendingCount.toString(), icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/5' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${stat.bg} border border-white/10 rounded-2xl p-6 flex items-center gap-4`}
            >
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-widest">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, email, CPF/CNPJ ou ID do pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-sm"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-16">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center p-16 gap-4 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
              <div>
                <p className="text-white font-bold">Acesso Bloqueado</p>
                <p className="text-slate-500 text-sm mt-1">{error}</p>
                <p className="text-slate-600 text-xs mt-2">Apenas contas com permissão admin podem visualizar pedidos.</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center p-16 gap-4 text-center opacity-50">
              <Package className="w-10 h-10 text-slate-600" />
              <p className="text-slate-400">Nenhum pedido encontrado.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((order) => (
                <div key={order.id}>
                  {/* Order Row */}
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors text-left"
                  >
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-white font-bold text-sm">{order.customer_name}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[160px]">{order.customer_email}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-slate-300 font-mono text-xs">{order.customer_document}</p>
                        <p className="text-slate-600 text-xs">{formatDate(order.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-[#00FF00] font-bold">{formatMoney(order.total_amount)}</p>
                        <p className="text-slate-500 text-xs">{order.shipping_method || 'Frete não calculado'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColors[order.status] || 'bg-white/5 text-white border-white/10'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                    </div>
                    {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>

                  {/* Expanded Details */}
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6 bg-[#060606]"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {/* Itens do Pedido */}
                        <div>
                          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Equipamentos Comprados</h4>
                          <div className="space-y-2">
                            {(order.order_items || []).map((item, i) => (
                              <div key={i} className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg">
                                <div>
                                  <p className="text-white font-bold">{item.product_name}</p>
                                  <p className="text-slate-500 text-xs">Qtd: {item.quantity}</p>
                                </div>
                                <span className="text-[#00FF00] font-bold">{formatMoney(item.unit_price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Endereço + Ações */}
                        <div>
                          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Endereço de Envio</h4>
                          {order.shipping_address && (
                            <div className="text-sm text-slate-300 p-3 bg-white/5 rounded-lg space-y-1">
                              <p>{order.shipping_address.rua}, {order.shipping_address.numero}</p>
                              <p>{order.shipping_address.bairro} - {order.shipping_address.cidade}/{order.shipping_address.estado}</p>
                              <p className="font-mono text-slate-400">CEP: {order.shipping_address.cep}</p>
                            </div>
                          )}

                          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 mt-4">Atualizar Status</h4>
                          <div className="flex gap-2 flex-wrap">
                            {['pendente', 'pago', 'enviado', 'cancelado'].map((s) => (
                              <button
                                key={s}
                                onClick={() => updateOrderStatus(order.id, s)}
                                className={`text-xs px-3 py-1.5 rounded-lg border font-bold uppercase tracking-widest transition-all ${
                                  order.status === s ? statusColors[s] : 'border-white/10 text-slate-500 hover:border-white/20'
                                }`}
                              >
                                {statusLabels[s]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
