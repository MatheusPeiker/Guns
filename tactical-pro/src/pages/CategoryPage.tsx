import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Hexagon } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  
  // Format slug to readable title
  const title = slug ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Categoria';

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar a Base
        </Link>
        
        <div className="relative border border-white/10 bg-white/5 p-12 rounded-2xl flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />
          <Hexagon className="w-16 h-16 text-white/20 mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4 text-[#00FF00]">
            {title}
          </h1>
          <p className="text-slate-400 max-w-lg mb-8">
            Você entrou na área operacional de {title}. Equipamentos de grau militar sendo carregados pro banco de dados em breve.
          </p>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-mono font-bold tracking-widest text-[#00FF00] border border-[#00FF00]/30 animate-pulse">
              STATUS: SCANNING INVENTORY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
