import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import HourlyWidget from './components/HourlyWidget';
import Breadcrumbs from './components/Breadcrumbs';
import SocialShare from './components/SocialShare';

// Lazy Load Pages for Performance (Code Splitting)
const TerminationCalculator = React.lazy(() => import('./pages/TerminationCalculator'));
const LetterGenerator = React.lazy(() => import('./pages/LetterGenerator'));
const NetSalaryCalculator = React.lazy(() => import('./pages/NetSalaryCalculator'));
const UnemploymentCalculator = React.lazy(() => import('./pages/UnemploymentCalculator'));
const VacationCalculator = React.lazy(() => import('./pages/VacationCalculator'));
const CltVsPj = React.lazy(() => import('./pages/CltVsPj'));
const OvertimeCalculator = React.lazy(() => import('./pages/OvertimeCalculator'));
const NightShiftCalculator = React.lazy(() => import('./pages/NightShiftCalculator'));
const IncomeProofGenerator = React.lazy(() => import('./pages/IncomeProofGenerator'));
const TimeSheetCalculator = React.lazy(() => import('./pages/TimeSheetCalculator'));
const InvestmentSimulator = React.lazy(() => import('./pages/InvestmentSimulator'));
const FgtsCalculator = React.lazy(() => import('./pages/FgtsCalculator'));
const BestDateCalculator = React.lazy(() => import('./pages/BestDateCalculator'));
const DomesticCalculator = React.lazy(() => import('./pages/DomesticCalculator'));
const RightsWizard = React.lazy(() => import('./pages/RightsWizard'));
const HomologationChecklist = React.lazy(() => import('./pages/HomologationChecklist'));
const SurvivalCalculator = React.lazy(() => import('./pages/SurvivalCalculator'));
const CvGenerator = React.lazy(() => import('./pages/CvGenerator'));
const ReceiptGenerator = React.lazy(() => import('./pages/ReceiptGenerator'));
const LinkedinGenerator = React.lazy(() => import('./pages/LinkedinGenerator'));
const MeiMonitor = React.lazy(() => import('./pages/MeiMonitor'));
const LegalAssistant = React.lazy(() => import('./pages/LegalAssistant'));
const Sitemap = React.lazy(() => import('./pages/Sitemap'));
const GlossaryPage = React.lazy(() => import('./pages/GlossaryPage'));
const OfficialTables = React.lazy(() => import('./pages/OfficialTables'));
const About = React.lazy(() => import('./pages/About'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
  </div>
);

interface NavLinkProps {
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isSecondary?: boolean;
  onClick?: () => void;
  className?: string; // Allow custom classes
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, children, isSecondary, onClick, className }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  if (isSecondary) {
      return (
        <Link 
          to={to} 
          onClick={onClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border shrink-0 ${
            isActive 
              ? 'bg-brand-600 text-white border-brand-600 shadow-md' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
          }`}
        >
          {children}
        </Link>
      );
  }

  // Custom styling for mobile grid items if className is provided, else default desktop nav
  if (className) {
      return (
        <Link 
          to={to}
          onClick={onClick}
          className={`${className} ${isActive ? 'ring-2 ring-brand-500 ring-offset-1 bg-brand-50 border-brand-200' : ''}`}
        >
          {children}
        </Link>
      );
  }

  return (
    <Link 
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
        isActive 
          ? 'bg-brand-50 text-brand-700' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
};

// Helper for Mobile Grid Items
const MobileGridItem: React.FC<{ to: string; icon: string; title: string; onClick: () => void }> = ({ to, icon, title, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link 
            to={to} 
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                isActive 
                ? 'bg-brand-50 border-brand-200 shadow-sm' 
                : 'bg-white border-slate-100 shadow-sm hover:border-brand-200'
            }`}
        >
            <span className="text-2xl mb-1">{icon}</span>
            <span className={`text-xs font-semibold text-center leading-tight ${isActive ? 'text-brand-700' : 'text-slate-600'}`}>{title}</span>
        </Link>
    );
}

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  // PWA Install Prompt Logic
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Primary Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print h-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group z-50" aria-label="Conta Trabalhista - Início">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                $
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="font-bold text-lg text-slate-800 tracking-tight leading-none">Conta Trabalhista</span>
                <span className="text-[10px] text-brand-600 font-semibold tracking-wide uppercase">Cálculos Exatos</span>
              </div>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink to="/">Rescisão</NavLink>
              <NavLink to="/assistente" icon={<span className="text-lg">🤖</span>}>Assistente</NavLink>
              <NavLink to="/seguro-desemprego">Seguro Desemprego</NavLink>
              <NavLink to="/ferias">Férias</NavLink>
              <NavLink to="/salario-liquido">Salário Líquido</NavLink>
            </nav>

            <div className="flex items-center gap-2">
                {/* Install Button (PWA) */}
                {showInstallBtn && (
                    <button 
                        onClick={handleInstallClick}
                        className="hidden md:flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-brand-100 transition-colors animate-fade-in"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Instalar App
                    </button>
                )}

                {/* Mobile Menu Button */}
                <button 
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none z-50"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Abrir Menu de Navegação"
                >
                {isMobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
                </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-slate-50 md:hidden animate-fade-in pt-16 px-4 pb-24 overflow-y-auto">
             
             {showInstallBtn && (
                 <button 
                    onClick={handleInstallClick}
                    className="w-full bg-brand-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-6 shadow-lg"
                 >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Instalar Aplicativo
                 </button>
             )}

             <div className="space-y-6 pt-2">
                
                {/* Section 1: Main Calculators */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Principais</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <MobileGridItem to="/" icon="❌" title="Rescisão CLT" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/assistente" icon="🤖" title="Assistente IA" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/seguro-desemprego" icon="🛡️" title="Seguro Desemprego" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/ferias" icon="🏖️" title="Férias" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/salario-liquido" icon="💰" title="Salário Líquido" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/adicional-noturno" icon="🌙" title="Adic. Noturno" onClick={() => setIsMobileMenuOpen(false)} />
                    </div>
                </div>

                {/* Section 2: Planning & Analysis */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Planejamento</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <MobileGridItem to="/melhor-data" icon="📅" title="Melhor Data" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/sobrevivencia" icon="🔋" title="Sobrevivência" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/fgts" icon="🏦" title="Simulador FGTS" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/clt-pj" icon="⚖️" title="CLT vs PJ" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/investimentos" icon="📈" title="Investimentos" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/mei-monitor" icon="🏢" title="Monitor MEI" onClick={() => setIsMobileMenuOpen(false)} />
                    </div>
                </div>

                {/* Section 3: Documents & Tools */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Documentos & Ferramentas</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <MobileGridItem to="/curriculo" icon="📄" title="Criar Currículo" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/linkedin" icon="👔" title="Gerar LinkedIn" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/gerador-recibo" icon="🧾" title="Gerar Recibo" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/carta-demissao" icon="✍️" title="Carta Demissão" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/comprovante-renda" icon="📝" title="Renda Informal" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/domestico" icon="🏠" title="Doméstica" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/ponto" icon="⏰" title="Folha Ponto" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/quiz-direitos" icon="🎓" title="Quiz Direitos" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileGridItem to="/checklist-homologacao" icon="✅" title="Checklist" onClick={() => setIsMobileMenuOpen(false)} />
                    </div>
                </div>

             </div>
          </div>
        )}
      </header>

      {/* Secondary Nav - Horizontal Scrollable Pills */}
      <div className={`hidden md:block bg-white border-b border-slate-200 py-3 no-print sticky top-16 z-30 shadow-sm`}>
         <div className="max-w-7xl mx-auto px-4 relative">
            {/* Flex container */}
            <div className="flex gap-3 flex-wrap justify-center">
                <NavLink to="/assistente" isSecondary>🤖 Assistente CLT</NavLink>
                <NavLink to="/tabelas" isSecondary>📊 Tabelas Oficiais</NavLink>
                <NavLink to="/quiz-direitos" isSecondary>🎓 Quiz Direitos</NavLink>
                <NavLink to="/sobrevivencia" isSecondary>🔋 Sobrevivência</NavLink>
                <NavLink to="/melhor-data" isSecondary>📅 Melhor Data</NavLink>
                <NavLink to="/curriculo" isSecondary>📄 Criar Currículo</NavLink>
                <NavLink to="/linkedin" isSecondary>👔 Gerador LinkedIn</NavLink>
                <NavLink to="/gerador-recibo" isSecondary>🧾 Recibo MEI</NavLink>
                <NavLink to="/mei-monitor" isSecondary>🏢 Monitor MEI</NavLink>
                <NavLink to="/domestico" isSecondary>🏠 Doméstica</NavLink>
                <NavLink to="/checklist-homologacao" isSecondary>✅ Checklist</NavLink>
                <NavLink to="/fgts" isSecondary>💰 FGTS</NavLink>
                <NavLink to="/investimentos" isSecondary>📈 Investir</NavLink>
                <NavLink to="/carta-demissao" isSecondary>✍️ Carta Demissão</NavLink>
                <NavLink to="/ponto" isSecondary>⏰ Ponto</NavLink>
                <NavLink to="/clt-pj" isSecondary>⚖️ CLT vs PJ</NavLink>
                <NavLink to="/hora-extra" isSecondary>⏱️ Hora Extra</NavLink>
                <NavLink to="/adicional-noturno" isSecondary>🌙 Adic. Noturno</NavLink>
                <NavLink to="/comprovante-renda" isSecondary>🧾 Renda Informal</NavLink>
                <NavLink to="/glossario" isSecondary>📖 Dicionário</NavLink>
            </div>
         </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <Breadcrumbs />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<TerminationCalculator />} />
            <Route path="/seguro-desemprego" element={<UnemploymentCalculator />} />
            <Route path="/ferias" element={<VacationCalculator />} />
            <Route path="/salario-liquido" element={<NetSalaryCalculator />} />
            <Route path="/clt-pj" element={<CltVsPj />} />
            <Route path="/hora-extra" element={<OvertimeCalculator />} />
            <Route path="/adicional-noturno" element={<NightShiftCalculator />} />
            <Route path="/comprovante-renda" element={<IncomeProofGenerator />} />
            <Route path="/ponto" element={<TimeSheetCalculator />} />
            <Route path="/investimentos" element={<InvestmentSimulator />} />
            <Route path="/fgts" element={<FgtsCalculator />} />
            <Route path="/melhor-data" element={<BestDateCalculator />} />
            <Route path="/domestico" element={<DomesticCalculator />} />
            <Route path="/quiz-direitos" element={<RightsWizard />} />
            <Route path="/checklist-homologacao" element={<HomologationChecklist />} />
            <Route path="/sobrevivencia" element={<SurvivalCalculator />} />
            <Route path="/curriculo" element={<CvGenerator />} />
            <Route path="/gerador-recibo" element={<ReceiptGenerator />} />
            <Route path="/carta-demissao" element={<LetterGenerator />} />
            <Route path="/linkedin" element={<LinkedinGenerator />} />
            <Route path="/mei-monitor" element={<MeiMonitor />} />
            <Route path="/assistente" element={<LegalAssistant />} />
            <Route path="/glossario" element={<GlossaryPage />} />
            <Route path="/tabelas" element={<OfficialTables />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/mapa-do-site" element={<Sitemap />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto no-print border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
                            $
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">Conta Trabalhista</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-6">
                        O Conta Trabalhista é sua referência em cálculos exatos e seguros. Nossa missão é simplificar a CLT, ajudando trabalhadores e pequenos empreendedores a entenderem seus direitos com transparência.
                    </p>
                    <p className="text-xs opacity-60">Última atualização: {currentMonth}/{currentYear}</p>
                </div>
                
                <div>
                    <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Cálculos Essenciais</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link to="/" className="hover:text-brand-400 transition-colors">Rescisão CLT</Link></li>
                        <li><Link to="/seguro-desemprego" className="hover:text-brand-400 transition-colors">Seguro Desemprego</Link></li>
                        <li><Link to="/salario-liquido" className="hover:text-brand-400 transition-colors">Salário Líquido</Link></li>
                        <li><Link to="/ferias" className="hover:text-brand-400 transition-colors">Férias + 1/3</Link></li>
                        <li><Link to="/hora-extra" className="hover:text-brand-400 transition-colors">Horas Extras</Link></li>
                        <li><Link to="/adicional-noturno" className="hover:text-brand-400 transition-colors">Adicional Noturno</Link></li>
                        <li><Link to="/fgts" className="hover:text-brand-400 transition-colors">FGTS & Multa</Link></li>
                        <li><Link to="/domestico" className="hover:text-brand-400 transition-colors">Empregada Doméstica</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Geradores & Carreira</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link to="/clt-pj" className="hover:text-brand-400 transition-colors">Comparador CLT vs PJ</Link></li>
                        <li><Link to="/mei-monitor" className="hover:text-brand-400 transition-colors">Monitor Limite MEI</Link></li>
                        <li><Link to="/curriculo" className="hover:text-brand-400 transition-colors">Gerador de Currículo</Link></li>
                        <li><Link to="/linkedin" className="hover:text-brand-400 transition-colors">Gerador LinkedIn</Link></li>
                        <li><Link to="/gerador-recibo" className="hover:text-brand-400 transition-colors">Gerador de Recibo</Link></li>
                        <li><Link to="/carta-demissao" className="hover:text-brand-400 transition-colors">Carta de Demissão</Link></li>
                        <li><Link to="/comprovante-renda" className="hover:text-brand-400 transition-colors">Renda Informal / Decore</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Planejamento & Útil</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link to="/tabelas" className="hover:text-brand-400 transition-colors text-white font-bold">Tabelas Oficiais {currentYear}</Link></li>
                        <li><Link to="/melhor-data" className="hover:text-brand-400 transition-colors">Melhor Data Demissão</Link></li>
                        <li><Link to="/sobrevivencia" className="hover:text-brand-400 transition-colors">Sobrevivência Financeira</Link></li>
                        <li><Link to="/investimentos" className="hover:text-brand-400 transition-colors">Simulador Investimentos</Link></li>
                        <li><Link to="/ponto" className="hover:text-brand-400 transition-colors">Folha de Ponto</Link></li>
                        <li><Link to="/quiz-direitos" className="hover:text-brand-400 transition-colors">Quiz: Meus Direitos</Link></li>
                        <li><Link to="/checklist-homologacao" className="hover:text-brand-400 transition-colors">Checklist Homologação</Link></li>
                        <li><Link to="/assistente" className="hover:text-brand-400 transition-colors flex items-center gap-2"><span>🤖</span> Assistente Virtual</Link></li>
                        <li><Link to="/glossario" className="hover:text-brand-400 transition-colors">Dicionário Trabalhista</Link></li>
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs gap-4 text-slate-500">
                <p className="text-center md:text-left">&copy; {currentYear} Conta Trabalhista. Todos os direitos reservados.</p>
                <div className="flex gap-4">
                    <Link to="/sobre" className="hover:text-slate-300">Quem Somos</Link>
                    <Link to="/privacidade" className="hover:text-slate-300">Privacidade</Link>
                    <Link to="/termos" className="hover:text-slate-300">Termos de Uso</Link>
                    <Link to="/mapa-do-site" className="hover:text-slate-300">Mapa do Site</Link>
                </div>
            </div>
        </div>
      </footer>
      <HourlyWidget />
      <SocialShare />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
};

export default App;