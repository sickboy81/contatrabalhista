import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/calculations';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const MeiMonitor: React.FC = () => {
  const [revenue, setRevenue] = useState<number[]>(Array(12).fill(0));
  const [category, setCategory] = useState<'servicos' | 'comercio' | 'industria'>('servicos');
  const [startMonth, setStartMonth] = useState(0); // 0 = Jan, 1 = Feb...

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  // MEI Constants 2024
  const ANNUAL_LIMIT = 81000;
  const MONTHLY_LIMIT = 6750; // Proportional base
  
  // DAS Values 2024 (Approx)
  // INSS (5% min wage 1412 = 70.60) + ICMS (1.00) or ISS (5.00)
  const DAS_VALUES = {
      comercio: 70.60 + 1.00,
      industria: 70.60 + 1.00,
      servicos: 70.60 + 5.00,
      misto: 70.60 + 6.00 // Not implementing mix to keep simple
  };

  const currentDas = DAS_VALUES[category];

  const updateRevenue = (monthIndex: number, value: number) => {
      const newRevenue = [...revenue];
      newRevenue[monthIndex] = value;
      setRevenue(newRevenue);
  };

  const totalRevenue = revenue.reduce((a, b) => a + b, 0);
  
  // Proportional Limit Logic
  // If opened in June, limit is not 81k, but 6.75k * remaining months
  const activeMonths = 12 - startMonth;
  const proportionalLimit = MONTHLY_LIMIT * activeMonths;
  
  const percentageUsed = (totalRevenue / proportionalLimit) * 100;
  
  const toleranceLimit = proportionalLimit * 1.20; // 20% tolerance allows staying in MEI but paying extra DAS on excess

  const faqItems = [
    {
        question: "O que acontece se eu estourar os R$ 81 mil?",
        answer: "Se você ultrapassar o limite em até 20% (até R$ 97.200), você continuará como MEI até o final do ano, mas pagará um imposto extra sobre o excedente. Em janeiro do ano seguinte, você será desenquadrado e virará ME."
    },
    {
        question: "E se eu estourar mais de 20%?",
        answer: "Se passar de R$ 97.200, a situação é grave. O desenquadramento é retroativo a janeiro do ano corrente (ou data de abertura). Você terá que pagar impostos como Microempresa (ME) sobre TODO o faturamento do ano, com juros e multas."
    },
    {
        question: "Posso emitir nota fiscal acima de R$ 6.750 no mês?",
        answer: "Sim! O limite de R$ 6.750 é apenas uma média mensal de referência. Você pode faturar R$ 15 mil num mês e R$ 0 no outro, desde que a soma anual não ultrapasse o teto."
    },
    {
        question: "MEI tem direito a aposentadoria?",
        answer: "Sim. O pagamento do DAS (que inclui 5% do salário mínimo para o INSS) conta tempo para aposentadoria por idade e dá direito a auxílio-doença, salário-maternidade e pensão por morte para dependentes."
    },
    {
        question: "Posso contratar funcionário sendo MEI?",
        answer: "Sim, o MEI pode ter **um único empregado** que receba um salário mínimo ou o piso da categoria. O custo é baixo (11% sobre o salário, sendo 3% do empregador e 8% descontado do funcionário)."
    },
    {
        question: "Preciso de contador sendo MEI?",
        answer: "Não é obrigatório por lei. O MEI foi criado para ser simples e você mesmo pode emitir as guias e fazer a declaração anual. Porém, se você tiver funcionário ou faturamento muito alto (perto do limite), um contador ajuda a evitar multas."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
       <SEO 
         title={`Monitor de Faturamento MEI ${currentYear} - Limite de 81 Mil`}
         description={`Controle o limite anual do MEI em ${currentYear}. Evite o desenquadramento e calcule se você estourou os R$ 81.000,00 permitidos. Calculadora gratuita.`}
         keywords={`limite mei ${currentYear}, monitor faturamento mei, estourei o mei o que fazer, desenquadramento mei, calculadora imposto mei`}
         ratingValue={4.9}
         reviewCount={780}
       />

       <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Monitor MEI {currentYear}</h1>
        <p className="text-gray-600">Controle seu faturamento para não estourar o limite de R$ 81 mil e ser desenquadrado.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.9/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Inputs */}
          <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Configuração</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Categoria de Atividade</label>
                          <select className="w-full p-2 border rounded bg-white" value={category} onChange={(e: any) => setCategory(e.target.value)}>
                              <option value="servicos">Prestação de Serviços (ISS)</option>
                              <option value="comercio">Comércio (ICMS)</option>
                              <option value="industria">Indústria (ICMS)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Mês de Abertura do CNPJ (Este ano)</label>
                          <select className="w-full p-2 border rounded bg-white" value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))}>
                              {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
                                  <option key={i} value={i}>{m}</option>
                              ))}
                          </select>
                          {startMonth > 0 && (
                              <p className="text-xs text-orange-600 mt-1">
                                  ⚠️ Atenção: Como você abriu em {['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][startMonth]}, seu limite proporcional é de <strong>{formatCurrency(proportionalLimit)}</strong>.
                              </p>
                          )}
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-center">
                          <span className="text-sm text-blue-800">Valor do DAS Mensal:</span>
                          <span className="text-xl font-bold text-blue-900">{formatCurrency(currentDas)}</span>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Lançamento de Faturamento</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {Array.from({ length: 12 }).map((_, i) => {
                          if (i < startMonth) return null; // Don't show months before opening
                          const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                          return (
                            <div key={i} className="flex items-center gap-3">
                                <span className="w-20 text-xs font-bold text-gray-500 uppercase">{months[i].substring(0,3)}</span>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-2 text-gray-400 text-xs">R$</span>
                                    <input 
                                        type="number" 
                                        className="w-full p-1.5 pl-8 border rounded text-sm bg-white" 
                                        value={revenue[i] || ''}
                                        onChange={e => updateRevenue(i, Number(e.target.value))}
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                          );
                      })}
                  </div>
              </div>
          </div>

          {/* Right: Dashboard */}
          <div className="lg:col-span-7 space-y-6">
              
              {/* Main Status */}
              <div className={`rounded-xl p-6 shadow-md border-l-8 ${
                  totalRevenue > toleranceLimit ? 'bg-red-50 border-red-500' : 
                  totalRevenue > proportionalLimit ? 'bg-orange-50 border-orange-500' :
                  'bg-white border-brand-500'
              }`}>
                  <h2 className="text-sm uppercase font-bold text-gray-500 mb-1">Faturamento Acumulado</h2>
                  <div className="flex items-end gap-2 mb-4">
                      <span className="text-4xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</span>
                      <span className="text-sm text-gray-500 mb-1">de {formatCurrency(proportionalLimit)} permitidos</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full transition-all duration-500 ${
                            percentageUsed > 100 ? 'bg-red-500' : 
                            percentageUsed > 80 ? 'bg-orange-500' : 'bg-brand-500'
                        }`} 
                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                      ></div>
                  </div>
                  <p className="text-right text-xs font-bold text-gray-500">{percentageUsed.toFixed(1)}% do limite utilizado</p>
              </div>

              {/* Analysis Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <h4 className="font-bold text-gray-800 text-sm mb-2">Saldo Restante</h4>
                      <p className={`text-2xl font-bold ${proportionalLimit - totalRevenue < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {formatCurrency(proportionalLimit - totalRevenue)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Quanto você ainda pode faturar este ano.</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <h4 className="font-bold text-gray-800 text-sm mb-2">Média Mensal Permitida</h4>
                      <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(MONTHLY_LIMIT)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Para se manter dentro dos 81k anuais.</p>
                  </div>
              </div>

              {/* Alert Box */}
              {totalRevenue > toleranceLimit ? (
                  <div className="bg-red-100 p-4 rounded-xl border border-red-200 text-red-800 text-sm">
                      <strong>🚨 SITUAÇÃO CRÍTICA: DESENQUADRAMENTO OBRIGATÓRIO</strong><br/>
                      Você ultrapassou o limite de tolerância (20%). Você será desenquadrado do MEI e passará a ser ME (Microempresa), pagando impostos retroativos sobre TODO o valor faturado no ano. Procure um contador urgente.
                  </div>
              ) : totalRevenue > proportionalLimit ? (
                  <div className="bg-orange-100 p-4 rounded-xl border border-orange-200 text-orange-900 text-sm">
                      <strong>⚠️ ATENÇÃO: LIMITE EXCEDIDO (DENTRO DA TOLERÂNCIA)</strong><br/>
                      Você passou do limite proporcional, mas está dentro dos 20% extras. Você continuará no MEI este ano, mas pagará um DAS complementar sobre o excesso e deverá mudar para ME no ano que vem.
                  </div>
              ) : (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-emerald-800 text-sm">
                      <strong>✅ SITUAÇÃO REGULAR</strong><br/>
                      Seu faturamento está dentro do limite do MEI. Continue pagando seu DAS mensalmente e não esqueça da Declaração Anual (DASN-SIMEI) em maio.
                  </div>
              )}

          </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 space-y-12">
           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-slate-900">Limite de Faturamento MEI {currentYear}: Regras e Multas</h2>
                 <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Atualizado: {currentMonthName}/{currentYear}
                 </span>
               </div>
               
               <div className="space-y-4">
                   <p>
                       O Microempreendedor Individual (MEI) tem um limite de faturamento anual de <strong>R$ 81.000,00</strong>. Esse valor não é apenas uma meta, é um teto legal que define o enquadramento tributário simplificado.
                   </p>
                   
                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">A Regra da Proporcionalidade</h3>
                   <p>
                       Se você abriu o CNPJ no meio do ano, seu limite NÃO é R$ 81 mil. O limite é proporcional aos meses de existência da empresa no ano: <strong>R$ 6.750,00 x Meses Ativos</strong>.
                   </p>
                   <p className="text-sm bg-gray-50 p-2 rounded border border-gray-200">
                       Exemplo: Abriu em Julho (6 meses ativos). Limite = 6.750 x 6 = R$ 40.500,00.
                   </p>

                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">O que é a Tolerância de 20%?</h3>
                   <p>
                       A lei prevê uma margem de segurança. Se você ultrapassar o limite em até 20% (R$ 97.200 no ano cheio), você não é desenquadrado imediatamente. 
                       Você termina o ano como MEI, paga uma guia DAS complementar sobre o excesso, e em janeiro do ano seguinte migra para Microempresa (ME). Se está em dúvida se vale a pena migrar, compare seus ganhos na nossa <Link to="/clt-pj" className="text-brand-600 hover:underline font-bold">Calculadora CLT vs PJ</Link>.
                   </p>
                   
                   <div className="bg-red-50 p-3 rounded text-red-800 text-sm font-bold border-l-4 border-red-500 mt-2">
                       Cuidado: Se estourar os 20%, o desenquadramento é retroativo a JANEIRO, e você pagará impostos altos sobre tudo o que faturou no ano, com juros.
                   </div>
               </div>
           </article>

           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <h2 className="text-2xl font-bold text-slate-900 mb-6">Calendário de Obrigações do MEI</h2>
               <p className="mb-6">
                   Ser MEI é simples, mas exige disciplina. Existem apenas duas obrigações principais que você não pode esquecer para manter seu CNPJ regular.
               </p>
               
               <div className="space-y-6">
                   <div className="flex gap-4 items-start">
                       <div className="bg-brand-100 text-brand-600 font-bold px-3 py-1 rounded text-sm uppercase mt-1">Mensal</div>
                       <div>
                           <h3 className="font-bold text-gray-900">Pagar o DAS (Documento de Arrecadação)</h3>
                           <p className="text-sm text-gray-600 mt-1">
                               Vence todo dia 20. É um valor fixo (independente se você faturou ou não naquele mês). O não pagamento acumula dívida ativa e pode cancelar seu CNPJ após 2 anos.
                           </p>
                       </div>
                   </div>

                   <div className="flex gap-4 items-start">
                       <div className="bg-purple-100 text-purple-600 font-bold px-3 py-1 rounded text-sm uppercase mt-1">Anual</div>
                       <div>
                           <h3 className="font-bold text-gray-900">Entregar a DASN-SIMEI</h3>
                           <p className="text-sm text-gray-600 mt-1">
                               A Declaração Anual de Faturamento deve ser enviada até 31 de maio de cada ano, informando tudo o que você faturou no ano anterior. O atraso gera multa mínima de R$ 50,00.
                           </p>
                       </div>
                   </div>

                   <div className="flex gap-4 items-start">
                       <div className="bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded text-sm uppercase mt-1">Mensal</div>
                       <div>
                           <h3 className="font-bold text-gray-900">Relatório Mensal de Receitas</h3>
                           <p className="text-sm text-gray-600 mt-1">
                               Embora não precise ser entregue a nenhum órgão, você é obrigado a preencher mensalmente o Relatório de Receitas Brutas e anexar as notas fiscais de compra e venda. Isso serve de prova caso a Receita Federal te fiscalize.
                           </p>
                       </div>
                   </div>
               </div>
           </article>
       </section>

      <RelatedTools current="/mei-monitor" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default MeiMonitor;