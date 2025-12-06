import React, { useState, useEffect } from 'react';
import { calculateInvestmentProjection, formatCurrency } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const InvestmentSimulator: React.FC = () => {
  const [amount, setAmount] = useState(10000);
  const [months, setMonths] = useState(12);
  const [result, setResult] = useState<any>(null);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  useEffect(() => {
    const res = calculateInvestmentProjection(amount, months);
    setResult(res);
  }, [amount, months]);

  const dataChart = result ? [
    { name: 'Poupança', value: result.poupanca },
    { name: 'CDB 100% CDI', value: result.cdb },
  ] : [];

  const faqItems = [
    {
        question: "Onde investir o dinheiro da rescisão?",
        answer: "Para dinheiro que você pode precisar a qualquer momento (reserva de emergência), o ideal são investimentos com <strong>Liquidez Diária</strong> e baixo risco, como o Tesouro Selic ou CDBs de bancos sólidos que rendam 100% do CDI."
    },
    {
        question: "A Poupança é segura?",
        answer: "Sim, é segura (garantida pelo FGC até R$ 250 mil), mas rende muito pouco. Atualmente, ela perde para a inflação e para quase qualquer outro investimento de renda fixa conservadora, como o Tesouro Direto."
    },
    {
        question: "O que é liquidez diária?",
        answer: "É a capacidade de transformar o investimento em dinheiro na conta rapidamente. Liquidez diária significa que se você pedir o resgate hoje, o dinheiro cai na conta hoje ou no próximo dia útil. Essencial para quem está desempregado."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <SEO 
        title={`Simulador de Investimento Rescisão ${currentYear} - Poupança vs CDI`}
        description={`Não deixe seu dinheiro parado. Compare quanto rende sua rescisão e FGTS na Poupança vs CDB (100% CDI) em ${currentYear}. Calculadora simples e segura.`}
        keywords="onde investir rescisao, simulador poupança vs cdb, calculadora investimentos, render dinheiro rescisão"
        ratingValue={4.8}
        reviewCount={650}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Simulador de Investimentos</h1>
        <p className="text-gray-600">Veja quanto seu dinheiro rende enquanto você busca novas oportunidades.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.8/5)</span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
          
          {/* Inputs */}
          <div className="md:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4">Parâmetros</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Valor Disponível (R$)</label>
                          <input 
                            type="number" 
                            className="w-full p-3 border rounded-lg bg-white font-bold text-gray-800" 
                            value={amount} 
                            onChange={e => setAmount(Number(e.target.value))} 
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tempo (Meses)</label>
                          <input 
                            type="range" 
                            min="1" 
                            max="60" 
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                            value={months} 
                            onChange={e => setMonths(Number(e.target.value))} 
                          />
                          <div className="text-center font-bold text-brand-600 mt-2">{months} meses</div>
                      </div>
                  </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                  <p className="font-bold mb-1">💡 Dica:</p>
                  Dinheiro de rescisão deve ter <strong>Liquidez Diária</strong>. Não trave seu dinheiro em investimentos de longo prazo (LCI/LCA com carência) se você não tem outra reserva.
              </div>
          </div>

          {/* Results */}
          <div className="md:col-span-7 space-y-6">
              
              {result && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-6 text-center">Projeção de Retorno</h3>
                      
                      <div className="h-64 w-full mb-6 flex flex-col">
                        <div className="flex-1 min-h-0 min-w-0 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} accessibilityLayer>
                                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                                    <YAxis hide />
                                    <RechartsTooltip 
                                        formatter={(val: number) => formatCurrency(val)}
                                        cursor={{fill: 'transparent'}}
                                    />
                                    <Bar dataKey="value" barSize={50} radius={[4, 4, 0, 0]}>
                                        {dataChart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#fbbf24' : '#10b981'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 rounded-lg bg-amber-50 border border-amber-100">
                              <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                  <span className="font-medium text-amber-900">Poupança (0.55% a.m.)</span>
                              </div>
                              <span className="font-bold text-amber-900">{formatCurrency(result.poupanca)}</span>
                          </div>

                          <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm relative overflow-hidden">
                              <div className="relative z-10 flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                  <span className="font-bold text-emerald-900">CDB / Tesouro (100% CDI)</span>
                              </div>
                              <span className="relative z-10 font-bold text-emerald-900 text-lg">{formatCurrency(result.cdb)}</span>
                          </div>

                          <div className="text-center pt-4 border-t border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Diferença no período</p>
                              <p className="text-xl font-bold text-emerald-600">+{formatCurrency(result.diff)}</p>
                              <p className="text-xs text-gray-400 mt-1">Apenas trocando de aplicação</p>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Onde render o dinheiro da Rescisão em {currentYear}?</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   Receber a rescisão e o saque do FGTS traz um alívio imediato, mas também a responsabilidade de fazer esse dinheiro durar. Deixar na Conta Corrente é perder para a inflação. Deixar na Poupança é perder dinheiro (rendimento real negativo em muitos cenários).
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Por que fugir da Poupança?</h3>
               <p>
                   A poupança rende apenas 70% da Taxa Selic (quando a Selic está baixa) ou 0,5% ao mês + TR (quando a Selic está alta). 
                   Já um investimento simples em CDB de banco digital ou Tesouro Selic rende <strong>100% da Taxa Selic</strong>. É seguro igual e rende muito mais.
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">O Poder dos Juros Compostos</h3>
               <p>
                   Se você conseguir preservar sua rescisão e viver de outra renda (como o Seguro Desemprego ou bicos), o tempo trabalha a seu favor.
                   Use nossa <Link to="/sobrevivencia" className="text-brand-600 font-bold hover:underline">Calculadora de Sobrevivência</Link> para ver quanto tempo esse dinheiro te sustenta se você não investir.
               </p>
           </div>
       </section>

      <RelatedTools current="/investimentos" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default InvestmentSimulator;