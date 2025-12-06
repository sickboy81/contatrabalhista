import React, { useMemo } from 'react';
import SEO from '../components/SEO';
import { GLOSSARY } from '../utils/glossary';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

// Mapeamento de termos para ferramentas (Link Building Interno)
const TERM_LINKS: Record<string, string> = {
    'aviso_previo': '/',
    'multa_fgts': '/fgts',
    'saldo_fgts': '/fgts',
    'rescisao': '/',
    'motivo_rescisao': '/',
    'ferias_vencidas': '/ferias',
    'ferias_proporcionais': '/ferias',
    'abono_pecuniario': '/ferias',
    'terco_constitucional': '/ferias',
    'decimo_terceiro': '/salario-liquido',
    'seguro_desemprego': '/seguro-desemprego',
    'ultimos_salarios': '/seguro-desemprego',
    'hora_extra': '/hora-extra',
    'adicional_noturno': '/adicional-noturno',
    'dsr': '/ponto',
    'jornada_mensal': '/ponto',
    'esocial_domestico': '/domestico',
    'saque_aniversario': '/fgts',
    'imposto_pj': '/clt-pj',
    'inss': '/salario-liquido',
    'irrf': '/salario-liquido',
};

const GlossaryPage: React.FC = () => {
  const groupedTerms = useMemo(() => {
    const groups: Record<string, [string, string, string][]> = {}; // [Term Name, Description, Key]
    
    Object.entries(GLOSSARY).forEach(([key, description]) => {
      const term = key.replace(/_/g, ' ');
      const letter = term.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push([term, description, key]);
    });

    // Sort keys
    return Object.keys(groups).sort().reduce((acc, key) => {
        acc[key] = groups[key].sort((a, b) => a[0].localeCompare(b[0]));
        return acc;
    }, {} as Record<string, [string, string, string][]>);
  }, []);

  const letters = Object.keys(groupedTerms);

  // Generate Structured Data for Google (Rich Snippets for Definitions)
  const glossarySchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "Dicionário Trabalhista e CLT",
    "description": "Glossário de termos técnicos da legislação trabalhista brasileira explicado pelo Conta Trabalhista.",
    "hasDefinedTerm": Object.entries(GLOSSARY).map(([key, description]) => ({
      "@type": "DefinedTerm",
      "termCode": key,
      "name": key.replace(/_/g, ' '),
      "description": description
    }))
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <SEO 
        title="Dicionário Trabalhista A-Z - Glossário da CLT"
        description="Entenda o significado de Aviso Prévio, Saldo de Salário, Multa do FGTS e outros termos difíceis da CLT. Guia completo do Conta Trabalhista."
        keywords="glossário clt, dicionario trabalhista, termos rescisão, o que é aviso previo, fgts significado"
        schemas={[glossarySchema]}
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-brand-900 mb-2">Dicionário do Trabalhador</h1>
        <p className="text-gray-600">A tradução do "juridiquês" para o português claro.</p>
      </div>

      {/* A-Z Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 sticky top-20 z-10 bg-slate-50/95 backdrop-blur p-4 rounded-xl border border-slate-200 shadow-sm no-print">
          {letters.map(letter => (
              <a 
                key={letter} 
                href={`#letter-${letter}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm bg-white text-slate-600 border border-slate-200 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all"
              >
                  {letter}
              </a>
          ))}
      </div>

      <div className="space-y-12">
        {letters.map(letter => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-36">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-4xl font-black text-slate-200 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-100">
                        {letter}
                    </h2>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    {groupedTerms[letter].map(([term, description, key]) => (
                        <div key={key} className="bg-white p-6 rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all group flex flex-col">
                            <h3 className="text-lg font-bold text-brand-700 mb-2 capitalize group-hover:text-brand-600">
                                {term}
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
                                {description}
                            </p>
                            
                            {/* Internal Link Injection */}
                            {TERM_LINKS[key] && (
                                <Link 
                                    to={TERM_LINKS[key]} 
                                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 uppercase tracking-wider mt-auto pt-4 border-t border-slate-50"
                                >
                                    Simular {term} 
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        ))}
      </div>

      <div className="bg-slate-50 p-8 rounded-2xl text-center text-sm text-slate-500 border border-slate-200 mt-12">
          <p>Este glossário é mantido pela equipe do <strong>Conta Trabalhista</strong> e atualizado constantemente com base nas novas regras da CLT e nas dúvidas mais frequentes dos nossos usuários.</p>
      </div>

      <RelatedTools current="/glossario" />
    </div>
  );
};

export default GlossaryPage;