import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatCurrency, numberToWordsPTBR, formatDate } from '../utils/calculations';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

const ReceiptGenerator: React.FC = () => {
  const [data, setData] = useState({
    providerName: '',
    providerDoc: '', // CPF/CNPJ
    providerPhone: '',
    providerAddress: '',
    clientName: '',
    clientDoc: '',
    amount: 0,
    description: '',
    city: '',
    date: new Date().toISOString().split('T')[0],
    receiptNumber: Math.floor(Math.random() * 10000).toString(),
  });

  const [settings, setSettings] = useState({
    color: '#0ea5e9', // Brand blue default
    logo: '',
    showSignature: true,
    saveMyData: false
  });

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const [amountInWords, setAmountInWords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Load saved provider data on mount
  useEffect(() => {
    const saved = localStorage.getItem('receiptProviderData');
    if (saved) {
      const parsed = JSON.parse(saved);
      setData(prev => ({
        ...prev,
        providerName: parsed.providerName || '',
        providerDoc: parsed.providerDoc || '',
        providerPhone: parsed.providerPhone || '',
        providerAddress: parsed.providerAddress || '',
        city: parsed.city || ''
      }));
      setSettings(prev => ({
        ...prev,
        logo: parsed.logo || '',
        color: parsed.color || '#0ea5e9',
        saveMyData: true
      }));
    }
  }, []);

  // Update Amount in Words
  useEffect(() => {
    setAmountInWords(numberToWordsPTBR(data.amount));
  }, [data.amount]);

  // Save provider data if checked
  useEffect(() => {
    if (settings.saveMyData) {
      const toSave = {
        providerName: data.providerName,
        providerDoc: data.providerDoc,
        providerPhone: data.providerPhone,
        providerAddress: data.providerAddress,
        city: data.city,
        logo: settings.logo,
        color: settings.color
      };
      localStorage.setItem('receiptProviderData', JSON.stringify(toSave));
    }
  }, [data.providerName, data.providerDoc, data.providerPhone, data.providerAddress, data.city, settings.logo, settings.color, settings.saveMyData]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyText = () => {
    const text = `🧾 *RECIBO DE PAGAMENTO*\n\n*Valor:* ${formatCurrency(data.amount)}\n*Referente a:* ${data.description}\n\nRecebi de ${data.clientName}.\n\nEmitido por: ${data.providerName}\nData: ${formatDate(data.date)}`;
    navigator.clipboard.writeText(text);
    alert("Texto copiado para área de transferência! Cole no WhatsApp.");
  };

  const generatePDF = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    
    // Wait for render stability
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Calculate dimensions to fit width, maintaining aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.width / imgProps.height;
      const printHeight = pdfWidth / imgRatio;

      const y = 20; // Top margin

      pdf.addImage(imgData, 'PNG', 0, y, pdfWidth, printHeight);
      pdf.save(`recibo-${data.clientName.split(' ')[0]}-${data.date}.pdf`);

    } catch (err) {
      console.error(err);
      alert("Erro ao gerar PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const [year, month, day] = data.date.split('-');
  const formattedDate = `${day}/${month}/${year}`;

  const faqItems = [
    {
        question: "Recibo vale como Nota Fiscal?",
        answer: "Não. O recibo comprova o pagamento, mas não substitui a Nota Fiscal (NF) para fins tributários. Se você é MEI ou empresa, deve emitir a NF conforme a legislação do seu município."
    },
    {
        question: "O MEI é obrigado a emitir Nota Fiscal?",
        answer: "O MEI só é obrigado a emitir nota fiscal quando vende ou presta serviços para <strong>outra empresa (Pessoa Jurídica)</strong>. Se o cliente for Pessoa Física (CPF), a emissão é opcional, e o recibo simples é suficiente para controle."
    },
    {
        question: "O que deve ter num recibo válido?",
        answer: "Para ter validade jurídica, um recibo deve conter: nome e documento (CPF/CNPJ) de quem pagou e de quem recebeu, valor (numérico e por extenso), data, descrição do serviço e assinatura."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12">
       <SEO 
         title={`Gerador de Recibo de Pagamento Online ${currentYear} (Grátis e PDF)`}
         description={`Emita recibos profissionais com sua logo em ${currentYear}. Preencha e baixe em PDF ou imagem. Ideal para autônomos, MEI e prestadores de serviço.`}
         keywords="gerador recibo online, modelo recibo pagamento, recibo pdf gratis, fazer recibo online"
         ratingValue={4.8}
         reviewCount={1205}
       />

       <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Gerador de Recibo Profissional</h1>
        <p className="text-gray-600">Emita recibos personalizados com sua marca para seus clientes.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.8/5)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
         
         {/* Left Column: Controls */}
         <div className="lg:col-span-5 space-y-6">
             
             {/* Card: Branding */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">1</span>
                    Personalização
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-xs text-gray-500 mb-1">Cor do Tema</label>
                         <div className="flex items-center gap-2">
                             <input type="color" className="h-10 w-10 p-1 rounded border cursor-pointer" value={settings.color} onChange={e => setSettings({...settings, color: e.target.value})} />
                             <span className="text-xs text-gray-400">{settings.color}</span>
                         </div>
                     </div>
                     <div>
                         <label className="block text-xs text-gray-500 mb-1">Logotipo (Opcional)</label>
                         <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs w-full text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"/>
                         {settings.logo && <button onClick={() => setSettings({...settings, logo: ''})} className="text-xs text-red-400 mt-1 hover:text-red-600">Remover Logo</button>}
                     </div>
                     <div className="col-span-2 flex items-center gap-2">
                         <input type="checkbox" id="saveData" checked={settings.saveMyData} onChange={e => setSettings({...settings, saveMyData: e.target.checked})} className="rounded text-brand-600 focus:ring-brand-500" />
                         <label htmlFor="saveData" className="text-sm text-gray-600 cursor-pointer">Salvar meus dados para os próximos recibos</label>
                     </div>
                 </div>
             </div>

             {/* Card: Provider Info */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">2</span>
                    Seus Dados (Emitente)
                 </h3>
                 <div className="space-y-3">
                     <input className="w-full p-2 border rounded bg-white text-sm" placeholder="Seu Nome ou Razão Social" value={data.providerName} onChange={e => setData({...data, providerName: e.target.value})} />
                     <div className="grid grid-cols-2 gap-3">
                        <input className="w-full p-2 border rounded bg-white text-sm" placeholder="CPF ou CNPJ" value={data.providerDoc} onChange={e => setData({...data, providerDoc: e.target.value})} />
                        <input className="w-full p-2 border rounded bg-white text-sm" placeholder="Telefone" value={data.providerPhone} onChange={e => setData({...data, providerPhone: e.target.value})} />
                     </div>
                     <input className="w-full p-2 border rounded bg-white text-sm" placeholder="Seu Endereço (Opcional)" value={data.providerAddress} onChange={e => setData({...data, providerAddress: e.target.value})} />
                     <input className="w-full p-2 border rounded bg-white text-sm" placeholder="Sua Cidade / Estado" value={data.city} onChange={e => setData({...data, city: e.target.value})} />
                 </div>
             </div>

             {/* Card: Transaction Info */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">3</span>
                    Dados do Pagamento
                 </h3>
                 <div className="space-y-3">
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Valor (R$)</label>
                            <input type="number" className="w-full p-2 border rounded bg-white font-bold text-brand-700" value={data.amount} onChange={e => setData({...data, amount: Number(e.target.value)})} />
                        </div>
                        <div>
                             <label className="block text-xs text-gray-500 mb-1">Nº Recibo</label>
                             <input className="w-full p-2 border rounded bg-white" value={data.receiptNumber} onChange={e => setData({...data, receiptNumber: e.target.value})} />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <input className="w-full p-2 border rounded bg-white text-sm" placeholder="Nome do Cliente" value={data.clientName} onChange={e => setData({...data, clientName: e.target.value})} />
                        <input className="w-full p-2 border rounded bg-white text-sm" placeholder="CPF/CNPJ Cliente" value={data.clientDoc} onChange={e => setData({...data, clientDoc: e.target.value})} />
                     </div>
                     <textarea className="w-full p-2 border rounded bg-white text-sm h-20" placeholder="Referente a (Descrição do serviço)..." value={data.description} onChange={e => setData({...data, description: e.target.value})} />
                     <div className="flex items-center justify-between">
                         <input type="date" className="p-2 border rounded bg-white text-sm" value={data.date} onChange={e => setData({...data, date: e.target.value})} />
                         <div className="flex items-center gap-2">
                             <input type="checkbox" id="sig" checked={settings.showSignature} onChange={e => setSettings({...settings, showSignature: e.target.checked})} className="rounded text-brand-600" />
                             <label htmlFor="sig" className="text-xs text-gray-600">Incluir Assinatura Digital</label>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Actions */}
             <div className="grid grid-cols-2 gap-3">
                 <button onClick={handleCopyText} className="bg-green-100 text-green-700 font-bold py-3 rounded-xl hover:bg-green-200 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Texto
                 </button>
                 <button onClick={generatePDF} disabled={isGenerating} className="bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
                    {isGenerating ? (
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    )}
                    Baixar PDF
                 </button>
             </div>
         </div>

         {/* Right Column: Preview Area */}
         <div className="lg:col-span-7 bg-gray-500/5 p-4 rounded-xl flex items-start justify-center overflow-auto min-h-[600px]">
             
             {/* The Receipt Canvas (What becomes the PDF) */}
             <div 
                ref={receiptRef}
                className="bg-white w-[210mm] min-h-[148mm] shadow-xl relative text-slate-800 flex flex-col font-sans"
                style={{ 
                    // Half A4 height roughly for receipt
                    padding: '0', 
                }}
             >
                {/* Colored Top Bar */}
                <div style={{ backgroundColor: settings.color }} className="h-4 w-full"></div>

                <div className="p-8 md:p-12 flex-1 flex flex-col">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                            {settings.logo ? (
                                <img src={settings.logo} alt="Logo" className="h-20 w-auto object-contain max-w-[150px]" />
                            ) : (
                                <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                    <span className="text-xs text-center px-1">Sem Logo</span>
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-900">{data.providerName || 'Nome da Empresa'}</h2>
                                <div className="text-xs text-slate-500 space-y-0.5 mt-1">
                                    {data.providerDoc && <p>CPF/CNPJ: {data.providerDoc}</p>}
                                    {data.providerPhone && <p>Tel: {data.providerPhone}</p>}
                                    {data.providerAddress && <p>{data.providerAddress}</p>}
                                    {data.city && <p>{data.city}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                             <h1 className="text-4xl font-black opacity-10 uppercase tracking-widest" style={{ color: settings.color }}>RECIBO</h1>
                             <div className="mt-2 inline-block border-2 px-4 py-2 rounded-lg" style={{ borderColor: settings.color, color: settings.color }}>
                                 <p className="text-xs font-bold uppercase opacity-70">Valor</p>
                                 <p className="text-2xl font-bold">{formatCurrency(data.amount)}</p>
                             </div>
                             <p className="text-xs text-slate-400 mt-2 font-mono">Nº {data.receiptNumber}</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 space-y-6">
                        <div className="text-sm leading-8 text-justify">
                            Recebi(emos) de <strong className="uppercase">{data.clientName || '_________________'}</strong>
                            {data.clientDoc && <span>, inscrito(a) no CPF/CNPJ nº {data.clientDoc}</span>}
                            , a importância supra de <span className="font-bold bg-gray-100 px-2 rounded" style={{ color: settings.color }}>{formatCurrency(data.amount)} ({amountInWords})</span>.
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: settings.color }}>
                            <p className="text-xs font-bold uppercase text-slate-400 mb-1">Referente a</p>
                            <p className="text-slate-800 font-medium italic">{data.description || 'Serviços prestados...'}</p>
                        </div>

                        <p className="text-sm text-slate-600">
                            Pelo que firmo(amos) o presente recibo para dar plena e geral quitação.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
                        <div>
                            <p className="text-sm font-medium text-slate-800">
                                {data.city || 'Local'}, {formattedDate}
                            </p>
                        </div>
                        <div className="text-center min-w-[200px]">
                            {settings.showSignature && (
                                <div className="mb-2 font-script text-3xl transform -rotate-2 text-slate-600" style={{ fontFamily: 'cursive' }}>
                                    {data.providerName.split(' ')[0] || 'Assinatura'}
                                </div>
                            )}
                            <div className="h-px bg-slate-300 w-full mb-1"></div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">{data.providerName || 'Assinatura do Emitente'}</p>
                        </div>
                    </div>
                </div>
             </div>

         </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Recibo vs Nota Fiscal em {currentYear}</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   Muitos profissionais autônomos e prestadores de serviço confundem o papel do Recibo e da Nota Fiscal. Embora ambos comprovem um pagamento, eles têm funções legais distintas.
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Para que serve o Recibo?</h3>
               <p>
                   O recibo é um documento simples que prova que uma dívida foi quitada. Ele serve para o pagador comprovar que pagou e para o recebedor controlar seu caixa. Juridicamente, ele atesta a quitação, mas <strong>não serve para recolhimento de impostos</strong> de empresas.
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Quando a Nota Fiscal é obrigatória?</h3>
               <p>
                   Sempre que há uma relação comercial entre <strong>Pessoas Jurídicas (B2B)</strong>, a emissão da Nota Fiscal é obrigatória.
               </p>
               <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 my-4">
                   <p className="font-bold text-blue-800">Regra do MEI</p>
                   <p className="text-sm text-blue-700 mt-1">
                       O Microempreendedor Individual (MEI) é <strong>dispensado</strong> de emitir nota fiscal para clientes Pessoa Física (CPF), salvo se o cliente exigir. Porém, é <strong>obrigado</strong> a emitir para clientes Pessoa Jurídica (CNPJ). 
                       Para controlar seu limite, use nosso <Link to="/mei-monitor" className="text-brand-600 font-bold hover:underline">Monitor de Faturamento MEI</Link>.
                   </p>
               </div>
           </div>
       </section>

      <RelatedTools current="/gerador-recibo" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default ReceiptGenerator;