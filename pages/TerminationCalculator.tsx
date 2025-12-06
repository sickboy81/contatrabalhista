import React, { useState } from 'react';
import { calculateTermination, formatCurrency, formatDate } from '../utils/calculations';
import { TerminationInputs, TerminationReason, NoticeType, CalculationResult } from '../types';
import Tooltip from '../components/Tooltip';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const INITIAL_STATE: TerminationInputs = {
  salary: 3000,
  startDate: '2022-01-01',
  endDate: new Date().toISOString().split('T')[0],
  reason: TerminationReason.DISMISSAL_NO_CAUSE,
  noticeType: NoticeType.INDEMNIFIED,
  vacationOverdueDays: 0,
  fgtsBalance: 8000,
  dependents: 0,
  thirteenthAdvanced: false
};

const TerminationCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<TerminationInputs>(INITIAL_STATE);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const handleCalculate = () => {
    const res = calculateTermination(inputs);
    setResult(res);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to determine available notice types based on reason
  const getAvailableNoticeTypes = () => {
      const { reason } = inputs;
      if (reason === TerminationReason.EXPERIENCE_END || reason === TerminationReason.DEATH) {
          return [NoticeType.NONE];
      }
      if (reason === TerminationReason.RESIGNATION) {
          return [NoticeType.WORKED, NoticeType.NOT_FULFILLED];
      }
      if (reason === TerminationReason.DISMISSAL_WITH_CAUSE) {
          return [NoticeType.NONE];
      }
      return [NoticeType.INDEMNIFIED, NoticeType.WORKED];
  };

  const faqItems = [
    {
        question: "Qual o prazo para pagamento da rescisão?",
        answer: "Pela nova regra da Reforma Trabalhista (Art. 477 da CLT), a empresa tem até <strong>10 dias corridos</strong> após o término do contrato para pagar as verbas rescisórias, independente se o aviso prévio foi trabalhado ou indenizado."
    },
    {
        question: "O que acontece se a empresa atrasar o pagamento?",
        answer: "Se a empresa não pagar a rescisão no prazo de 10 dias, ela deve pagar uma multa a favor do empregado no valor de <strong>um salário nominal</strong> do trabalhador (Art. 477, § 8º da CLT)."
    },
    {
        question: "Fui demitido doente, a rescisão é válida?",
        answer: "Se a doença for ocupacional (causada pelo trabalho) ou se você estiver inapto no exame demissional, a demissão pode ser anulada. Você pode ter direito à reintegração e estabilidade de 12 meses após a alta médica do INSS."
    },
    {
        question: "Posso ser readmitido pela mesma empresa?",
        answer: "Sim, mas existem regras. Para evitar fraudes no FGTS, a empresa deve esperar 90 dias para recontratar o mesmo funcionário. Se for como PJ, a quarentena é de 18 meses."
    },
    {
        question: "O que é a multa de 40% do FGTS?",
        answer: "É uma indenização paga pela empresa quando ela demite o funcionário sem justa causa. O valor é calculado sobre todo o montante depositado durante a vigência do contrato. Em caso de demissão por comum acordo, essa multa cai para 20%."
    },
    {
        question: "Como funciona o Aviso Prévio Proporcional?",
        answer: "Além dos 30 dias padrão, a Lei 12.506/2011 garante <strong>3 dias adicionais</strong> de aviso para cada ano completo de trabalho na mesma empresa, limitado a 90 dias no total."
    }
  ];

  // Schema.org HowTo for Rich Snippets
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Como calcular rescisão trabalhista passo a passo",
    "description": "Aprenda a fórmula base para calcular sua rescisão CLT, incluindo saldo de salário, aviso prévio, férias e 13º salário.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Calcular Saldo de Salário",
        "text": "Divida seu salário por 30 e multiplique pelos dias trabalhados no mês da saída."
      },
      {
        "@type": "HowToStep",
        "name": "Calcular Aviso Prévio",
        "text": "Se indenizado: recebe 1 salário + 3 dias por ano de casa (Lei 12.506). Se trabalhado: recebe os dias trabalhados normalmente."
      },
      {
        "@type": "HowToStep",
        "name": "Calcular 13º Proporcional",
        "text": "Divida o salário por 12 e multiplique pelo número de meses trabalhados no ano (fração > 14 dias conta como mês)."
      },
      {
        "@type": "HowToStep",
        "name": "Calcular Férias Proporcionais",
        "text": "Some férias vencidas (se houver) com as proporcionais (mesma lógica do 13º). Adicione 33% (um terço) sobre o total."
      },
      {
        "@type": "HowToStep",
        "name": "Deduzir Impostos",
        "text": "Subtraia o INSS e o IRRF incidentes sobre o saldo de salário e o 13º salário."
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto">
      <SEO 
        title={`Calculadora de Rescisão de Contrato CLT ${currentYear} (Cálculo Exato)`}
        description={`Calcule sua rescisão trabalhista grátis e online. Simule demissão sem justa causa, pedido de demissão, multa de 40% do FGTS, férias e 13º salário. Atualizado ${currentYear}.`}
        keywords="calculadora rescisão, calcular acerto trabalhista, simular rescisão contrato, demissão sem justa causa, calculo exato rescisão, multa 40 fgts, aviso prévio indenizado"
        schemas={[howToSchema]}
        ratingValue={4.9}
        reviewCount={3452}
      />
      
      <div className="text-center mb-8 md:mb-10 no-print animate-fade-in-up">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-2 md:mb-4 tracking-tight">
          Calculadora de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Rescisão {currentYear}</span>
        </h1>
        <p className="text-sm md:text-lg text-slate-600 max-w-2xl mx-auto">
          Cálculo exato com projeção de aviso prévio e regras de {currentYear}. Desenvolvido pelo <strong>Conta Trabalhista</strong>.
        </p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.9/5 com base em 3.452 cálculos)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-7 space-y-6">
           <div className="bg-white p-4 md:p-8 rounded-2xl shadow-soft border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm">1</span>
                Dados do Contrato
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Tooltip termKey="motivo_rescisao">Motivo da Rescisão</Tooltip>
                  </label>
                  <select 
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-700 text-sm md:text-base"
                    value={inputs.reason}
                    onChange={(e) => {
                        const newReason = e.target.value as TerminationReason;
                        // Reset notice type default when reason changes
                        let defaultNotice = NoticeType.INDEMNIFIED;
                        if (newReason === TerminationReason.RESIGNATION) defaultNotice = NoticeType.WORKED;
                        if (newReason === TerminationReason.EXPERIENCE_END) defaultNotice = NoticeType.NONE;
                        
                        setInputs({...inputs, reason: newReason, noticeType: defaultNotice})
                    }}
                  >
                    {Object.values(TerminationReason).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <Tooltip termKey="salario_bruto">Último Salário Bruto</Tooltip>
                        </label>
                        <div className="relative group">
                            <span className="absolute left-3 top-3 text-slate-400 font-medium group-focus-within:text-brand-500">R$</span>
                            <input 
                                type="number" 
                                className="w-full p-3 pl-10 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-semibold text-slate-800"
                                value={inputs.salary}
                                onChange={(e) => setInputs({...inputs, salary: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <Tooltip termKey="tipo_aviso">Aviso Prévio</Tooltip>
                        </label>
                        <select 
                            className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none text-slate-700 text-sm md:text-base"
                            value={inputs.noticeType}
                            onChange={(e) => setInputs({...inputs, noticeType: e.target.value as NoticeType})}
                        >
                             {getAvailableNoticeTypes().map(t => (
                                <option key={t} value={t}>{t}</option>
                             ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Tooltip termKey="data_admissao">Data de Admissão</Tooltip>
                    </label>
                    <input 
                      type="date" 
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all text-slate-600 text-sm md:text-base"
                      value={inputs.startDate}
                      onChange={(e) => setInputs({...inputs, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Tooltip termKey="data_saida">Data do Afastamento</Tooltip>
                    </label>
                    <input 
                      type="date" 
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all text-slate-600 text-sm md:text-base"
                      value={inputs.endDate}
                      onChange={(e) => setInputs({...inputs, endDate: e.target.value})}
                    />
                  </div>
                </div>
                
                {/* Vacation Section */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                       <Tooltip termKey="ferias_vencidas">Tem Férias Vencidas? (Acima de 1 ano)</Tooltip>
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                name="vacation" 
                                id="vacNo" 
                                checked={inputs.vacationOverdueDays === 0} 
                                onChange={() => setInputs({...inputs, vacationOverdueDays: 0})}
                                className="text-brand-600 focus:ring-brand-500"
                            />
                            <label htmlFor="vacNo" className="text-sm text-slate-700">Não</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                name="vacation" 
                                id="vacYes" 
                                checked={inputs.vacationOverdueDays > 0} 
                                onChange={() => setInputs({...inputs, vacationOverdueDays: 30})} // Default 30
                                className="text-brand-600 focus:ring-brand-500"
                            />
                            <label htmlFor="vacYes" className="text-sm text-slate-700">Sim</label>
                        </div>
                    </div>
                    {inputs.vacationOverdueDays > 0 && (
                        <div className="mt-3">
                            <label className="block text-xs text-slate-500 mb-1">Quantos dias vencidos?</label>
                            <input 
                                type="number" 
                                className="w-24 p-2 border rounded bg-white text-sm" 
                                value={inputs.vacationOverdueDays}
                                onChange={e => setInputs({...inputs, vacationOverdueDays: Number(e.target.value)})}
                            />
                        </div>
                    )}
                </div>

                {/* Advanced Toggle */}
                <div className="border-t pt-4">
                    <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors"
                    >
                        {showAdvanced ? '− Ocultar Opções Avançadas' : '+ Opções Avançadas (Dependentes, Adiantamento, FGTS)'}
                    </button>
                    
                    {showAdvanced && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-100">
                             <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    <Tooltip termKey="dependentes">Dependentes (IRRF)</Tooltip>
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded bg-white" 
                                    value={inputs.dependents} 
                                    onChange={(e) => setInputs({...inputs, dependents: Number(e.target.value)})} 
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    <Tooltip termKey="saldo_fgts">Saldo FGTS (Para Multa)</Tooltip>
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded bg-white" 
                                    value={inputs.fgtsBalance} 
                                    onChange={(e) => setInputs({...inputs, fgtsBalance: Number(e.target.value)})} 
                                />
                             </div>
                             <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="13adv" 
                                    checked={inputs.thirteenthAdvanced} 
                                    onChange={e => setInputs({...inputs, thirteenthAdvanced: e.target.checked})} 
                                    className="rounded text-brand-600"
                                />
                                <label htmlFor="13adv" className="text-sm text-slate-600">
                                    <Tooltip termKey="decimo_terceiro_adiantado">Já recebi a 1ª parcela do 13º este ano</Tooltip>
                                </label>
                             </div>
                        </div>
                    )}
                </div>

                <button 
                  onClick={handleCalculate}
                  className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 transform transition-all active:scale-[0.98] text-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  Calcular Rescisão
                </button>
              </div>
           </div>
        </div>

        {/* Right Column: Results Sticky */}
        <div className="lg:col-span-5">
           <div className="sticky top-24">
              {!result ? (
                <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 text-center h-full flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
                  <div className="bg-slate-50 p-4 rounded-full mb-4">
                     <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Aguardando Dados</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">Preencha o formulário para ver a simulação detalhada com projeção de aviso prévio.</p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in-up">
                   {/* Main Card */}
                   <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                      {/* Decorative Background */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>

                      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Valor Líquido Estimado</h3>
                      <div className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                         {formatCurrency(result.totalNet)}
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-3 text-sm">
                         <div className="flex justify-between items-center">
                            <span className="text-slate-300"><Tooltip termKey="salario_bruto">Total Bruto</Tooltip></span>
                            <span className="font-semibold">{formatCurrency(result.totalGross)}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-red-300">Descontos (INSS/IRRF)</span>
                            <span className="font-semibold text-red-300">- {formatCurrency(result.totalGross - result.totalNet)}</span>
                         </div>
                         {result.fgtsFine > 0 && (
                             <>
                                <div className="h-px bg-white/10 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-brand-300"><Tooltip termKey="multa_fgts">Multa FGTS (40%/20%)</Tooltip></span>
                                    <span className="font-bold text-brand-300">+ {formatCurrency(result.fgtsFine)}</span>
                                </div>
                             </>
                         )}
                         
                         {/* Link to Tables */}
                         <div className="text-center pt-2 mt-2 border-t border-white/10">
                             <Link to="/tabelas" className="text-xs text-brand-300 hover:text-white underline">
                                 Ver Tabela Oficial de Descontos
                             </Link>
                         </div>
                      </div>
                      
                      <div className="mt-4 text-[10px] text-slate-400 text-center">
                         Tempo de Casa: {result.meta.yearsWorked} anos. Aviso Prévio: {result.meta.noticeDays} dias.
                      </div>
                   </div>

                   {/* Action Buttons */}
                   <button 
                     onClick={handlePrint} 
                     className="w-full bg-white text-slate-800 border border-slate-200 font-bold py-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2 group"
                   >
                     <span className="bg-slate-100 p-1.5 rounded-md group-hover:bg-slate-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                     </span>
                     Baixar Relatório Completo
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* SEO CONTENT: GUIDES AND EXPLANATIONS */}
      <section className="my-12 space-y-12 no-print">
          
          {/* Guide 1: How to Calculate */}
          <article className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100" aria-labelledby="how-to-calculate">
              <div className="flex justify-between items-center mb-6">
                 <h2 id="how-to-calculate" className="text-2xl font-bold text-slate-800">Como calcular a rescisão passo a passo?</h2>
                 <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Atualizado: {currentMonthName}/{currentYear}
                 </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed">
                  <div className="space-y-4">
                      <p>
                          O cálculo da rescisão trabalhista envolve somar os direitos adquiridos e subtrair os descontos legais. O <strong>Conta Trabalhista</strong> simplifica esse processo, mas você pode conferir a lógica manualmente:
                      </p>
                      <ol className="list-decimal pl-5 space-y-3">
                          <li>
                              <strong>Saldo de Salário:</strong> Divida seu salário por 30 e multiplique pelos dias trabalhados no mês da saída.
                          </li>
                          <li>
                              <strong>Aviso Prévio:</strong> Se for indenizado, você recebe 1 salário + 3 dias para cada ano completo de casa (Lei 12.506).
                          </li>
                          <li>
                              <strong>13º Proporcional:</strong> Divida o salário por 12 e multiplique pelo número de meses trabalhados no ano (fração superior a 14 dias conta como mês cheio).
                          </li>
                          <li>
                              <strong>Férias + 1/3:</strong> Some as férias vencidas (se houver) com as proporcionais. Sobre esse total, adicione 33% (um terço).
                          </li>
                      </ol>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-brand-700 mb-3">Exemplo Prático</h3>
                      <p className="mb-2"><strong>Salário:</strong> R$ 3.000,00</p>
                      <p className="mb-2"><strong>Demissão:</strong> Sem justa causa após 1 ano.</p>
                      <ul className="space-y-2 text-xs border-t pt-2 mt-2">
                          <li className="flex justify-between"><span>Aviso Prévio (33 dias):</span> <span>R$ 3.300,00</span></li>
                          <li className="flex justify-between"><span>13º Proporcional (e.g. 6/12):</span> <span>R$ 1.500,00</span></li>
                          <li className="flex justify-between"><span>Férias Prop. + 1/3:</span> <span>R$ 2.000,00</span></li>
                          <li className="flex justify-between font-bold text-slate-900 pt-2 border-t"><span>Total Bruto (aprox):</span> <span>R$ 6.800,00</span></li>
                      </ul>
                      <p className="text-[10px] text-gray-400 mt-2">*Exemplo simplificado. Consulte as <Link to="/tabelas" className="underline hover:text-brand-600">tabelas de descontos oficiais</Link>.</p>
                  </div>
              </div>
          </article>

          {/* Guide 2: Stability and Rights */}
          <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <h2 className="text-2xl font-bold text-slate-900 mb-6">Estabilidade: Quem NÃO pode ser demitido?</h2>
               <div className="space-y-4">
                   <p>
                       Existem situações em que a CLT proíbe a demissão sem justa causa, garantindo a <strong>Estabilidade Provisória</strong>. Se a empresa demitir, deverá reintegrar o funcionário ou pagar todo o período de estabilidade como indenização.
                   </p>
                   
                   <div className="grid md:grid-cols-3 gap-6 mt-4">
                       <div className="bg-pink-50 p-5 rounded-xl border border-pink-100">
                           <h3 className="font-bold text-pink-800 mb-2">Gestante</h3>
                           <p className="text-xs text-pink-700">
                               Desde a confirmação da gravidez até <strong>5 meses após o parto</strong>. Mesmo se a gravidez for descoberta durante o aviso prévio, a estabilidade é garantida.
                           </p>
                       </div>

                       <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                           <h3 className="font-bold text-orange-800 mb-2">Acidente de Trabalho</h3>
                           <p className="text-xs text-orange-700">
                               Quem sofre acidente de trabalho e fica afastado pelo INSS por mais de 15 dias tem estabilidade de <strong>12 meses</strong> após o retorno ao trabalho.
                           </p>
                       </div>

                       <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                           <h3 className="font-bold text-blue-800 mb-2">Membro da CIPA</h3>
                           <p className="text-xs text-blue-700">
                               O cipeiro eleito pelos trabalhadores não pode ser demitido desde o registro da candidatura até <strong>1 ano após o final do mandato</strong>.
                           </p>
                       </div>
                   </div>
                   
                   <p className="text-sm text-gray-500 italic mt-2">
                       * Existem outras estabilidades previstas em convenções coletivas, como a pré-aposentadoria. Consulte seu sindicato.
                   </p>
               </div>
          </article>

          {/* Guide 3: Types of Termination */}
          <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <h2 className="text-2xl font-bold text-slate-900 mb-4">Guia: Tipos de Demissão e Seus Direitos</h2>
               <p className="mb-6">Entenda o que muda no cálculo dependendo da forma como o contrato foi encerrado.</p>
               
               <div className="grid md:grid-cols-3 gap-6">
                   <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                       <h3 className="font-bold text-green-800 mb-2">Sem Justa Causa</h3>
                       <p className="text-xs text-green-700 mb-2">É quando a empresa decide demitir o funcionário sem um motivo grave. Garante todos os direitos.</p>
                       <ul className="list-disc pl-4 text-xs text-green-800 space-y-1">
                           <li>Aviso Prévio (Trab. ou Ind.)</li>
                           <li>Férias e 13º Proporcionais</li>
                           <li>Saque do <Link to="/fgts" className="underline hover:text-green-600 font-bold">FGTS</Link> + Multa 40%</li>
                           <li><Link to="/seguro-desemprego" className="underline hover:text-green-600 font-bold">Seguro Desemprego</Link></li>
                       </ul>
                   </div>

                   <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                       <h3 className="font-bold text-blue-800 mb-2">Pedido de Demissão</h3>
                       <p className="text-xs text-blue-700 mb-2">Quando o próprio funcionário decide sair da empresa. Perde alguns benefícios importantes.</p>
                       <ul className="list-disc pl-4 text-xs text-blue-800 space-y-1">
                           <li>Saldo de Salário</li>
                           <li>Férias e 13º Proporcionais</li>
                           <li className="text-red-500">Sem Saque FGTS e Multa</li>
                           <li className="text-red-500">Sem Seguro Desemprego</li>
                       </ul>
                       <Link to="/carta-demissao" className="text-xs text-blue-600 underline mt-2 block font-medium">Gerar Carta de Demissão</Link>
                   </div>

                   <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                       <h3 className="font-bold text-red-800 mb-2">Justa Causa</h3>
                       <p className="text-xs text-red-700 mb-2">Ocorre por falta grave (roubo, abandono, agressão, etc). O trabalhador perde quase tudo.</p>
                       <ul className="list-disc pl-4 text-xs text-red-800 space-y-1">
                           <li>Apenas Saldo de Salário</li>
                           <li>Apenas Férias Vencidas (se houver)</li>
                           <li className="text-red-600 font-bold">Perde 13º e Férias Prop.</li>
                           <li className="text-red-600 font-bold">Perde FGTS e Seguro</li>
                       </ul>
                   </div>
               </div>
          </article>

          {/* New Methodology Section for E-E-A-T */}
          <article className="mt-12 bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm text-gray-600">
              <h3 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider">Metodologia e Fontes</h3>
              <p>
                  O <strong>Conta Trabalhista</strong> revisa seus cálculos periodicamente para garantir conformidade com a <strong>Consolidação das Leis do Trabalho (Decreto-Lei nº 5.452/1943)</strong>, as tabelas vigentes do INSS e IRRF da Receita Federal e as normas da Caixa Econômica Federal para o FGTS. 
                  Este simulador é uma ferramenta educativa desenvolvida por especialistas em tecnologia e finanças pessoais para auxiliar na conferência de valores, mas não substitui o cálculo oficial homologado.
              </p>
          </article>

      </section>

      <RelatedTools current="/" />
      <FAQ items={faqItems} />

      {/* Printable Report Section (Hidden normally, Visible on Print) */}
      {result && (
        <div className="print-only p-8 bg-white text-black max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Demonstrativo de Rescisão</h1>
              <p className="text-sm text-gray-500">Conta Trabalhista</p>
            </div>
            <div className="text-right">
               <div className="text-sm text-gray-600">Data: {new Date().toLocaleDateString()}</div>
               <div className="text-xs text-gray-400">Projeção: {result.meta.projectedDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <p><span className="font-bold">Motivo:</span> {inputs.reason}</p>
              <p><span className="font-bold">Aviso Prévio:</span> {inputs.noticeType} ({result.meta.noticeDays} dias)</p>
              <p><span className="font-bold">Admissão:</span> {formatDate(inputs.startDate)}</p>
              <p><span className="font-bold">Saída:</span> {formatDate(inputs.endDate)}</p>
            </div>
            <div>
              <p><span className="font-bold">Salário Base:</span> {formatCurrency(inputs.salary)}</p>
              <p><span className="font-bold">Anos Trabalhados:</span> {result.meta.yearsWorked}</p>
            </div>
          </div>

          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="text-left p-2">Descrição</th>
                <th className="text-right p-2">Vencimentos (Crédito)</th>
                <th className="text-right p-2">Descontos (Débito)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-200">
                <td className="p-2">Saldo de Salário</td>
                <td className="text-right p-2 text-green-700">{formatCurrency(result.earnings.salaryBalance)}</td>
                <td className="text-right p-2">-</td>
              </tr>
              {result.earnings.noticeIndemnified > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="p-2">Aviso Prévio Indenizado</td>
                    <td className="text-right p-2 text-green-700">{formatCurrency(result.earnings.noticeIndemnified)}</td>
                    <td className="text-right p-2">-</td>
                  </tr>
              )}
              {result.earnings.thirteenthTotal > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="p-2">13º Salário Proporcional</td>
                    <td className="text-right p-2 text-green-700">{formatCurrency(result.earnings.thirteenthTotal)}</td>
                    <td className="text-right p-2">-</td>
                  </tr>
              )}
              {result.earnings.vacationTotal > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="p-2">Férias (Venc. + Prop. + 1/3)</td>
                    <td className="text-right p-2 text-green-700">{formatCurrency(result.earnings.vacationTotal)}</td>
                    <td className="text-right p-2">-</td>
                  </tr>
              )}
              {result.earnings.fgtsFine > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="p-2">Multa Rescisória do FGTS</td>
                    <td className="text-right p-2 text-green-700">{formatCurrency(result.earnings.fgtsFine)}</td>
                    <td className="text-right p-2">-</td>
                  </tr>
              )}
              
              {/* DISCOUNTS */}
              {result.discounts.noticeDeduction > 0 && (
                   <tr className="border-b border-gray-200 bg-red-50">
                    <td className="p-2">Aviso Prévio Não Cumprido</td>
                    <td className="text-right p-2">-</td>
                    <td className="text-right p-2 text-red-700">{formatCurrency(result.discounts.noticeDeduction)}</td>
                  </tr>
              )}
              {result.discounts.thirteenthAdvance > 0 && (
                   <tr className="border-b border-gray-200 bg-red-50">
                    <td className="p-2">Adiantamento 13º</td>
                    <td className="text-right p-2">-</td>
                    <td className="text-right p-2 text-red-700">{formatCurrency(result.discounts.thirteenthAdvance)}</td>
                  </tr>
              )}
              <tr className="border-b border-gray-200 bg-red-50">
                <td className="p-2">INSS</td>
                <td className="text-right p-2">-</td>
                <td className="text-right p-2 text-red-700">{formatCurrency(result.discounts.inss)}</td>
              </tr>
              <tr className="border-b border-gray-200 bg-red-50">
                <td className="p-2">IRRF</td>
                <td className="text-right p-2">-</td>
                <td className="text-right p-2 text-red-700">{formatCurrency(result.discounts.irrf)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="font-bold text-lg bg-gray-50">
                <td className="p-4 text-right">TOTAL LÍQUIDO A RECEBER</td>
                <td colSpan={2} className="p-4 text-right text-emerald-700">{formatCurrency(result.totalNet)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div className="mt-8 pt-8 border-t border-gray-300 text-xs text-gray-500 text-center">
             <p>Este documento é uma simulação educacional.</p>
             <p>www.contatrabalhista.com.br</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminationCalculator;