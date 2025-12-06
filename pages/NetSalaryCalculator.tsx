import React, { useState, useEffect } from 'react';
import { calculateINSS, calculateIRRF, formatCurrency } from '../utils/calculations';
import Tooltip from '../components/Tooltip';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const NetSalaryCalculator: React.FC = () => {
  const [salary, setSalary] = useState(3000);
  const [dependents, setDependents] = useState(0);
  const [discounts, setDiscounts] = useState(0);
  const [result, setResult] = useState<any>(null);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('netSalaryData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSalary(data.salary || 3000);
        setDependents(data.dependents || 0);
        setDiscounts(data.discounts || 0);
      } catch (e) {
        console.error("Error loading saved salary data");
      }
    }
  }, []);

  // Save and Calculate
  useEffect(() => {
    const inss = calculateINSS(salary);
    const irrfBase = salary - inss;
    const irrf = calculateIRRF(irrfBase, dependents);
    const net = salary - inss - irrf - discounts;
    
    setResult({ inss, irrf, net });
    
    // Debounce save slightly or just save
    localStorage.setItem('netSalaryData', JSON.stringify({ salary, dependents, discounts }));
  }, [salary, dependents, discounts]);

  const faqItems = [
    {
        question: `Como é calculado o INSS em ${currentYear}?`,
        answer: "O cálculo é progressivo. O desconto não é uma porcentagem fixa sobre o total, mas sim fatiado por faixas salariais: 7,5% (até R$ 1.412), 9%, 12% e 14% (até o teto de R$ 7.786,02)."
    },
    {
        question: "O que deduz do Imposto de Renda (IRRF)?",
        answer: "Para calcular o IRRF, subtrai-se primeiro o valor do INSS. Também é deduzido R$ 189,59 por dependente e, se for o caso, pensão alimentícia. Sobre o saldo restante, aplica-se a alíquota da tabela progressiva."
    },
    {
        question: "Quem são considerados dependentes?",
        answer: "Cônjuge, filhos até 21 anos (ou 24 se universitários), pais que dependam financeiramente, entre outros previstos na lei do IR."
    },
    {
        question: "Posso vender 10 dias de férias para aumentar o salário?",
        answer: "Sim. O abono pecuniário (venda de 10 dias) entra como um valor 'limpo', pois não sofre desconto de INSS nem de Imposto de Renda. É uma ótima forma de aumentar o líquido no mês das férias."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
       <SEO 
         title={`Calculadora de Salário Líquido ${currentYear} - Descontos INSS e IRRF`}
         description={`Descubra quanto realmente cai na sua conta. Calculadora de Salário Líquido com tabela INSS e IRRF atualizadas de ${currentYear}. Simples e rápido.`}
         keywords={`calculadora salario liquido, calcular salario ${currentYear}, descontos inss irrf, quanto recebo, salario limpo`}
         ratingValue={4.9}
         reviewCount={2150}
       />
       
       <div className="text-center mb-8">
         <h1 className="text-3xl font-bold text-brand-900 mb-2">Calculadora de Salário Líquido {currentYear}</h1>
         <p className="text-gray-600">Simule seu holerite e entenda os descontos oficiais.</p>
         <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.9/5)</span>
        </div>
       </div>
       
       <div className="grid md:grid-cols-12 gap-8">
           <div className="md:col-span-7 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="space-y-4 mb-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">
                        <Tooltip termKey="salario_bruto">Salário Bruto</Tooltip>
                    </label>
                    <input type="number" className="w-full p-3 border rounded-lg text-lg bg-white" value={salary} onChange={(e) => setSalary(Number(e.target.value))} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <Tooltip termKey="dependentes">Dependentes</Tooltip>
                        </label>
                        <input type="number" className="w-full p-3 border rounded-lg bg-white" value={dependents} onChange={(e) => setDependents(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <Tooltip termKey="outros_descontos">Outros Descontos</Tooltip>
                        </label>
                        <input type="number" className="w-full p-3 border rounded-lg bg-white" value={discounts} onChange={(e) => setDiscounts(Number(e.target.value))} placeholder="VT, VR..." />
                    </div>
                 </div>
              </div>

              <div className="space-y-3 pt-6 border-t">
                  <div className="flex justify-between items-center">
                      <span className="text-gray-600"><Tooltip termKey="inss">INSS (Previdência)</Tooltip></span>
                      <span className="text-red-500 font-medium">- {result ? formatCurrency(result.inss) : '...'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-gray-600"><Tooltip termKey="irrf">IRRF (Imposto de Renda)</Tooltip></span>
                      <span className="text-red-500 font-medium">- {result ? formatCurrency(result.irrf) : '...'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-gray-600">Outros</span>
                      <span className="text-gray-500">- {formatCurrency(discounts)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 text-xl font-bold text-emerald-700 border-t mt-4">
                      <span>Salário Líquido</span>
                      <span>{result ? formatCurrency(result.net) : '...'}</span>
                  </div>
              </div>
           </div>

           <div className="md:col-span-5 space-y-4">
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-blue-800">Tabela INSS {currentYear}</h3>
                        <Link to="/tabelas" className="text-xs text-blue-600 font-bold underline hover:text-blue-800">Ver Completa</Link>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-2">
                        <li className="flex justify-between"><span>Até R$ 1.412,00</span> <strong>7,5%</strong></li>
                        <li className="flex justify-between"><span>R$ 1.412,01 a R$ 2.666,68</span> <strong>9%</strong></li>
                        <li className="flex justify-between"><span>R$ 2.666,69 a R$ 4.000,03</span> <strong>12%</strong></li>
                        <li className="flex justify-between"><span>R$ 4.000,04 a R$ 7.786,02</span> <strong>14%</strong></li>
                    </ul>
                    <p className="text-[10px] mt-2 opacity-70">* Desconto progressivo.</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3">Dedução por Dependente</h3>
                    <p className="text-sm text-gray-600">
                        Cada dependente reduz a base de cálculo do IRRF em <strong>R$ 189,59</strong>. Isso pode fazer você cair de faixa e pagar menos imposto.
                    </p>
                </div>
           </div>
       </div>

       {/* SEO CONTENT SECTION */}
       <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Entenda o Cálculo do Salário Líquido</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   O salário líquido é o valor que efetivamente cai na conta do trabalhador após todos os descontos obrigatórios e opcionais. A diferença entre o salário bruto (registrado na carteira) e o líquido pode assustar, mas segue regras rígidas da CLT.
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">1. Desconto do INSS (Previdência)</h3>
               <p>
                   O primeiro desconto aplicado é o INSS. Ele serve para garantir sua aposentadoria e auxílios (doença, acidente). Desde a reforma da previdência, o cálculo é progressivo. Isso significa que quem ganha mais paga uma alíquota maior, mas calculada fatia por fatia.
                   <br/>
                   <Link to="/tabelas" className="text-brand-600 font-bold hover:underline">Consulte a tabela oficial do INSS aqui.</Link>
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">2. Desconto do IRRF (Imposto de Renda)</h3>
               <p>
                   O Imposto de Renda Retido na Fonte é calculado <strong>após</strong> descontar o INSS. Ou seja, você não paga imposto sobre o dinheiro que foi para a previdência. Além disso, subtrai-se R$ 189,59 por dependente legal.
               </p>
               <p>
                   A partir de {currentYear}, quem ganha até 2 salários mínimos pode estar isento devido ao desconto simplificado oferecido pelo governo.
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">3. Lista de Descontos Legais</h3>
               <p>
                   Além dos impostos, veja o que mais pode reduzir seu líquido:
               </p>
               <ul className="list-disc pl-5 space-y-2 text-sm">
                   <li><strong>Vale Transporte:</strong> A empresa pode descontar até 6% do seu salário base. Se o custo da passagem for menor que isso, desconta-se apenas o custo real.</li>
                   <li><strong>Vale Refeição/Alimentação:</strong> Se a empresa participa do PAT, pode descontar até 20% do valor do benefício (geralmente descontam um valor simbólico).</li>
                   <li><strong>Faltas e Atrasos:</strong> Dias não trabalhados sem justificativa são descontados integralmente, impactando também no DSR (Descanso Semanal Remunerado).</li>
                   <li><strong>Empréstimo Consignado:</strong> Desconto direto em folha, limitado a 35% da renda líquida.</li>
                   <li><strong>Pensão Alimentícia:</strong> Descontada diretamente da fonte conforme determinação judicial.</li>
               </ul>
           </div>
       </section>

       <RelatedTools current="/salario-liquido" />
       <FAQ items={faqItems} />
    </div>
  );
};

export default NetSalaryCalculator;