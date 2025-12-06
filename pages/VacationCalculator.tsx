import React, { useState, useEffect } from 'react';
import { calculateINSS, calculateIRRF, formatCurrency, formatDate } from '../utils/calculations';
import Tooltip from '../components/Tooltip';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const VacationCalculator: React.FC = () => {
  // Inputs
  const [salary, setSalary] = useState(3000);
  const [dependents, setDependents] = useState(0);
  const [absences, setAbsences] = useState(0); // Faltas injustificadas
  
  // Options
  const [sellDays, setSellDays] = useState(false); // Abono
  const [advance13th, setAdvance13th] = useState(false); // Adiantar 1ª parcela
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Selection
  const [daysToTake, setDaysToTake] = useState(30);

  // Derived State (Calculated on the fly)
  const [entitledDays, setEntitledDays] = useState(30);
  const [maxDaysToTake, setMaxDaysToTake] = useState(30);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  // Effect to update entitlements based on absences
  useEffect(() => {
      let rights = 30;
      if (absences > 32) rights = 0;
      else if (absences >= 24) rights = 12;
      else if (absences >= 15) rights = 18;
      else if (absences >= 6) rights = 24;
      
      setEntitledDays(rights);

      // Reset selection if rights changed
      // If selling 10 days, max to take is rights - 10
      const selling = (sellDays && rights > 15) ? 10 : 0;
      const newMax = rights - selling;
      
      setMaxDaysToTake(newMax);
      if (daysToTake > newMax) setDaysToTake(newMax);
      
      // If sellDays was checked but rights are too low (e.g. 12 days), uncheck it
      if (sellDays && rights <= 15) setSellDays(false);

  }, [absences, sellDays, daysToTake]);

  const calculate = () => {
      const sellingDays = sellDays ? 10 : 0;
      
      // Values
      const dailySalary = salary / 30;
      
      // 1. Vacation Pay (Days taken)
      const vacationGross = dailySalary * daysToTake;
      const vacationOneThird = vacationGross / 3;

      // 2. Abono (Sold days) - Indemnified (No Tax)
      const abonoGross = dailySalary * sellingDays;
      const abonoOneThird = abonoGross / 3;

      // 3. 13th Advance (No Tax usually in the advance, adjusted in Nov/Dec)
      // Standard practice: No INSS/IRRF on the advance.
      const val13th = advance13th ? salary / 2 : 0;

      // Taxes
      // INSS/IRRF apply ONLY to Vacation + 1/3. 
      // Abono and its 1/3 are exempt. 13th Advance is exempt at moment of payment.
      const taxBase = vacationGross + vacationOneThird;
      
      const inss = calculateINSS(taxBase);
      const irrf = calculateIRRF(taxBase - inss, dependents);

      const totalNet = (vacationGross + vacationOneThird + abonoGross + abonoOneThird + val13th) - inss - irrf;

      // Return Date Logic
      const start = new Date(startDate);
      // Add daysToTake
      const returnDate = new Date(start);
      returnDate.setDate(returnDate.getDate() + daysToTake);

      return {
          entitledDays,
          vacationGross,
          vacationOneThird,
          abonoGross,
          abonoOneThird,
          val13th,
          inss,
          irrf,
          totalNet,
          returnDate: returnDate.toLocaleDateString('pt-BR'),
          sellingDays
      };
  };

  const result = calculate();

  const faqItems = [
    {
        question: "Quando o pagamento das férias deve cair na conta?",
        answer: "A empresa deve pagar as férias e o abono pecuniário até <strong>2 dias antes</strong> do início do período de descanso. Se atrasar, a empresa pode ser condenada a pagar o valor em dobro."
    },
    {
        question: "Sou obrigado a vender 10 dias de férias?",
        answer: "Não. A conversão de 1/3 das férias em dinheiro (abono pecuniário) é um <strong>direito do empregado</strong>, e não uma obrigação. A empresa não pode te forçar a vender, mas também não pode recusar se você pedir no prazo legal (até 15 dias antes do fim do período aquisitivo)."
    },
    {
        question: "Quem escolhe a data das férias: eu ou a empresa?",
        answer: "Pela lei, <strong>a empresa decide</strong> a época das férias, conforme a necessidade do negócio. Porém, é prática comum haver um acordo amigável. A exceção são membros da mesma família que trabalham na mesma empresa (têm direito a férias juntas) e estudantes menores de 18 anos (coincidir com férias escolares)."
    },
    {
        question: "Incide imposto sobre a venda das férias?",
        answer: "Não. O valor recebido pela venda dos 10 dias (abono pecuniário) e seu respectivo terço constitucional têm natureza indenizatória, portanto, <strong>não sofrem desconto de INSS nem de Imposto de Renda</strong>."
    },
    {
        question: "Posso ser demitido durante as férias?",
        answer: "Não. Durante o período de gozo de férias, o contrato de trabalho está interrompido. A empresa só pode demitir o funcionário quando ele retornar ao trabalho."
    },
    {
        question: "Posso dividir minhas férias em quantos períodos?",
        answer: "Com a Reforma Trabalhista, as férias podem ser divididas em até 3 períodos. Um deles não pode ser inferior a 14 dias corridos e os outros não podem ser inferiores a 5 dias corridos cada."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <SEO 
        title={`Calculadora de Férias ${currentYear} - Venda de Dias e Abono`}
        description={`Simulador de Férias CLT atualizado ${currentYear}. Calcule quanto você vai receber, se vale a pena vender 10 dias (abono pecuniário) e o adiantamento do 13º salário.`}
        keywords={`calcular férias ${currentYear}, vender férias 10 dias, abono pecuniário, calculo férias online, calculadora de ferias`}
        ratingValue={4.8}
        reviewCount={1840}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Planejador de Férias Inteligente</h1>
        <p className="text-gray-600">Simule vendas de dias, impacto de faltas e adiantamento do 13º.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.8/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Config */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">1</span>
                   Seus Dados
               </h3>
               <div className="space-y-4">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                           <Tooltip termKey="salario_bruto">Salário Bruto</Tooltip>
                       </label>
                       <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">R$</span>
                            <input 
                                type="number" 
                                className="w-full p-2 pl-10 border rounded-lg bg-white font-semibold text-gray-700 focus:ring-2 focus:ring-brand-500" 
                                value={salary} 
                                onChange={e => setSalary(Number(e.target.value))} 
                            />
                       </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Dependentes</label>
                           <input type="number" className="w-full p-2 border rounded-lg bg-white" value={dependents} onChange={e => setDependents(Number(e.target.value))} />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Faltas Injustificadas</label>
                           <input type="number" className="w-full p-2 border rounded-lg bg-white" value={absences} onChange={e => setAbsences(Number(e.target.value))} />
                       </div>
                   </div>

                   {/* CLT Rules Feedback */}
                   {entitledDays < 30 && (
                       <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-xs text-red-700">
                           ⚠️ Devido a <strong>{absences} faltas</strong> no período aquisitivo, seu direito caiu para <strong>{entitledDays} dias</strong>.
                       </div>
                   )}
               </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                   Planejamento
               </h3>
               
               <div className="space-y-6">
                   <div className="flex items-center justify-between">
                       <label className="text-sm font-medium text-gray-700">Início das Férias</label>
                       <input 
                            type="date" 
                            className="p-2 border rounded-lg bg-white text-sm"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                       />
                   </div>

                   {/* Sell Option */}
                   <div className={`p-4 rounded-lg border transition-all ${sellDays ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="sellToggle" 
                                    checked={sellDays}
                                    disabled={entitledDays <= 15}
                                    onChange={e => setSellDays(e.target.checked)}
                                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                />
                                <label htmlFor="sellToggle" className={`text-sm font-bold cursor-pointer ${sellDays ? 'text-emerald-800' : 'text-gray-600'}`}>
                                    <Tooltip termKey="abono_pecuniario">Vender 10 dias (Abono)</Tooltip>
                                </label>
                            </div>
                            {sellDays && <span className="text-xs font-bold text-emerald-600">+ Dinheiro</span>}
                        </div>
                        {entitledDays <= 15 && (
                             <p className="text-[10px] text-gray-400 mt-2 ml-7">Indisponível (direito a férias reduzido).</p>
                        )}
                   </div>

                   {/* Slider for days to take */}
                   <div>
                       <div className="flex justify-between text-sm mb-2">
                           <span className="font-medium text-gray-700">Dias de descanso: <strong className="text-brand-600 text-lg">{daysToTake}</strong></span>
                           <span className="text-gray-400 text-xs">Máx: {maxDaysToTake}</span>
                       </div>
                       <input 
                           type="range"
                           min="5" 
                           max={maxDaysToTake}
                           step="1"
                           value={daysToTake}
                           onChange={e => setDaysToTake(Number(e.target.value))}
                           className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                       />
                       <p className="text-[10px] text-gray-500 mt-1">
                           Você pode fracionar. Se sobrar dias, você tira depois.
                       </p>
                   </div>

                   {/* 13th Advance */}
                   <div className="flex items-center gap-3 pt-4 border-t">
                        <input 
                            type="checkbox" 
                            id="adv13"
                            checked={advance13th}
                            onChange={e => setAdvance13th(e.target.checked)}
                            className="w-4 h-4 text-brand-600 rounded"
                        />
                        <label htmlFor="adv13" className="text-sm text-gray-700 cursor-pointer">
                            Adiantar 1ª parcela do 13º Salário
                        </label>
                   </div>
               </div>
           </div>
        </div>

        {/* Right Column: Receipt */}
        <div className="lg:col-span-7">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header Ticket */}
                <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Valor Líquido Estimado</p>
                            <p className="text-4xl font-bold">{formatCurrency(result.totalNet)}</p>
                        </div>
                        <div className="text-right">
                             <div className="bg-white/10 px-3 py-1 rounded text-xs mb-1">Retorno ao Trabalho</div>
                             <p className="text-xl font-bold text-emerald-400">{result.returnDate}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b pb-2">Demonstrativo</h4>
                    
                    <div className="space-y-3 text-sm">
                        {/* Vacation Pay */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Férias ({daysToTake} dias)</span>
                            <span className="font-medium">{formatCurrency(result.vacationGross)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">1/3 Constitucional</span>
                            <span className="font-medium">{formatCurrency(result.vacationOneThird)}</span>
                        </div>

                        {/* Sold Days (Abono) */}
                        {sellDays && (
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-2">
                                <div className="flex justify-between items-center text-emerald-800 font-medium">
                                    <span>Abono Pecuniário (10 dias)</span>
                                    <span>{formatCurrency(result.abonoGross)}</span>
                                </div>
                                <div className="flex justify-between items-center text-emerald-700 text-xs mt-1">
                                    <span>+ 1/3 do Abono</span>
                                    <span>{formatCurrency(result.abonoOneThird)}</span>
                                </div>
                                <div className="text-[10px] text-emerald-600 mt-1 italic">* Isento de IRRF e INSS</div>
                            </div>
                        )}

                        {/* 13th */}
                        {advance13th && (
                            <div className="flex justify-between items-center bg-blue-50 p-2 rounded text-blue-800 font-medium">
                                <span>Adiantamento 13º (50%)</span>
                                <span>{formatCurrency(result.val13th)}</span>
                            </div>
                        )}

                        {/* Discounts */}
                        <div className="pt-4 mt-4 border-t border-dashed border-gray-200 space-y-2">
                             <div className="flex justify-between items-center text-red-600">
                                <span>INSS</span>
                                <span>- {formatCurrency(result.inss)}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-600">
                                <span>IRRF</span>
                                <span>- {formatCurrency(result.irrf)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="bg-gray-50 p-4 text-xs text-gray-500 text-center border-t border-gray-100">
                    {sellDays ? (
                        <p>💡 Você optou por <strong>vender 10 dias</strong>. Esse valor entra "limpo" (sem descontos), aumentando seu líquido.</p>
                    ) : (
                        <p>Dica: Vender 10 dias de férias é financeiramente vantajoso pois não há incidência de impostos sobre o abono.</p>
                    )}
                </div>
            </div>
        </div>

      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 space-y-12">
           {/* General Vacation Guide */}
           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-slate-900">Guia Prático: Férias CLT e Abono Pecuniário</h2>
                 <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Atualizado: {currentMonthName}/{currentYear}
                 </span>
               </div>
               
               <div className="space-y-4">
                   <p>
                       As férias são um direito fundamental garantido pela Constituição. Após cada período de 12 meses de vigência do contrato de trabalho (período aquisitivo), o empregado tem direito ao gozo de um período de férias, sem prejuízo da remuneração.
                   </p>
                   
                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">O que é o Abono Pecuniário ("Vender Férias")?</h3>
                   <p>
                       O abono pecuniário é a conversão em dinheiro de 1/3 (um terço) dos dias de férias a que o empregado tem direito. Na prática, você deixa de descansar esses 10 dias e trabalha normalmente, recebendo o valor das férias + o valor dos dias trabalhados.
                   </p>
                   <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500 my-4">
                       <p className="font-bold text-emerald-800">Vantagem Financeira</p>
                       <p className="text-sm text-emerald-700 mt-1">O valor recebido a título de abono pecuniário é isento de Imposto de Renda e INSS (veja mais na <Link to="/salario-liquido" className="underline font-bold hover:text-emerald-900">Calculadora de Salário Líquido</Link>), o que torna a "venda" financeiramente muito atrativa para quem precisa de dinheiro rápido.</p>
                   </div>

                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Impacto das Faltas</h3>
                   <p>
                       Faltas injustificadas durante o ano podem reduzir seus dias de férias. A tabela oficial da CLT determina que acima de 5 faltas, você já começa a perder dias, e acima de 32 faltas, perde o direito total.
                   </p>
               </div>
           </article>

           {/* Vacation Splitting Guide */}
           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <h2 className="text-2xl font-bold text-slate-900 mb-6">Como funciona o Fracionamento de Férias?</h2>
               <div className="space-y-4">
                   <p>
                       Desde a Reforma Trabalhista de 2017, as férias podem ser divididas em até três períodos, desde que haja concordância do empregado. Essa flexibilidade permite planejar melhor o descanso ao longo do ano.
                   </p>
                   
                   <h3 className="text-lg font-bold text-brand-700 mt-4 mb-2">Regras de Ouro da Divisão:</h3>
                   <ul className="list-disc pl-5 space-y-2">
                       <li><strong>Um período deve ter no mínimo 14 dias corridos.</strong> Isso garante que o trabalhador tenha pelo menos duas semanas de descanso ininterrupto para se recuperar.</li>
                       <li><strong>Os outros períodos não podem ser menores que 5 dias corridos.</strong> Não é permitido tirar 1 ou 2 dias de férias picados (como numa "ponte" de feriado).</li>
                   </ul>

                   <div className="grid md:grid-cols-2 gap-4 mt-6">
                       <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                           <h4 className="font-bold text-blue-800 mb-2">Exemplo Válido ✅</h4>
                           <ul className="text-sm text-blue-700 space-y-1">
                               <li>1º Período: 15 dias</li>
                               <li>2º Período: 10 dias</li>
                               <li>3º Período: 5 dias</li>
                               <li><strong>Total: 30 dias</strong></li>
                           </ul>
                       </div>
                       <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                           <h4 className="font-bold text-red-800 mb-2">Exemplo Inválido ❌</h4>
                           <ul className="text-sm text-red-700 space-y-1">
                               <li>1º Período: 10 dias (Menor que 14)</li>
                               <li>2º Período: 10 dias</li>
                               <li>3º Período: 10 dias</li>
                               <li><strong>Proibido por Lei</strong></li>
                           </ul>
                       </div>
                   </div>

                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Início das Férias</h3>
                   <p>
                       A lei proíbe o início das férias no período de dois dias que antecede feriado ou dia de repouso semanal remunerado (DSR). 
                       Ou seja, se você folga sábado e domingo, suas férias não podem começar na quinta ou na sexta-feira. O ideal é iniciar na segunda-feira para não perder dias de descanso que já seriam seus.
                   </p>
               </div>
           </article>
      </section>

      <RelatedTools current="/ferias" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default VacationCalculator;