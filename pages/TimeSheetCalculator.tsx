import React, { useState } from 'react';
import Tooltip from '../components/Tooltip';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const TimeSheetCalculator: React.FC = () => {
  const [entryTime, setEntryTime] = useState('08:00');
  const [lunchTime, setLunchTime] = useState('12:00');
  const [lunchDuration, setLunchDuration] = useState(60); // minutes
  const [workHours, setWorkHours] = useState(8);
  const [workMinutes, setWorkMinutes] = useState(48); // Standard 8h48 for 44h week (Mon-Fri) or 8h00

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const calculateSchedule = () => {
    // Helper to convert HH:MM to minutes
    const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    // Helper to convert minutes to HH:MM
    const toTimeStr = (totalMinutes: number) => {
        let h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        if (h >= 24) h = h - 24;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const entryMin = toMinutes(entryTime);
    const lunchStartMin = toMinutes(lunchTime);
    
    // Calculate Return from Lunch
    const lunchReturnMin = lunchStartMin + Number(lunchDuration);
    
    // Calculate Exit Time
    // Total Work Minutes needed = workHours * 60 + workMinutes
    const totalWorkNeeded = Number(workHours) * 60 + Number(workMinutes);
    
    // Time worked before lunch
    const morningWork = lunchStartMin - entryMin;
    
    // Remaining work needed
    const remainingWork = totalWorkNeeded - morningWork;
    
    // Exit Time
    const exitMin = lunchReturnMin + remainingWork;

    return {
        lunchReturn: toTimeStr(lunchReturnMin),
        exitTime: toTimeStr(exitMin)
    };
  };

  const schedule = calculateSchedule();

  const faqItems = [
    {
        question: "Qual é a tolerância para atrasos no ponto?",
        answer: "Pelo artigo 58 da CLT, existe uma tolerância de <strong>5 a 10 minutos</strong> diários (somando entrada e saída) que não são descontados do salário e nem contam como hora extra."
    },
    {
        question: "Sou obrigado a tirar 1 hora de almoço?",
        answer: "Para jornadas acima de 6 horas diárias, a concessão de um intervalo de repouso/alimentação de no mínimo 1 hora é obrigatória. Em alguns casos específicos previstos em convenção coletiva, pode ser reduzido para 30 minutos."
    },
    {
        question: "Quantas horas posso trabalhar por dia no máximo?",
        answer: "A jornada normal é de até 8 horas diárias. Com horas extras, o limite máximo é de 10 horas trabalhadas por dia (2 horas extras), salvo regimes especiais de escala (como 12x36)."
    },
    {
        question: "A empresa pode proibir bater o ponto na volta do almoço?",
        answer: "Algumas empresas usam a 'pré-assinalação' do intervalo, onde o horário de almoço já vem preenchido. Isso é legal. Porém, se você realmente trabalhar durante o almoço ou voltar antes, deve ter o direito de marcar o horário real."
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <SEO 
        title={`Calculadora de Ponto e Hora de Almoço ${currentYear}`}
        description="Não se atrase na volta do almoço. Calcule exatamente que horas você deve voltar e que horas termina seu expediente de trabalho."
        keywords="calculadora de ponto, calcular hora almoço, horario de saida, folha de ponto, jornada de trabalho"
        ratingValue={4.6}
        reviewCount={620}
      />

      <h1 className="text-2xl md:text-3xl font-bold text-brand-900 mb-2 text-center">Calculadora de Ponto</h1>
      <p className="text-center text-gray-600 mb-2 text-sm md:text-base">Saiba exatamente a hora de voltar do almoço e a hora de sair.</p>
      <div className="flex justify-center items-center gap-1 mb-8 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.6/5)</span>
      </div>

      <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg border border-gray-100">
         <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
             <div>
                 <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Hora de Entrada</label>
                 <input 
                    type="time" 
                    className="w-full p-2 md:p-4 text-xl md:text-2xl border rounded-lg text-center bg-white focus:ring-2 focus:ring-brand-500 outline-none" 
                    value={entryTime} 
                    onChange={e => setEntryTime(e.target.value)} 
                 />
             </div>
             <div>
                 <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Saída para Almoço</label>
                 <input 
                    type="time" 
                    className="w-full p-2 md:p-4 text-xl md:text-2xl border rounded-lg text-center bg-white focus:ring-2 focus:ring-brand-500 outline-none" 
                    value={lunchTime} 
                    onChange={e => setLunchTime(e.target.value)} 
                 />
             </div>
         </div>

         <div className="bg-gray-50 p-4 rounded-lg mb-8 grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs text-gray-500 mb-1">Duração do Almoço (min)</label>
                <input 
                    type="number" 
                    className="w-full p-2 border rounded bg-white" 
                    value={lunchDuration} 
                    onChange={e => setLunchDuration(Number(e.target.value))} 
                />
             </div>
             <div>
                <label className="block text-xs text-gray-500 mb-1">
                    <Tooltip termKey="jornada_mensal">Jornada Diária (H:Min)</Tooltip>
                </label>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        className="w-full p-2 border rounded bg-white" 
                        value={workHours} 
                        onChange={e => setWorkHours(Number(e.target.value))} 
                        placeholder="Horas"
                    />
                    <input 
                        type="number" 
                        className="w-full p-2 border rounded bg-white" 
                        value={workMinutes} 
                        onChange={e => setWorkMinutes(Number(e.target.value))} 
                        placeholder="Min"
                    />
                </div>
             </div>
         </div>

         <div className="grid grid-cols-2 gap-4 md:gap-8 text-center border-t pt-8">
             <div>
                 <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider mb-1">Volta do Almoço</p>
                 <p className="text-2xl md:text-4xl font-bold text-gray-800">{schedule.lunchReturn}</p>
             </div>
             <div>
                 <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider mb-1">Hora da Saída</p>
                 <p className="text-2xl md:text-4xl font-bold text-brand-600">{schedule.exitTime}</p>
             </div>
         </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Regras de Ponto e Tolerância {currentYear}</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   O controle de ponto é obrigatório para empresas com mais de 20 funcionários, mas recomendado para todas para evitar passivos trabalhistas. A marcação correta dos horários de entrada, intervalo e saída é fundamental.
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">A regra dos 5/10 Minutos (Art. 58 CLT)</h3>
               <p>
                   Muitos trabalhadores desconhecem essa regra. O Artigo 58 da CLT estabelece que não serão descontadas nem computadas como jornada extraordinária as variações de horário no registro de ponto não excedentes a <strong>cinco minutos</strong>, observado o limite máximo de <strong>dez minutos diários</strong>.
               </p>
               <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border-l-4 border-blue-500">
                   <strong>Exemplo Prático:</strong><br/>
                   Se você entra às 08:00 e marca 08:04, não desconta.<br/>
                   Se você sai às 17:00 e marca 17:04, não é hora extra.<br/>
                   <strong>Mas atenção:</strong> Se você marcar 08:06, você perde a tolerância e os 6 minutos são descontados (ou contam como extra, dependendo do caso).
               </div>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Intervalo de Almoço (Intrajornada)</h3>
               <p>
                   Para quem trabalha mais de 6 horas, o intervalo mínimo é de 1 hora. Se a empresa não conceder esse tempo integralmente (ex: você só tirou 40 minutos), ela deve pagar o tempo suprimido (20 minutos) como hora extra com adicional de 50%.
               </p>
           </div>
       </section>

      <RelatedTools current="/ponto" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default TimeSheetCalculator;