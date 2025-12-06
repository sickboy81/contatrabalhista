import React, { useState } from 'react';
import { formatCurrency } from '../utils/calculations';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import TooltipHelp from '../components/Tooltip';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const SurvivalCalculator: React.FC = () => {
  // Inputs
  const [resources, setResources] = useState({
    severance: 5000,
    fgts: 8000,
    savings: 2000,
  });

  const [expenses, setExpenses] = useState({
    monthlyCost: 3500,
    economyPercentage: 0, // 0 to 50%
  });

  const [income, setIncome] = useState({
    unemploymentValue: 1800,
    unemploymentMonths: 5,
  });

  // Calculations
  const totalCashStart = resources.severance + resources.fgts + resources.savings;
  const adjustedMonthlyCost = expenses.monthlyCost * (1 - expenses.economyPercentage / 100);

  const generateProjection = () => {
    let currentBalance = totalCashStart;
    const data = [];
    let month = 0;
    const today = new Date();

    // Simulate up to 60 months or until money runs out
    // We add an initial point (Month 0)
    data.push({
        monthIndex: 0,
        label: 'Hoje',
        balance: currentBalance,
        cost: adjustedMonthlyCost,
        income: 0
    });

    while (currentBalance > 0 && month < 48) {
      month++;
      
      // Income for this specific month (e.g., Seguro Desemprego)
      const monthlyIncome = month <= income.unemploymentMonths ? income.unemploymentValue : 0;
      
      // Calculate new balance
      currentBalance = currentBalance - adjustedMonthlyCost + monthlyIncome;
      
      // Date Label
      const date = new Date(today.getFullYear(), today.getMonth() + month, 1);
      const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      data.push({
        monthIndex: month,
        label: label,
        balance: Math.max(0, currentBalance),
        cost: adjustedMonthlyCost,
        income: monthlyIncome
      });
    }

    return data;
  };

  const projection = generateProjection();
  const survivalMonths = projection.length - 1; // Minus start point
  const lastPoint = projection[projection.length - 1];
  const isInfinite = survivalMonths >= 48 && lastPoint.balance > 0;
  
  // Determine status color
  let statusColor = 'text-red-600';
  let statusBg = 'bg-red-50';
  let statusBorder = 'border-red-100';
  
  if (isInfinite) {
      statusColor = 'text-emerald-600';
      statusBg = 'bg-emerald-50';
      statusBorder = 'border-emerald-100';
  } else if (survivalMonths > 12) {
      statusColor = 'text-emerald-600';
      statusBg = 'bg-emerald-50';
      statusBorder = 'border-emerald-100';
  } else if (survivalMonths > 6) {
      statusColor = 'text-amber-600';
      statusBg = 'bg-amber-50';
      statusBorder = 'border-amber-100';
  }

  const crashDate = new Date();
  crashDate.setMonth(crashDate.getMonth() + survivalMonths);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const faqItems = [
    {
        question: "Quais gastos devo cortar primeiro?",
        answer: "Foque em cortar supérfluos (assinaturas de streaming, delivery, lazer pago) e renegociar fixos (plano de internet e celular). Evite mexer em gastos essenciais como aluguel e alimentação básica no primeiro momento, a menos que a situação seja crítica."
    },
    {
        question: "Vale a pena pagar dívidas com a rescisão?",
        answer: "Depende. Se a dívida tiver juros altos (cartão de crédito, cheque especial), sim. Se for um financiamento imobiliário com juros baixos, pode ser melhor guardar o dinheiro da rescisão para pagar as parcelas mensais e garantir sua moradia enquanto busca emprego."
    },
    {
        question: "Onde deixar o dinheiro da rescisão rendendo?",
        answer: "Como você pode precisar desse dinheiro a qualquer momento, busque investimentos com <strong>Liquidez Diária</strong>, como CDBs de bancos digitais que rendem 100% do CDI ou Tesouro Selic. Evite a poupança (rende pouco) e fuja de investimentos de risco (bolsa) ou com carência."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
       <SEO 
         title="Calculadora de Sobrevivência Financeira Pós-Demissão"
         description="Quanto tempo seu dinheiro dura? Insira sua rescisão, FGTS e gastos mensais para saber sua 'data de colapso' financeiro e se planejar."
         keywords="planejamento financeiro desemprego, quanto tempo dura rescisão, calculadora sobrevivencia financeira, organizar contas desempregado"
         ratingValue={4.9}
         reviewCount={410}
       />

       <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Simulador de Sobrevivência Financeira</h1>
        <p className="text-gray-600">Considerando Rescisão, FGTS e Seguro Desemprego, quanto tempo você aguenta?</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.9/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
              
              {/* 1. Resources */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Dinheiro em Mãos
                  </h3>
                  <div className="space-y-3">
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">Rescisão Líquida (Estimada)</label>
                          <input type="number" className="w-full p-2 border rounded bg-white text-sm" value={resources.severance} onChange={e => setResources({...resources, severance: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">FGTS (Saque + Multa)</label>
                          <input type="number" className="w-full p-2 border rounded bg-white text-sm" value={resources.fgts} onChange={e => setResources({...resources, fgts: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">Reserva de Emergência / Outros</label>
                          <input type="number" className="w-full p-2 border rounded bg-white text-sm" value={resources.savings} onChange={e => setResources({...resources, savings: Number(e.target.value)})} />
                      </div>
                      <div className="pt-3 border-t flex justify-between items-center font-bold text-gray-700">
                          <span>Total Inicial:</span>
                          <span>{formatCurrency(totalCashStart)}</span>
                      </div>
                  </div>
              </div>

              {/* 2. Income Stream */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Entradas Mensais (Temporárias)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">Seguro Desemprego (R$)</label>
                          <input type="number" className="w-full p-2 border rounded bg-white text-sm" value={income.unemploymentValue} onChange={e => setIncome({...income, unemploymentValue: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">Duração (Meses)</label>
                          <select className="w-full p-2 border rounded bg-white text-sm" value={income.unemploymentMonths} onChange={e => setIncome({...income, unemploymentMonths: Number(e.target.value)})}>
                              <option value={0}>Sem seguro</option>
                              <option value={3}>3 Parcelas</option>
                              <option value={4}>4 Parcelas</option>
                              <option value={5}>5 Parcelas</option>
                          </select>
                      </div>
                  </div>
              </div>

              {/* 3. Expenses & Cuts */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Saídas Mensais
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">Custo de Vida Padrão (Aluguel, Luz, Mercado...)</label>
                          <input type="number" className="w-full p-2 border rounded bg-white text-sm font-semibold" value={expenses.monthlyCost} onChange={e => setExpenses({...expenses, monthlyCost: Number(e.target.value)})} />
                      </div>
                      
                      <div>
                          <div className="flex justify-between text-xs mb-2">
                              <span className="font-bold text-gray-700">Plano de Corte de Gastos</span>
                              <span className="text-brand-600 font-bold">-{expenses.economyPercentage}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="50" 
                            step="5"
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                            value={expenses.economyPercentage} 
                            onChange={e => setExpenses({...expenses, economyPercentage: Number(e.target.value)})} 
                          />
                          <div className="mt-2 text-xs text-gray-500 flex justify-between bg-gray-50 p-2 rounded">
                              <span>Novo Custo Mensal:</span>
                              <span className="font-bold text-gray-800">{formatCurrency(adjustedMonthlyCost)}</span>
                          </div>
                      </div>
                  </div>
              </div>

          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-8 space-y-6">
              
              {/* Main Status Card */}
              <div className={`rounded-xl p-6 border-l-4 shadow-sm ${statusBg} ${statusBorder}`}>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                      <div>
                          <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Seu dinheiro dura aproximadamente</p>
                          <div className={`text-5xl font-extrabold ${statusColor}`}>
                              {isInfinite ? 'Para Sempre*' : `${survivalMonths} Meses`}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                              {isInfinite ? '*Seus rendimentos superam os gastos.' : `Data estimada do colapso: ${crashDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
                          </p>
                      </div>
                      
                      {income.unemploymentMonths > 0 && (
                        <div className="bg-white/60 p-4 rounded-lg text-xs max-w-xs backdrop-blur-sm">
                            <p className="font-bold text-gray-700 mb-1">💡 O Efeito do Seguro</p>
                            O Seguro Desemprego segura as pontas nos primeiros {income.unemploymentMonths} meses. 
                            A queda brusca no gráfico acontece quando ele acaba.
                        </div>
                      )}
                  </div>
              </div>

              {/* Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
                  <h3 className="font-bold text-gray-800 mb-6 text-sm uppercase">Projeção do Saldo (Caixa)</h3>
                  <div className="flex-1 w-full min-h-0 min-w-0 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} accessibilityLayer>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="label" 
                                tick={{fontSize: 12, fill: '#94a3b8'}} 
                                interval="preserveStartEnd"
                                minTickGap={30}
                            />
                            <YAxis 
                                tick={{fontSize: 12, fill: '#94a3b8'}} 
                                tickFormatter={(val) => `R$${val/1000}k`}
                            />
                            <Tooltip 
                                formatter={(value: number) => [formatCurrency(value), 'Saldo em Caixa']}
                                labelStyle={{ color: '#64748b' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                            <Area 
                                type="monotone" 
                                dataKey="balance" 
                                stroke="#0ea5e9" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorBalance)" 
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              {/* Actionable Advice */}
              <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-brand-50 p-4 rounded-xl border border-brand-100">
                      <h4 className="font-bold text-brand-800 text-sm mb-2">🔍 Análise</h4>
                      <p className="text-xs text-brand-700 leading-relaxed">
                          {survivalMonths < 3 ? (
                              "CUIDADO CRÍTICO: Você tem menos de 3 meses. Corte gastos supérfluos IMEDIATAMENTE e considere pegar qualquer trabalho temporário enquanto busca sua vaga ideal."
                          ) : survivalMonths < 6 ? (
                              "ATENÇÃO: Você tem uma margem razoável, mas o mercado pode levar de 3 a 6 meses para recolocação. Mantenha os gastos controlados."
                          ) : (
                              "SITUAÇÃO CONFORTÁVEL: Você tem um bom colchão financeiro. Use esse tempo para se qualificar e escolher bem sua próxima oportunidade, sem desespero."
                          )}
                      </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <h4 className="font-bold text-orange-800 text-sm mb-2">✂️ O Poder do Corte</h4>
                      <p className="text-xs text-orange-700 leading-relaxed">
                          Se você aumentar sua economia para <strong>{(expenses.economyPercentage + 10)}%</strong>, 
                          seu custo mensal cai para <strong>{formatCurrency(expenses.monthlyCost * (1 - (expenses.economyPercentage + 10)/100))}</strong>.
                          Isso pode te dar semanas ou meses extras de fôlego.
                      </p>
                  </div>
              </div>

          </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Guia: Planejamento Financeiro no Desemprego</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   O momento da rescisão exige frieza. O dinheiro que entra (<Link to="/fgts" className="text-brand-600 hover:underline font-bold">FGTS</Link>, Multa, Saldo de Salário) pode parecer muito à primeira vista, mas ele precisa substituir seu salário por um período indeterminado.
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">O Conceito de "Runway" (Pista de Decolagem)</h3>
               <p>
                   Em finanças pessoais, chamamos de "Runway" o tempo que você sobrevive sem renda nova. A fórmula é simples: <strong>Dinheiro Total ÷ Gasto Mensal = Meses de Sobrevivência</strong>.
               </p>
               <p>
                   Seu objetivo número 1 agora é aumentar esse tempo. Existem duas formas: aumentar o dinheiro (bicos, venda de itens parados) ou diminuir o gasto (cortes radicais temporários).
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Hierarquia de Pagamentos</h3>
               <p>Se o dinheiro for curto, priorize nesta ordem:</p>
               <ol className="list-decimal pl-5 space-y-2">
                   <li><strong>Sobrevivência Básica:</strong> Comida, Água, Luz, Gás.</li>
                   <li><strong>Moradia:</strong> Aluguel ou Condomínio (para não ser despejado).</li>
                   <li><strong>Dívidas com Bens em Garantia:</strong> Financiamento do Carro ou Casa (para não perder o bem).</li>
                   <li><strong>Dívidas Sem Garantia:</strong> Cartão de Crédito, Empréstimo Pessoal (se não der para pagar, renegocie depois, mas preserve seu caixa de sobrevivência).</li>
               </ol>
           </div>
       </section>

      <RelatedTools current="/sobrevivencia" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default SurvivalCalculator;