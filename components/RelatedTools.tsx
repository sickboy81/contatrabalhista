import React from 'react';
import { Link } from 'react-router-dom';

const TOOLS = [
    { path: '/', title: 'Rescisão CLT', icon: '❌', desc: 'Cálculo exato da rescisão.' },
    { path: '/salario-liquido', title: 'Salário Líquido', icon: '💰', desc: 'Descontos INSS e IRRF.' },
    { path: '/ferias', title: 'Calculadora de Férias', icon: '🏖️', desc: 'Valor das férias e abono.' },
    { path: '/seguro-desemprego', title: 'Seguro Desemprego', icon: '🛡️', desc: 'Valor e parcelas.' },
    { path: '/hora-extra', title: 'Horas Extras', icon: '⏱️', desc: 'Cálculo com DSR.' },
    { path: '/clt-pj', title: 'CLT vs PJ', icon: '⚖️', desc: 'Comparador de contratos.' },
    { path: '/domestico', title: 'Empregada Doméstica', icon: '🏠', desc: 'Cálculo completo PEC.' },
    { path: '/mei-monitor', title: 'Monitor MEI', icon: '🏢', desc: 'Limite de faturamento.' },
    { path: '/fgts', title: 'Simulador FGTS', icon: '🏦', desc: 'Saque Aniversário.' },
    { path: '/sobrevivencia', title: 'Sobrevivência', icon: '🔋', desc: 'Planejamento financeiro.' },
];

interface Props {
    current: string; // The current route path to exclude
}

const RelatedTools: React.FC<Props> = ({ current }) => {
    // Advanced Logic: 
    // 1. Always filter out current page
    // 2. To ensure all tools get visibility, we rotate the starting point based on the current page length (pseudo-random but deterministic)
    // This helps crawling deep pages instead of always showing the same top 3.
    
    const available = TOOLS.filter(t => t.path !== current && t.path !== '/' + current);
    
    // Pseudo-shuffle based on current page string length to vary suggestions
    const startIndex = current.length % available.length;
    const rotated = [...available.slice(startIndex), ...available.slice(0, startIndex)];
    
    const related = rotated.slice(0, 3);
    
    return (
        <div className="mt-12 mb-8 no-print border-t border-slate-200 pt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Ferramentas Recomendadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map(tool => (
                    <Link key={tool.path} to={tool.path} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-slate-50 text-xl w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">{tool.icon}</span>
                            <h4 className="font-bold text-gray-800 group-hover:text-brand-600 transition-colors">{tool.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500 mt-auto">{tool.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedTools;