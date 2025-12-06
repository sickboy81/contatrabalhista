import React from 'react';
import SEO from '../components/SEO';

const Terms: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <SEO 
        title="Termos de Uso - Portal do Bolso"
        description="Termos e condições de uso das calculadoras trabalhistas."
      />

      <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-200 prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Termos de Uso</h1>
        <p className="text-sm text-slate-500 mb-8 capitalize">Última atualização: {currentMonth} de {currentYear}</p>

        <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">1. Natureza Informativa</h3>
        <p>O <strong>Portal do Bolso do Trabalhador</strong> é uma ferramenta educativa e informativa. As calculadoras fornecem <strong>simulações</strong> baseadas nas leis trabalhistas vigentes (CLT) e tabelas oficiais (INSS, IRRF).</p>
        <p>Embora nos esforcemos para garantir a precisão, os resultados <strong>não substituem</strong> o cálculo oficial feito pelo departamento pessoal da sua empresa, pelo sindicato ou por um contador, e não têm valor legal como prova em juízo.</p>

        <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">2. Isenção de Responsabilidade</h3>
        <p>Não nos responsabilizamos por quaisquer perdas ou danos, diretos ou indiretos, decorrentes do uso das informações contidas neste site. Recomendamos sempre a conferência dos valores com um profissional qualificado antes de tomar decisões financeiras ou assinar documentos rescisórios.</p>

        <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">3. Propriedade Intelectual</h3>
        <p>Todo o conteúdo, layout, logotipos e códigos deste site são protegidos por direitos autorais. É proibida a reprodução total ou parcial sem autorização expressa.</p>

        <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">4. Alterações</h3>
        <p>Reservamo-nos o direito de alterar estes termos a qualquer momento, sem aviso prévio, para refletir mudanças na legislação ou no funcionamento do site.</p>
      </div>
    </div>
  );
};

export default Terms;