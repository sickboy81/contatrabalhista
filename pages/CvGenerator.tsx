import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

interface Experience {
  id: number;
  company: string;
  role: string;
  period: string;
  description: string;
}

interface Education {
  id: number;
  institution: string;
  degree: string;
  year: string;
}

const CvGenerator: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'personal' | 'exp' | 'edu' | 'skills' | 'config'>('personal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scale, setScale] = useState(1);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const [config, setConfig] = useState({
    template: 'modern', // 'modern' | 'classic'
    color: '#0ea5e9', // Brand Blue
    font: 'sans', // 'sans' | 'serif'
  });

  const [personal, setPersonal] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    summary: '',
    photo: '' // Added photo field
  });

  const [experience, setExperience] = useState<Experience[]>([
    { id: 1, company: '', role: '', period: '', description: '' }
  ]);

  const [education, setEducation] = useState<Education[]>([
     { id: 1, institution: '', degree: '', year: '' }
  ]);

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [languages, setLanguages] = useState<{id: number, lang: string, level: string}[]>([]);

  const cvRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- AUTO SCALE LOGIC ---
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // On mobile preview mode, we want to fit differently
        const padding = mobilePreviewOpen ? 20 : 40; 
        const availableWidth = containerWidth - padding;
        const standardWidth = 794; // 210mm @ 96 DPI
        
        if (availableWidth < standardWidth) {
           // Scale down
           setScale(availableWidth / standardWidth);
        } else {
           // Standard size
           setScale(1);
        }
      }
    };

    // Initial calc
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobilePreviewOpen]);


  // --- HANDLERS ---

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonal(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Experience
  const addExp = () => setExperience([...experience, { id: Date.now(), company: '', role: '', period: '', description: '' }]);
  const removeExp = (id: number) => setExperience(experience.filter(e => e.id !== id));
  const updateExp = (id: number, field: keyof Experience, value: string) => {
      setExperience(experience.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // Education
  const addEdu = () => setEducation([...education, { id: Date.now(), institution: '', degree: '', year: '' }]);
  const removeEdu = (id: number) => setEducation(education.filter(e => e.id !== id));
  const updateEdu = (id: number, field: keyof Education, value: string) => {
      setEducation(education.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // Skills
  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));

  // Languages
  const addLang = () => setLanguages([...languages, { id: Date.now(), lang: '', level: 'Intermediário' }]);
  const updateLang = (id: number, field: 'lang' | 'level', value: string) => {
    setLanguages(languages.map(l => l.id === id ? { ...l, [field]: value } : l));
  };
  const removeLang = (id: number) => setLanguages(languages.filter(l => l.id !== id));


  // Fill Example Data
  const fillExample = () => {
    setPersonal({
      name: 'Ana Pereira',
      role: 'Gerente de Vendas',
      email: 'ana.pereira@email.com',
      phone: '(11) 99999-8888',
      location: 'São Paulo, SP',
      linkedin: 'linkedin.com/in/ana-exemplo',
      summary: 'Profissional com 8 anos de experiência em gestão comercial e liderança de equipes. Especialista em estratégias de crescimento B2B e fidelização de clientes.',
      photo: '' // Don't add a photo by default to keep it clean
    });
    setExperience([
      { id: 1, role: 'Gerente Comercial', company: 'Empresa Tech Solutions', period: '2020 - Atual', description: 'Liderança de equipe de 15 vendedores. Aumento de 40% no faturamento anual. Implementação de CRM.' },
      { id: 2, role: 'Vendedora Sênior', company: 'Comércio Global Ltda', period: '2017 - 2020', description: 'Responsável por contas chave e negociação com grandes fornecedores.' }
    ]);
    setEducation([
      { id: 1, degree: 'MBA em Gestão Empresarial', institution: 'FGV', year: '2019' },
      { id: 2, degree: 'Bacharelado em Administração', institution: 'USP', year: '2016' }
    ]);
    setSkills(['Liderança', 'Negociação B2B', 'Salesforce', 'Pacote Office Avançado', 'Oratória']);
    setLanguages([{ id: 1, lang: 'Inglês', level: 'Avançado' }, { id: 2, lang: 'Espanhol', level: 'Intermediário' }]);
  };

  // PDF Generation
  const generatePDF = async () => {
    if (!cvRef.current) return;
    setIsGenerating(true);
    
    // TEMPORARILY RESET SCALE FOR PDF GENERATION
    const currentScale = scale;
    // We need to render it at 100% scale for html2canvas to capture correctly high res
    setScale(1);

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const canvas = await html2canvas(cvRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY // Correct scrolling issues
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Multi-page logic
      while (heightLeft > 1) { 
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`curriculo-${personal.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF.');
    } finally {
      // RESTORE SCALE
      setScale(currentScale);
      setIsGenerating(false);
    }
  };

  const faqItems = [
    {
        question: "Devo colocar foto no currículo?",
        answer: "Depende. No Brasil, atualmente, <strong>não é obrigatório</strong> e muitos recrutadores preferem sem, para evitar vieses. Coloque apenas se a vaga exigir (ex: modelo, recepção) ou se for um padrão da sua área."
    },
    {
        question: "Preciso colocar endereço completo?",
        answer: "Não. Por segurança, coloque apenas Bairro, Cidade e Estado. O recrutador só precisa saber se você mora perto do trabalho ou se tem disponibilidade de mudança."
    },
    {
        question: "Qual o tamanho ideal do currículo?",
        answer: "Para a maioria dos profissionais, <strong>1 a 2 páginas</strong> é o ideal. Recrutadores gastam poucos segundos na primeira leitura. Seja conciso e foque em resultados."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20 lg:pb-12">
      <SEO 
        title={`Gerador de Currículo Grátis ${currentYear} (PDF) - Modelos Profissionais`}
        description={`Crie seu Curriculum Vitae online e baixe em PDF. Modelos modernos ${currentYear}, prontos para preencher. Sem cadastro e totalmente gratuito.`}
        keywords={`criar curriculo gratis ${currentYear}, gerador de curriculo pdf, modelos de curriculo, fazer curriculo online, curriculum vitae`}
        ratingValue={4.7}
        reviewCount={2890}
      />

      <div className="text-center mb-8 no-print">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-900">Gerador de Currículo {currentYear}</h1>
        <p className="text-gray-600 text-sm md:text-base">Crie um CV moderno, visualize em tempo real e baixe em alta qualidade.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.7/5)</span>
        </div>
        <button onClick={fillExample} className="text-xs text-brand-600 underline mt-2 hover:text-brand-800">Preencher com exemplo</button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: EDITOR */}
        <div className="lg:col-span-5 space-y-4 no-print h-full lg:overflow-y-auto lg:max-h-[calc(100vh-200px)] custom-scrollbar pr-1">
            
            {/* TABS HEADER - UPDATED TO WRAP */}
            <div className="flex flex-wrap gap-2 pb-2">
                {[
                    { id: 'personal', label: 'Dados', icon: '👤' },
                    { id: 'exp', label: 'Experiência', icon: '💼' },
                    { id: 'edu', label: 'Formação', icon: '🎓' },
                    { id: 'skills', label: 'Habilidades', icon: '⚡' },
                    { id: 'config', label: 'Design', icon: '🎨' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                            activeTab === tab.id 
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
                
                {/* 1. PERSONAL */}
                {activeTab === 'personal' && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="font-bold text-gray-800">Dados Pessoais</h3>
                        
                        {/* PHOTO UPLOAD */}
                        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                {personal.photo ? (
                                    <img src={personal.photo} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl text-gray-300">📷</span>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Foto (Opcional)</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handlePhotoUpload} 
                                        className="text-xs w-full text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white file:text-brand-600 file:border-brand-100 file:border hover:file:bg-brand-50"
                                    />
                                    {personal.photo && (
                                        <button onClick={() => setPersonal({...personal, photo: ''})} className="text-red-400 hover:text-red-600 p-1">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <input className="w-full p-3 border rounded bg-white text-gray-800" placeholder="Nome Completo" value={personal.name} onChange={e => setPersonal({...personal, name: e.target.value})} />
                        <input className="w-full p-3 border rounded bg-white text-gray-800" placeholder="Cargo Pretendido" value={personal.role} onChange={e => setPersonal({...personal, role: e.target.value})} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input className="w-full p-3 border rounded bg-white text-gray-800" placeholder="E-mail" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} />
                            <input className="w-full p-3 border rounded bg-white text-gray-800" placeholder="Telefone" value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} />
                        </div>
                        <input className="w-full p-3 border rounded bg-white text-gray-800" placeholder="Cidade / Estado" value={personal.location} onChange={e => setPersonal({...personal, location: e.target.value})} />
                        <input className="w-full p-3 border rounded bg-white text-gray-800" placeholder="Link LinkedIn / Portfólio" value={personal.linkedin} onChange={e => setPersonal({...personal, linkedin: e.target.value})} />
                        <textarea className="w-full p-3 border rounded h-32 bg-white text-gray-800" placeholder="Resumo Profissional" value={personal.summary} onChange={e => setPersonal({...personal, summary: e.target.value})} />
                    </div>
                )}

                {/* 2. EXPERIENCE */}
                {activeTab === 'exp' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Experiência Profissional</h3>
                            <button onClick={addExp} className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded font-bold hover:bg-brand-100">+ Adicionar</button>
                        </div>
                        {experience.map(exp => (
                            <div key={exp.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative group">
                                <button onClick={() => removeExp(exp.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2">✕</button>
                                <input className="w-full p-2 border rounded mb-2 text-sm bg-white text-gray-800" placeholder="Cargo" value={exp.role} onChange={e => updateExp(exp.id, 'role', e.target.value)} />
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <input className="w-full p-2 border rounded text-sm bg-white text-gray-800" placeholder="Empresa" value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} />
                                    <input className="w-full p-2 border rounded text-sm bg-white text-gray-800" placeholder="Período" value={exp.period} onChange={e => updateExp(exp.id, 'period', e.target.value)} />
                                </div>
                                <textarea className="w-full p-2 border rounded text-sm h-20 bg-white text-gray-800" placeholder="Descrição das atividades..." value={exp.description} onChange={e => updateExp(exp.id, 'description', e.target.value)} />
                            </div>
                        ))}
                    </div>
                )}

                {/* 3. EDUCATION */}
                {activeTab === 'edu' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Formação Acadêmica</h3>
                            <button onClick={addEdu} className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded font-bold hover:bg-brand-100">+ Adicionar</button>
                        </div>
                        {education.map(edu => (
                            <div key={edu.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative group">
                                <button onClick={() => removeEdu(edu.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2">✕</button>
                                <input className="w-full p-2 border rounded mb-2 text-sm bg-white text-gray-800" placeholder="Curso / Grau" value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="w-full p-2 border rounded text-sm bg-white text-gray-800" placeholder="Instituição" value={edu.institution} onChange={e => updateEdu(edu.id, 'institution', e.target.value)} />
                                    <input className="w-full p-2 border rounded text-sm bg-white text-gray-800" placeholder="Ano Conclusão" value={edu.year} onChange={e => updateEdu(edu.id, 'year', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 4. SKILLS & LANGUAGES */}
                {activeTab === 'skills' && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-2">Habilidades Técnicas</h3>
                            <div className="flex gap-2 mb-2">
                                <input 
                                    className="flex-1 p-2 border rounded text-sm bg-white text-gray-800" 
                                    placeholder="Ex: Excel Avançado, Gestão..." 
                                    value={skillInput} 
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                                />
                                <button onClick={addSkill} className="bg-gray-800 text-white px-3 rounded text-sm font-bold">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, i) => (
                                    <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        {skill} <button onClick={() => removeSkill(i)} className="hover:text-red-500 p-1">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-gray-800">Idiomas</h3>
                                <button onClick={addLang} className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded font-bold hover:bg-brand-100">+ Adicionar</button>
                            </div>
                            {languages.map(lang => (
                                <div key={lang.id} className="flex gap-2 mb-2 items-center">
                                     <input className="flex-1 p-2 border rounded text-sm bg-white text-gray-800" placeholder="Idioma" value={lang.lang} onChange={e => updateLang(lang.id, 'lang', e.target.value)} />
                                     <select className="w-32 p-2 border rounded text-sm bg-white text-gray-800" value={lang.level} onChange={e => updateLang(lang.id, 'level', e.target.value)}>
                                        <option>Básico</option>
                                        <option>Intermediário</option>
                                        <option>Avançado</option>
                                        <option>Fluente</option>
                                        <option>Nativo</option>
                                     </select>
                                     <button onClick={() => removeLang(lang.id)} className="text-red-400 hover:text-red-600 p-1">×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. CONFIG / DESIGN */}
                {activeTab === 'config' && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-2">Modelo (Template)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setConfig({...config, template: 'modern'})}
                                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 ${config.template === 'modern' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="w-12 h-16 bg-white border flex shadow-sm">
                                        <div className="w-1/3 h-full bg-gray-300"></div>
                                        <div className="w-2/3 h-full p-1 space-y-1">
                                            <div className="w-full h-1 bg-gray-200"></div>
                                            <div className="w-full h-1 bg-gray-200"></div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium">Moderno</span>
                                </button>
                                <button 
                                    onClick={() => setConfig({...config, template: 'classic'})}
                                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 ${config.template === 'classic' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="w-12 h-16 bg-white border flex flex-col p-1 items-center shadow-sm space-y-1">
                                        <div className="w-8 h-2 bg-gray-300 mb-1"></div>
                                        <div className="w-full h-1 bg-gray-200"></div>
                                        <div className="w-full h-1 bg-gray-200"></div>
                                        <div className="w-full h-1 bg-gray-200"></div>
                                    </div>
                                    <span className="text-sm font-medium">Clássico</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 mb-2">Cor de Destaque</h3>
                            <div className="flex gap-3 flex-wrap">
                                {['#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#1f2937'].map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => setConfig({...config, color: c})}
                                        className={`w-8 h-8 rounded-full border-2 ${config.color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <button 
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-2 mt-4"
            >
                {isGenerating ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                )}
                Baixar Currículo em PDF
            </button>
        </div>

        {/* MOBILE: FLOATING PREVIEW BUTTON */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40 no-print">
            <button 
                onClick={() => setMobilePreviewOpen(true)}
                className="bg-brand-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 font-bold ring-4 ring-white"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <span className="pr-2">Ver Currículo</span>
            </button>
        </div>

        {/* RIGHT COLUMN: PREVIEW (A4) */}
        <div 
          ref={containerRef}
          className={`
            lg:col-span-7 bg-gray-100 p-4 md:p-8 rounded-xl overflow-hidden flex flex-col items-center border border-gray-200 
            ${mobilePreviewOpen ? 'fixed inset-0 z-50 overflow-y-auto h-screen w-screen rounded-none' : 'hidden lg:flex min-h-[800px]'}
          `}
        >
            
            {/* MOBILE HEADER (Only visible when preview modal is open) */}
            {mobilePreviewOpen && (
                <div className="w-full flex justify-between items-center mb-6 lg:hidden sticky top-0 bg-gray-100/95 backdrop-blur pt-4 pb-4 px-2 border-b border-gray-200 z-50">
                    <button 
                        onClick={() => setMobilePreviewOpen(false)}
                        className="text-gray-600 font-bold text-sm flex items-center gap-1 bg-white px-3 py-2 rounded-lg shadow-sm border"
                    >
                        ← Editar
                    </button>
                    <button 
                        onClick={generatePDF}
                        disabled={isGenerating}
                        className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2"
                    >
                        {isGenerating ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : 'Baixar PDF'}
                    </button>
                </div>
            )}

            {/* WRAPPER FOR SCALING & SHADOW */}
            {/* The scale and shadow are applied here so they are NOT captured by html2canvas */}
            <div 
                className="shadow-2xl shrink-0 transition-transform duration-200 ease-out origin-top mt-2 lg:mt-0"
                style={{ 
                    transform: `scale(${scale})`,
                    // We allow some bottom margin so it doesn't look cut off visually when scrolling down if needed
                    marginBottom: '40px'
                }}
            >
                {/* THE PRINTABLE CV CONTENT */}
                <div 
                    ref={cvRef}
                    className="bg-white"
                    style={{ 
                        width: '210mm', 
                        minHeight: '297mm',
                    }}
                >
                    {/* --- MODERN TEMPLATE --- */}
                    {config.template === 'modern' && (
                        <div className="flex h-full min-h-[297mm]">
                            {/* SIDEBAR */}
                            <div className="w-[70mm] text-white p-6 space-y-8 shrink-0" style={{ backgroundColor: config.color }}>
                                <div className="text-center">
                                    {/* Photo Placeholder / Image */}
                                    <div className="w-32 h-32 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-white/10 relative">
                                        {personal.photo ? (
                                            <img src={personal.photo} alt={personal.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl font-bold text-white/50 uppercase">{personal.name.charAt(0) || 'EU'}</span>
                                        )}
                                    </div>
                                    
                                    <h2 className="text-xl font-bold uppercase leading-tight">{personal.name || 'Seu Nome'}</h2>
                                    <p className="text-sm opacity-90 mt-1">{personal.role || 'Seu Cargo'}</p>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <h3 className="font-bold border-b border-white/30 pb-1 uppercase text-xs tracking-wider">Contato</h3>
                                    <div className="space-y-2 opacity-90 text-xs">
                                        {personal.phone && <div className="flex gap-2"><span>📞</span> {personal.phone}</div>}
                                        {personal.email && <div className="flex gap-2 break-all"><span>✉️</span> {personal.email}</div>}
                                        {personal.location && <div className="flex gap-2"><span>📍</span> {personal.location}</div>}
                                        {personal.linkedin && <div className="flex gap-2 break-all"><span>🔗</span> {personal.linkedin}</div>}
                                    </div>
                                </div>

                                {skills.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-bold border-b border-white/30 pb-1 uppercase text-xs tracking-wider">Habilidades</h3>
                                        <ul className="text-sm space-y-1 opacity-90">
                                            {skills.map((s, i) => <li key={i}>• {s}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {languages.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-bold border-b border-white/30 pb-1 uppercase text-xs tracking-wider">Idiomas</h3>
                                        <ul className="text-sm space-y-1 opacity-90">
                                            {languages.map((l, i) => (
                                                <li key={i}>
                                                    <span className="font-semibold">{l.lang}</span>
                                                    <span className="block text-xs opacity-75">{l.level}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* MAIN CONTENT */}
                            <div className="flex-1 p-8 space-y-8">
                                {personal.summary && (
                                    <div>
                                        <h3 className="text-lg font-bold uppercase tracking-wider mb-3 text-gray-800 border-b-2 pb-1" style={{ borderColor: config.color }}>Sobre Mim</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed text-justify">{personal.summary}</p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-bold uppercase tracking-wider mb-4 text-gray-800 border-b-2 pb-1" style={{ borderColor: config.color }}>Experiência</h3>
                                    <div className="space-y-5">
                                        {experience.filter(e => e.company).map(exp => (
                                            <div key={exp.id}>
                                                <div className="flex justify-between items-center mb-1 gap-4">
                                                    <h4 className="font-bold text-gray-800">{exp.role}</h4>
                                                    <span className="text-xs font-bold text-white px-3 py-1.5 rounded-md shrink-0 whitespace-nowrap flex items-center justify-center" style={{ backgroundColor: config.color }}>{exp.period}</span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-500 mb-2">{exp.company}</p>
                                                <p className="text-sm text-gray-600 whitespace-pre-line text-justify">{exp.description}</p>
                                            </div>
                                        ))}
                                        {experience.length === 0 || !experience[0].company && <p className="text-xs text-gray-300 italic">Adicione sua experiência...</p>}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold uppercase tracking-wider mb-4 text-gray-800 border-b-2 pb-1" style={{ borderColor: config.color }}>Formação</h3>
                                    <div className="space-y-4">
                                        {education.filter(e => e.institution).map(edu => (
                                            <div key={edu.id}>
                                                <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                    <span>{edu.institution}</span>
                                                    <span>{edu.year}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {education.length === 0 || !education[0].institution && <p className="text-xs text-gray-300 italic">Adicione sua formação...</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- CLASSIC TEMPLATE --- */}
                    {config.template === 'classic' && (
                        <div className="p-12 text-gray-800 h-full min-h-[297mm]">
                            {/* HEADER */}
                            <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
                                <h1 className="text-3xl font-bold uppercase tracking-widest">{personal.name || 'SEU NOME'}</h1>
                                <p className="text-lg mt-2 text-gray-600 font-medium uppercase tracking-wide">{personal.role || 'Cargo Pretendido'}</p>
                                
                                <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-500">
                                    {personal.phone && <span>{personal.phone}</span>}
                                    {personal.email && <span>{personal.email}</span>}
                                    {personal.location && <span>{personal.location}</span>}
                                    {personal.linkedin && <span>{personal.linkedin}</span>}
                                </div>
                            </div>

                            {/* COLUMNS */}
                            <div className="grid grid-cols-1 gap-8">
                                {/* SUMMARY */}
                                {personal.summary && (
                                    <div>
                                        <h3 className="font-bold uppercase tracking-wider border-b border-gray-300 mb-3 text-sm">Resumo Profissional</h3>
                                        <p className="text-sm leading-relaxed text-justify">{personal.summary}</p>
                                    </div>
                                )}
                                
                                {/* SKILLS ROW FOR CLASSIC */}
                                {(skills.length > 0 || languages.length > 0) && (
                                    <div className="grid grid-cols-2 gap-8">
                                        {skills.length > 0 && (
                                            <div>
                                                <h3 className="font-bold uppercase tracking-wider border-b border-gray-300 mb-3 text-sm">Habilidades</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {skills.map((s, i) => (
                                                        <span key={i} className="text-xs border border-gray-300 px-2 py-1 rounded bg-gray-50">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {languages.length > 0 && (
                                            <div>
                                                <h3 className="font-bold uppercase tracking-wider border-b border-gray-300 mb-3 text-sm">Idiomas</h3>
                                                <ul className="text-sm space-y-1">
                                                    {languages.map((l, i) => (
                                                        <li key={i}>{l.lang} <span className="text-gray-500 italic">- {l.level}</span></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* EXP */}
                                <div>
                                    <h3 className="font-bold uppercase tracking-wider border-b border-gray-300 mb-4 text-sm">Experiência Profissional</h3>
                                    <div className="space-y-6">
                                        {experience.filter(e => e.company).map(exp => (
                                            <div key={exp.id}>
                                                <div className="flex justify-between items-center mb-1 gap-4">
                                                    <h4><strong>{exp.role}</strong></h4>
                                                    <span className="text-sm shrink-0 whitespace-nowrap text-gray-600 min-w-[80px] text-right py-1">{exp.period}</span>
                                                </div>
                                                <div className="text-sm font-semibold text-gray-600 mb-2">{exp.company}</div>
                                                <p className="text-sm text-gray-700 leading-relaxed text-justify">{exp.description}</p>
                                            </div>
                                        ))}
                                        {experience.length === 0 || !experience[0].company && <p className="text-xs text-gray-300 italic">Adicione sua experiência...</p>}
                                    </div>
                                </div>

                                {/* EDU */}
                                <div>
                                    <h3 className="font-bold uppercase tracking-wider border-b border-gray-300 mb-4 text-sm">Formação Acadêmica</h3>
                                    <div className="space-y-4">
                                        {education.filter(e => e.institution).map(edu => (
                                            <div key={edu.id} className="flex justify-between items-baseline">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                                                    <p className="text-sm text-gray-600">{edu.institution}</p>
                                                </div>
                                                <span className="text-sm font-medium text-gray-500">{edu.year}</span>
                                            </div>
                                        ))}
                                        {education.length === 0 || !education[0].institution && <p className="text-xs text-gray-300 italic">Adicione sua formação...</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed no-print">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Como criar um currículo em {currentYear}</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   A maioria dos currículos é descartada em menos de 6 segundos. Para passar dessa triagem, você precisa de clareza, objetividade e formatação adequada para leitura humana e de robôs (ATS).
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">O que são Sistemas ATS?</h3>
               <p>
                   Grandes empresas usam softwares (Applicant Tracking Systems) que leem seu currículo antes de qualquer humano. Se o seu design for confuso, cheio de gráficos ou tabelas complexas, o robô não consegue ler e te descarta. 
                   <strong>Nossos modelos são 100% otimizados para ATS</strong>, com texto limpo e estrutura hierárquica.
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Estrutura Ideal</h3>
               <ul className="list-disc pl-5 space-y-2">
                   <li><strong>Resumo Profissional:</strong> 3 a 4 linhas focadas em quem você é e o que entrega de resultado. Use nosso <Link to="/linkedin" className="text-brand-600 font-bold hover:underline">Gerador de Resumo LinkedIn</Link> para se inspirar.</li>
                   <li><strong>Experiência:</strong> Ordem cronológica inversa (do mais recente para o mais antigo). Foque em conquistas ("Aumentei vendas em 20%") e não apenas em tarefas ("Atendia telefone").</li>
                   <li><strong>Habilidades:</strong> Palavras-chave da sua área (ex: Excel Avançado, Gestão de Projetos).</li>
               </ul>
           </div>
       </section>

      <RelatedTools current="/curriculo" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default CvGenerator;