import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const ITEMS = [
    { id: 'ctps', text: 'Carteira de Trabalho (Digital ou Física) atualizada' },
    { id: 'trct', text: 'Termo de Rescisão de Contrato de Trabalho (TRCT) em 3 vias' },
    { id: 'aso', text: 'Atestado de Saúde Ocupacional (Exame Demissional)' },
    { id: 'fgts_key', text: 'Chave de Conectividade Social (para saque do FGTS)' },
    { id: 'fgts_extract', text: 'Extrato analítico da conta do FGTS' },
    { id: 'grrf', text: 'Comprovante do pagamento da Multa do FGTS (GRRF)' },
    { id: 'insurance', text: 'Guias de Requerimento do Seguro Desemprego (CD/SD)' },
    { id: 'pppp', text: 'Perfil Profissiográfico Previdenciário (PPP) - Se aplicável' },
    { id: 'letter', text: 'Carta de Preposto (se a empresa mandou representante)' }
];

const HomologationChecklist: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  useEffect(() => {
    const saved = localStorage.getItem('homologationChecklist');
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  const toggle = (id: string) => {
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(next);
    localStorage.setItem('homologationChecklist', JSON.stringify(next));
  };

  const progress = Math.round((Object.values(checkedItems).filter(Boolean).length / ITEMS.length) * 100);

  const faqItems = [
    {
        question: "A homologação no sindicato é obrigatória?",
        answer: "Com a Reforma Trabalhista de 2017, a homologação no sindicato deixou de ser obrigatória, independente do tempo de casa. A rescisão pode ser feita na própria empresa. Contudo, verifique a Convenção Coletiva da sua categoria, pois ela pode exigir a homologação sindical."
    },
    {
        question: "Quando devo fazer o exame demissional?",
        answer: "O exame demissional deve ser feito até a data da homologação (assinatura da rescisão), desde que o último exame médico ocupacional tenha sido realizado há mais de 135 dias (empresas de grau de risco 1 e 2) ou 90 dias (grau de risco 3 e 4)."
    },
    {
        question: "A empresa não pagou a rescisão, o que fazer?",
        answer: "Se a empresa não pagar em até 10 dias, você tem direito a uma multa no valor de um salário (Art. 477 da CLT). Se o atraso persistir, procure o sindicato da categoria ou um advogado trabalhista para entrar com uma ação."
    }
  ];

  return (
    <div className="max-w-xl mx-auto">
      <SEO 
        title={`Checklist Homologação e Rescisão ${currentYear} - Documentos Necessários`}
        description={`Lista completa do que levar no dia da homologação em ${currentYear}. Não esqueça a Carteira de Trabalho, chaves do FGTS e exames demissionais.`}
        keywords={`checklist homologação ${currentYear}, documentos rescisão, o que levar homologação, documentos demissão`}
        ratingValue={4.8}
        reviewCount={310}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Checklist da Homologação</h1>
        <p className="text-gray-600">Não esqueça nada no dia de assinar a rescisão.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.8/5)</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
         <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso</span>
                <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
               <div className="bg-brand-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
         </div>

         <div className="divide-y divide-gray-100">
             {ITEMS.map(item => (
                 <div 
                    key={item.id} 
                    onClick={() => toggle(item.id)}
                    className="p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                 >
                    <div className={`mt-1 w-6 h-6 rounded border flex items-center justify-center transition-colors ${checkedItems[item.id] ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}>
                        {checkedItems[item.id] && (
                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                    </div>
                    <div className={`flex-1 text-sm ${checkedItems[item.id] ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>
                        {item.text}
                    </div>
                 </div>
             ))}
         </div>

         <div className="bg-brand-50 p-6 text-center">
             <p className="text-xs text-brand-700 font-medium">
                💡 Dica: Leve uma caneta azul ou preta e confira os valores na <Link to="/" className="underline">Calculadora de Rescisão</Link> antes de assinar. 
                Se algo estiver errado, faça uma "Ressalva" no verso do documento.
             </p>
         </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Guia: O Dia da Homologação em {currentYear}</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   A homologação é o ato formal de conferência e quitação das verbas rescisórias. É o momento em que o trabalhador assina o TRCT (Termo de Rescisão) e recebe seus direitos.
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Fim da Obrigatoriedade Sindical</h3>
               <p>
                   Antes da Reforma Trabalhista de 2017, contratos com mais de 1 ano exigiam homologação no sindicato. Hoje, a lei permite que a rescisão seja feita na própria empresa, independente do tempo de casa.
                   <strong>Porém</strong>, muitos sindicatos mantêm essa exigência em Convenção Coletiva. Vale a pena conferir.
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Multa do Artigo 477 (Atraso)</h3>
               <p>
                   A empresa tem prazos rígidos. O pagamento das verbas e a entrega dos documentos (para saque do <Link to="/fgts" className="text-brand-600 font-bold hover:underline">FGTS</Link> e Seguro) deve ocorrer em até <strong>10 dias corridos</strong> após o fim do contrato.
               </p>
               <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 my-4">
                   <p className="font-bold text-red-800">Atrasou?</p>
                   <p className="text-sm text-red-700 mt-1">Se a empresa perder esse prazo, ela deve pagar uma multa a favor do empregado no valor de <strong>um salário nominal</strong>.</p>
               </div>
           </div>
       </section>

      <RelatedTools current="/checklist-homologacao" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default HomologationChecklist;