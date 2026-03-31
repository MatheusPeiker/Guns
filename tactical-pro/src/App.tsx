import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Search, 
  ShoppingCart, 
  User, 
  ArrowRight, 
  Microscope, 
  Flashlight, 
  Backpack, 
  Briefcase, 
  Truck, 
  Settings, 
  Cpu, 
  Droplets, 
  Sun, 
  Zap, 
  Package, 
  LayoutGrid, 
  Filter, 
  Eye, 
  Heart, 
  ShoppingBag,
  Share2,
  Instagram,
  Youtube,
  Menu,
  X
} from 'lucide-react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';

/**
 * Componente Crosshair (Mira HUD)
 * Cria um efeito visual tecnológico que segue o mouse e interage com elementos da página.
 */
const Crosshair = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Configuração de mola para movimento suave (smooth follow)
  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Detecta se o mouse está sobre elementos interativos
      const isInteractive = target.closest('button, a, img, input, [role="button"]');
      setIsHovering(!!isInteractive);
    };

    const handleScroll = () => {
      setIsScrolling(true);
      setIsVisible(true);
      
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      
      // Efeito de desaparecer após parar de rolar
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
        // Mantém visível se o mouse estiver se movendo, mas aqui simulamos o fade out do scroll
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mouseX, mouseY, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center"
          style={{
            x: smoothX,
            y: smoothY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: isScrolling ? 0.8 : 1, 
            scale: isHovering ? 1.5 : 1,
            color: isHovering ? '#00FF00' : '#FFFFFF'
          }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          {/* Círculo Central */}
          <motion.div 
            className="absolute w-2 h-2 bg-current rounded-full"
            animate={{ scale: isHovering ? [1, 1.5, 1] : 1 }}
            transition={{ repeat: isHovering ? Infinity : 0, duration: 1 }}
          />
          
          {/* Linhas da Mira */}
          <div className="absolute w-10 h-10 border border-current rounded-full opacity-20" />
          
          {/* Retículos Externos */}
          {[0, 90, 180, 270].map((angle) => (
            <motion.div
              key={angle}
              className="absolute w-4 h-[1px] bg-current"
              style={{
                rotate: angle,
                transformOrigin: 'center',
                translateY: angle === 0 ? -15 : angle === 180 ? 15 : 0,
                translateX: angle === 90 ? 15 : angle === 270 ? -15 : 0,
              }}
              animate={{ 
                translateY: angle === 0 ? (isHovering ? -20 : -15) : angle === 180 ? (isHovering ? 20 : 15) : 0,
                translateX: angle === 90 ? (isHovering ? 20 : 15) : angle === 270 ? (isHovering ? -20 : -15) : 0,
              }}
            />
          ))}

          {/* Efeito de "Lock" no Scroll */}
          {isScrolling && (
            <motion.div 
              className="absolute w-16 h-16 border-2 border-[#00FF00] rounded-sm opacity-40"
              initial={{ scale: 2, rotate: 45 }}
              animate={{ scale: 0.8, rotate: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Texto de HUD Minimalista */}
          {isHovering && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 30 }}
              className="absolute left-full ml-4 text-[10px] font-mono whitespace-nowrap uppercase tracking-tighter"
            >
              <div className="text-[#00FF00]">Target Locked</div>
              <div className="opacity-50">Dist: 450m</div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const categories = [
  { name: 'Miras Ópticas', icon: Microscope },
  { name: 'Lanternas', icon: Flashlight },
  { name: 'Mochilas', icon: Backpack },
  { name: 'Bolsas & Cases', icon: Briefcase },
  { name: 'Transporte', icon: Truck },
  { name: 'Acessórios', icon: Settings },
];

const products = [
  {
    id: 1,
    name: 'Mira Holográfica X-700',
    price: 1850,
    description: 'Sistema de aquisição rápida de alvo com retículo iluminado em 12 níveis.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHvt6AxbTKAg5vGom9H-3IezKTIulsi_vd3QeZ9TL7rM9dWQODt_GEdICErXBuU9NSowu8yNClPiyL0F6S00YGxcThDETNmtpr-yJXUiX4JFk08464IqnvjNq9-iUdn9ldoTJklyQeD2Fiwyxllvz7Y4lkrOdLhftpEW4c5TqjFZk0lXZbG55HSzBzc5RQgZVJORDoFCsZ4TunTPbYl_nZDFJmEjDcclEZWsmQ4JiVL4z8X4hgmgP-8MkrzlG5hRnVabB3TTdBZmsq',
    tag: 'DESTAQUE',
    tagColor: 'bg-[#2e3e2e]',
    specs: [
      { icon: Cpu, label: 'Bateria: 50.000h' },
      { icon: Droplets, label: 'IPX8 Waterproof' }
    ]
  },
  {
    id: 2,
    name: 'Lanterna Strobe Pro G3',
    price: 640,
    description: '2500 Lumens de potência com foco ajustável e corpo em alumínio aeroespacial.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOjdmJde4q8iRLuvvCnEJLWU_nVA2207XRR0kH0jpC3LJP_ZkPQ1jtA5SucwEISFafMfw7ZwgqpstBTng74dC6BwlekRGYed54MH5eOWzv1zn8iglRRRDnWpBKZW_3MGuBWQB002iummrCmbHEb8xR_dqGAHSDti-oMH5VhLvH-9I3hLfyTMpDJKlTya02v8FWhZuHgwngpOoFrLb69pLFUTL8G8CPsUlZLtAEKu1oEq8U5p8XpJhaTOfqKpRIeqNVvNeoN_iwezIv',
    tag: 'RECARREGÁVEL',
    tagColor: 'bg-slate-600',
    specs: [
      { icon: Sun, label: '2500 Lumens' },
      { icon: Zap, label: 'Fast Charge USB-C' }
    ]
  },
  {
    id: 3,
    name: 'Mochila Rogue 45L',
    price: 890,
    description: 'Cordura 1000D com sistema MOLLE completo e compartimento para hidratação.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlyOE7dJ6TK0WCBneB0KhgIZnUvjkMe2y7xgvWpv6Erjx9HY5TaBzltpE1XMY4TEJXPdIlRHZ1FSDxtaSMj1eQEbwMQcCIwBBkdpJum_eoApQi9bmZh5ScxREn2oTogQJDCOLDojYp43YOZa5nmcb4dyc9Q9JJ0n54gKjXUyzo5VOwxwqlJSI0k_iQ_AHtHY35e0M15Rzlwan1aF9RnEXm_UtkGAqqs-2V9I1FFTmRJQwMZ_c2qOmKwYHnX5JRnAq1E5F8VSUdNU5v',
    tag: 'NEW ERA',
    tagColor: 'bg-red-800',
    specs: [
      { icon: Package, label: 'Capacidade 45L' },
      { icon: LayoutGrid, label: 'Sistema Laser Cut' }
    ]
  },
  {
    id: 4,
    name: 'Faca Ghost Blade V2',
    price: 420,
    description: 'Aço S35VN com cabo em G10 texturizado para máxima aderência em climas úmidos.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWmzkEGsUd84IqsLUSrkEeTNwtRXrbQezwnJQciHTqgQV-qraZQtFUy3j0eYP54fc1jOMaAkq46foRxaUGcRvmAXkhpssU4ErrSgN0ZuWGq7N73TUbBelR-7qSQXBOzPk1IPJM2jQO0_eje9klQ_b_MyuagyrYnQBVahLZq6Jk65vlWiAoU5TvQTw9dHMCFi-ngcSH_4CZk0-vQOSOVdNdtmAUBdDovH4zIxjWRlZtOf1jMDaoNFUqg8L9crYuiJ0hNDBgeJDfY20L',
    tag: 'EDC ESSENTIAL',
    tagColor: 'bg-[#2e3e2e]/40',
    specs: [
      { icon: Shield, label: 'Full Tang Construction' },
      { icon: Shield, label: 'Kydex Sheath Included' }
    ]
  }
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#171b17] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#2e3e2e]/30 cursor-none">
      <Crosshair />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2e3e2e]/20 bg-[#f7f7f7]/80 dark:bg-[#171b17]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-[#2e3e2e] dark:text-slate-100">
                <Shield className="w-8 h-8" />
                <h1 className="text-xl font-bold tracking-tight">Tactical Pro</h1>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                {['Miras', 'Lanternas', 'Mochilas', 'Equipamentos'].map((item) => (
                  <a key={item} href="#" className="text-sm font-medium hover:text-[#2e3e2e] dark:hover:text-[#2e3e2e] transition-colors">
                    {item}
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center bg-[#2e3e2e]/10 dark:bg-[#2e3e2e]/20 rounded-lg px-3 py-1.5 border border-[#2e3e2e]/10">
                <Search className="w-4 h-4 opacity-60 mr-2" />
                <input 
                  type="text" 
                  placeholder="Buscar equipamento..." 
                  className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-500 w-48 outline-none"
                />
              </div>
              <button className="p-2 hover:bg-[#2e3e2e]/10 rounded-lg transition-colors relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#2e3e2e] rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-[#2e3e2e]/10 rounded-lg transition-colors">
                <User className="w-6 h-6" />
              </button>
              <div className="w-8 h-8 rounded-full bg-[#2e3e2e]/20 border border-[#2e3e2e]/30 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiOfUem6DH12OSiWA5CJSG43xpMO8JvsHzrMWjZb-R6VQEWz6_s5d7h0T5tHEiyF0ZDTxDqsrRp_s-ylv-tj2m-lS2hLIFOauyFJ7wf12mSQKDlDV19AdtbFsaFvdHp-we02jY2DSPD5_CSS9reokknpZai1SYf-9ic-i9i7omNTpxm52RWN5wQP9UjnfbT_WNzlRkyZyCm3y4wXpzxUzss5ktA7UQivw1jt-SILnvw1X8yude8vCdZkDuRIERyF6K0Y0nN8lNTuPI" 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                className="md:hidden p-2 hover:bg-[#2e3e2e]/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-[#f7f7f7] dark:bg-[#171b17] border-b border-[#2e3e2e]/20 p-4"
          >
            <nav className="flex flex-col gap-4">
              {['Miras', 'Lanternas', 'Mochilas', 'Equipamentos'].map((item) => (
                <a key={item} href="#" className="text-lg font-medium hover:text-[#2e3e2e] transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="relative rounded-xl overflow-hidden mb-12 group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#171b17]/90 via-[#171b17]/40 to-transparent z-10"></div>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuADRc3tBvjoJbQZRttU8RfnoO8VlITfhAH7yt3r7yDFYCkQ4_iZx1PKFB_RY7JlNJW3D94xNHdoLZDZN9UQz8AkMqJLcf_4G8HxQ4as3EQDgzGf1kQLac3d5r8K3Bm86PSQkA-K2l6Jrcez_NmWvgtxOB-YfszQ3bnmoPmYBA75J7pe4eiJZdmRZ-wh0QsAtvMsDMz3YcQslBxXci0hTp2JHsQME-j4mvA8kLzocSETXZyhg7MAb2z9O74br3WD3zdKvXj0JBAC2hNS" 
            alt="Hero Banner" 
            className="aspect-[21/9] w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-16">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[#2e3e2e] font-bold uppercase tracking-widest text-xs mb-4"
            >
              Lançamento 2024
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white max-w-2xl leading-tight"
            >
              PREPARE-SE PARA QUALQUER MISSÃO
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 mt-4 max-w-lg text-lg"
            >
              Equipamentos testados em campo, projetados para durabilidade extrema e performance absoluta.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex gap-4"
            >
              <button className="bg-[#2e3e2e] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#2e3e2e]/90 transition-all">
                Ver Coleção
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-lg font-bold hover:bg-white/20 transition-all">
                Catálogo PDF
              </button>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Categorias</h3>
            <a href="#" className="text-sm text-[#2e3e2e] font-semibold flex items-center gap-1">
              Ver todas <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button key={cat.name} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-[#2e3e2e]/5 hover:bg-[#2e3e2e]/10 border border-[#2e3e2e]/10 transition-all group">
                <cat.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-tighter">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">Destaques Tactical Pro</h3>
            <div className="flex gap-2">
              <button className="p-2 border border-[#2e3e2e]/20 rounded-lg hover:bg-[#2e3e2e]/5"><Filter className="w-5 h-5" /></button>
              <button className="p-2 border border-[#2e3e2e]/20 rounded-lg hover:bg-[#2e3e2e]/5"><LayoutGrid className="w-5 h-5" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-[#2e3e2e]/5 border border-[#2e3e2e]/10 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-[#2e3e2e]/10 transition-all flex flex-col"
              >
                <div className="relative group">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="aspect-square w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute top-2 right-2 ${product.tagColor} text-white text-[10px] font-bold px-2 py-1 rounded`}>
                    {product.tag}
                  </div>
                  <div className="absolute inset-0 bg-[#171b17]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button className="bg-white text-[#171b17] p-2 rounded-full hover:scale-110 transition-transform"><Eye className="w-5 h-5" /></button>
                    <button className="bg-white text-[#171b17] p-2 rounded-full hover:scale-110 transition-transform"><Heart className="w-5 h-5" /></button>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg leading-tight">{product.name}</h4>
                    <span className="text-[#2e3e2e] font-bold">R$ {product.price}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">
                    {product.description}
                  </p>
                  
                  <div className="space-y-1 mb-6">
                    {product.specs.map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <spec.icon className="w-4 h-4" />
                        <span>{spec.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full bg-[#2e3e2e] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                    <ShoppingBag className="w-5 h-5" />
                    Adicionar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="mt-20 bg-[#2e3e2e]/10 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#2e3e2e]/20">
          <div className="max-w-md text-center md:text-left">
            <h3 className="text-3xl font-bold mb-4">Mantenha-se Operacional</h3>
            <p className="text-slate-400">
              Receba atualizações exclusivas sobre novos carregamentos e equipamentos limitados diretamente no seu e-mail.
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input 
              type="email" 
              placeholder="Seu e-mail tático" 
              className="bg-[#171b17]/50 border border-[#2e3e2e]/20 rounded-lg px-4 py-3 flex-1 md:w-64 focus:ring-2 focus:ring-[#2e3e2e] focus:border-transparent outline-none text-white"
            />
            <button className="bg-[#2e3e2e] text-white px-6 py-3 rounded-lg font-bold hover:brightness-110 transition-all">
              Assinar
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#171b17] border-t border-[#2e3e2e]/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 text-[#2e3e2e] mb-6">
                <Shield className="w-8 h-8" />
                <h1 className="text-xl font-bold tracking-tight text-white">Tactical Pro</h1>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Referência nacional em equipamentos táticos de alta performance. Desenvolvido para quem não aceita falhas.
              </p>
            </div>
            
            <div>
              <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Suporte</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                {['Rastreio de Pedido', 'Garantia Lifetime', 'Trocas e Devoluções', 'Contato Direto'].map((link) => (
                  <li key={link}><a href="#" className="hover:text-[#2e3e2e] transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Institucional</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                {['Sobre Nós', 'Blog Operacional', 'Termos de Uso', 'Privacidade'].map((link) => (
                  <li key={link}><a href="#" className="hover:text-[#2e3e2e] transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Social</h5>
              <div className="flex gap-4">
                {[Share2, Instagram, Youtube].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-10 h-10 rounded-lg bg-[#2e3e2e]/10 flex items-center justify-center hover:bg-[#2e3e2e] transition-colors group">
                    <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-[#2e3e2e]/5 text-center text-xs text-slate-600">
            © 2024 Tactical Pro Professional Equipment. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
