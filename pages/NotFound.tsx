import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <SEO 
        title="Página não encontrada (Erro 404)"
        description="A página que você está procurando não existe."
        noIndex={true}
      />
      
      <div className="bg-slate-100 p-6 rounded-full mb-6 animate-bounce">
        <span className="text-6xl">🧭</span>
      </div>
      
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Ops! Página não encontrada.</h1>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        Parece que você se perdeu nas contas. A página que você tentou acessar não existe ou foi movida.
      </p>

      <div className="grid gap-4 w-full max-w-sm">
        <Link 
          to="/" 
          className="bg-brand-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
        >
          Ir para Calculadora de Rescisão
        </Link>
        
        <Link 
          to="/mapa-do-site" 
          className="bg-white text-slate-700 font-bold py-3 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Ver Todas as Ferramentas
        </Link>
      </div>
    </div>
  );
};

export default NotFound;