import React from 'react';
import SEO from '../components/SEO';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { Link } from 'react-router-dom';
import { 
    INSS_TABLE, 
    INSS_CEILING, 
    IRRF_TABLE, 
    DEDUCTION_PER_DEPENDENT, 
    FAMILY_SALARY_LIMIT, 
    FAMILY_SALARY_VALUE, 
    FGTS_ANNIVERSARY_TABLE, 
    MINIMUM_WAGE,
    CURRENT_YEAR,
    UNEMPLOYMENT_TABLE,
    UNEMPLOYMENT_CEILING
} from '../utils/taxConstants';
import { formatCurrency } from '../utils/calculations';

const OfficialTables: React.FC = () => {
  const currentYear = CURRENT_YEAR;

  const faqItems = [
    {
        question: "Quando o Salário Mínimo aumenta?",
        answer: "O Salário Mínimo Nacional geralmente é reajustado em <strong>1º de janeiro</strong> de cada ano, com base na inflação (INPC) e crescimento do PIB. O pagamento com o novo valor começa a ser feito no quinto dia útil de fevereiro."
    },
    {
        question: "Como funciona a tabela progressiva do INSS?",
        answer: "Na tabela progressiva, você não paga uma porcentagem única sobre todo o salário. O cálculo é feito por fatias. A alíquota incide apenas sobre a parte do salário que se enquadra em cada faixa."
    },
    {
        question: "Quem tem direito ao Salário Família?",
        answer: `Trabalhadores, inclusive domésticos e avulsos, que tenham renda mensal abaixo do limite estipulado pelo governo (${formatCurrency(FAMILY_SALARY_LIMIT)}) e tenham filhos menores de 14 anos ou inválidos de qualquer idade.`
    },
    {
        question: "Quantos dias de Aviso Prévio eu tenho direito?",
        answer: "Pela Lei 12.506/2011, todo trabalhador tem direito a 30 dias fixos, mais <strong>3 dias adicionais para cada ano completo</strong> trabalhado na mesma empresa, até o limite de 90 dias (20 anos)."
    }
  ];

  // Generate Aviso Previo Rows
  const avisoRows = Array.from({ length: 21 }, (_, i) => ({
      years: i,
      days: 30 + (i * 3)
  })).filter(r => r.days <= 90);

  // Dataset Schemas for Google Rich Snippets
  const inssDatasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `Tabela INSS ${currentYear}`,
    "description": "Tabela de alíquotas de contribuição previdenciária do INSS para trabalhadores CLT, domésticos e avulsos.",
    "creator": {
        "@type": "Organization",
        "name": "Portal do Bolso do Trabalhador"
    },
    "variableMeasured": ["Salário de Contribuição", "Alíquota"],
    "license": "https://creativecommons.org/licenses/by-sa/4.0/"
  };

  const irrfDatasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `Tabela IRRF ${currentYear}`,
    "description": "Tabela progressiva mensal do Imposto de Renda Retido na Fonte (IRRF).",
    "creator": {
        "@type": "Organization",
        "name": "Portal do Bolso do Trabalhador"
    },
    "variableMeasured": ["Base de Cálculo", "Alíquota", "Dedução"],
    "license": "https://creativecommons.org/licenses/by-sa/4.0/"
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <SEO 
        title={`Tabelas Oficiais Trabalhistas ${currentYear}: INSS, Seguro Desemprego, Aviso Prévio e Férias`}
        description={`Consulte todas as tabelas trabalhistas atualizadas de ${currentYear}: INSS, IRRF, Seguro Desemprego, Tabela de Aviso Prévio Proporcional e Escala de Férias.`}
        keywords={`tabela inss ${currentYear}, tabela aviso previo proporcional, tabela seguro desemprego ${currentYear}, tabela ferias faltas, aliquotas oficiais`}
        schemas={[inssDatasetSchema, irrfDatasetSchema]}
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-brand-900 mb-2">Tabelas Oficiais Trabalhistas</h1>
        <p className="text-gray-600">Dados consolidados e atualizados conforme a legislação vigente em {currentYear}.</p>
      </div>

      <div className="space-y-12">
        
        {/* INSS SECTION */}
        <section id="inss" className="scroll-mt-24">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-brand-600">📊</span> Tabela INSS {currentYear}
                    </h2>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Vigente</span>
                </div>
                
                <p className="text-slate-600 mb-4 text-sm">
                    Utilizada para cálculo da contribuição previdenciária. Desde a reforma, o cálculo é <strong>progressivo</strong>.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                            <tr>
                                <th className="p-3 border-b border-slate-200">Salário de Contribuição (R$)</th>
                                <th className="p-3 border-b border-slate-200">Alíquota</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {INSS_TABLE.map((row, index) => {
                                const prevLimit = index === 0 ? 0 : INSS_TABLE[index - 1].limit;
                                const isLast = index === INSS_TABLE.length - 1;
                                const rangeText = index === 0 
                                    ? `Até ${formatCurrency(row.limit)}` 
                                    : `De ${formatCurrency(prevLimit + 0.01)} a ${formatCurrency(row.limit)}`;
                                
                                return (
                                    <tr key={index}>
                                        <td className="p-3">{rangeText}</td>
                                        <td className="p-3 font-bold">{(row.rate * 100).toFixed(1).replace('.',',')}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-50 text-xs text-slate-500">
                            <tr>
                                <td colSpan={2} className="p-3">
                                    <strong>Teto do INSS:</strong> O desconto máximo é travado em {formatCurrency(INSS_CEILING)}.
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="mt-6 bg-brand-50 p-4 rounded-xl border border-brand-100 text-center">
                    <p className="text-brand-800 text-sm mb-3">Quer saber o valor exato do desconto no seu salário?</p>
                    <Link to="/salario-liquido" className="inline-block bg-brand-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
                        Calcular Desconto INSS
                    </Link>
                </div>
            </div>
        </section>

        {/* IRRF SECTION */}
        <section id="irrf" className="scroll-mt-24">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-brand-600">🦁</span> Tabela IRRF {currentYear}
                    </h2>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Vigente</span>
                </div>
                
                <p className="text-slate-600 mb-4 text-sm">
                    Imposto de Renda Retido na Fonte. Há uma dedução de <strong>{formatCurrency(DEDUCTION_PER_DEPENDENT)}</strong> por dependente legal.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                            <tr>
                                <th className="p-3 border-b border-slate-200">Base de Cálculo (R$)</th>
                                <th className="p-3 border-b border-slate-200">Alíquota</th>
                                <th className="p-3 border-b border-slate-200">Parcela a Deduzir do IR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {IRRF_TABLE.map((row, index) => {
                                const prevLimit = index === 0 ? 0 : IRRF_TABLE[index - 1].limit;
                                const isLast = row.limit === Infinity;
                                const rangeText = index === 0 
                                    ? `Até ${formatCurrency(row.limit)}` 
                                    : isLast 
                                        ? `Acima de ${formatCurrency(prevLimit)}`
                                        : `De ${formatCurrency(prevLimit + 0.01)} a ${formatCurrency(row.limit)}`;
                                
                                return (
                                    <tr key={index}>
                                        <td className="p-3">{rangeText}</td>
                                        <td className={`p-3 font-bold ${row.rate === 0 ? 'text-green-600' : ''}`}>
                                            {row.rate === 0 ? 'Isento' : `${(row.rate * 100).toFixed(1).replace('.',',')}%`}
                                        </td>
                                        <td className="p-3">{row.deduction === 0 ? '-' : formatCurrency(row.deduction)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <strong>Novidade:</strong> Quem ganha até 2 salários mínimos pode optar pelo desconto simplificado para garantir a isenção. Nossas calculadoras já fazem essa análise automaticamente.
                </div>
            </div>
        </section>

        {/* SEGURO DESEMPREGO SECTION */}
        <section id="seguro-desemprego" className="scroll-mt-24">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-brand-600">🛡️</span> Seguro Desemprego {currentYear}
                    </h2>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Atualizada</span>
                </div>
                
                <p className="text-slate-600 mb-4 text-sm">
                    Calculado com base na média dos últimos 3 salários. O valor da parcela <strong>não pode ser inferior a {formatCurrency(MINIMUM_WAGE)}</strong>.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse border border-slate-100">
                        <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                            <tr>
                                <th className="p-3 border-b border-slate-200">Faixa de Salário Médio</th>
                                <th className="p-3 border-b border-slate-200">Cálculo da Parcela</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {UNEMPLOYMENT_TABLE.map((row, index) => {
                                const prevLimit = index === 0 ? 0 : UNEMPLOYMENT_TABLE[index-1].limit;
                                const isLast = row.limit === Infinity;
                                
                                let range = "";
                                let calculation = "";

                                if (index === 0) {
                                    range = `Até ${formatCurrency(row.limit)}`;
                                    calculation = `Multiplica-se a média por 0.8 (80%)`;
                                } else if (isLast) {
                                    range = `Acima de ${formatCurrency(prevLimit)}`;
                                    calculation = `O valor da parcela será invariavelmente ${formatCurrency(UNEMPLOYMENT_CEILING)}`;
                                } else {
                                    range = `De ${formatCurrency(prevLimit + 0.01)} a ${formatCurrency(row.limit)}`;
                                    calculation = `O que exceder ${formatCurrency(prevLimit)} multiplica por 0.5 + ${formatCurrency(row.added)}`;
                                }

                                return (
                                    <tr key={index}>
                                        <td className="p-3 font-medium">{range}</td>
                                        <td className="p-3 text-slate-600">{calculation}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        {/* AVISO PREVIO TABLE */}
        <section id="aviso-previo" className="scroll-mt-24">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-brand-600">📅</span> Tabela Aviso Prévio (Lei 12.506)
                    </h2>
                </div>
                
                <p className="text-slate-600 mb-4 text-sm">
                    A cada ano trabalhado, adiciona-se 3 dias ao aviso prévio padrão de 30 dias.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs md:text-sm">
                    {avisoRows.map((row) => (
                        <div key={row.years} className={`flex justify-between p-2 rounded ${row.years % 2 === 0 ? 'bg-slate-50' : 'bg-white border border-slate-100'}`}>
                            <span className="text-slate-600">
                                {row.years === 0 ? 'Menos de 1 ano' : `${row.years} ${row.years === 1 ? 'ano' : 'anos'}`}
                            </span>
                            <span className="font-bold text-brand-700">{row.days} dias</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* FERIAS TABLE (FALTAS) */}
        <section id="ferias-faltas" className="scroll-mt-24">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-brand-600">🏖️</span> Tabela de Férias (Proporção por Faltas)
                    </h2>
                </div>
                
                <p className="text-slate-600 mb-4 text-sm">
                    De acordo com o Art. 130 da CLT, o número de dias de férias diminui conforme o número de <strong>faltas injustificadas</strong> no período aquisitivo.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse border border-slate-100">
                        <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                            <tr>
                                <th className="p-3 border-b">Faltas Injustificadas</th>
                                <th className="p-3 border-b">Dias de Férias</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr><td className="p-3">Até 5 faltas</td><td className="p-3 font-bold text-green-600">30 dias</td></tr>
                            <tr><td className="p-3">De 6 a 14 faltas</td><td className="p-3 font-bold text-emerald-600">24 dias</td></tr>
                            <tr><td className="p-3">De 15 a 23 faltas</td><td className="p-3 font-bold text-orange-500">18 dias</td></tr>
                            <tr><td className="p-3">De 24 a 32 faltas</td><td className="p-3 font-bold text-red-500">12 dias</td></tr>
                            <tr><td className="p-3">Acima de 32 faltas</td><td className="p-3 font-bold text-red-700">Perde o direito</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        {/* SALÁRIO FAMÍLIA SECTION */}
        <section id="salario-familia" className="scroll-mt-24">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-brand-600">👨‍👩‍👧</span> Salário Família {currentYear}
                    </h2>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Atualizado</span>
                </div>
                
                <p className="text-slate-600 mb-4 text-sm">
                    Benefício pago a trabalhadores de baixa renda, de acordo com o número de filhos menores de 14 anos ou inválidos.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse border border-slate-100">
                        <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                            <tr>
                                <th className="p-3 border-b border-slate-200">Remuneração Mensal (Teto)</th>
                                <th className="p-3 border-b border-slate-200">Valor da Cota (Por Filho)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="p-3">Até {formatCurrency(FAMILY_SALARY_LIMIT)}</td>
                                <td className="p-3 font-bold text-emerald-600">{formatCurrency(FAMILY_SALARY_VALUE)}</td>
                            </tr>
                            <tr>
                                <td className="p-3">Acima de {formatCurrency(FAMILY_SALARY_LIMIT)}</td>
                                <td className="p-3 font-bold text-slate-400">Não tem direito</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        {/* FGTS SAQUE ANIVERSARIO SECTION */}
        <section id="fgts-aliquotas" className="scroll-mt-24">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-brand-600">🎂</span> Alíquotas Saque-Aniversário FGTS
                    </h2>
                </div>
                
                <p className="text-slate-600 mb-4 text-sm">
                    Para quem opta por sacar uma parte do FGTS anualmente. O valor é calculado aplicando a alíquota sobre o saldo + uma parcela adicional fixa.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse border border-slate-100">
                        <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                            <tr>
                                <th className="p-3 border-b">Saldo na Conta</th>
                                <th className="p-3 border-b">Alíquota</th>
                                <th className="p-3 border-b">Parcela Adicional</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                           {FGTS_ANNIVERSARY_TABLE.map((row, index) => {
                               const prevLimit = index === 0 ? 0 : FGTS_ANNIVERSARY_TABLE[index - 1].limit;
                               const isLast = row.limit === Infinity;
                               const rangeText = index === 0 
                                   ? `Até ${formatCurrency(row.limit)}` 
                                   : isLast 
                                        ? `Acima de ${formatCurrency(prevLimit)}`
                                        : `De ${formatCurrency(prevLimit + 0.01)} a ${formatCurrency(row.limit)}`;

                               return (
                                   <tr key={index}>
                                       <td className="p-2">{rangeText}</td>
                                       <td className="p-2">{(row.rate * 100).toFixed(0)}%</td>
                                       <td className="p-2">{row.added === 0 ? '-' : formatCurrency(row.added)}</td>
                                   </tr>
                               )
                           })}
                       </tbody>
                    </table>
                </div>
                <div className="mt-6 text-center">
                    <Link to="/fgts" className="text-brand-600 font-bold hover:underline">
                        Simular meu Saque-Aniversário →
                    </Link>
                </div>
            </div>
        </section>

        {/* MIN WAGE SECTION */}
        <section id="salario-minimo" className="scroll-mt-24">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Salário Mínimo Nacional ({currentYear})</h3>
                    <div className="text-4xl font-extrabold text-brand-600 mb-2">{formatCurrency(MINIMUM_WAGE)}</div>
                    <p className="text-sm text-slate-500">Valor vigente.</p>
                    <p className="text-xs text-slate-400 mt-2">Base para cálculo de benefícios como Seguro Desemprego, BPC e Abono Salarial.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico Recente</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex justify-between border-b border-slate-100 pb-2">
                            <span>2024</span>
                            <span className="font-bold">R$ 1.412,00</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-100 pb-2">
                            <span>2023 (Maio)</span>
                            <span className="font-bold text-slate-600">R$ 1.320,00</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-100 pb-2">
                            <span>2023 (Jan)</span>
                            <span className="font-bold text-slate-600">R$ 1.302,00</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

      </div>

      <RelatedTools current="/tabelas" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default OfficialTables;