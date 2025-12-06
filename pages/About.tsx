import React from 'react';
import SEO from '../components/SEO';
import RelatedTools from '../components/RelatedTools';

const About: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Conta Trabalhista",
      "description": "Ferramentas gratuitas de cálculo trabalhista para simplificar a CLT no Brasil.",
      "url": "https://contatrabalhista.com.br",
      "foundingDate": "2023",
      "areaServed": "BR"
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <SEO 
        title="Quem Somos - Metodologia e Missão do Conta Trabalhista"
        description="Conheça a equipe e a metodologia por trás das calculadoras do Conta Trabalhista. Transparência e precisão nos cálculos trabalhistas."
        keywords="quem somos, sobre conta trabalhista, metodologia calculo rescisao, contato"
        schemas={[aboutSchema]}
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-900 mb-4">Quem Somos</h1>
        <p className="text-gray-600 text-lg">Transparência para o trabalhador brasileiro.</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 space-y-8 text-slate-700 leading-relaxed">
        
        <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Nossa Missão</h2>
            <p>
                O <strong>Conta Trabalhista</strong> nasceu com um objetivo claro: descomplicar a CLT. Acreditamos que todo trabalhador tem o direito de entender, centavo por centavo, o que está recebendo ou deixando de receber.
            </p>
            <p className="mt-3">
                Nossas ferramentas transformam leis complexas (como a Lei 13.467/2017 da Reforma Trabalhista) em simuladores simples, rápidos e acessíveis, permitindo que você tome decisões financeiras mais seguras.
            </p>
        </section>

        <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🧮</span> Nossa Metodologia
            </h2>
            <p className="mb-3">
                A precisão é nossa prioridade. Nossos algoritmos são atualizados constantemente para refletir as mudanças na legislação. Utilizamos como base oficial:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
                <li><strong>Consolidação das Leis do Trabalho (CLT):</strong> Decreto-Lei nº 5.452/1943.</li>
                <li><strong>Tabela de INSS e IRRF:</strong> Atualizadas conforme vigência anual da Receita Federal e Previdência Social.</li>
                <li><strong>FGTS:</strong> Regras da Caixa Econômica Federal (Lei 8.036/1990).</li>
                <li><strong>Seguro Desemprego:</strong> Tabela atualizada anualmente pelo Ministério do Trabalho (CODEFAT).</li>
            </ul>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Isenção de Responsabilidade (Disclaimer)</h2>
            <p>
                O Conta Trabalhista é uma ferramenta de <strong>simulação educativa e informativa</strong>. Embora envidemos todos os esforços para garantir a exatidão dos cálculos, os resultados aqui apresentados não substituem o cálculo oficial realizado pelo Departamento Pessoal da sua empresa, pelo seu Sindicato ou por um Contador habilitado.
            </p>
            <p className="mt-3">
                Não somos um escritório de advocacia e não prestamos consultoria jurídica individualizada. Para casos de litígio trabalhista, recomendamos fortemente a consulta a um advogado especializado.
            </p>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contato</h2>
            <p>
                Encontrou algum erro? Tem sugestões de novas ferramentas? Entre em contato conosco.
            </p>
            <div className="mt-4 inline-block bg-brand-50 text-brand-700 px-4 py-2 rounded-lg font-medium border border-brand-100">
                📧 contato@contatrabalhista.com.br
            </div>
        </section>

      </div>

      <RelatedTools current="/sobre" />
    </div>
  );
};

export default About;