import React, { useState, useEffect } from 'react';
import { calculateFgtsAnniversary, formatCurrency } from '../utils/calculations';
import Tooltip from '../components/Tooltip';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';

const FgtsCalculator: React.FC = () => {
  const [balance, setBalance] = useState(8000);
  const [salary, setSalary] = useState(3000);
  const [yearsProjection, setYearsProjection] = useState(2);
  
  const [projection, setProjection] = useState<any>(null);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  useEffect(() => {
    // Simulation Logic
    const monthlyDeposit = salary * 0.08;
    
    // SCENARIO A: RESCISÃO (Standard)
    // Balance grows with deposits. No withdrawals.
    // Fine is 40% of (Initial + Deposits).
    // Interest (JAM) omitted for simplicity (approx 3% pa), focusing on cash flow.
    const totalDeposited = balance + (monthlyDeposit * 12 * yearsProjection);
    const fine = totalDeposited * 0.40;
    const scenarioA_CashInHand = totalDeposited + fine;

    // SCENARIO B: ANIVERSÁRIO
    // Withdraws once a year. Balance reduces.
    // Fine is still 40% of TOTAL DEPOSITED (The base for fine doesn't shrink with withdrawals).
    // But Cash in Hand on termination is ONLY the fine. The rest is locked.
    
    let currentBalanceB = balance;
    let totalWithdrawn = 0;
    let totalAnnualWithdrawals = [];

    for (let i = 0; i < yearsProjection; i++) {
        // Add 12 months of deposits
        currentBalanceB += (monthlyDeposit * 12);
        
        // Calculate withdrawal for this year
        const { annualWithdrawal } = calculateFgtsAnniversary(currentBalanceB);
        
        // Deduct withdrawal
        currentBalanceB -= annualWithdrawal;
        totalWithdrawn += annualWithdrawal;
        totalAnnualWithdrawals.push(annualWithdrawal);
    }

    const scenarioB_Fine = totalDeposited * 0.40; // Fine is based on history, not current balance
    const scenarioB_CashOnTermination = scenarioB_Fine; // Only fine is accessible
    const scenarioB_Locked = currentBalanceB; // Remains in account
    const scenarioB_TotalGained = totalWithdrawn + scenarioB_Fine + scenarioB_Locked; // Total wealth (same as A, mathematically, usually)

    setProjection({
        deposited: totalDeposited,
        scenarioA: {
            cashHand: scenarioA_CashInHand,
            fine,
            balance: totalDeposited
        },
        scenarioB: {
            cashHand: scenarioB_CashOnTermination, // On dismissal day
            alreadyWithdrawn: totalWithdrawn,
            locked: scenarioB_Locked,
            fine: scenarioB_Fine
        }
    });

  }, [balance, salary, yearsProjection]);

  if (!projection) return null;

  const chartData = [
    {
      name: 'Saque-Rescisão',
      "Dinheiro na Mão": projection.scenarioA.cashHand,
      "Bloqueado": 0,
      "Já Sacado": 0,
    },
    {
      name: 'Saque-Aniversário',
      "Dinheiro na Mão": projection.scenarioB.cashHand, // Only fine
      "Bloqueado": projection.scenarioB.locked,
      "Já Sacado": projection.scenarioB.alreadyWithdrawn,
    }
  ];

  const faqItems = [
    {
        question: "Se eu optar pelo Saque-Aniversário, perco a multa de 40%?",
        answer: "Não. A multa de 40% é calculada sobre o total de depósitos feitos pela empresa durante o contrato, independente se você sacou parte do dinheiro ou não. Você receberá a multa normalmente na demissão."
    },
    {
        question: "Se eu for demitido no Saque-Aniversário, o que acontece?",
        answer: "Você saca apenas a multa rescisória (40%). O restante do saldo fica preso na conta e você continuará recebendo as parcelas anuais no mês do seu aniversário."
    },
    {
        question: "Posso usar o FGTS para comprar imóvel no Saque-Aniversário?",
        answer: "Sim! A opção pelo Saque-Aniversário não impede o uso do saldo para compra da casa própria, liquidação ou amortização de dívida habitacional, desde que você se enquadre nas regras do SFH (Sistema Financeiro de Habitação)."
    },
    {
        question: "O que é o Saque Calamidade?",
        answer: "É uma modalidade que permite ao trabalhador sacar até R$ 6.220,00 de cada conta do FGTS em caso de desastres naturais (enchentes, deslizamentos) reconhecidos pelo Governo Federal na sua região de residência."
    },
    {
        question: "A empresa não depositou meu FGTS, o que fazer?",
        answer: "Você pode denunciar ao Ministério do Trabalho ou entrar com uma ação na Justiça do Trabalho. A falta de depósito do FGTS é considerada falta grave do empregador e pode dar direito à Rescisão Indireta (onde você sai da empresa recebendo todos os direitos, como se tivesse sido demitido)."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <SEO 
        title={`Simulador FGTS ${currentYear}: Saque-Aniversário vs Rescisão (Multa 40%)`}
        description={`Descubra qual vale mais a pena em ${currentYear}: Saque-Aniversário ou Saque-Rescisão. Simule o rendimento, multa de 40% e quanto você perde se for demitido.`}
        keywords={`simulador fgts ${currentYear}, saque aniversário vale a pena, calcular multa 40 fgts, saldo fgts, saque rescisão bloqueado`}
        ratingValue={4.7}
        reviewCount={890}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Simulador de Estratégia FGTS</h1>
        <p className="text-gray-600">Simule o futuro: Vale a pena trocar a segurança pela liquidez anual?</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.7/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">1</span>
                      Seus Dados Atuais
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              <Tooltip termKey="saldo_fgts">Saldo Atual do FGTS</Tooltip>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400 font-bold">R$</span>
                            <input 
                                type="number" 
                                className="w-full p-2 pl-10 border rounded-lg bg-white font-semibold text-gray-800 focus:ring-2 focus:ring-brand-500"
                                value={balance}
                                onChange={e => setBalance(Number(e.target.value))}
                            />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              <Tooltip termKey="salario_bruto">Salário Bruto (Para depósitos)</Tooltip>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400 font-bold">R$</span>
                            <input 
                                type="number" 
                                className="w-full p-2 pl-10 border rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-brand-500"
                                value={salary}
                                onChange={e => setSalary(Number(e.target.value))}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Depósito mensal estimado: {formatCurrency(salary * 0.08)}</p>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                      Cenário Futuro
                  </h3>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          Se eu for demitido daqui a...
                      </label>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="1"
                        className="w-full accent-brand-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        value={yearsProjection}
                        onChange={e => setYearsProjection(Number(e.target.value))}
                      />
                      <div className="text-center font-bold text-2xl text-brand-600 mt-2">
                          {yearsProjection} {yearsProjection === 1 ? 'ano' : 'anos'}
                      </div>
                  </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 leading-relaxed">
                  <strong>Atenção à Regra de Bloqueio:</strong><br/>
                  Se você aderir ao Saque-Aniversário e quiser voltar ao Saque-Rescisão, terá que esperar <strong>25 meses</strong> de carência. Durante esse tempo, se for demitido, seu saldo continua preso.
              </div>
          </div>

          {/* Right Column: Comparative Results */}
          <div className="lg:col-span-8 space-y-6">
              
              {/* Graphic Comparison */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[320px] flex flex-col">
                  <h3 className="font-bold text-gray-800 mb-2 text-center">Disponibilidade Financeira na Demissão (após {yearsProjection} anos)</h3>
                  <div className="flex-1 min-h-0 min-w-0 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                        accessibilityLayer
                        >
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={110} tick={{fontSize: 12, fontWeight: 'bold'}} />
                        <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                        <Legend />
                        <Bar dataKey="Dinheiro na Mão" stackId="a" fill="#10b981" barSize={40} />
                        <Bar dataKey="Já Sacado" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="Bloqueado" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              {/* Detailed Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                  {/* Scenario A Card */}
                  <div className="bg-white border-t-4 border-green-500 rounded-xl shadow-sm p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-gray-800 text-lg">Saque-Rescisão</h3>
                          <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-1 rounded">Seguro</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                          Você deixa o dinheiro render e saca tudo de uma vez se for demitido.
                      </p>
                      
                      <div className="space-y-2 text-sm border-t pt-4">
                          <div className="flex justify-between">
                              <span className="text-gray-500">Saldo Acumulado:</span>
                              <span>{formatCurrency(projection.scenarioA.balance)}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-gray-500">Multa 40%:</span>
                              <span className="text-green-600 font-medium">+{formatCurrency(projection.scenarioA.fine)}</span>
                          </div>
                      </div>

                      <div className="mt-4 bg-green-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-green-800 uppercase font-bold mb-1">Total na Mão ao ser demitido</p>
                          <p className="text-2xl font-bold text-green-700">{formatCurrency(projection.scenarioA.cashHand)}</p>
                      </div>
                  </div>

                  {/* Scenario B Card */}
                  <div className="bg-white border-t-4 border-blue-500 rounded-xl shadow-sm p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-gray-800 text-lg">Saque-Aniversário</h3>
                          <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-2 py-1 rounded">Fluxo</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                          Você antecipa gastos anuais, mas <strong>perde o fundo de segurança</strong> na demissão.
                      </p>
                      
                      <div className="space-y-2 text-sm border-t pt-4">
                          <div className="flex justify-between text-blue-600 font-medium">
                              <span>Já sacou (em {yearsProjection} anos):</span>
                              <span>{formatCurrency(projection.scenarioB.alreadyWithdrawn)}</span>
                          </div>
                          <div className="flex justify-between text-red-500 font-medium">
                              <span>Fica Bloqueado (Retido):</span>
                              <span>{formatCurrency(projection.scenarioB.locked)}</span>
                          </div>
                      </div>

                      <div className="mt-4 bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total na Mão ao ser demitido</p>
                          <p className="text-2xl font-bold text-gray-800">{formatCurrency(projection.scenarioB.cashHand)}</p>
                          <p className="text-[10px] text-gray-400">(Apenas a Multa de 40%)</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 space-y-12">
           {/* Saque Aniversario Guide */}
           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-slate-900">Saque-Aniversário: O que você precisa saber em {currentYear}</h2>
                 <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Atualizado: {currentMonthName}/{currentYear}
                 </span>
               </div>
               
               <div className="space-y-4">
                   <p>
                       O Saque-Aniversário do FGTS é uma modalidade opcional onde o trabalhador pode retirar, anualmente, uma parcela do saldo do fundo no mês de seu aniversário.
                   </p>
                   
                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Vantagens</h3>
                   <ul className="list-disc pl-5 space-y-2">
                       <li>Dinheiro extra todo ano para pagar contas ou investir.</li>
                       <li>O saldo do FGTS não fica "preso" rendendo pouco (abaixo da inflação em alguns anos).</li>
                       <li>Possibilidade de antecipação (empréstimo) usando o saldo como garantia.</li>
                   </ul>

                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Desvantagens (O Perigo)</h3>
                   <p>A principal desvantagem é a perda da proteção em caso de <Link to="/" className="text-brand-600 hover:underline font-bold">Rescisão Sem Justa Causa</Link>:</p>
                   <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 my-4">
                       <p className="font-bold text-red-800">Bloqueio do Saldo</p>
                       <p className="text-sm text-red-700 mt-1">Se você for demitido estando no Saque-Aniversário, você <strong>NÃO poderá sacar o saldo total</strong> da conta. Você receberá apenas a multa de 40%. O restante do dinheiro continua lá e você continuará recebendo as parcelas anuais.</p>
                   </div>

                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Tabela de Alíquotas {currentYear}</h3>
                   <p>Quanto maior o saldo, menor a porcentagem que você pode sacar, mas maior a parcela fixa adicional.</p>
                   <div className="overflow-x-auto mt-2">
                       <table className="w-full text-sm text-left border border-slate-200 rounded-lg">
                           <thead className="bg-slate-50 font-bold text-slate-700">
                               <tr>
                                   <th className="p-3 border-b">Saldo na Conta</th>
                                   <th className="p-3 border-b">Alíquota</th>
                                   <th className="p-3 border-b">Parcela Adicional</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               <tr><td>Até R$ 500,00</td><td>50%</td><td>-</td></tr>
                               <tr><td>De R$ 500,01 a R$ 1.000,00</td><td>40%</td><td>R$ 50,00</td></tr>
                               <tr><td>De R$ 1.000,01 a R$ 5.000,00</td><td>30%</td><td>R$ 150,00</td></tr>
                               <tr><td>De R$ 5.000,01 a R$ 10.000,00</td><td>20%</td><td>R$ 650,00</td></tr>
                               <tr><td>De R$ 10.000,01 a R$ 15.000,00</td><td>15%</td><td>R$ 1.150,00</td></tr>
                               <tr><td>De R$ 15.000,01 a R$ 20.000,00</td><td>10%</td><td>R$ 1.900,00</td></tr>
                               <tr><td>Acima de R$ 20.000,01</td><td>5%</td><td>R$ 2.900,00</td></tr>
                           </tbody>
                       </table>
                   </div>
               </div>
           </article>

           {/* Real Estate Guide */}
           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <h2 className="text-2xl font-bold text-slate-900 mb-6">Como usar o FGTS na Compra da Casa Própria</h2>
               <div className="space-y-4">
                   <p>
                       O FGTS é um dos maiores aliados do trabalhador na hora de realizar o sonho da casa própria. Você pode usar o saldo para <strong>entrada, amortização ou quitação</strong> do financiamento.
                   </p>
                   
                   <h3 className="text-lg font-bold text-brand-700 mt-4 mb-2">Requisitos Básicos</h3>
                   <ul className="list-disc pl-5 space-y-2">
                       <li>Ter pelo menos 3 anos de trabalho sob regime do FGTS (somando todos os períodos trabalhados, consecutivos ou não).</li>
                       <li>Não possuir outro imóvel residencial na mesma cidade onde trabalha ou mora.</li>
                       <li>Não ter financiamento ativo no SFH (Sistema Financeiro de Habitação).</li>
                   </ul>

                   <h3 className="text-lg font-bold text-brand-700 mt-4 mb-2">Posso usar mesmo no Saque-Aniversário?</h3>
                   <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 my-2">
                       <p className="font-bold text-green-800">Sim!</p>
                       <p className="text-sm text-green-700 mt-1">
                           A adesão ao Saque-Aniversário <strong>não impede</strong> o uso do saldo para compra da casa própria. O que fica bloqueado é apenas o saque em caso de demissão sem justa causa. Para habitação, as regras continuam as mesmas.
                       </p>
                   </div>
               </div>
           </article>
      </section>

      <RelatedTools current="/fgts" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default FgtsCalculator;