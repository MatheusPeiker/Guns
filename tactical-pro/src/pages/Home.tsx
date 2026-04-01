import React from 'react';
import { ArrowRight, Truck, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductScrollExploded from '../components/ProductScrollExploded';
import InteractiveVideoCard from '../components/InteractiveVideoCard';

const categories = [
  { slug: 'transporte', name: 'Transporte', icon: Truck },
  { slug: 'acessorios', name: 'Acessórios', icon: Settings },
];

const videoProducts = [
  {
    id: 1,
    slug: 'miras',
    name: 'Miras Ópticas',
    description: 'Sistemas inteligentes de aquisição rápida de alvo com retículos iluminados em múltiplos níveis. Resposta tática impecável em qualquer ambiente.',
    videoSrc: '/assets/ROVER/MIRA.mp4',
    tag: 'PRECISÃO EXTREMA'
  },
  {
    id: 2,
    slug: 'lanternas',
    name: 'Lanternas Táticas',
    description: 'Lumens de potência extremas com foco ajustável. Iluminação tática para cegar e dominar o ambiente mesmo na escuridão total.',
    videoSrc: '/assets/ROVER/LANTERNA.mp4',
    tag: 'ILUMINAÇÃO TÁTICA'
  },
  {
    id: 3,
    slug: 'cases',
    name: 'Cases & Proteção',
    description: 'Armazenamento blindado para o seu equipamento. Proteção termo-moldada com sistema de vedação total para máxima segurança no transporte operacional.',
    videoSrc: '/assets/ROVER/CASES.mp4',
    tag: 'BLINDAGEM NÍVEL 5'
  }
];

export default function Home() {
  return (
    <>
      <div className="bg-[#050505] w-full relative z-40">
         <ProductScrollExploded />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">Categorias Principais</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoProducts.map((product) => (
              <InteractiveVideoCard 
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                videoSrc={product.videoSrc}
                tag={product.tag}
                slug={product.slug}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Outros Departamentos</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Link to={`/categoria/${cat.slug}`} key={cat.name} className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
                <cat.icon className="w-10 h-10 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-tighter">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-20 bg-white/10 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/20">
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
              className="bg-[#050505]/50 border border-white/20 rounded-lg px-4 py-3 flex-1 md:w-64 focus:ring-2 focus:ring-[#2e3e2e] focus:border-transparent outline-none text-white"
            />
            <button className="bg-[#2e3e2e] text-white px-6 py-3 rounded-lg font-bold hover:brightness-110 transition-all">
              Assinar
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
