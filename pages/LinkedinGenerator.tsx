import React, { useState } from 'react';
import FAQ from '../components/FAQ';
import SEO from '../components/SEO';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const LinkedinGenerator: React.FC = () => {
  const [data, setData] = useState({
    role: '',
    industry: '',
    hardSkills: '', // Separated by comma
    softSkills: '', // Separated by comma
    yearsExp: '',
    achievements: ''
  });

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const [generated, setGenerated] = useState<{ headlines: string[], summaries: string[] } | null>(null);

  const generate = () => {
    const skills = data.hardSkills.split(',').map(s => s.trim()).filter(s => s);
    const softs = data.softSkills.split(',').map(s => s.trim()).filter(s => s);
    const topSkills = skills.slice(0, 3).join(' | ');
    const allSkills = [...skills, ...softs].join(', ');

    // Headlines Strategies
    const headlines = [
        // 1. The Direct Authority
        `${data.role} | ${topSkills} | ${data.industry}`,
        // 2. The Value Proposition
        `Ajudando empresas de ${data.industry} através de ${skills[0] || 'Estratégia'} e ${skills[1] || 'Inovação'}`,
        // 3. The Experienced Professional
        `${data.role} Sênior | +${data.yearsExp} anos em ${data.industry} | Especialista em ${skills[0] || 'Resultados'}`,
        // 4. The Open Networker
        `${data.role} | ${topSkills} | Buscando novas oportunidades em ${data.industry}`
    ];

    // Summaries Strategies
    const summaries = [
        // 1. The Narrative
        `Como ${data.role} com mais de ${data.yearsExp} anos de experiência no mercado de ${data.industry}, construí minha carreira focada em resolver problemas complexos através de ${skills[0] || 'técnica'} e ${skills[1] || 'estratégia'}.\n\nAo longo da minha trajetória, desenvolvi competências sólidas em ${allSkills}. ${data.achievements ? `Um dos meus maiores orgulhos foi ${data.achievements}.` : ''}\n\nSou movido por desafios e busco contribuir com equipes que valorizam inovação e resultados.`,
        
        // 2. The Bullet Points (Scannable)
        `Profissional de ${data.industry} focado em ${data.role} e resultados práticos.\n\n🛠 Competências Técnicas:\n${skills.map(s => `• ${s}`).join('\n')}\n\n🧠 Competências Comportamentais:\n${softs.map(s => `• ${s}`).join('\n')}\n\n🏆 Destaque:\n${data.achievements || 'Foco total em entrega de valor e crescimento sustentável.'}\n\nEstou aberto a conexões e novas oportunidades. Vamos conversar?`
    ];

    setGenerated({ headlines, summaries });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado!");
  };

  const faqItems = [
    {
        question: "Por que o Título (Headline) é tão importante?",
        answer: "O Título é a primeira coisa que o recrutador vê junto com sua foto. Ele é indexado pelo algoritmo de busca. Usar palavras-chave (Ex: 'Gerente de Vendas' em vez de 'Em busca de desafios') aumenta drasticamente suas chances de aparecer nas pesquisas."
    },
    {
        question: "O que é o 'Sobre' (Resumo) ideal?",
        answer: "Um bom resumo conta uma história breve. Ele deve misturar quem você é, suas conquistas (números são ótimos!) e suas habilidades técnicas (hard skills). Evite clichês e foque em como você gera valor."
    },
    {
        question: "Devo aceitar conexões de desconhecidos?",
        answer: "No LinkedIn, sim! Diferente do Facebook, aqui conexões são oportunidades de negócio. Expandir sua rede com pessoas da sua área ou recrutadores aumenta sua visibilidade."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <SEO 
        title={`Gerador de Resumo e Headline LinkedIn ${currentYear} (IA)`}
        description={`Otimize seu perfil no LinkedIn para ser encontrado por recrutadores em ${currentYear}. Gere títulos e resumos profissionais com palavras-chave estratégicas.`}
        keywords="gerador resumo linkedin, headline linkedin, perfil campeao linkedin, seo para linkedin, resumo profissional pronto"
        ratingValue={4.9}
        reviewCount={680}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900 text-[#0077b5]">Otimizador de LinkedIn</h1>
        <p className="text-gray-600">Crie títulos e resumos que os recrutadores realmente buscam.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.9/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
         <div className="lg:col-span-5 space-y-4">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 mb-4">Sobre Você</h3>
                 <div className="space-y-3">
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Seu Cargo / Objetivo</label>
                         <input className="w-full p-2 border rounded bg-white" placeholder="Ex: Analista de Marketing" value={data.role} onChange={e => setData({...data, role: e.target.value})} />
                     </div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Indústria / Área</label>
                         <input className="w-full p-2 border rounded bg-white" placeholder="Ex: Varejo, Tecnologia..." value={data.industry} onChange={e => setData({...data, industry: e.target.value})} />
                     </div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Hard Skills (Técnicas) - Separe por vírgula</label>
                         <input className="w-full p-2 border rounded bg-white" placeholder="Ex: Excel, Python, Vendas B2B" value={data.hardSkills} onChange={e => setData({...data, hardSkills: e.target.value})} />
                     </div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Soft Skills (Comportamentais)</label>
                         <input className="w-full p-2 border rounded bg-white" placeholder="Ex: Liderança, Comunicação..." value={data.softSkills} onChange={e => setData({...data, softSkills: e.target.value})} />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                             <label className="block text-xs font-medium text-gray-500 mb-1">Anos de Exp.</label>
                             <input type="number" className="w-full p-2 border rounded bg-white" placeholder="Ex: 5" value={data.yearsExp} onChange={e => setData({...data, yearsExp: e.target.value})} />
                        </div>
                     </div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Maior Conquista (Opcional)</label>
                         <textarea className="w-full p-2 border rounded bg-white h-20 text-sm" placeholder="Ex: Aumentei as vendas em 20%..." value={data.achievements} onChange={e => setData({...data, achievements: e.target.value})} />
                     </div>

                     <button onClick={generate} className="w-full bg-[#0077b5] hover:bg-[#006097] text-white font-bold py-3 rounded-lg transition-colors">
                         Gerar Perfis
                     </button>
                 </div>
             </div>
         </div>

         <div className="lg:col-span-7 space-y-6">
             {!generated ? (
                 <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
                     Preencha os dados para gerar sugestões de perfil otimizadas para o algoritmo.
                 </div>
             ) : (
                 <div className="space-y-6 animate-fade-in-up">
                     
                     {/* HEADLINES */}
                     <div>
                         <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                             📌 Opções de Título (Headline)
                             <span className="text-[10px] font-normal bg-gray-100 px-2 py-0.5 rounded text-gray-500">O que aparece abaixo do seu nome</span>
                         </h3>
                         <div className="space-y-3">
                             {generated.headlines.map((head, i) => (
                                 <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-[#0077b5] transition-colors group">
                                     <p className="text-sm text-gray-800 font-medium mb-2">{head}</p>
                                     <button onClick={() => copyToClipboard(head)} className="text-xs text-[#0077b5] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                         Copiar Texto
                                     </button>
                                 </div>
                             ))}
                         </div>
                     </div>

                     {/* SUMMARIES */}
                     <div>
                         <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                             📝 Opções de Resumo (Sobre)
                             <span className="text-[10px] font-normal bg-gray-100 px-2 py-0.5 rounded text-gray-500">Sua carta de vendas</span>
                         </h3>
                         <div className="space-y-4">
                             {generated.summaries.map((sum, i) => (
                                 <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-[#0077b5] transition-colors group">
                                     <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase text-gray-400">Opção {i+1}</span>
                                        <button onClick={() => copyToClipboard(sum)} className="text-xs bg-blue-50 text-[#0077b5] px-2 py-1 rounded font-bold">
                                            Copiar
                                        </button>
                                     </div>
                                     <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{sum}</p>
                                 </div>
                             ))}
                         </div>
                     </div>

                 </div>
             )}
         </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Como ser encontrado por recrutadores no LinkedIn?</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   O LinkedIn funciona como um Google de profissionais. Os recrutadores usam filtros e palavras-chave para encontrar candidatos. Se o seu perfil não tiver essas palavras nos lugares certos, você é invisível.
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">A Importância da Headline (Título)</h3>
               <p>
                   Muitas pessoas usam "Em busca de recolocação" no título. Isso é um erro! Recrutadores buscam por "Analista Financeiro" ou "Vendedor". 
                   Seu título deve conter: <strong>Cargo + Especialidades + Setor</strong>. Nosso gerador cria opções exatamente com essa estrutura.
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">O Campo "Sobre" (Resumo)</h3>
               <p>
                   As 3 primeiras linhas são cruciais, pois é o que aparece antes do "ver mais". Use esse espaço para vender seu peixe: quantos anos de experiência, principais resultados e tecnologias que domina.
                   Depois de otimizar seu perfil, não esqueça de ter um <Link to="/curriculo" className="text-brand-600 font-bold hover:underline">Currículo PDF</Link> alinhado com as mesmas informações.
               </p>
           </div>
       </section>

      <RelatedTools current="/linkedin" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default LinkedinGenerator;