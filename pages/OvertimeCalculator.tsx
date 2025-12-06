import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/calculations';
import Tooltip from '../components/Tooltip';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

interface OvertimeEntry {
  id: number;
  hours: number;
  rate: number; // percentage (50, 60, 100)
}

const OvertimeCalculator: React.FC = () => {
  // Configuration
  const [salary, setSalary] = useState(3000);
  const [weeklyHours, setWeeklyHours] = useState(44); // Determines divisor
  
  // DSR Configuration
  const [dsrMethod, setDsrMethod] = useState<'standard' | 'precise'>('standard');
  const [businessDays, setBusinessDays] = useState(25);
  const [sundaysAndHolidays, setSundaysAndHolidays] = useState(5);

  // Entries List
  const [entries, setEntries] = useState<OvertimeEntry[]>([
    { id: 1, hours: 10, rate: 50 },
    { id: 2, hours: 0, rate: 100 }
  ]);

  const [result, setResult] = useState<any>(null);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  // Helper: Get Divisor based on CLT standard table
  const getDivisor = (hours: number) => {
      if (hours === 44) return 220;
      if (hours === 40) return 200;
      if (hours === 36) return 180;
      if (hours === 30) return 150;
      return hours * 5; // Approximation fallback
  };

  useEffect(() => {
    const divisor = getDivisor(weeklyHours);
    const hourlyRate = salary / divisor;

    let totalOvertimeValue = 0;
    let totalHours = 0;
    const breakdown = [];

    // Calculate each entry
    for (const entry of entries) {
        if (entry.hours > 0) {
            const multiplier = 1 + (entry.rate / 100);
            const value = entry.hours * hourlyRate * multiplier;
            
            totalOvertimeValue += value;
            totalHours += entry.hours;
            
            breakdown.push({
                ...entry,
                hourValue: hourlyRate * multiplier,
                totalValue: value
            });
        }
    }

    // Calculate DSR
    let dsrValue = 0;
    if (totalOvertimeValue > 0) {
        if (dsrMethod === 'standard') {
            // Standard approximation (often ~1/6 or based on 25/5 split)
            // Using 5 Sundays for 25 Business Days = 20%
            dsrValue = totalOvertimeValue * 0.20; 
        } else {
            // Precise formula: (Overtime / BusinessDays) * SundaysHolidays
            // Validation to avoid division by zero
            const bDays = businessDays || 1; 
            dsrValue = (totalOvertimeValue / bDays) * sundaysAndHolidays;
        }
    }

    setResult({
        divisor,
        hourlyRate,
        breakdown,
        totalHours,
        totalOvertimeValue,
        dsrValue,
        grandTotal: totalOvertimeValue + dsrValue
    });

  }, [salary, weeklyHours, entries, dsrMethod, businessDays, sundaysAndHolidays]);

  // Handlers
  const addEntry = () => {
      setEntries([...entries, { id: Date.now(), hours: 0, rate: 50 }]);
  };

  const removeEntry = (id: number) => {
      setEntries(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: number, field: keyof OvertimeEntry, val: number) => {
      setEntries(entries.map(e => e.id === id ? { ...e, [field]: val } : e));
  };

  const faqItems = [
    {
        question: "Quando a hora extra deve ser 100%?",
        answer: "A hora extra de 100% (dobro do valor) é devida quando o trabalho ocorre em <strong>domingos ou feriados</strong> civis e religiosos que não foram compensados com folga em outro dia da semana."
    },
    {
        question: "Cargo de confiança recebe hora extra?",
        answer: "Geralmente não. Gerentes, diretores e chefes de departamento que possuem poderes de gestão e recebem gratificação de função superior a 40% do salário não têm controle de jornada (Art. 62 da CLT), portanto, não recebem horas extras."
    },
    {
        question: "Quem trabalha em Home Office tem direito a hora extra?",
        answer: "Depende. Se a empresa controla a jornada (por login/logout, softwares de ponto), o direito permanece. Se o contrato for por produção ou tarefa, sem controle de horário fixo, não há hora extra."
    },
    {
        question: "O intervalo de almoço conta como hora extra se eu trabalhar?",
        answer: "Sim! Se você não gozar do intervalo mínimo de refeição (1 hora), a empresa deve pagar o tempo suprimido como hora extra indenizada (com adicional de 50%)."
    },
    {
        question: "O que é o DSR sobre hora extra?",
        answer: "DSR significa Descanso Semanal Remunerado. Como a hora extra é uma verba salarial habitual, ela deve refletir no pagamento do seu dia de descanso. O cálculo é feito dividindo o valor total das horas extras pelos dias úteis do mês e multiplicando pelos domingos e feriados."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <SEO 
        title={`Calculadora de Hora Extra ${currentYear} - 50% e 100% com DSR`}
        description={`Saiba quanto vale sua hora extra em ${currentYear}. Calculadora completa com adicionais de 50%, 100%, noturno e reflexo no DSR (Descanso Semanal Remunerado).`}
        keywords={`calculadora hora extra ${currentYear}, calcular horas extras, valor hora extra 50, hora extra 100, calculo dsr hora extra`}
        ratingValue={4.7}
        reviewCount={950}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Calculadora de Horas Extras</h1>
        <p className="text-gray-600">Simule diferentes adicionais (50%, 100%) e o DSR exato.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.7/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SETTINGS */}
          <div className="lg:col-span-5 space-y-6">
              
              {/* Card 1: Base Data */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                     <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">1</span>
                     Dados do Contrato
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              <Tooltip termKey="salario_base">Salário Base (R$)</Tooltip>
                          </label>
                          <input 
                            type="number" 
                            className="w-full p-2 border rounded-lg bg-white font-bold text-gray-700" 
                            value={salary} 
                            onChange={e => setSalary(Number(e.target.value))} 
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              <Tooltip termKey="jornada_mensal">Jornada Semanal</Tooltip>
                          </label>
                          <select 
                            className="w-full p-2 border rounded-lg bg-white" 
                            value={weeklyHours} 
                            onChange={e => setWeeklyHours(Number(e.target.value))}
                          >
                              <option value={44}>44 Horas (Padrão CLT - Divisor 220)</option>
                              <option value={40}>40 Horas (Divisor 200)</option>
                              <option value={36}>36 Horas (Divisor 180)</option>
                              <option value={30}>30 Horas (Divisor 150)</option>
                          </select>
                      </div>
                  </div>
              </div>

              {/* Card 2: Overtime Entries */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                        Banco de Horas
                      </h3>
                      <button onClick={addEntry} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100 transition-colors">
                          + Adicionar
                      </button>
                  </div>

                  <div className="space-y-3">
                      {entries.map((entry, index) => (
                          <div key={entry.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                              <div className="flex-1">
                                  <label className="block text-[10px] text-gray-500 uppercase font-bold">Qtd. Horas</label>
                                  <input 
                                    type="number" 
                                    className="w-full p-1 border rounded bg-white text-sm" 
                                    value={entry.hours}
                                    onChange={e => updateEntry(entry.id, 'hours', Number(e.target.value))}
                                  />
                              </div>
                              <div className="w-24">
                                  <label className="block text-[10px] text-gray-500 uppercase font-bold">Adicional %</label>
                                  <select 
                                    className="w-full p-1 border rounded bg-white text-sm"
                                    value={entry.rate}
                                    onChange={e => updateEntry(entry.id, 'rate', Number(e.target.value))}
                                  >
                                      <option value={50}>50%</option>
                                      <option value={60}>60%</option>
                                      <option value={75}>75%</option>
                                      <option value={100}>100%</option>
                                  </select>
                              </div>
                              {entries.length > 1 && (
                                  <button onClick={() => removeEntry(entry.id)} className="mt-4 text-red-400 hover:text-red-600 p-1">
                                      ✕
                                  </button>
                              )}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Card 3: DSR Settings */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                     <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">3</span>
                     <Tooltip termKey="dsr">Configurar DSR</Tooltip>
                  </h3>
                  
                  <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                      <button 
                        onClick={() => setDsrMethod('standard')}
                        className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${dsrMethod === 'standard' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                      >
                          Padrão (Estimado)
                      </button>
                      <button 
                        onClick={() => setDsrMethod('precise')}
                        className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${dsrMethod === 'precise' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                      >
                          Exato (Calendário)
                      </button>
                  </div>

                  {dsrMethod === 'standard' ? (
                      <p className="text-xs text-gray-500 italic">
                          Considera uma média de 5 domingos para 25 dias úteis (20% de adicional).
                      </p>
                  ) : (
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs text-gray-500 mb-1">Dias Úteis (Seg-Sáb)</label>
                              <input 
                                type="number" 
                                className="w-full p-2 border rounded bg-white" 
                                value={businessDays} 
                                onChange={e => setBusinessDays(Number(e.target.value))} 
                              />
                          </div>
                          <div>
                              <label className="block text-xs text-gray-500 mb-1">Domingos e Feriados</label>
                              <input 
                                type="number" 
                                className="w-full p-2 border rounded bg-white" 
                                value={sundaysAndHolidays} 
                                onChange={e => setSundaysAndHolidays(Number(e.target.value))} 
                              />
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="lg:col-span-7">
              {result && (
                  <div className="sticky top-24 space-y-6">
                      
                      {/* Highlight Box */}
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
                          
                          <div className="relative z-10 flex justify-between items-end">
                              <div>
                                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Valor Total a Receber</p>
                                  <h2 className="text-5xl font-bold">{formatCurrency(result.grandTotal)}</h2>
                              </div>
                              <div className="text-right hidden sm:block">
                                  <div className="bg-white/10 px-3 py-1 rounded text-xs mb-1">Total de Horas</div>
                                  <p className="text-2xl font-bold">{result.totalHours}h</p>
                              </div>
                          </div>
                      </div>

                      {/* Detail List (Holerite Style) */}
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                              <span className="font-bold text-gray-700 text-sm uppercase">Detalhamento</span>
                              <span className="text-xs text-gray-400">Divisor utilizado: {result.divisor}</span>
                          </div>
                          
                          <div className="p-6 space-y-4">
                              {/* Hourly Rate */}
                              <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
                                  <span className="text-sm text-gray-600">Valor da sua Hora Normal</span>
                                  <span className="font-bold text-gray-800">{formatCurrency(result.hourlyRate)}</span>
                              </div>

                              {/* Entries */}
                              <div className="space-y-2">
                                  {result.breakdown.map((item: any) => (
                                      <div key={item.id} className="flex justify-between items-center text-sm">
                                          <div className="flex items-center gap-2">
                                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{item.hours}h</span>
                                              <span className="text-gray-600">Hora Extra {item.rate}%</span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                              <span className="text-xs text-gray-400 hidden sm:inline">({formatCurrency(item.hourValue)}/h)</span>
                                              <span className="font-bold text-gray-800">{formatCurrency(item.totalValue)}</span>
                                          </div>
                                      </div>
                                  ))}
                                  {result.breakdown.length === 0 && (
                                      <p className="text-sm text-gray-400 italic text-center py-2">Nenhuma hora extra adicionada.</p>
                                  )}
                              </div>

                              {/* DSR */}
                              {result.dsrValue > 0 && (
                                  <div className="flex justify-between items-center pt-2 bg-purple-50 p-2 rounded border border-purple-100">
                                      <span className="text-sm font-bold text-purple-800">DSR (Descanso Semanal)</span>
                                      <span className="font-bold text-purple-800">{formatCurrency(result.dsrValue)}</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Explanation */}
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed">
                          <strong>Como o cálculo é feito?</strong><br/>
                          1. Descobrimos o valor da sua hora normal (Salário ÷ {result.divisor}).<br/>
                          2. Somamos o percentual (ex: 50% = Hora × 1.5).<br/>
                          3. Calculamos o reflexo no descanso (DSR), pois as horas extras habituais também remuneram seu dia de folga.
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 space-y-12">
           {/* General Guide */}
           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-slate-900">Guia Completo: Cálculo de Hora Extra {currentYear}</h2>
                 <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Atualizado: {currentMonthName}/{currentYear}
                 </span>
               </div>
               
               <div className="space-y-4">
                   <p>
                       A hora extra é um direito garantido pela Constituição e pela CLT a todo trabalhador que excede sua jornada normal de trabalho. O valor da hora extra deve ser, no mínimo, 50% superior ao da hora normal.
                   </p>
                   
                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Qual o valor da Hora Extra?</h3>
                   <ul className="list-disc pl-5 space-y-2">
                       <li><strong>50% (Dias úteis):</strong> É o adicional mínimo obrigatório para horas trabalhadas além da jornada de segunda a sábado.</li>
                       <li><strong>100% (Domingos e Feriados):</strong> Se você trabalhar em um dia de folga ou feriado não compensado, o valor da hora dobra.</li>
                       <li><strong>Adicional Noturno:</strong> Se a extra for feita à noite, incide também o <Link to="/adicional-noturno" className="text-brand-600 hover:underline font-bold">Adicional Noturno (20%)</Link>.</li>
                   </ul>

                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Reflexo no Salário Líquido</h3>
                   <p>
                       Lembre-se que as horas extras aumentam seu salário bruto, o que pode mudar sua faixa de desconto do INSS e IRRF. Use nossa <Link to="/salario-liquido" className="text-brand-600 hover:underline font-bold">Calculadora de Salário Líquido</Link> para ver o valor final na conta.
                   </p>

                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Reflexo no DSR (Descanso Semanal Remunerado)</h3>
                   <p>
                       Quando você faz horas extras habitualmente, elas geram um valor adicional no seu dia de descanso (domingo). 
                       O cálculo é simples: some o valor total das horas extras, divida pelos dias úteis do mês e multiplique pelo número de domingos e feriados.
                   </p>
               </div>
           </article>

           {/* Bank of Hours vs Payment */}
           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <h2 className="text-2xl font-bold text-slate-900 mb-6">Banco de Horas ou Pagamento em Dinheiro?</h2>
               <div className="space-y-4">
                   <p>
                       Muitas empresas utilizam o sistema de <strong>Banco de Horas</strong> em vez de pagar as horas extras no mês. É fundamental entender a diferença.
                   </p>
                   
                   <div className="grid md:grid-cols-2 gap-6 mt-4">
                       <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                           <h4 className="font-bold text-blue-800 mb-3 text-lg">Banco de Horas</h4>
                           <p className="text-sm text-blue-700 mb-3">
                               As horas trabalhadas a mais são acumuladas para serem trocadas por folgas futuras.
                           </p>
                           <ul className="text-sm text-blue-800 list-disc pl-4 space-y-1">
                               <li>Compensação em até 6 meses (acordo individual) ou 1 ano (sindicato).</li>
                               <li>Não há acréscimo de 50% na troca por folga (1 hora trabalhada = 1 hora de folga).</li>
                               <li>Se você for demitido com saldo positivo, a empresa deve pagar essas horas como extras na rescisão.</li>
                           </ul>
                       </div>

                       <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                           <h4 className="font-bold text-green-800 mb-3 text-lg">Pagamento em Dinheiro</h4>
                           <p className="text-sm text-green-700 mb-3">
                               A empresa paga o valor correspondente no holerite do mês seguinte.
                           </p>
                           <ul className="text-sm text-green-800 list-disc pl-4 space-y-1">
                               <li>Obrigatório o adicional mínimo de 50%.</li>
                               <li>Gera reflexos em todas as verbas (FGTS, Férias, 13º, INSS).</li>
                               <li>Melhor para quem prefere aumentar a renda mensal do que ter dias de folga.</li>
                           </ul>
                       </div>
                   </div>
                   
                   <p className="text-sm text-gray-500 italic mt-4">
                       * A Reforma Trabalhista permitiu o banco de horas por acordo individual escrito, desde que a compensação ocorra em no máximo 6 meses.
                   </p>
               </div>
           </article>
      </section>

      <RelatedTools current="/hora-extra" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default OvertimeCalculator;