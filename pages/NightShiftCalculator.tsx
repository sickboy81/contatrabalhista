import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/calculations';
import Tooltip from '../components/Tooltip';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const NightShiftCalculator: React.FC = () => {
  const [salary, setSalary] = useState(3000);
  const [hours, setHours] = useState(40); // Monthly night hours
  const [rate, setRate] = useState(20); // 20% Urban, 25% Rural
  const [applyReducedHour, setApplyReducedHour] = useState(true);
  const [monthlyDivisor, setMonthlyDivisor] = useState(220);

  const calculate = () => {
    // 1. Calculate Hourly Rate
    const hourlyRate = salary / monthlyDivisor;

    // 2. Calculate Reduced Hours (Hora Ficta)
    // 1 normal hour = 52m 30s night hour (ratio 60 / 52.5 = 1.142857)
    const effectiveHours = applyReducedHour ? hours * (60 / 52.5) : hours;

    // 3. Calculate Allowance Value
    const allowanceTotal = effectiveHours * hourlyRate * (rate / 100);

    // 4. Calculate DSR (Estimate 20% or 5 sundays / 25 work days)
    const dsrValue = allowanceTotal * 0.20;

    return {
        hourlyRate,
        effectiveHours,
        allowanceTotal,
        dsrValue,
        total: allowanceTotal + dsrValue
    };
  };

  const [result, setResult] = useState<any>(calculate());

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  useEffect(() => {
    setResult(calculate());
  }, [salary, hours, rate, applyReducedHour, monthlyDivisor]);

  const faqItems = [
    {
        question: "Qual o horário do adicional noturno?",
        answer: "Para trabalhadores urbanos, o horário noturno vai das <strong>22h às 05h</strong> do dia seguinte. Para trabalhadores rurais (lavoura), é das 21h às 05h, e na pecuária, das 20h às 04h."
    },
    {
        question: "O que é a hora noturna reduzida?",
        answer: "A lei considera que o trabalho noturno é mais desgastante. Por isso, <strong>1 hora relógio equivale a 52 minutos e 30 segundos</strong> de trabalho. Na prática, se você trabalha 7 horas no relógio entre 22h e 05h, recebe como se tivesse trabalhado 8 horas."
    },
    {
        question: "Adicional noturno integra o salário?",
        answer: "Sim. Se pago com habitualidade, o adicional noturno reflete em Férias, 13º Salário, FGTS, Aviso Prévio e DSR (Descanso Semanal Remunerado)."
    },
    {
        question: "Se eu trabalhar além das 05h, continuo recebendo?",
        answer: "Sim. A Súmula 60 do TST garante que, se a jornada noturna for cumprida integralmente e prorrogada (ex: entra às 22h e sai às 07h), as horas após as 05h também devem ser pagas com adicional noturno."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <SEO 
        title={`Calculadora de Adicional Noturno ${currentYear} (Hora Reduzida)`}
        description={`Calcule o valor exato do seu adicional noturno em ${currentYear}. Inclui cálculo da hora reduzida (52m30s), reflexo no DSR e salário total.`}
        keywords={`calcular adicional noturno ${currentYear}, hora noturna reduzida, valor hora noturna, calculo adicional noturno`}
        ratingValue={4.8}
        reviewCount={890}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Calculadora de Adicional Noturno</h1>
        <p className="text-gray-600">Simule quanto você deve receber pelo trabalho entre 22h e 05h.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.8/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Inputs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
              <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Dados do Trabalho</h3>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Tooltip termKey="salario_base">Salário Base</Tooltip>
                  </label>
                  <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400">R$</span>
                      <input 
                        type="number" 
                        className="w-full p-2 pl-10 border rounded-lg bg-white font-semibold text-gray-800 focus:ring-2 focus:ring-brand-500" 
                        value={salary} 
                        onChange={e => setSalary(Number(e.target.value))} 
                      />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horas Noturnas/Mês</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-brand-500" 
                        value={hours} 
                        onChange={e => setHours(Number(e.target.value))} 
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Horas de relógio trabalhadas</p>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jornada Divisor</label>
                      <select 
                        className="w-full p-2 border rounded-lg bg-white"
                        value={monthlyDivisor}
                        onChange={e => setMonthlyDivisor(Number(e.target.value))}
                      >
                          <option value={220}>220 (44h sem)</option>
                          <option value={200}>200 (40h sem)</option>
                          <option value={180}>180 (36h sem)</option>
                      </select>
                  </div>
              </div>

              <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                      <input 
                        type="checkbox" 
                        id="reduced" 
                        checked={applyReducedHour} 
                        onChange={e => setApplyReducedHour(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <label htmlFor="reduced" className="text-sm font-medium text-indigo-900 cursor-pointer">
                          Aplicar Hora Reduzida (52m30s)
                          <p className="text-xs font-normal text-indigo-700 opacity-80">Recomendado para trabalhador urbano.</p>
                      </label>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Percentual do Adicional</label>
                      <div className="flex gap-2">
                          <button 
                            onClick={() => setRate(20)}
                            className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-all ${rate === 20 ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                          >
                              20% (Urbano)
                          </button>
                          <button 
                            onClick={() => setRate(25)}
                            className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-all ${rate === 25 ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                          >
                              25% (Rural)
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          {/* Results */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-[50px] -mr-10 -mt-10"></div>
              
              <h3 className="font-bold text-gray-800 border-b pb-2 mb-4 relative z-10">Resultado Estimado</h3>
              
              {result && (
              <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Valor Hora Normal</span>
                      <span className="font-semibold">{formatCurrency(result.hourlyRate)}</span>
                  </div>
                  
                  {applyReducedHour && (
                      <div className="flex justify-between items-center text-sm bg-indigo-50 p-2 rounded">
                          <span className="text-indigo-800">Horas Computadas (+14.28%)</span>
                          <span className="font-bold text-indigo-900">{result.effectiveHours.toFixed(2)}h</span>
                      </div>
                  )}

                  <div className="pt-2 border-t border-dashed border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700 font-medium">Adicional Noturno ({rate}%)</span>
                          <span className="font-bold text-gray-900">{formatCurrency(result.allowanceTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 font-medium">Reflexo DSR (~20%)</span>
                          <span className="font-bold text-gray-600">{formatCurrency(result.dsrValue)}</span>
                      </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 mt-2">
                      <div className="flex justify-between items-end">
                          <span className="text-sm font-bold text-gray-500 uppercase">Total Extra no Mês</span>
                          <span className="text-3xl font-bold text-brand-600">{formatCurrency(result.total)}</span>
                      </div>
                  </div>
              </div>
              )}
          </div>

      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Guia: Como calcular Adicional Noturno?</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   O trabalho noturno é regulamentado pelo Art. 73 da CLT e pela Constituição Federal. Devido ao desgaste biológico de trabalhar no horário de sono, a lei prevê compensações financeiras e de jornada.
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">O que é a Hora Noturna Reduzida (Hora Ficta)?</h3>
               <p>
                   Esta é a regra que mais confunde. Para o trabalhador urbano, <strong>1 hora de relógio equivale a 52 minutos e 30 segundos</strong> de trabalho noturno.
               </p>
               <p>
                   Na prática, isso significa um acréscimo de aproximadamente 14,28% na quantidade de horas pagas. Exemplo: Se você trabalha das 22h às 05h (7 horas de relógio), a empresa deve pagar o equivalente a 8 horas de trabalho.
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Qual o horário considerado noturno?</h3>
               <ul className="list-disc pl-5 space-y-2">
                   <li><strong>Trabalhador Urbano:</strong> Das 22:00 de um dia às 05:00 do dia seguinte.</li>
                   <li><strong>Trabalhador Rural (Lavoura):</strong> Das 21:00 às 05:00. (Adicional de 25%)</li>
                   <li><strong>Trabalhador Rural (Pecuária):</strong> Das 20:00 às 04:00. (Adicional de 25%)</li>
               </ul>
           </div>
       </section>

       <section className="mt-8 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <h2 className="text-2xl font-bold text-slate-900 mb-6">Reflexos e Integração no Salário</h2>
           <p className="mb-4">
               O valor recebido como adicional noturno não é um "bônus" isolado. Se pago com habitualidade, ele integra o salário para o cálculo de todas as outras verbas trabalhistas:
           </p>
           
           <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                   <h3 className="font-bold text-indigo-800 mb-2">Integração Mensal</h3>
                   <ul className="text-sm text-indigo-700 space-y-2 list-disc pl-4">
                       <li><strong>DSR:</strong> O adicional também deve ser pago sobre o dia de descanso.</li>
                       <li><strong>FGTS:</strong> O depósito de 8% incide sobre o salário base + adicional.</li>
                       <li><strong>INSS:</strong> O desconto previdenciário também considera esse valor extra.</li>
                   </ul>
               </div>

               <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                   <h3 className="font-bold text-purple-800 mb-2">Integração Anual / Rescisão</h3>
                   <ul className="text-sm text-purple-700 space-y-2 list-disc pl-4">
                       <li><strong>Férias:</strong> A média do adicional recebido entra no cálculo das férias + 1/3.</li>
                       <li><strong>13º Salário:</strong> Calculado sobre a média da remuneração (incluindo o adicional).</li>
                       <li><strong>Aviso Prévio:</strong> O valor do aviso indenizado deve considerar a média noturna.</li>
                   </ul>
               </div>
           </div>
       </section>

      <RelatedTools current="/adicional-noturno" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default NightShiftCalculator;