import React, { useState, useRef, useEffect } from 'react';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface KnowledgeBaseItem {
  keywords: string[];
  answer: string;
  title?: string; // Title for SEO display
}

// --- BANCO DE DADOS LOCAL (CÉREBRO DO ROBÔ) ---
const KNOWLEDGE_BASE: KnowledgeBaseItem[] = [
  // RESCISÃO
  {
    title: "Demissão por Justa Causa",
    keywords: ['justa causa', 'motivo grave', 'roubo', 'agressão'],
    answer: "A demissão por **Justa Causa** ocorre quando o empregado comete uma falta grave prevista no Art. 482 da CLT (como roubo, agressão, abandono de emprego). Nesse caso, você perde quase todos os direitos: recebe apenas o saldo de salário e férias vencidas (se houver). Perde 13º proporcional, férias proporcionais, saque do FGTS e multa de 40%."
  },
  {
    title: "Pedido de Demissão",
    keywords: ['pedido de demissão', 'pedir demissão', 'pedir as contas', 'sair da empresa'],
    answer: "Ao **pedir demissão**, você tem direito a: Saldo de salário, 13º proporcional e Férias (vencidas e proporcionais). \n\n⚠️ **Atenção:** Você NÃO saca o FGTS, NÃO recebe a multa de 40% e NÃO tem direito ao Seguro Desemprego. Se não cumprir o aviso prévio, a empresa pode descontar o valor dele da sua rescisão."
  },
  {
    title: "Demissão por Comum Acordo",
    keywords: ['acordo', 'comum acordo', 'distrato'],
    answer: "A demissão por **Comum Acordo** (Reforma Trabalhista) funciona assim: \n\n1. Você saca 80% do FGTS. \n2. A multa do FGTS é de 20% (metade). \n3. O aviso prévio indenizado é pago pela metade. \n4. As demais verbas são pagas integralmente. \n\n🚫 **Importante:** Nessa modalidade, você NÃO tem direito ao Seguro Desemprego."
  },
  {
    title: "Prazo para Pagamento da Rescisão",
    keywords: ['prazo', 'pagamento', 'quando recebo', 'dias para pagar'],
    answer: "A empresa tem até **10 dias corridos** após o término do contrato para pagar as verbas rescisórias. Esse prazo vale tanto para aviso prévio trabalhado quanto indenizado. Se atrasar, você tem direito a uma multa no valor de um salário seu."
  },
  
  // AVISO PRÉVIO
  {
    title: "Tipos de Aviso Prévio",
    keywords: ['aviso prévio', 'aviso previo', 'trabalhar aviso'],
    answer: "O Aviso Prévio é a comunicação da saída com 30 dias de antecedência. \n\n🔹 **Trabalhado:** Você continua indo à empresa (pode sair 2h mais cedo ou folgar 7 dias). \n🔹 **Indenizado:** A empresa te dispensa na hora e paga o mês sem você trabalhar. \n🔹 **Proporcional:** A cada ano de casa, você ganha 3 dias a mais de aviso (Lei 12.506), até o limite de 90 dias."
  },

  // FÉRIAS
  {
    title: "Direito a Férias",
    keywords: ['férias', 'ferias', 'descanso'],
    answer: "Todo funcionário tem direito a 30 dias de férias após 12 meses de trabalho (período aquisitivo). \n\n💰 **Pagamento:** Salário + 1/3. Deve ser pago até 2 dias antes do início. \n🗓️ **Divisão:** Pode dividir em até 3 períodos (um deles deve ter pelo menos 14 dias). \n💵 **Venda:** Você pode vender até 10 dias (abono pecuniário) se quiser."
  },
  {
    title: "Venda de Férias (Abono)",
    keywords: ['vender férias', 'abono pecuniário', 'vender 10 dias'],
    answer: "Você pode converter 1/3 das suas férias (10 dias) em dinheiro. Isso se chama **Abono Pecuniário**. \n\n✅ É um direito seu (a empresa não pode negar se pedido no prazo). \n✅ Não incide imposto de renda nem INSS sobre esse valor."
  },

  // SEGURO DESEMPREGO
  {
    title: "Regras do Seguro Desemprego",
    keywords: ['seguro desemprego', 'seguro', 'parcelas'],
    answer: "Tem direito quem foi demitido **sem justa causa** e trabalhou tempo suficiente. \n\n📅 **1ª solicitação:** Precisa ter trabalhado 12 meses. \n📅 **2ª solicitação:** 9 meses. \n📅 **3ª em diante:** 6 meses. \n\nO valor depende da média dos últimos 3 salários, com teto de R$ 2.313,78 (2024)."
  },

  // FGTS
  {
    title: "FGTS e Saque-Aniversário",
    keywords: ['fgts', 'fundo de garantia'],
    answer: "O FGTS é um depósito mensal de 8% do seu salário feito pela empresa (não é descontado de você). \n\n🔓 **Quando sacar:** Demissão sem justa causa, aposentadoria, compra da casa própria ou doença grave. \n🎂 **Saque-Aniversário:** Permite sacar uma parte todo ano, mas bloqueia o saque do saldo total na demissão (mantém apenas a multa de 40%)."
  },
  
  // GERAL / EXTRA
  {
    title: "Horas Extras",
    keywords: ['hora extra', 'horas extras'],
    answer: "Hora extra deve ser paga com adicional de no mínimo **50%** (dias úteis) ou **100%** (domingos e feriados). Além disso, a hora extra reflete no DSR (pagamento do descanso semanal)."
  },
  {
    title: "Adicional Noturno",
    keywords: ['adicional noturno', 'trabalho a noite'],
    answer: "Quem trabalha entre **22h e 05h** (trabalhador urbano) tem direito ao Adicional Noturno de **20%** sobre a hora normal. Além disso, a hora noturna é reduzida (52 minutos e 30 segundos contam como 1 hora)."
  },
  {
    title: "Estabilidade da Gestante",
    keywords: ['gravidez', 'grávida', 'gestante'],
    answer: "A gestante tem **estabilidade provisória** desde a confirmação da gravidez até 5 meses após o parto. Ela NÃO pode ser demitida sem justa causa nesse período."
  }
];

const DEFAULT_ANSWER = "Desculpe, ainda estou aprendendo e não encontrei uma resposta exata para isso no meu banco de dados da CLT. \n\nTente perguntar sobre: **Rescisão, Férias, Seguro Desemprego, Aviso Prévio ou Justa Causa**.";

const LegalAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Olá! Sou o Assistente Virtual do Portal do Bolso. 🤖\n\nFunciono 100% offline e conheço as principais regras da CLT.\n\nQual é a sua dúvida hoje?'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const findBestMatch = (text: string): string => {
    const cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
    
    // 1. Direct Match
    const match = KNOWLEDGE_BASE.find(item => 
      item.keywords.some(keyword => cleanText.includes(keyword))
    );

    if (match) return match.answer;

    // 2. Simple Heuristics / Greetings
    if (cleanText.includes('ola') || cleanText.includes('oi') || cleanText.includes('bom dia')) {
        return "Olá! Como posso ajudar com seus direitos trabalhistas hoje?";
    }
    if (cleanText.includes('obrigado') || cleanText.includes('valeu')) {
        return "De nada! Se tiver mais dúvidas, é só chamar.";
    }

    return DEFAULT_ANSWER;
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // 1. Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 2. Simulate AI Delay (0.5s - 1.5s)
    const delay = Math.random() * 1000 + 500;
    
    setTimeout(() => {
        const responseText = findBestMatch(textToSend);
        
        const aiMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: responseText 
        };
        
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
    }, delay);
  };

  const suggestions = [
    "Quais os meus direitos se eu pedir demissão?",
    "Como funciona a justa causa?",
    "Quanto tempo para pagar a rescisão?",
    "Posso vender minhas férias?",
    "Quem tem direito ao seguro desemprego?"
  ];

  const faqItems = [
    {
        question: "Esse assistente substitui um advogado?",
        answer: "Não. Esta é uma ferramenta automatizada baseada em regras gerais da CLT. Casos específicos, convenções coletivas e processos judiciais exigem a análise de um advogado trabalhista humano."
    },
    {
        question: "Preciso de internet para usar?",
        answer: "Não! Diferente do ChatGPT, este assistente roda inteiramente no seu navegador. Você pode usá-lo até no modo avião."
    },
    {
        question: "Ele aprende com minhas perguntas?",
        answer: "Não. Por questões de privacidade, nada do que você digita é salvo ou enviado para servidores externos. A conversa é temporária e se apaga ao fechar a página."
    }
  ];

  // Convert Knowledge Base to FAQ items for display
  const knowledgeFAQ = KNOWLEDGE_BASE.map(item => ({
      question: item.title || item.keywords[0],
      answer: item.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <SEO 
        title={`Assistente Trabalhista Virtual ${currentYear} - Tire Dúvidas da CLT`}
        description={`Converse com nosso Robô especialista em leis trabalhistas. Tire dúvidas sobre demissão, férias e direitos na hora. Rápido e sem cadastro.`}
        keywords="chat clt, duvidas trabalhistas, assistente virtual rescisao, bot trabalhista, direitos do trabalhador chat"
        ratingValue={4.9}
        reviewCount={2400}
      />

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-brand-900 flex items-center justify-center gap-2">
            <span className="bg-brand-100 text-brand-600 p-2 rounded-lg text-2xl">🤖</span> Assistente CLT
        </h1>
        <p className="text-gray-600">Tire suas dúvidas rápidas. Respostas imediatas.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.9/5)</span>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col h-[600px] mb-12">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50">
              {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`
                          max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm
                          ${msg.role === 'user' 
                              ? 'bg-brand-600 text-white rounded-br-none' 
                              : 'bg-white text-slate-800 border border-gray-100 rounded-bl-none'}
                      `}>
                          {msg.role === 'model' && <div className="text-[10px] font-bold text-brand-500 mb-1 uppercase tracking-wider">Assistente Virtual</div>}
                          <div dangerouslySetInnerHTML={{ 
                              // Simple markdown parser for bold
                              __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                          }} />
                      </div>
                  </div>
              ))}
              
              {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                      <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1 h-12">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                      </div>
                  </div>
              )}
              <div ref={chatEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length < 3 && (
              <div className="bg-slate-50 px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
                  {suggestions.map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSend(s)}
                        className="whitespace-nowrap bg-white border border-brand-200 text-brand-600 text-xs px-3 py-2 rounded-full hover:bg-brand-50 transition-colors shadow-sm"
                      >
                          {s}
                      </button>
                  ))}
              </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-white text-slate-800"
                    placeholder="Digite sua dúvida (ex: justa causa, férias...)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                  >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                  </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                  Este chat é informativo e não substitui consulta jurídica.
              </p>
          </div>
      </div>

      {/* SEO CONTENT SECTION: EXPOSED KNOWLEDGE BASE */}
      <section className="mb-12 bg-slate-50 p-8 rounded-xl border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-slate-900">Base de Conhecimento (Perguntas que o Robô responde)</h2>
           </div>
           
           <div className="grid md:grid-cols-2 gap-6">
               {knowledgeFAQ.map((item, idx) => (
                   <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200">
                       <h3 className="font-bold text-brand-700 mb-2 text-sm">{item.question}</h3>
                       <div className="text-xs text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.answer }} />
                   </div>
               ))}
           </div>
      </section>

      {/* General Info */}
      <section className="mt-8 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Inteligência Artificial no Direito do Trabalho</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   A tecnologia está transformando a forma como acessamos nossos direitos. Ferramentas como o nosso Assistente Virtual utilizam bases de dados da Consolidação das Leis do Trabalho (CLT) para fornecer respostas instantâneas a dúvidas comuns.
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Para que serve o Assistente?</h3>
               <p>
                   Ele é ideal para <strong>triagem inicial</strong>. Você pode descobrir rapidamente o prazo legal para pagamento de rescisão, o valor da multa do FGTS ou as regras básicas de férias sem precisar ler leis complexas.
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Limitações Importantes</h3>
               <p>
                   Embora preciso nas regras gerais, um robô não consegue analisar nuances específicas do seu caso, como cláusulas de convenção coletiva do seu sindicato, danos morais ou assédio. Para situações de conflito ou processo judicial, a consulta com um <strong>advogado trabalhista humano</strong> é indispensável.
               </p>
           </div>
       </section>

      <RelatedTools current="/assistente" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default LegalAssistant;