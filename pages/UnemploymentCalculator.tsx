import React, { useState } from 'react';
import { calculateUnemploymentBenefit, formatCurrency, formatDate } from '../utils/calculations';
import Tooltip from '../components/Tooltip';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';
import {
  MINIMUM_WAGE,
  UNEMPLOYMENT_CEILING,
  UNEMPLOYMENT_FIRST_RANGE_LIMIT,
  UNEMPLOYMENT_SECOND_RANGE_LIMIT
} from '../utils/taxConstants';

const UnemploymentCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    salary1: '',
    salary2: '',
    salary3: '',
    monthsWorked: 24,
    requestCount: 1,
    dismissalDate: new Date().toISOString().split('T')[0]
  });

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const [result, setResult] = useState<{ 
    benefitValue: number; 
    installments: number; 
    average: number;
    schedule: { date: string, value: number, index: number }[] 
  } | null>(null);

  const handleCalculate = () => {
    // Treat empty strings as 0
    const s1 = Number(inputs.salary1) || 0;
    const s2 = Number(inputs.salary2) || 0;
    const s3 = Number(inputs.salary3) || 0;

    // Calculate Average (Only considering non-zero inputs if user worked less than 3 months, 
    // but standard rule is sum of last 3 / 3, or distinct logic. 
    // Simplified rule: Sum of existing / count of existing)
    const validSalaries = [s1, s2, s3].filter(s => s > 0);
    const average = validSalaries.length > 0 
        ? validSalaries.reduce((a, b) => a + b, 0) / validSalaries.length 
        : 0;

    const res = calculateUnemploymentBenefit(average, inputs.monthsWorked, inputs.requestCount);
    
    // Generate Schedule
    const schedule = [];
    const baseDate = new Date(inputs.dismissalDate);
    // Usually, the first payment is 30 days after the request, which is done shortly after dismissal.
    // We estimate 30 days after dismissal + processing time (approx 30 days).
    // Let's assume Request Date = Dismissal Date for simulation simplicity + 30 days intervals.
    
    for (let i = 1; i <= res.installments; i++) {
        const payDate = new Date(baseDate);
        payDate.setDate(baseDate.getDate() + (i * 30));
        schedule.push({
            index: i,
            date: payDate.toISOString().split('T')[0],
            value: res.benefitValue
        });
    }

    setResult({ ...res, average, schedule });
  };

  const faqItems = [
    {
      question: "Quem tem direito ao Seguro Desemprego?",
      answer: "Tem direito o trabalhador formal demitido <strong>sem justa causa</strong>, que não possua renda própria suficiente para sua manutenção e não esteja recebendo benefício previdenciário (exceto auxílio-acidente e pensão por morte)."
    },
    {
      question: `Qual o valor máximo do Seguro Desemprego em ${currentYear}?`,
      answer: `O valor máximo da parcela é de <strong>${formatCurrency(UNEMPLOYMENT_CEILING)}</strong>. O valor mínimo não pode ser inferior a <strong>${formatCurrency(MINIMUM_WAGE)}</strong>.`
    },
    {
      question: "Quantas parcelas vou receber?",
      answer: "Depende de quantas vezes você já solicitou. <br/>• <strong>1ª solicitação:</strong> 4 parcelas (se trabalhou 12-23 meses) ou 5 parcelas (24+ meses). <br/>• <strong>2ª solicitação:</strong> 3 parcelas (9-11 meses), 4 (12-23 meses) ou 5 (24+ meses). <br/>• <strong>3ª em diante:</strong> 3 parcelas (6-11 meses), 4 (12-23 meses) ou 5 (24+ meses)."
    },
    {
      question: "Qual o prazo para dar entrada?",
      answer: "O prazo é de 7 a 120 dias corridos após a data da demissão. O pedido pode ser feito pelo aplicativo Carteira de Trabalho Digital ou portal Gov.br."
    },
    {
      question: "Tenho CNPJ MEI, recebo Seguro Desemprego?",
      answer: "Em regra, <strong>não</strong>. O governo entende que o CNPJ ativo gera renda. Porém, se você provar que o MEI está inativo (sem faturamento) através da declaração anual zerada, é possível conseguir o benefício mediante recurso administrativo."
    },
    {
      question: "Fiz acordo para sair da empresa, tenho direito?",
      answer: "Não. A demissão por <strong>comum acordo</strong> (distrato) permite o saque de 80% do FGTS, mas retira expressamente o direito ao Seguro Desemprego."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <SEO 
        title={`Calculadora de Seguro Desemprego ${currentYear} - Valor e Parcelas`}
        description={`Simule quantas parcelas do Seguro Desemprego você vai receber e qual o valor exato. Baseado na média salarial e novas regras de ${currentYear}.`}
        keywords={`calcular seguro desemprego, valor parcela seguro, quantas parcelas seguro desemprego, simulador seguro desemprego ${currentYear}`}
        ratingValue={4.8}
        reviewCount={1120}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Simulador de Seguro Desemprego</h1>
        <p className="text-gray-600">Descubra o valor, quantidade de parcelas e as datas de pagamento.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.8/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
            <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <span className="bg-brand-100 text-brand-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Dados Financeiros
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tooltip termKey="ultimos_salarios">Últimos 3 Salários Brutos</Tooltip>
              </label>
              <div className="space-y-2">
                  <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 text-sm">1º (Último)</span>
                      <input 
                        type="number" 
                        className="w-full p-2 pl-24 border rounded bg-white font-semibold text-gray-700 focus:ring-2 focus:ring-brand-500 outline-none" 
                        placeholder="R$ 0,00" 
                        value={inputs.salary1} 
                        onChange={e => setInputs({...inputs, salary1: e.target.value})} 
                      />
                  </div>
                  <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 text-sm">2º (Penúltimo)</span>
                      <input 
                        type="number" 
                        className="w-full p-2 pl-24 border rounded bg-white text-gray-700 focus:ring-2 focus:ring-brand-500 outline-none" 
                        placeholder="R$ 0,00" 
                        value={inputs.salary2} 
                        onChange={e => setInputs({...inputs, salary2: e.target.value})} 
                      />
                  </div>
                  <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 text-sm">3º (Antepen.)</span>
                      <input 
                        type="number" 
                        className="w-full p-2 pl-24 border rounded bg-white text-gray-700 focus:ring-2 focus:ring-brand-500 outline-none" 
                        placeholder="R$ 0,00" 
                        value={inputs.salary3} 
                        onChange={e => setInputs({...inputs, salary3: e.target.value})} 
                      />
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Tooltip termKey="meses_trabalhados">Meses Trabalhados</Tooltip>
                    </label>
                    <input type="number" className="w-full p-2 border rounded bg-white" value={inputs.monthsWorked} onChange={e => setInputs({...inputs, monthsWorked: Number(e.target.value)})} />
                    <p className="text-[10px] text-gray-500 mt-1">Nos últimos 36 meses</p>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                         <Tooltip termKey="quantidade_solicitacoes">Vezes Solicitado</Tooltip>
                     </label>
                     <select className="w-full p-2 border rounded bg-white" value={inputs.requestCount} onChange={e => setInputs({...inputs, requestCount: Number(e.target.value)})}>
                         <option value={1}>1ª Solicitação</option>
                         <option value={2}>2ª Solicitação</option>
                         <option value={3}>3ª ou mais</option>
                     </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data da Demissão</label>
                <input type="date" className="w-full p-2 border rounded bg-white" value={inputs.dismissalDate} onChange={e => setInputs({...inputs, dismissalDate: e.target.value})} />
                <p className="text-[10px] text-gray-500 mt-1">Usada para projetar as datas de pagamento.</p>
            </div>

            <button onClick={handleCalculate} className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-500/20 active:scale-[0.98]">
              Calcular Benefício
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
             {!result ? (
                 <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                     <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                     </div>
                     <h3 className="text-lg font-bold text-gray-700">Resultado da Simulação</h3>
                     <p className="text-gray-500 max-w-xs mt-2">Preencha os dados ao lado para ver o valor da parcela e o calendário de pagamentos.</p>
                 </div>
             ) : (
                 <div className="space-y-6 animate-fade-in-up">
                    
                    {/* Main Card */}
                    {result.installments === 0 ? (
                         <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
                             <div className="text-red-500 font-bold text-lg mb-2">Benefício Não Concedido</div>
                             <p className="text-red-700 text-sm">
                                 Com {inputs.monthsWorked} meses trabalhados nesta {inputs.requestCount}ª solicitação, você não atingiu a carência mínima exigida por lei.
                             </p>
                         </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Valor da Parcela</p>
                                            <p className="text-4xl font-bold">{formatCurrency(result.benefitValue)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                                                <p className="text-2xl font-bold">{result.installments}x</p>
                                                <p className="text-[10px] uppercase text-slate-300">Parcelas</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-xs text-slate-400">
                                        <span>Total a receber: {formatCurrency(result.benefitValue * result.installments)}</span>
                                        <span>Média Salarial: {formatCurrency(result.average)}</span>
                                    </div>
                                </div>
                                
                                {/* Calculation Breakdown */}
                                <div className="p-4 bg-gray-50 border-b border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Entenda o Cálculo</p>
                                    <div className="text-sm text-gray-700 space-y-1">
                                        <p>1. Sua média salarial foi de <strong>{formatCurrency(result.average)}</strong>.</p>
                                        <p>2. Aplicando a regra da faixa salarial (Tabela {currentYear})...</p>
                                        {result.average > UNEMPLOYMENT_SECOND_RANGE_LIMIT ? (
                                            <p className="text-brand-600 font-medium">3. Você atingiu o teto do benefício ({formatCurrency(UNEMPLOYMENT_CEILING)}).</p>
                                        ) : result.average <= UNEMPLOYMENT_FIRST_RANGE_LIMIT ? (
                                            <p className="text-brand-600 font-medium">3. Calcula-se 80% da média.</p>
                                        ) : (
                                            <p className="text-brand-600 font-medium">3. Calcula-se regra mista (Faixa intermediária).</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Calendar */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">📅</span>
                                    Calendário Estimado
                                </h3>
                                <div className="space-y-3">
                                    {result.schedule.map((pay) => (
                                        <div key={pay.index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center text-xs group-hover:bg-brand-200 group-hover:text-brand-700 transition-colors">
                                                    {pay.index}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-700">{formatDate(pay.date)}</p>
                                                    <p className="text-xs text-gray-400">Previsão de Saque</p>
                                                </div>
                                            </div>
                                            <div className="font-bold text-gray-800">
                                                {formatCurrency(pay.value)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-4 text-center">
                                    * As datas são estimativas baseadas em intervalos de 30 dias após a liberação. Consulte o app Carteira de Trabalho Digital para datas oficiais.
                                </p>
                            </div>
                        </>
                    )}
                 </div>
             )}
        </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 space-y-12">
           {/* General Guide */}
           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-slate-900">Guia Completo: Seguro Desemprego {currentYear}</h2>
                 <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Atualizado: {currentMonthName}/{currentYear}
                 </span>
               </div>
               
               <div className="space-y-4">
                   <p>
                       O Seguro Desemprego é um dos benefícios mais importantes da Seguridade Social, oferecendo assistência financeira temporária ao trabalhador dispensado involuntariamente (sem justa causa). 
                       Se você acabou de calcular sua <Link to="/" className="text-brand-600 font-bold hover:underline">Rescisão Trabalhista</Link>, este é o próximo passo.
                   </p>
                   
                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Quem tem direito?</h3>
                   <ul className="list-disc pl-5 space-y-2">
                       <li>Trabalhadores formais demitidos <strong>sem justa causa</strong>.</li>
                       <li>Trabalhadores domésticos (quando o empregador recolhe FGTS).</li>
                       <li>Pescadores artesanais no período do defeso.</li>
                       <li>Trabalhadores resgatados de condição análoga à de escravo.</li>
                   </ul>

                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Regra de Carência (Meses Trabalhados)</h3>
                   <p>Para solicitar o benefício, é necessário ter recebido salários por um período específico antes da data de demissão:</p>
                   <ul className="list-disc pl-5 space-y-2">
                       <li><strong>1ª Solicitação:</strong> Pelo menos 12 meses nos últimos 18 meses anteriores à data de dispensa.</li>
                       <li><strong>2ª Solicitação:</strong> Pelo menos 9 meses nos últimos 12 meses.</li>
                       <li><strong>3ª Solicitação ou mais:</strong> Cada um dos 6 meses anteriores à dispensa.</li>
                   </ul>

                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Tabela de Cálculo {currentYear}</h3>
                   <p>O valor da parcela é calculado com base na média dos últimos 3 salários anteriores à demissão. Para {currentYear}, as faixas são:</p>
                   <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left mt-2 border border-slate-200 rounded-lg">
                           <thead className="bg-slate-50 font-bold text-slate-700">
                               <tr>
                                   <th className="p-3 border-b">Média Salarial</th>
                                   <th className="p-3 border-b">Cálculo da Parcela</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               <tr>
                                   <td className="p-3">Até {formatCurrency(UNEMPLOYMENT_FIRST_RANGE_LIMIT)}</td>
                                   <td className="p-3">Multiplica-se a média por 0.8 (80%)</td>
                               </tr>
                               <tr>
                                   <td className="p-3">De {formatCurrency(UNEMPLOYMENT_FIRST_RANGE_LIMIT + 0.01)} até {formatCurrency(UNEMPLOYMENT_SECOND_RANGE_LIMIT)}</td>
                                   <td className="p-3">O que exceder {formatCurrency(UNEMPLOYMENT_FIRST_RANGE_LIMIT)} multiplica por 0.5 + valor adicional da faixa vigente</td>
                               </tr>
                               <tr>
                                   <td className="p-3">Acima de {formatCurrency(UNEMPLOYMENT_SECOND_RANGE_LIMIT)}</td>
                                   <td className="p-3">Valor fixo de {formatCurrency(UNEMPLOYMENT_CEILING)} (Teto)</td>
                               </tr>
                           </tbody>
                       </table>
                   </div>
                   <p className="text-xs text-gray-500 mt-2">* O valor da parcela não pode ser inferior ao salário mínimo vigente.</p>
               </div>
           </article>

           {/* Step by Step Guide */}
           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <h2 className="text-2xl font-bold text-slate-900 mb-6">Passo a Passo: Como dar entrada online</h2>
               <div className="space-y-6">
                   <p>
                       Não é mais necessário ir até uma agência do SINE. O processo é 100% digital e pode ser feito pelo celular.
                   </p>
                   
                   <ol className="relative border-l border-brand-200 ml-4 space-y-8">
                       <li className="ml-6">
                           <span className="absolute flex items-center justify-center w-8 h-8 bg-brand-100 rounded-full -left-4 ring-4 ring-white font-bold text-brand-600">1</span>
                           <h4 className="font-bold text-gray-900">Baixe o Aplicativo</h4>
                           <p className="text-sm mt-1">Instale o app "Carteira de Trabalho Digital" (Gov.br) no seu celular Android ou iOS.</p>
                       </li>
                       <li className="ml-6">
                           <span className="absolute flex items-center justify-center w-8 h-8 bg-brand-100 rounded-full -left-4 ring-4 ring-white font-bold text-brand-600">2</span>
                           <h4 className="font-bold text-gray-900">Acesse a aba "Benefícios"</h4>
                           <p className="text-sm mt-1">No menu inferior, clique em "Benefícios" e procure o quadro "Seguro-Desemprego". Clique em "Solicitar".</p>
                       </li>
                       <li className="ml-6">
                           <span className="absolute flex items-center justify-center w-8 h-8 bg-brand-100 rounded-full -left-4 ring-4 ring-white font-bold text-brand-600">3</span>
                           <h4 className="font-bold text-gray-900">Digite o Requerimento</h4>
                           <p className="text-sm mt-1">Tenha em mãos o número do <strong>Requerimento (10 dígitos)</strong> que está no alto do formulário entregue pela empresa na demissão.</p>
                       </li>
                       <li className="ml-6">
                           <span className="absolute flex items-center justify-center w-8 h-8 bg-brand-100 rounded-full -left-4 ring-4 ring-white font-bold text-brand-600">4</span>
                           <h4 className="font-bold text-gray-900">Confirme e Acompanhe</h4>
                           <p className="text-sm mt-1">Confira seus dados bancários para depósito e finalize. A primeira parcela costuma ser liberada em 30 dias após o cadastro.</p>
                       </li>
                   </ol>

                   <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm text-amber-900">
                       <strong>Dica Importante:</strong> Seus dados no cadastro devem ser <strong>idênticos</strong> aos informados pela empresa no eSocial. Se houver divergência (ex: data de admissão errada), o sistema bloqueará o pedido e você terá que abrir um recurso no site do Ministério do Trabalho.
                   </div>
               </div>
           </article>
      </section>

      <RelatedTools current="/seguro-desemprego" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default UnemploymentCalculator;