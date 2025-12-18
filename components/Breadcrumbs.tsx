import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const routeNameMap: Record<string, string> = {
  '': 'Início',
  'seguro-desemprego': 'Seguro Desemprego',
  'ferias': 'Calculadora de Férias',
  'salario-liquido': 'Salário Líquido',
  'clt-pj': 'Comparador CLT vs PJ',
  'hora-extra': 'Horas Extras',
  'comprovante-renda': 'Gerador de Renda',
  'ponto': 'Folha de Ponto',
  'investimentos': 'Investimentos',
  'fgts': 'Simulador FGTS',
  'melhor-data': 'Melhor Data Demissão',
  'domestico': 'Empregada Doméstica',
  'quiz-direitos': 'Quiz Direitos',
  'checklist-homologacao': 'Checklist Homologação',
  'sobrevivencia': 'Sobrevivência Financeira',
  'curriculo': 'Gerador de Currículo',
  'gerador-recibo': 'Gerador de Recibo',
  'carta-demissao': 'Carta de Demissão',
  'linkedin': 'Gerador LinkedIn',
  'mei-monitor': 'Monitor MEI',
  'assistente': 'Assistente Virtual',
  'mapa-do-site': 'Mapa do Site',
  'glossario': 'Dicionário Trabalhista',
  'privacidade': 'Política de Privacidade',
  'termos': 'Termos de Uso'
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/') return null;

  // Schema.org BreadcrumbList
  const baseUrl = 'https://contatrabalhista.com.br';
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": `${baseUrl}/`
      },
      ...pathnames.map((name, index) => {
        const path = `/${pathnames.slice(0, index + 1).join('/')}`;
        return {
          "@type": "ListItem",
          "position": index + 2,
          "name": routeNameMap[name] || name,
          "item": `${baseUrl}${path}`
        };
      })
    ]
  };

  return (
    <nav className="text-sm mb-6 no-print" aria-label="Breadcrumb">
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} 
      />
      <ol className="list-none p-0 inline-flex">
        <li className="flex items-center">
          <Link to="/" className="text-slate-500 hover:text-brand-600 transition-colors">Início</Link>
          <svg className="fill-current w-3 h-3 mx-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const name = routeNameMap[value] || value;

          return (
            <li key={to} className="flex items-center">
              {last ? (
                <span className="text-brand-600 font-medium" aria-current="page">{name}</span>
              ) : (
                <>
                  <Link to={to} className="text-slate-500 hover:text-brand-600 transition-colors">{name}</Link>
                  <svg className="fill-current w-3 h-3 mx-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;