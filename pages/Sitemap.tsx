import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Sitemap: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Cálculos Trabalhistas",
      links: [
        { to: "/", label: "Calculadora de Rescisão CLT" },
        { to: "/seguro-desemprego", label: "Simulador de Seguro Desemprego" },
        { to: "/ferias", label: "Calculadora de Férias e Venda (Abono)" },
        { to: "/salario-liquido", label: "Calculadora de Salário Líquido" },
        { to: "/hora-extra", label: "Calculadora de Horas Extras e DSR" },
        { to: "/fgts", label: "Simulador de Saque-Aniversário FGTS" },
        { to: "/domestico", label: "Calculadora de Empregada Doméstica" },
      ]
    },
    {
      title: "Planejamento e Carreira",
      links: [
        { to: "/clt-pj", label: "Comparador CLT vs PJ" },
        { to: "/melhor-data", label: "Melhor Data para Pedir Demissão" },
        { to: "/sobrevivencia", label: "Calculadora de Sobrevivência Financeira" },
        { to: "/investimentos", label: "Simulador de Investimento da Rescisão" },
        { to: "/quiz-direitos", label: "Quiz: Quais meus Direitos?" },
        { to: "/mei-monitor", label: `Monitor de Limite MEI ${currentYear}` },
      ]
    },
    {
      title: "Geradores de Documentos",
      links: [
        { to: "/curriculo", label: "Gerador de Currículo PDF" },
        { to: "/carta-demissao", label: "Gerador de Carta de Demissão" },
        { to: "/gerador-recibo", label: "Gerador de Recibo de Pagamento" },
        { to: "/comprovante-renda", label: "Gerador de Comprovante de Renda" },
        { to: "/linkedin", label: "Gerador de Perfil LinkedIn" },
      ]
    },
    {
      title: "Utilidades & Legal",
      links: [
        { to: "/ponto", label: "Calculadora de Ponto e Almoço" },
        { to: "/checklist-homologacao", label: "Checklist de Homologação" },
        { to: "/assistente", label: "Assistente Virtual CLT (IA)" },
        { to: "/glossario", label: "Dicionário Trabalhista" },
        { to: "/privacidade", label: "Política de Privacidade" },
        { to: "/termos", label: "Termos de Uso" },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <SEO 
        title="Mapa do Site - Todas as Ferramentas"
        description="Índice completo de todas as calculadoras e ferramentas trabalhistas disponíveis no Portal do Bolso."
        keywords="mapa do site, lista calculadoras, ferramentas clt"
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-brand-900 mb-2">Mapa do Site</h1>
        <p className="text-gray-600">Encontre rapidamente a ferramenta que você precisa.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-lg text-brand-700 mb-4 pb-2 border-b border-brand-100">
              {section.title}
            </h2>
            <ul className="space-y-3">
              {section.links.map((link, lIdx) => (
                <li key={lIdx}>
                  <Link 
                    to={link.to} 
                    className="flex items-center text-gray-700 hover:text-brand-600 transition-colors group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-brand-500 mr-2 transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sitemap;