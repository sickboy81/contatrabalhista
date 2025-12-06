import React from 'react';
import SEO from '../components/SEO';

const Privacy: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <SEO 
        title="Política de Privacidade - Portal do Bolso"
        description="Entenda como tratamos seus dados. Respeito total à sua privacidade: cálculos locais e zero armazenamento de dados sensíveis."
      />

      <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-200 prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Política de Privacidade</h1>
        <p className="text-sm text-slate-500 mb-8 capitalize">Última atualização: {currentMonth} de {currentYear}</p>

        <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">1. Visão Geral</h3>
        <p>O <strong>Portal do Bolso do Trabalhador</strong> tem o compromisso de proteger sua privacidade. Esta política descreve como coletamos, usamos e protegemos suas informações ao utilizar nossas calculadoras e ferramentas.</p>

        <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">2. Dados Inseridos nas Calculadoras</h3>
        <p>Todas as informações financeiras e pessoais (como salário, data de admissão, nome, CPF) que você insere em nossas calculadoras são processadas <strong>exclusivamente no seu navegador (localmente)</strong>.</p>
        <p>Nós <strong>NÃO</strong> enviamos, armazenamos ou salvamos seus dados de cálculo em nossos servidores. Assim que você fecha a aba ou atualiza a página, esses dados são descartados (exceto quando você opta explicitamente por salvar no "Armazenamento Local" do seu próprio dispositivo para uso futuro).</p>

        <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">3. Cookies e Publicidade</h3>
        <p>Utilizamos cookies de terceiros para melhorar sua experiência e exibir anúncios relevantes. Nossos parceiros de publicidade, incluindo o Google (AdSense), podem usar cookies para exibir anúncios com base em suas visitas anteriores a este ou a outros sites.</p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Você pode desativar a publicidade personalizada acessando as Configurações de Anúncios do Google.</li>
            <li>Utilizamos o Google Analytics para entender como os usuários navegam no site (páginas mais acessadas, tempo de permanência), de forma anônima e agregada.</li>
        </ul>

        <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">4. Links Externos</h3>
        <p>Nosso site pode conter links para sites externos (como Gov.br ou sites de notícias). Não nos responsabilizamos pelas práticas de privacidade desses terceiros.</p>

        <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">5. Contato</h3>
        <p>Se tiver dúvidas sobre esta política, entre em contato conosco através dos canais oficiais disponíveis no rodapé do site.</p>
      </div>
    </div>
  );
};

export default Privacy;