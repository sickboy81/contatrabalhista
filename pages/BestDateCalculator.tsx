import React, { useState } from 'react';
import { formatCurrency } from '../utils/calculations';
import Tooltip from '../components/Tooltip';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const BestDateCalculator: React.FC = () => {
  const [salary, setSalary] = useState(3000);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const calculateStrategy = () => {
    const date = new Date(targetDate);
    // Adjust for timezone offset issues with simple YYYY-MM-DD strings
    const userDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
    
    const day = userDate.getDate();
    const lastDayOfMonth = new Date(userDate.getFullYear(), userDate.getMonth() + 1, 0).getDate();
    
    // Financials (1/12 avos)
    const oneTwelfth13th = salary / 12;
    const oneTwelfthVacation = salary / 12;
    const oneThirdVacation = oneTwelfthVacation / 3;
    const totalAtStake = oneTwelfth13th + oneTwelfthVacation + oneThirdVacation;

    // Logic
    const isSafeZone = day >= 15;
    const daysToWait = 15 - day;
    
    return {
        day,
        lastDayOfMonth,
        totalAtStake,
        isSafeZone,
        daysToWait,
        values: {
            thirteenth: oneTwelfth13th,
            vacation: oneTwelfthVacation + oneThirdVacation
        }
    };
  };

  const { day, lastDayOfMonth, totalAtStake, isSafeZone, daysToWait, values } = calculateStrategy();

  // Helper for grid rendering
  const renderCalendar = () => {
      const days = [];
      for (let i = 1; i <= Math.min(lastDayOfMonth, 31); i++) {
          const isSelected = i === day;
          const isTarget = i === 15;
          const isDanger = i < 15;

          days.push(
              <div 
                key={i} 
                className={`
                    relative rounded-lg p-1 min-h-[50px] flex flex-col items-center justify-center border-2 transition-all
                    ${isDanger 
                        ? 'bg-red-50 border-red-100 text-red-300' 
                        : 'bg-emerald-50 border-emerald-100 text-emerald-400'
                    }
                    ${isSelected 
                        ? 'ring-2 ring-brand-500 ring-offset-2 border-brand-500 bg-white z-10 shadow-lg scale-110 !text-brand-700' 
                        : ''
                    }
                    ${isTarget && !isSelected ? 'border-emerald-400 border-dashed bg-emerald-100/50' : ''}
                `}
              >
                  <span className={`text-sm font-bold leading-none ${isSelected ? 'text-lg' : ''}`}>{i}</span>
                  
                  {isTarget && (
                      <span className="text-[8px] uppercase font-bold text-emerald-600 mt-1 leading-none">
                          O Marco
                      </span>
                  )}
                  {isSelected && (
                      <span className="text-[8px] font-bold text-brand-600 mt-1 leading-none text-center">
                          Sua Saída
                      </span>
                  )}
              </div>
          );
      }
      return days;
  };

  const faqItems = [
    {
        question: "Por que o dia 15 é tão importante?",
        answer: "Pela Lei 4.090/1962, o empregado só tem direito a receber 1/12 avos de 13º salário e Férias referentes a um mês específico se trabalhar <strong>fração igual ou superior a 15 dias</strong> naquele mês."
    },
    {
        question: "Pedir demissão na sexta-feira é ruim?",
        answer: "Geralmente sim. Se o aviso prévio for indenizado, o prazo começa a contar no dia seguinte. Se você pedir na sexta, a empresa ganha o sábado e domingo (que são remunerados) dentro do aviso. Idealmente, peça na segunda ou terça-feira."
    },
    {
        question: "O aviso prévio conta como tempo de serviço?",
        answer: "Sim! Mesmo que seja indenizado (você não trabalha), o período do aviso projeta seu contrato para o futuro. Se essa projeção cair após o dia 15 do mês seguinte, você ganha mais 1/12 avos de férias e 13º."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <SEO 
        title="Qual o Melhor Dia para Pedir Demissão? (Calculadora de Avos)"
        description="Não perca dinheiro! Descubra se vale a pena esperar o dia 15 para pedir demissão e ganhar 1 mês a mais de férias e 13º salário."
        keywords="melhor dia pedir demissão, dia 15 demissão, calcular avos ferias 13, quando pedir conta"
        ratingValue={4.8}
        reviewCount={540}
      />

      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-900">O "Pulo do Gato" da Rescisão</h1>
        <p className="text-gray-600 text-sm md:text-base">Descubra se vale a pena esperar alguns dias para pedir demissão.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.8/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Input & Advice */}
          <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">1</span>
                     Cenário
                  </h3>
                  <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Tooltip termKey="salario_bruto">Seu Salário Base</Tooltip>
                        </label>
                        <div className="relative">
                             <span className="absolute left-3 top-3 text-gray-400 font-medium">R$</span>
                             <input 
                                type="number" 
                                className="w-full p-2 pl-10 border rounded-lg bg-white font-semibold text-gray-700 focus:ring-2 focus:ring-brand-500 outline-none" 
                                value={salary} 
                                onChange={e => setSalary(Number(e.target.value))} 
                             />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pretendo sair dia (Último dia trabalhado)
                        </label>
                        <input 
                            type="date" 
                            className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer" 
                            value={targetDate} 
                            onChange={e => setTargetDate(e.target.value)} 
                        />
                      </div>
                  </div>
              </div>

              {/* Recommendation Card */}
              <div className={`p-6 rounded-xl shadow-lg border-l-4 transition-all duration-500 ${!isSafeZone ? 'bg-white border-red-500' : 'bg-emerald-600 border-emerald-800 text-white'}`}>
                  {!isSafeZone ? (
                      <div>
                          <div className="flex items-center gap-3 mb-3">
                              <div className="bg-red-100 p-2 rounded-full text-red-600">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              </div>
                              <h3 className="text-xl font-bold text-red-600">Espere mais {daysToWait} dias!</h3>
                          </div>
                          <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                              Se você sair no dia {day}, <strong>você perde o direito a este mês</strong> no cálculo de <Link to="/ferias" className="text-brand-600 underline font-bold">Férias</Link> e 13º Salário.
                              Pela CLT, você precisa trabalhar fração igual ou superior a 15 dias.
                          </p>
                          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                              <p className="text-xs text-red-500 font-bold uppercase mb-1">Dinheiro deixado na mesa</p>
                              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalAtStake)}</p>
                          </div>
                      </div>
                  ) : (
                      <div>
                          <div className="flex items-center gap-3 mb-3">
                              <div className="bg-emerald-500 p-2 rounded-full text-white">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              </div>
                              <h3 className="text-xl font-bold">Data Segura!</h3>
                          </div>
                          <p className="text-emerald-100 mb-4 leading-relaxed text-sm">
                              Ótimo! Passando do dia 15, você já garantiu <strong>1/12 avos a mais</strong> na sua <Link to="/" className="text-white underline font-bold">Rescisão</Link> referente a este mês.
                          </p>
                          <div className="bg-emerald-700/50 p-4 rounded-lg border border-emerald-500/30">
                              <p className="text-xs text-emerald-200 font-bold uppercase mb-1">Valor Garantido este mês</p>
                              <p className="text-2xl font-bold text-white">{formatCurrency(totalAtStake)}</p>
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* Right: Visualizer */}
          <div className="lg:col-span-7">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">2</span>
                        Calendário do Mês
                    </h3>
                    <div className="flex gap-3 text-[10px] md:text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                            <span className="text-gray-500">Perde Avos</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded"></div>
                            <span className="text-gray-500">Ganha Avos</span>
                        </div>
                    </div>
                  </div>

                  {/* Grid Visualization */}
                  <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 md:gap-3">
                      {renderCalendar()}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Entenda o Cálculo (Os "Avos")</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-blue-600 font-bold">1/12 de 13º Salário</span>
                                  <span className="text-xs text-blue-400">≈ 8.33%</span>
                              </div>
                              <p className="text-lg font-bold text-blue-700">{formatCurrency(values.thirteenth)}</p>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-orange-600 font-bold">1/12 de Férias + 1/3</span>
                                  <span className="text-xs text-orange-400">≈ 11.11%</span>
                              </div>
                              <p className="text-lg font-bold text-orange-700">{formatCurrency(values.vacation)}</p>
                          </div>
                      </div>
                      <p className="text-[10px] text-gray-400 text-center mt-4 max-w-md mx-auto">
                          * Cálculo estimado com base no salário bruto, sem considerar descontos de INSS/IRRF sobre essas verbas.
                      </p>
                  </div>
              </div>
          </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">O Segredo do Dia 15: Entenda o Cálculo</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   No Direito Trabalhista Brasileiro, o cálculo de verbas proporcionais (Férias e 13º Salário) segue a regra da fração igual ou superior a 15 dias de trabalho no mês civil.
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Como funciona a regra?</h3>
               <p>
                   A Lei 4.090/62 (13º Salário) e o Art. 146 da CLT (Férias) determinam que <strong>cada mês trabalhado conta como 1/12 avos</strong>. Porém, para que um mês incompleto seja considerado na conta, o empregado deve ter trabalhado pelo menos 15 dias dentro daquele mês.
               </p>
               <ul className="list-disc pl-5 space-y-2">
                   <li><strong>Saiu dia 14:</strong> O mês da demissão não conta. Você perde 1/12 de férias e 1/12 de 13º.</li>
                   <li><strong>Saiu dia 15:</strong> O mês conta como integral. Você ganha o direito aos avos proporcionais.</li>
               </ul>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Atenção ao Aviso Prévio</h3>
               <p>
                   O tempo do Aviso Prévio (trabalhado ou indenizado) integra o tempo de serviço para todos os efeitos legais. Isso significa que a data que conta para o "dia 15" não é o seu último dia na empresa, mas sim a <strong>data projetada</strong> ao final do aviso prévio. (Verifique nossa <Link to="/" className="text-brand-600 hover:underline font-bold">Calculadora Principal</Link> para ver a projeção).
               </p>
           </div>
       </section>

      <RelatedTools current="/melhor-data" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default BestDateCalculator;