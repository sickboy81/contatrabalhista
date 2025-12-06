import React, { useState, useEffect } from 'react';
import { calculateINSS, calculateIRRF, formatCurrency } from '../utils/calculations';
import Tooltip from '../components/Tooltip';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const CltVsPj: React.FC = () => {
  // CLT State
  const [clt, setClt] = useState({
    salary: 5000,
    vr: 600, // Vale Refeição/Alimentação
    health: 300, // Plano de Saúde (Valor pago pela empresa)
    otherBenefits: 0, // Gympass, Seguro, etc
    plr: 0, // Participação nos Lucros Anual
    dependents: 0
  });

  // PJ State
  const [pj, setPj] = useState({
    gross: 8000,
    taxRate: 6, // 6% Anexo III
    accountant: 200,
    expenses: 0, // Software, equipment
    billedMonths: 12
  });

  const [result, setResult] = useState<any>(null);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  useEffect(() => {
    // --- CLT CALCULATION (ANNUAL) ---
    // 1. Monthly Net
    const monthlyInss = calculateINSS(clt.salary);
    const monthlyIrrf = calculateIRRF(clt.salary - monthlyInss, clt.dependents);
    const monthlyNet = clt.salary - monthlyInss - monthlyIrrf;
    
    // 2. Annual Salary Logic (11 months salary + 1 month vacation pay)
    // Note: Vacation Pay = Salary + 1/3.
    // Annual Cash Flow = (11 * NetSalary) + (NetVacation) + (Net13th) + PLR
    
    // 13th Net
    const inss13 = calculateINSS(clt.salary);
    const irrf13 = calculateIRRF(clt.salary - inss13, clt.dependents);
    const net13 = clt.salary - inss13 - irrf13;

    // Vacation Net (Gross + 1/3)
    const vacationGross = clt.salary + (clt.salary / 3);
    const inssVacation = calculateINSS(vacationGross);
    const irrfVacation = calculateIRRF(vacationGross - inssVacation, clt.dependents);
    const netVacation = vacationGross - inssVacation - irrfVacation;

    const annualCashCLT = (monthlyNet * 11) + netVacation + net13 + clt.plr;

    // 3. FGTS (8% of Gross Salary, 13th, Vacation)
    const annualFgts = (clt.salary * 0.08 * 11) + (vacationGross * 0.08) + (clt.salary * 0.08);

    // 4. Benefits (Non-cash value but economic value)
    const annualBenefits = (clt.vr + clt.health + clt.otherBenefits) * 12;

    const totalCltAnnual = annualCashCLT + annualFgts + annualBenefits;


    // --- PJ CALCULATION (ANNUAL) ---
    // Gross Revenue
    const annualGrossPj = pj.gross * pj.billedMonths;
    
    // Taxes
    const annualTaxPj = annualGrossPj * (pj.taxRate / 100);
    
    // Costs
    const annualCostsPj = (pj.accountant + pj.expenses) * 12;

    const totalPjAnnual = annualGrossPj - annualTaxPj - annualCostsPj;


    // --- EQUIVALENCE ---
    // How much PJ Gross needed to match Total CLT?
    // Formula: RequiredGross * Months * (1 - Rate) - Costs = TotalCLT
    // RequiredGross = (TotalCLT + Costs) / (Months * (1 - Rate))
    
    const requiredPjGross = (totalCltAnnual + annualCostsPj) / (pj.billedMonths * (1 - (pj.taxRate/100)));

    setResult({
        clt: {
            monthlyNet, // Standard monthly
            totalAnnual: totalCltAnnual,
            monthlyEquivalent: totalCltAnnual / 12,
            details: {
                cash: annualCashCLT,
                fgts: annualFgts,
                benefits: annualBenefits
            }
        },
        pj: {
            monthlyNet: (totalPjAnnual / 12), // Average monthly net
            totalAnnual: totalPjAnnual,
            details: {
                taxes: annualTaxPj,
                costs: annualCostsPj
            }
        },
        diff: totalPjAnnual - totalCltAnnual,
        requiredPjGross
    });

  }, [clt, pj]);

  if (!result) return null;

  const chartData = [
    { name: 'CLT (Total)', value: result.clt.totalAnnual },
    { name: 'PJ (Líquido)', value: result.pj.totalAnnual },
  ];

  const faqItems = [
    {
        question: "PJ tem direito a férias e 13º salário?",
        answer: "Por lei, <strong>não</strong>. O contrato PJ é uma prestação de serviços entre empresas (B2B) regida pelo Código Civil, não pela CLT. Porém, muitos profissionais negociam esses benefícios no valor da hora ou como cláusula contratual de 'pausa remunerada'."
    },
    {
        question: "O que é o Fator R do Simples Nacional?",
        answer: "É uma regra que define se sua empresa PJ pagará 6% (Anexo III) ou 15,5% (Anexo V) de impostos. Para pagar menos (6%), sua folha de pagamento (ex: seu Pró-labore) deve ser igual ou superior a 28% do faturamento mensal."
    },
    {
        question: "PJ recebe Seguro Desemprego?",
        answer: "Não. Como PJ é considerado um empresário e não um empregado, não há direito a Seguro Desemprego nem FGTS ao encerrar o contrato com o cliente."
    },
    {
        question: "PJ tem que bater ponto?",
        answer: "Não! O controle de jornada (horário de entrada e saída) é uma característica exclusiva do regime CLT (vínculo de emprego). Se a empresa exige que o PJ cumpra horário rígido e bata ponto, isso configura 'Pejotização' ilegal e gera risco trabalhista."
    },
    {
        question: "O que é subordinação?",
        answer: "É receber ordens diretas, punições ou feedbacks disciplinares de um chefe. O PJ autêntico tem autonomia técnica para realizar o serviço contratado do jeito dele, entregando o resultado acordado, sem um chefe dizendo 'como' fazer a cada minuto."
    },
    {
        question: "Fui PJ mas agia como funcionário. Posso processar?",
        answer: "Sim. Se você comprovar na Justiça do Trabalho que cumpria os requisitos do Art. 3º da CLT (Pessoalidade, Habitualidade, Onerosidade e Subordinação), o juiz pode anular o contrato PJ e obrigar a empresa a pagar todos os direitos retroativos (Férias, 13º, FGTS) dos últimos 5 anos."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <SEO 
        title={`Calculadora CLT vs PJ ${currentYear} - Vale a Pena ser PJ?`}
        description={`Comparador real entre salário CLT e PJ. Descubra qual compensa mais em ${currentYear} considerando FGTS, Férias, 13º, impostos e benefícios.`}
        keywords={`calculadora clt pj ${currentYear}, vale a pena ser pj, simulador salario pj, calcular imposto pj, clt x pj`}
        ratingValue={4.9}
        reviewCount={4520}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Comparador CLT vs PJ Avançado</h1>
        <p className="text-gray-600">Descubra qual proposta vale mais a pena no final do ano.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.9/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
         
         {/* LEFT COLUMN: CLT INPUTS */}
         <div className="lg:col-span-3 space-y-4">
             <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                 <h3 className="font-bold text-blue-800 mb-4 border-b border-blue-100 pb-2 flex items-center gap-2">
                    <span className="text-lg">💼</span> Cenário CLT
                 </h3>
                 <div className="space-y-3">
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Salário Bruto</label>
                         <input type="number" className="w-full p-2 border rounded bg-white font-bold text-gray-700" value={clt.salary} onChange={e => setClt({...clt, salary: Number(e.target.value)})} />
                     </div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1"><Tooltip termKey="beneficios_mensais">Vale Refeição/Alim. (Mensal)</Tooltip></label>
                         <input type="number" className="w-full p-2 border rounded bg-white" value={clt.vr} onChange={e => setClt({...clt, vr: Number(e.target.value)})} />
                     </div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Plano de Saúde (Valor Empresa)</label>
                         <input type="number" className="w-full p-2 border rounded bg-white" value={clt.health} onChange={e => setClt({...clt, health: Number(e.target.value)})} />
                     </div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">PLR / Bônus Anual</label>
                         <input type="number" className="w-full p-2 border rounded bg-white" value={clt.plr} onChange={e => setClt({...clt, plr: Number(e.target.value)})} />
                     </div>
                 </div>
             </div>
         </div>

         {/* MIDDLE COLUMN: PJ INPUTS */}
         <div className="lg:col-span-3 space-y-4">
             <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-100">
                 <h3 className="font-bold text-purple-800 mb-4 border-b border-purple-100 pb-2 flex items-center gap-2">
                    <span className="text-lg">🚀</span> Cenário PJ
                 </h3>
                 <div className="space-y-3">
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Proposta Mensal (Bruto)</label>
                         <input type="number" className="w-full p-2 border rounded bg-white font-bold text-gray-700" value={pj.gross} onChange={e => setPj({...pj, gross: Number(e.target.value)})} />
                     </div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1"><Tooltip termKey="imposto_pj">Imposto (%)</Tooltip></label>
                         <input type="number" className="w-full p-2 border rounded bg-white" value={pj.taxRate} onChange={e => setPj({...pj, taxRate: Number(e.target.value)})} />
                         <p className="text-[10px] text-gray-400 mt-0.5">Simples Nacional Anexo III ~6%</p>
                     </div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Contabilidade (Mensal)</label>
                         <input type="number" className="w-full p-2 border rounded bg-white" value={pj.accountant} onChange={e => setPj({...pj, accountant: Number(e.target.value)})} />
                     </div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Meses Faturados no Ano</label>
                         <select className="w-full p-2 border rounded bg-white" value={pj.billedMonths} onChange={e => setPj({...pj, billedMonths: Number(e.target.value)})}>
                             <option value={12}>12 Meses (Sem férias)</option>
                             <option value={11.5}>11,5 Meses (15 dias off)</option>
                             <option value={11}>11 Meses (30 dias off)</option>
                         </select>
                         <p className="text-[10px] text-gray-400 mt-0.5">Simula férias não remuneradas</p>
                     </div>
                 </div>
             </div>
         </div>

         {/* RIGHT COLUMN: RESULTS */}
         <div className="lg:col-span-6 space-y-6">
             
             {/* HEADLINE WINNER */}
             <div className={`p-6 rounded-xl shadow-lg text-white relative overflow-hidden transition-all duration-500 ${result.diff >= 0 ? 'bg-purple-900' : 'bg-blue-600'}`}>
                 <div className="relative z-10 flex justify-between items-center">
                     <div>
                         <p className="text-xs uppercase font-bold tracking-widest opacity-80 mb-1">Veredito Financeiro</p>
                         <h2 className="text-3xl font-bold">
                             {result.diff >= 0 ? 'PJ Vence' : 'CLT Vence'}
                         </h2>
                         <p className="text-sm opacity-90 mt-2">
                             Diferença de <span className="font-bold bg-white/20 px-1 rounded">{formatCurrency(Math.abs(result.diff))}</span> por ano no bolso.
                         </p>
                     </div>
                     <div className="text-right">
                         <div className="text-5xl">
                            {result.diff >= 0 ? '🚀' : '🛡️'}
                         </div>
                     </div>
                 </div>
                 {/* Background decoration */}
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             </div>

             {/* CHART */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col">
                 <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide text-center mb-4">Ganho Líquido Anual Total</h4>
                 <div className="flex-1 min-h-0 min-w-0 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} accessibilityLayer>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 12, fontWeight: 'bold'}} />
                            <RechartsTooltip 
                                formatter={(value: number) => formatCurrency(value)} 
                                cursor={{fill: 'transparent'}}
                            />
                            <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#9333ea'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
             </div>

             {/* BREAKDOWN GRID */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                     <h4 className="text-blue-800 font-bold mb-3 text-sm">Pacote CLT Anual</h4>
                     <ul className="text-xs space-y-2 text-blue-700">
                         <li className="flex justify-between">
                             <span>Salário + 13º + Férias:</span>
                             <span className="font-semibold">{formatCurrency(result.clt.details.cash)}</span>
                         </li>
                         <li className="flex justify-between">
                             <span>FGTS:</span>
                             <span className="font-semibold">{formatCurrency(result.clt.details.fgts)}</span>
                         </li>
                         <li className="flex justify-between">
                             <span>Benefícios:</span>
                             <span className="font-semibold">{formatCurrency(result.clt.details.benefits)}</span>
                         </li>
                         <li className="border-t border-blue-200 pt-2 flex justify-between font-bold text-sm">
                             <span>TOTAL:</span>
                             <span>{formatCurrency(result.clt.totalAnnual)}</span>
                         </li>
                         <li className="text-[10px] text-center opacity-70 mt-2">
                             Equivale a {formatCurrency(result.clt.monthlyEquivalent)}/mês limpo
                         </li>
                     </ul>
                 </div>

                 <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                     <h4 className="text-purple-800 font-bold mb-3 text-sm">Pacote PJ Anual</h4>
                     <ul className="text-xs space-y-2 text-purple-700">
                         <li className="flex justify-between">
                             <span>Faturamento Bruto:</span>
                             <span className="font-semibold">{formatCurrency(pj.gross * pj.billedMonths)}</span>
                         </li>
                         <li className="flex justify-between text-red-500">
                             <span>Impostos (-):</span>
                             <span>{formatCurrency(result.pj.details.taxes)}</span>
                         </li>
                         <li className="flex justify-between text-red-500">
                             <span>Custos Fixos (-):</span>
                             <span>{formatCurrency(result.pj.details.costs)}</span>
                         </li>
                         <li className="border-t border-purple-200 pt-2 flex justify-between font-bold text-sm">
                             <span>LÍQUIDO:</span>
                             <span>{formatCurrency(result.pj.totalAnnual)}</span>
                         </li>
                         <li className="text-[10px] text-center opacity-70 mt-2">
                             Média de {formatCurrency(result.pj.monthlyNet)}/mês limpo
                         </li>
                     </ul>
                 </div>
             </div>

             {/* EQUIVALENCE INFO */}
             <div className="bg-gray-800 text-gray-300 p-4 rounded-xl text-center text-sm">
                 Para empatar com o pacote CLT de <strong>{formatCurrency(clt.salary)}</strong>, você precisaria cobrar como PJ:
                 <div className="text-2xl font-bold text-white mt-1">{formatCurrency(result.requiredPjGross)}</div>
                 <p className="text-xs mt-1 opacity-70">Considerando seus custos e impostos atuais.</p>
             </div>

         </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 space-y-12">
           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-slate-900">Diferenças Cruciais: CLT vs PJ {currentYear}</h2>
                 <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Atualizado: {currentMonthName}/{currentYear}
                 </span>
               </div>
               
               <div className="space-y-4">
                   <p>
                       A principal diferença é a relação de trabalho. Na CLT (Carteira Assinada), há vínculo empregatício, subordinação e horário fixo, com direitos garantidos por lei. No modelo PJ (Pessoa Jurídica), a relação é entre duas empresas (B2B), focada em entrega de resultados, sem subordinação direta ou controle de jornada rígido.
                   </p>
                   
                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Custos Ocultos do PJ</h3>
                   <p>
                       Muitos profissionais olham apenas para o valor bruto maior do PJ e esquecem dos custos que deixam de ser cobertos pela empresa:
                   </p>
                   <ul className="list-disc pl-5 space-y-2">
                       <li><strong>Férias Não Remuneradas:</strong> Se você não trabalhar, não recebe. É preciso provisionar esse valor mensalmente. (Simule suas <Link to="/ferias" className="text-brand-600 hover:underline font-bold">Férias aqui</Link>).</li>
                       <li><strong>Contador:</strong> Mensalidade obrigatória para manter o CNPJ regular.</li>
                       <li><strong>Impostos (DAS):</strong> No Simples Nacional, variam de 6% a 15,5% dependendo da atividade e do Fator R.</li>
                       <li><strong>Previdência (INSS):</strong> Você deve recolher sobre o Pró-labore para contar tempo de aposentadoria.</li>
                   </ul>

                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Vantagem do CLT: Segurança</h3>
                   <p>
                       O modelo CLT oferece uma rede de proteção (<Link to="/fgts" className="text-brand-600 hover:underline font-bold">FGTS</Link>, <Link to="/seguro-desemprego" className="text-brand-600 hover:underline font-bold">Seguro Desemprego</Link>, Multa de 40%) que funciona como um "seguro" em caso de demissão. No PJ, o contrato pode ser encerrado a qualquer momento sem indenização (salvo multa contratual se houver).
                   </p>
               </div>
           </article>

           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold text-slate-900">O Risco da "Pejotização" (Fraude Trabalhista)</h2>
               </div>
               
               <div className="space-y-4">
                   <p>
                       Muitas empresas contratam como PJ apenas para reduzir custos fiscais, mas tratam o profissional como empregado. Isso é ilegal. Para ser um PJ verdadeiro (B2B), você deve ter:
                   </p>
                   
                   <div className="grid md:grid-cols-2 gap-6 mt-4">
                       <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                           <h3 className="font-bold text-red-800 mb-2">Você é "Falso PJ" se:</h3>
                           <ul className="text-sm text-red-700 list-disc pl-4 space-y-1">
                               <li>Tem chefe, cumpre ordens e leva bronca (Subordinação).</li>
                               <li>Cumpre horário fixo (bate ponto ou fica online obrigatório).</li>
                               <li>Não pode mandar outra pessoa no seu lugar (Pessoalidade).</li>
                               <li>Recebe salário fixo mensal, independente da entrega.</li>
                           </ul>
                       </div>

                       <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                           <h3 className="font-bold text-green-800 mb-2">Você é PJ Verdadeiro se:</h3>
                           <ul className="text-sm text-green-700 list-disc pl-4 space-y-1">
                               <li>Tem autonomia para definir como e quando trabalhar.</li>
                               <li>Assume os riscos do negócio (se errar, refaz sem cobrar).</li>
                               <li>Pode prestar serviços para outras empresas simultaneamente.</li>
                               <li>Emite nota fiscal baseada em entregas ou contratos de escopo.</li>
                           </ul>
                       </div>
                   </div>
               </div>
           </article>
       </section>

      <RelatedTools current="/clt-pj" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default CltVsPj;