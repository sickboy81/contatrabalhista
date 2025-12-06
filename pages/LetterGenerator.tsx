import React, { useState, useRef } from 'react';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type TemplateType = 'standard' | 'grateful' | 'newOffer' | 'short';

const LetterGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    city: '',
    lastDay: '', // Only for notice
    noticeType: 'worked', // 'worked' | 'immediate'
  });

  const [template, setTemplate] = useState<TemplateType>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const todayDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  // --- TEMPLATE LOGIC ---
  const getBodyText = () => {
    const { role, company, noticeType, lastDay } = formData;
    const formattedLastDay = lastDay ? new Date(lastDay).toLocaleDateString('pt-BR') : '[DATA FINAL]';
    
    const companyName = company || '[NOME DA EMPRESA]';
    const roleName = role || '[SEU CARGO]';

    const noticeText = noticeType === 'immediate' 
        ? "Solicito a dispensa do cumprimento do aviso prévio, para desligamento imediato." 
        : `Irei cumprir o aviso prévio conforme previsto em lei, sendo meu último dia de trabalho em ${formattedLastDay}.`;

    switch (template) {
        case 'grateful':
            return `Venho por meio desta comunicar formalmente meu pedido de demissão do cargo de ${roleName} que ocupo na ${companyName}.\n\nGostaria de expressar minha sincera gratidão pelas oportunidades de crescimento e desenvolvimento profissional que tive durante meu período na empresa. Foi um prazer fazer parte desta equipe.\n\n${noticeText}\n\nEstarei à disposição para auxiliar na transição de minhas tarefas da melhor forma possível.`;
        
        case 'newOffer':
            return `Venho comunicar meu pedido de demissão do cargo de ${roleName} na ${companyName}.\n\nRecebi uma nova proposta de trabalho que vai ao encontro dos meus objetivos de carreira atuais. Agradeço imensamente a oportunidade que me foi dada aqui.\n\n${noticeText}\n\nComprometo-me a entregar minhas pendências e facilitar a passagem de bastão.`;

        case 'short':
            return `Por motivos de ordem pessoal, venho apresentar meu pedido de demissão do cargo de ${roleName}.\n\n${noticeText}`;

        case 'standard':
        default:
            return `Venho por meio desta carta formalizar meu pedido de demissão do cargo de ${roleName} na empresa ${companyName}.\n\n${noticeText}\n\nAgradeço a oportunidade e o aprendizado durante o período em que permaneci na empresa.`;
    }
  };

  const fullText = `À ${formData.company || '[EMPRESA]'}\nAtt. Departamento Pessoal / Gestão\n\nPrezados,\n\n${getBodyText()}\n\nAtenciosamente,\n\n\n__________________________\n${formData.name || '[SEU NOME]'}\n\n${formData.city || '[CIDADE]'}, ${todayDate}`;

  // --- ACTIONS ---

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    alert("Texto copiado para a área de transferência!");
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([fullText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "carta_demissao.txt";
    document.body.appendChild(element);
    element.click();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`carta-demissao-${formData.name || 'modelo'}.pdf`);
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const faqItems = [
    {
        question: "Preciso escrever o motivo da demissão na carta?",
        answer: "Não. A legislação não exige justificativa. Um texto formal e breve como 'motivos pessoais' ou 'novos desafios profissionais' é suficiente e elegante."
    },
    {
        question: "A carta deve ser escrita à mão ou digitada?",
        answer: "Tradicionalmente, muitas empresas exigiam a carta de próprio punho (à mão) para evitar fraudes (coação). Porém, hoje a maioria aceita digitada e assinada. Pergunte ao RH da sua empresa. Se for à mão, copie o texto gerado aqui."
    },
    {
        question: "O que acontece se a empresa se recusar a assinar?",
        answer: "A empresa não pode recusar o pedido de demissão. Se o RH se recusar a receber, você pode enviar via Correios com AR (Aviso de Recebimento) ou Telegrama com cópia, o que serve como prova legal da data de comunicação."
    },
    {
        question: "Se eu arrumar outro emprego, preciso cumprir aviso?",
        answer: "Depende. A Súmula 276 do TST diz que a dispensa do aviso só é obrigatória se a DEMISSÃO partir da empresa e o trabalhador arrumar outro emprego. Se VOCÊ pediu demissão, a empresa não é obrigada a liberar, mesmo com carta de novo emprego (embora muitas liberem por bom senso)."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <SEO 
        title="Gerador de Carta de Demissão Formal (PDF Grátis)"
        description="Crie sua carta de pedido de demissão em segundos. Modelos prontos para cumprimento de aviso prévio ou dispensa imediata. Copie ou baixe em PDF."
        keywords="modelo carta demissão, gerador pedido demissão, carta demissão imediata, carta demissão aviso previo, como fazer carta demissão"
        ratingValue={4.8}
        reviewCount={1540}
      />

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-brand-900">Gerador de Carta de Demissão</h1>
        <p className="text-gray-600">Escolha o modelo ideal, preencha e baixe pronto para assinar.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.8/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: FORM & CONTROLS */}
        <div className="lg:col-span-5 space-y-6">
           
           {/* Template Selection */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">1. Escolha o Modelo</h3>
               <div className="grid grid-cols-2 gap-3">
                   {[
                       { id: 'standard', label: 'Padrão (Formal)', icon: '👔' },
                       { id: 'grateful', label: 'Gratidão', icon: '🙏' },
                       { id: 'newOffer', label: 'Nova Proposta', icon: '🚀' },
                       { id: 'short', label: 'Simples/Curto', icon: '📝' },
                   ].map((t) => (
                       <button 
                        key={t.id}
                        onClick={() => setTemplate(t.id as TemplateType)}
                        className={`p-3 rounded-lg border text-left text-sm transition-all ${template === t.id ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                       >
                           <span className="mr-2">{t.icon}</span>
                           <span className={`font-medium ${template === t.id ? 'text-brand-700' : 'text-gray-700'}`}>{t.label}</span>
                       </button>
                   ))}
               </div>
           </div>

           {/* Inputs */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
               <h3 className="font-bold text-gray-800 border-b pb-2">2. Preencha os Dados</h3>
               
               <input 
                 placeholder="Seu Nome Completo" 
                 className="w-full p-2.5 border rounded-lg bg-gray-50 focus:bg-white transition-colors" 
                 value={formData.name} 
                 onChange={e => setFormData({...formData, name: e.target.value})} 
               />
               <input 
                 placeholder="Seu Cargo" 
                 className="w-full p-2.5 border rounded-lg bg-gray-50 focus:bg-white transition-colors" 
                 value={formData.role} 
                 onChange={e => setFormData({...formData, role: e.target.value})} 
               />
               <input 
                 placeholder="Nome da Empresa" 
                 className="w-full p-2.5 border rounded-lg bg-gray-50 focus:bg-white transition-colors" 
                 value={formData.company} 
                 onChange={e => setFormData({...formData, company: e.target.value})} 
               />
               <input 
                 placeholder="Sua Cidade" 
                 className="w-full p-2.5 border rounded-lg bg-gray-50 focus:bg-white transition-colors" 
                 value={formData.city} 
                 onChange={e => setFormData({...formData, city: e.target.value})} 
               />

               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                   <label className="block text-sm font-bold text-blue-900 mb-2">Sobre o Aviso Prévio</label>
                   <div className="space-y-2">
                       <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                             type="radio" 
                             name="notice" 
                             checked={formData.noticeType === 'immediate'} 
                             onChange={() => setFormData({...formData, noticeType: 'immediate'})}
                             className="text-brand-600 focus:ring-brand-500"
                           />
                           <span className="text-sm text-blue-800">Quero sair imediatamente (Pedir dispensa)</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                             type="radio" 
                             name="notice" 
                             checked={formData.noticeType === 'worked'} 
                             onChange={() => setFormData({...formData, noticeType: 'worked'})}
                             className="text-brand-600 focus:ring-brand-500"
                           />
                           <span className="text-sm text-blue-800">Vou cumprir o aviso (Trabalhar)</span>
                       </label>
                   </div>

                   {formData.noticeType === 'worked' && (
                       <div className="mt-3 animate-fade-in">
                           <label className="block text-xs font-bold text-blue-700 mb-1">Qual será o último dia?</label>
                           <input 
                             type="date" 
                             className="w-full p-2 border rounded bg-white text-sm" 
                             value={formData.lastDay} 
                             onChange={e => setFormData({...formData, lastDay: e.target.value})} 
                           />
                       </div>
                   )}
               </div>
           </div>

           {/* Action Buttons */}
           <div className="flex flex-col gap-3">
               <button 
                 onClick={handleDownloadPDF}
                 disabled={isGenerating}
                 className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
               >
                 {isGenerating ? 'Gerando...' : (
                     <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Baixar PDF para Assinar
                     </>
                 )}
               </button>
               <div className="grid grid-cols-2 gap-3">
                   <button onClick={handleCopy} className="bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors">
                       Copiar Texto
                   </button>
                   <button onClick={handleDownloadTxt} className="bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors">
                       Baixar .TXT
                   </button>
               </div>
           </div>
        </div>

        {/* RIGHT: PREVIEW (PAPER STYLE) */}
        <div className="lg:col-span-7 bg-gray-200/50 p-4 md:p-8 rounded-xl flex items-start justify-center overflow-auto min-h-[600px] border border-gray-200">
            <div 
                ref={printRef}
                className="bg-white shadow-2xl p-12 md:p-16 w-full max-w-[210mm] min-h-[297mm] text-black font-serif relative"
            >
                {/* Header Placeholders */}
                <div className="text-right mb-12 text-sm">
                    <p>{formData.city || '[Sua Cidade]'}, {todayDate}</p>
                </div>

                <div className="mb-8 text-sm font-bold">
                    <p>À {formData.company || '[NOME DA EMPRESA]'}</p>
                    <p>Att. Departamento Pessoal / Gestão</p>
                </div>

                <div className="mb-8 text-sm">
                    <p>Prezados,</p>
                </div>

                {/* Body Content */}
                <div className="text-justify leading-relaxed text-base mb-16 whitespace-pre-wrap">
                    {getBodyText()}
                </div>

                {/* Signature Area */}
                <div className="mt-auto pt-16 text-center">
                    <p className="text-sm mb-12">Atenciosamente,</p>
                    <div className="w-64 border-b border-black mx-auto mb-2"></div>
                    <p className="font-bold uppercase">{formData.name || '[SEU NOME]'}</p>
                    {formData.role && <p className="text-xs text-gray-600 mt-1">{formData.role}</p>}
                </div>

                {/* Watermark for web preview only (optional) */}
                <div className="absolute bottom-4 right-4 text-[10px] text-gray-300 pointer-events-none no-print">
                    Gerado via Portal do Bolso
                </div>
            </div>
        </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 space-y-12">
           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-slate-900">Como fazer uma carta de demissão?</h2>
                 <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Atualizado: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                 </span>
               </div>
               
               <div className="space-y-4">
                   <p>
                       O pedido de demissão é um documento formal que encerra seu vínculo empregatício. Ele deve ser simples, direto e, preferencialmente, impresso em duas vias (uma fica com a empresa, a outra volta assinada para você como recibo).
                   </p>
                   
                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Aviso Prévio na Carta</h3>
                   <p>
                       A informação mais importante da carta é sobre o aviso prévio. Você deve deixar claro se pretende cumprir os 30 dias trabalhando ou se deseja o desligamento imediato (solicitando a dispensa do aviso).
                   </p>
                   <ul className="list-disc pl-5 space-y-2">
                       <li><strong>Cumprir Aviso:</strong> Você trabalha mais um mês e recebe por ele. A empresa não pode descontar nada.</li>
                       <li><strong>Não Cumprir (Dispensa):</strong> A empresa <em>pode</em> descontar o valor de um salário da sua rescisão, a menos que concorde em te dispensar da multa. (Simule o valor na <Link to="/" className="text-brand-600 font-bold hover:underline">Calculadora de Rescisão</Link>).</li>
                   </ul>

                   <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Preciso explicar o motivo?</h3>
                   <p>
                       Não. Você não é obrigado a detalhar por que está saindo (salário baixo, chefe ruim, nova proposta). Escrever apenas "motivos de ordem pessoal" ou "novos desafios profissionais" é o padrão do mercado e evita desgastes desnecessários.
                   </p>
               </div>
           </article>

           <article className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
               <h2 className="text-2xl font-bold text-slate-900 mb-6">3 Erros Comuns na Carta de Demissão</h2>
               <div className="space-y-4">
                   <p>
                       A carta de demissão é um documento jurídico. Escrever demais ou de menos pode gerar problemas futuros.
                   </p>
                   
                   <h3 className="text-lg font-bold text-brand-700 mt-4 mb-2">1. Desabafar ou Criticar</h3>
                   <p>
                       A carta fica arquivada. Nunca use esse documento para criticar chefes, colegas ou a cultura da empresa. Se quiser dar feedback, peça uma "Entrevista de Desligamento" verbal. Na carta, mantenha a frieza profissional.
                   </p>

                   <h3 className="text-lg font-bold text-brand-700 mt-4 mb-2">2. Esquecer de Datar</h3>
                   <p>
                       A data é fundamental pois marca o início da contagem do Aviso Prévio e o prazo de 10 dias para pagamento da rescisão. Sem data, a empresa pode alegar que você entregou depois.
                   </p>

                   <h3 className="text-lg font-bold text-brand-700 mt-4 mb-2">3. Não deixar claro o Aviso Prévio</h3>
                   <p>
                       Frases vagas como "gostaria de sair o quanto antes" não servem. Seja explícito: "Solicito a dispensa do cumprimento do aviso" ou "Cumprirei o aviso até o dia X".
                   </p>
               </div>
           </article>
       </section>

      <RelatedTools current="/carta-demissao" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default LetterGenerator;