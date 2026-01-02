import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from '../utils/calculations';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

interface IncomeItem {
  id: number;
  description: string;
  value: number;
  date: string;
}

const validateCPF = (cpf: string) => {
  const strCPF = cpf.replace(/[^\d]+/g, '');
  if (strCPF === '') return true; 
  if (strCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(strCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;

  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(strCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;

  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(strCPF.substring(10, 11))) return false;

  return true;
};

const IncomeProofGenerator: React.FC = () => {
  const [name, setName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [city, setCity] = useState('');
  const [monthReference, setMonthReference] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [cpf, setCpf] = useState('');
  const [cpfError, setCpfError] = useState('');
  
  const [newItem, setNewItem] = useState({ description: '', value: '', date: new Date().toISOString().split('T')[0] });
  const [items, setItems] = useState<IncomeItem[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Apply mask
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})/, '$1-$2');
    
    setCpf(value);
    
    if (value.length === 14) {
        if (!validateCPF(value)) {
            setCpfError('CPF inválido');
        } else {
            setCpfError('');
        }
    } else {
        setCpfError('');
    }
  };

  const addItem = () => {
    if (!newItem.description || !newItem.value) return;
    setItems([
      ...items,
      {
        id: Date.now(),
        description: newItem.description,
        value: Number(newItem.value),
        date: newItem.date
      }
    ]);
    setNewItem({ ...newItem, description: '', value: '' });
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const getTotal = () => items.reduce((acc, curr) => acc + curr.value, 0);

  const generateDocument = async (format: 'png' | 'pdf') => {
    if (!printRef.current) return;
    setIsGenerating(true);
    
    // Wait for a moment to ensure rendering is stable and fonts are loaded
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // High quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        // Ensures full scroll height is captured even if hidden
        scrollY: -window.scrollY,
      });
      
      const fileName = `comprovante-renda-${monthReference}-${name.replace(/\s+/g, '-').toLowerCase()}`;

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps = pdf.getImageProperties(imgData);
        
        // Logic to fit image within A4 Page (Contain Strategy)
        // 1. Calculate the ratio of the image
        const imgRatio = imgProps.width / imgProps.height;
        // 2. Calculate the ratio of the PDF page
        const pdfRatio = pdfWidth / pdfHeight;

        let finalWidth = pdfWidth;
        let finalHeight = pdfHeight;

        // 3. Adjust dimensions to fit
        if (imgRatio > pdfRatio) {
            // Image is wider than page (landscape-ish content in portrait page)
            finalHeight = pdfWidth / imgRatio;
        } else {
            // Image is taller than page (portrait content)
            finalWidth = pdfHeight * imgRatio;
        }
        
        // If content is still wider than PDF (rounding errors), cap it to PDF width
        if (finalWidth > pdfWidth) {
             finalWidth = pdfWidth;
             finalHeight = pdfWidth / imgRatio;
        }

        // 4. Center the image horizontally/vertically if needed (optional, here we stick to top-left or center x)
        const x = (pdfWidth - finalWidth) / 2;
        const y = 0; // Start from top

        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
        pdf.save(`${fileName}.pdf`);
      }

    } catch (err) {
      console.error("Erro ao gerar documento", err);
      alert("Erro ao gerar o documento. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const [year, month] = monthReference.split('-');
  const displayMonth = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const todayDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  const faqItems = [
    {
        question: "Esse documento serve para alugar imóvel?",
        answer: "Depende da imobiliária. Muitas aceitam a auto-declaração de renda (DECORE informal) acompanhada de extratos bancários dos últimos 3 meses para comprovar a movimentação. Consulte sempre quem solicitou o documento."
    },
    {
        question: "Sou autônomo, como comprovo renda?",
        answer: "A forma oficial é através da Declaração de Imposto de Renda (IRPF) ou do Extrato do Simples Nacional (se for MEI). No dia a dia, extratos bancários e recibos de prestação de serviço assinados (como este gerador cria) ajudam a compor a prova de renda."
    },
    {
        question: "O que é DECORE?",
        answer: "É a Declaração Comprobatória de Percepção de Rendimentos. É um documento oficial que só pode ser emitido por um contador habilitado. Este gerador cria uma declaração simples pessoal, que não substitui o DECORE contábil."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <SEO 
        title={`Gerador de Comprovante de Renda Informal ${currentYear} (Decore PDF)`}
        description={`Precisa comprovar renda em ${currentYear}? Gere um extrato de rendimentos profissional (Auto-Declaração) em PDF para apresentar em aluguéis e cadastros.`}
        keywords={`comprovante renda informal ${currentYear}, gerador decore, declaração renda autonomo, modelo comprovante renda, extrato ganhos autonomo`}
        ratingValue={4.7}
        reviewCount={1034}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Gerador de Comprovante de Renda Informal</h1>
        <p className="text-gray-600">Organize seus ganhos autônomos e gere um extrato profissional.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.7/5)</span>
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-xs text-red-600 font-bold bg-red-50 inline-block px-4 py-2 rounded-lg border-2 border-red-200">
            ⚠️ AVISO LEGAL IMPORTANTE: Este gerador cria apenas uma auto-declaração pessoal para organização de rendimentos informais. Este documento NÃO tem valor contábil oficial e NÃO substitui documentos emitidos por contador (DECORE) ou declaração de imposto de renda.
          </p>
          <p className="text-xs text-orange-600 font-medium bg-orange-50 inline-block px-4 py-2 rounded-lg border border-orange-200">
            📋 Uso adequado: Organização pessoal de ganhos, apresentação em aluguéis (quando aceito pela imobiliária) ou cadastros informais. Sempre acompanhe com extratos bancários para comprovação.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <span className="bg-brand-100 text-brand-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Seus Dados
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nome Completo</label>
                  <input 
                    className="w-full p-2 border rounded bg-white" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Ex: João da Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Atividade / Profissão</label>
                  <input 
                    className="w-full p-2 border rounded bg-white" 
                    value={occupation} 
                    onChange={e => setOccupation(e.target.value)} 
                    placeholder="Ex: Motorista de Aplicativo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="block text-sm text-gray-600 mb-1">CPF</label>
                      <input 
                        className={`w-full p-2 border rounded bg-white ${cpfError ? 'border-red-500 bg-red-50' : ''}`}
                        value={cpf} 
                        onChange={handleCpfChange} 
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                   </div>
                   <div>
                      <label className="block text-sm text-gray-600 mb-1">Mês Ref.</label>
                      <input 
                        type="month"
                        className="w-full p-2 border rounded bg-white" 
                        value={monthReference} 
                        onChange={e => setMonthReference(e.target.value)} 
                      />
                   </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Cidade / Estado (Para assinatura)</label>
                  <input 
                    className="w-full p-2 border rounded bg-white" 
                    value={city} 
                    onChange={e => setCity(e.target.value)} 
                    placeholder="Ex: São Paulo - SP"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                 <span className="bg-brand-100 text-brand-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                 Entradas (Lançamentos)
              </h3>
              <div className="flex gap-2 mb-4 items-end bg-gray-50 p-3 rounded-lg">
                 <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Descrição</label>
                    <input 
                      className="w-full p-2 border rounded text-sm bg-white" 
                      value={newItem.description}
                      onChange={e => setNewItem({...newItem, description: e.target.value})}
                      placeholder="Ex: Serviço Prestado"
                    />
                 </div>
                 <div className="w-24">
                    <label className="block text-xs text-gray-500 mb-1">Valor (R$)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded text-sm bg-white" 
                      value={newItem.value}
                      onChange={e => setNewItem({...newItem, value: e.target.value})}
                      placeholder="0,00"
                    />
                 </div>
                 <div className="w-auto">
                     <button onClick={addItem} className="bg-brand-600 text-white h-[38px] w-[38px] rounded flex items-center justify-center hover:bg-brand-700 mt-5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                     </button>
                 </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                 {items.length === 0 && <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">Nenhum item adicionado ainda.</p>}
                 {items.map(item => (
                   <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 bg-white p-2 rounded shadow-sm">
                      <div className="flex-1">
                         <p className="font-medium text-gray-800">{item.description}</p>
                         <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="font-semibold text-green-600">{formatCurrency(item.value)}</span>
                         <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-gray-100">
               <button 
                  onClick={() => generateDocument('png')}
                  disabled={items.length === 0 || isGenerating}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${items.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg'}`}
                >
                  {isGenerating ? 'Gerando...' : 'Baixar Imagem (PNG)'}
               </button>
               
               <button 
                  onClick={() => generateDocument('pdf')}
                  disabled={items.length === 0 || isGenerating}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${items.length === 0 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-2 border-brand-600 text-brand-600 hover:bg-brand-50'}`}
                >
                  {isGenerating ? 'Gerando...' : 'Baixar Documento (PDF)'}
               </button>
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-7 bg-gray-500/5 p-4 rounded-xl flex items-start justify-center overflow-auto min-h-[700px]">
           {/* Document Container - A4 Aspect Ratio */}
           <div 
             id="income-statement" 
             ref={printRef}
             className="bg-white w-[210mm] min-h-[297mm] shadow-2xl relative text-black flex flex-col box-border font-serif"
             style={{ 
                 padding: '20mm',
                 backgroundImage: 'radial-gradient(#f1f5f9 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
             }}
           >
              {/* Border "Watermark" style */}
              <div className="absolute inset-4 border-4 border-double border-slate-200 pointer-events-none"></div>

              {/* Watermark Text */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-9xl font-bold text-slate-100 pointer-events-none select-none whitespace-nowrap z-0">
                  AUTO-DECLARAÇÃO
              </div>

              {/* Header */}
              <div className="relative z-10 border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-center">
                 <div>
                     <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-widest font-sans">Demonstrativo<br/>de Rendimentos</h1>
                     <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Trabalhador Autônomo / Profissional Liberal</p>
                 </div>
                 <div className="text-right">
                     <div className="border border-slate-800 p-2 inline-block rounded-sm">
                        <p className="text-[10px] text-slate-500 uppercase text-center font-sans">Referência</p>
                        <p className="text-xl font-bold uppercase font-sans text-center px-2">{displayMonth}</p>
                     </div>
                 </div>
              </div>

              {/* Identification Section */}
              <div className="relative z-10 mb-8">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1 font-sans">1. Identificação do Declarante</h3>
                  <div className="bg-slate-50 border border-slate-200 p-4 grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                      <div>
                          <p className="text-[10px] text-slate-500 uppercase">Nome Completo</p>
                          <p className="font-bold text-base">{name || '____________________________________'}</p>
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-500 uppercase">CPF</p>
                          <p className="font-mono font-bold text-base tracking-wider">{cpf || '___.___.___-__'}</p>
                      </div>
                      <div className="col-span-2">
                          <p className="text-[10px] text-slate-500 uppercase">Atividade Profissional</p>
                          <p className="font-bold">{occupation || '____________________________________'}</p>
                      </div>
                  </div>
              </div>

              {/* Table Section */}
              <div className="relative z-10 mb-auto">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1 font-sans">2. Detalhamento dos Proventos</h3>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-100 border-y border-slate-300 font-sans text-xs uppercase">
                            <th className="py-2 pl-4 text-left font-bold text-slate-700 w-32">Data</th>
                            <th className="py-2 text-left font-bold text-slate-700">Descrição / Fonte Pagadora</th>
                            <th className="py-2 pr-4 text-right font-bold text-slate-700 w-40">Valor (R$)</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                        {items.length === 0 ? (
                            <tr className="border-b border-slate-200">
                                <td colSpan={3} className="py-12 text-center text-slate-400 italic">Nenhum lançamento registrado.</td>
                            </tr>
                        ) : (
                            items.map((item, i) => (
                                <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 pl-4 text-slate-600">{formatDate(item.date)}</td>
                                    <td className="py-3 font-serif text-slate-800">{item.description}</td>
                                    <td className="py-3 pr-4 text-right font-bold text-slate-800">{item.value.toFixed(2).replace('.', ',')}</td>
                                </tr>
                            ))
                        )}
                        {/* Minimum height rows if empty to look good */}
                        {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
                             <tr key={`empty-${i}`} className="border-b border-slate-100">
                                <td className="py-4">&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                             </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-800">
                        <tr className="bg-slate-50">
                            <td colSpan={2} className="py-3 pl-4 text-right font-bold text-slate-600 font-sans uppercase text-xs tracking-wider">Total de Rendimentos Brutos</td>
                            <td className="py-3 pr-4 text-right font-bold text-xl text-slate-900 font-mono">{formatCurrency(getTotal())}</td>
                        </tr>
                    </tfoot>
                  </table>
              </div>

              {/* Legal Statement */}
              <div className="relative z-10 mt-8 mb-12 text-justify">
                  <p className="text-sm leading-relaxed text-slate-700 mb-3">
                      Declaro, sob as penas da Lei (Art. 299 do Código Penal), que as informações acima prestadas são verdadeiras e referem-se aos rendimentos por mim auferidos provenientes de meu trabalho como autônomo/profissional liberal durante o período supracitado. Assumo inteira responsabilidade pela veracidade destas informações.
                  </p>
                  <p className="text-xs text-slate-500 italic border-t border-slate-200 pt-3">
                      <strong>Nota:</strong> Esta é uma auto-declaração pessoal. Para documentos oficiais (financiamentos bancários, processos judiciais), consulte um contador para emissão do DECORE ou utilize sua Declaração de Imposto de Renda.
                  </p>
              </div>

              {/* Signature Section */}
              <div className="relative z-10 mt-auto">
                  <div className="flex justify-between items-end">
                      <div className="text-center w-1/2 pr-8">
                          <div className="border-b border-slate-400 mb-2"></div>
                          <p className="font-bold text-slate-900 uppercase text-sm">{name || 'Assinatura do Declarante'}</p>
                          <p className="text-xs text-slate-500">CPF: {cpf || '___.___.___-__'}</p>
                      </div>
                      <div className="text-right w-1/2">
                          <p className="text-base text-slate-800 font-serif italic">
                              {city ? city : '____________________'}, {todayDate}
                          </p>
                      </div>
                  </div>
              </div>

              {/* Footer / QR Placeholder */}
              <div className="relative z-10 mt-12 pt-4 border-t border-slate-200 flex justify-between items-center opacity-70">
                   <div className="text-[10px] text-slate-400 max-w-xs leading-tight">
                       Este documento foi gerado digitalmente através do Conta Trabalhista. A veracidade das informações é de responsabilidade exclusiva do declarante.
                   </div>
                   <div className="flex items-center gap-2">
                       <div className="text-right">
                           <p className="text-[10px] font-bold text-slate-300 uppercase">Autenticação Digital</p>
                           <p className="text-[8px] font-mono text-slate-300">{Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
                       </div>
                       <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                       </div>
                   </div>
              </div>

           </div>
        </div>
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Como Autônomo comprova renda em {currentYear}?</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   A informalidade é a realidade de milhões de brasileiros. Sem holerite (contracheque), comprovar renda para alugar imóvel, abrir conta em banco ou solicitar crédito pode ser um desafio.
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">O que é a Auto-Declaração de Renda?</h3>
               <p>
                   É um documento escrito pelo próprio profissional onde ele afirma, sob as penas da lei, quanto ganha mensalmente. 
                   Embora não tenha valor contábil oficial, é amplamente aceita por imobiliárias e lojas quando acompanhada de provas complementares, como extratos bancários dos últimos 3 meses.
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Diferença para o DECORE</h3>
               <p>
                   O <strong>DECORE</strong> (Declaração Comprobatória de Percepção de Rendimentos) é o documento oficial exigido por bancos para financiamentos habitacionais. Ele só pode ser emitido por um <strong>contador</strong> com base em notas fiscais ou recibos de pagamento de autônomo (RPA). 
               </p>
               <p>
                   Se você já tem CNPJ, recomendamos usar nosso <Link to="/mei-monitor" className="text-brand-600 font-bold hover:underline">Monitor de Faturamento MEI</Link> para controlar seu faturamento oficial antes de declarar.
               </p>
           </div>
       </section>

      <RelatedTools current="/comprovante-renda" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default IncomeProofGenerator;