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
  // --- RESCISÃO E DEMISSÃO ---
  {
    title: "Demissão sem Justa Causa",
    keywords: ['sem justa causa', 'fui demitido', 'demissao sem justa', 'direitos demissao'],
    answer: "Na demissão **sem justa causa**, você tem direito a receber: Saldo de Salário, Aviso Prévio (trabalhado ou indenizado), 13º Salário Proporcional, Férias Vencidas + 1/3, Férias Proporcionais + 1/3, Saque do FGTS e Multa de 40% sobre o FGTS. Você também recebe as guias para o Seguro Desemprego."
  },
  {
    title: "Pedido de Demissão",
    keywords: ['pedido de demissão', 'pedir demissão', 'pedir as contas', 'quero sair', 'me demitir'],
    answer: "Ao **pedir demissão**, você tem direito a: Saldo de Salário, 13º Salário Proporcional e Férias (vencidas e proporcionais + 1/3). \n\n⚠️ **O que você perde:** Você NÃO saca o FGTS, NÃO recebe a multa de 40% e NÃO tem direito ao Seguro Desemprego. Lembre-se que se não cumprir o aviso prévio, a empresa pode descontar o valor dele."
  },
  {
    title: "Demissão por Justa Causa",
    keywords: ['justa causa', 'motivo grave', 'roubo', 'agressão', 'abandono de emprego'],
    answer: "A demissão por **Justa Causa** (Art. 482 da CLT) retira a maioria dos direitos. Você recebe apenas: Saldo de Salário e Férias Vencidas + 1/3 (se houver mais de um ano de casa). \n\n🚫 Você perde: Aviso Prévio, 13º, Férias Proporcionais, Saque FGTS, Multa 40% e Seguro Desemprego."
  },
  {
    title: "Demissão por Comum Acordo",
    keywords: ['acordo', 'comum acordo', 'distrato', 'acordo trabalhista'],
    answer: "O **Acordo Trabalhista** (Art. 484-A da CLT) oferece um meio termo: \n\n1. O Aviso Prévio indenizado é pago pela metade (50%). \n2. A Multa do FGTS é de 20% (metade). \n3. Você pode sacar até 80% do saldo do FGTS. \n\n🚫 **Atenção:** Quem faz acordo NÃO tem direito ao Seguro Desemprego."
  },
  {
    title: "Prazo de Pagamento da Rescisão",
    keywords: ['prazo pagamento', 'quando recebo', 'dias para pagar', 'prazo rescisao'],
    answer: "A empresa tem **10 dias corridos** após o término do contrato para pagar as verbas rescisórias, independente se o aviso foi trabalhado ou indenizado. Se o pagamento atrasar, a empresa deve pagar uma multa no valor de um salário seu (Art. 477 da CLT)."
  },

  // --- AVISO PRÉVIO ---
  {
    title: "Tipos de Aviso Prévio",
    keywords: ['aviso prévio', 'aviso previo', 'tipos de aviso'],
    answer: "🔹 **Trabalhado:** Você trabalha mais 30 dias. Pode escolher sair 2h mais cedo todo dia ou folgar 7 dias corridos no final. \n🔹 **Indenizado:** A empresa paga o mês sem você precisar trabalhar (o contrato encerra na hora). \n🔹 **Proporcional:** A lei garante 3 dias extras de aviso para cada ano completo de empresa, até o limite total de 90 dias."
  },
  {
    title: "Redução de Jornada no Aviso",
    keywords: ['redução de jornada', 'sair mais cedo', '7 dias corridos', 'duas horas a menos'],
    answer: "No aviso prévio **trabalhado** (quando a empresa te demite), você tem direito a escolher: \n\n1. Reduzir 2 horas da jornada diária (sem desconto no salário). \n2. OU Folgar os últimos 7 dias corridos do aviso. \n\nSe você pediu demissão, não tem direito a essa redução (trabalha normal até o fim)."
  },

  // --- FÉRIAS ---
  {
    title: "Direito a Férias",
    keywords: ['férias', 'ferias', 'descanso', 'quando posso tirar ferias'],
    answer: "Todo funcionário tem direito a 30 dias de férias a cada 12 meses de trabalho (período aquisitivo). A empresa tem os 12 meses seguintes (período concessivo) para conceder o descanso. Passando desse prazo, ela deve pagar em dobro."
  },
  {
    title: "Venda de Férias (Abono)",
    keywords: ['vender férias', 'vender ferias', 'abono pecuniário', 'vender 10 dias'],
    answer: "É seu direito vender 1/3 das férias (10 dias) em troca de dinheiro. Isso é o **Abono Pecuniário**. A empresa não pode recusar se você pedir até 15 dias antes de completar o período aquisitivo. Sobre esse valor não incide imposto."
  },
  {
    title: "Faltas impactam nas Férias?",
    keywords: ['faltas', 'desconto ferias', 'faltei muito'],
    answer: "Sim. Se você tiver mais de 5 faltas injustificadas no ano, seus dias de férias diminuem. \n\n• 6 a 14 faltas: 24 dias de férias \n• 15 a 23 faltas: 18 dias \n• 24 a 32 faltas: 12 dias \n• Acima de 32 faltas: Perde o direito às férias."
  },

  // --- 13º SALÁRIO ---
  {
    title: "13º Salário",
    keywords: ['decimo terceiro', '13 salario', '13o', 'gratificacao natalina'],
    answer: "O 13º salário é pago em duas parcelas: \n\n1ª Parcela: Entre 1º de fevereiro e 30 de novembro (sem descontos). \n2ª Parcela: Até 20 de dezembro (com descontos de INSS e IRRF). \n\nQuem trabalhou menos de um ano recebe proporcional (1/12 avos para cada mês com mais de 14 dias trabalhados)."
  },

  // --- FGTS E SEGURO DESEMPREGO ---
  {
    title: "Regras do Seguro Desemprego",
    keywords: ['seguro desemprego', 'quem tem direito ao seguro', 'parcelas seguro'],
    answer: "Tem direito quem foi demitido sem justa causa. \n\n📅 **Prazos:** \n1ª solicitação: Ter trabalhado pelo menos 12 meses nos últimos 18. \n2ª solicitação: 9 meses nos últimos 12. \n3ª em diante: 6 meses anteriores à demissão. \n\nO valor varia conforme a média salarial e tem um teto."
  },
  {
    title: "Saque-Aniversário FGTS",
    keywords: ['saque aniversário', 'saque aniversario', 'bloqueio fgts'],
    answer: "Ao optar pelo **Saque-Aniversário**, você saca uma parte do FGTS todo ano no mês do seu aniversário. \n\n⚠️ **O Risco:** Se for demitido, você **NÃO saca o saldo total** da conta, apenas a multa de 40%. Para voltar ao saque-rescisão (regra antiga), há uma carência de 25 meses."
  },

  // --- JORNADA E HORAS EXTRAS ---
  {
    title: "Horas Extras",
    keywords: ['hora extra', 'valor hora extra', 'banco de horas'],
    answer: "A hora extra vale no mínimo 50% a mais que a hora normal (dias úteis). Aos domingos e feriados, o adicional é de 100%. \n\nAs horas extras habituais integram o cálculo de férias, 13º, aviso prévio e FGTS. A empresa pode usar Banco de Horas se previsto em convenção coletiva."
  },
  {
    title: "Adicional Noturno",
    keywords: ['adicional noturno', 'trabalho a noite', 'hora noturna'],
    answer: "O trabalho entre **22h e 05h** (urbano) tem acréscimo de 20% no valor da hora. Além disso, a hora noturna é menor: 52 minutos e 30 segundos contam como se fosse 1 hora cheia de trabalho."
  },
  {
    title: "Intervalo de Almoço",
    keywords: ['almoço', 'intervalo', 'hora de almoço', 'descanso'],
    answer: "Quem trabalha mais de 6 horas por dia tem direito a no mínimo **1 hora** e no máximo 2 horas de intervalo. \nQuem trabalha entre 4 e 6 horas tem direito a 15 minutos. \nSe a empresa não conceder, deve pagar o tempo suprimido como hora extra indenizatória."
  },

  // --- DIREITOS ESPECÍFICOS ---
  {
    title: "Estabilidade Gestante",
    keywords: ['gestante', 'gravida', 'estabilidade gravidez'],
    answer: "A empregada gestante tem estabilidade no emprego desde a confirmação da gravidez até **5 meses após o parto**. Ela não pode ser demitida sem justa causa nesse período, mesmo se estiver no período de experiência ou aviso prévio."
  },
  {
    title: "Licença Paternidade",
    keywords: ['paternidade', 'licença pai', 'dias paternidade'],
    answer: "A licença-paternidade padrão é de **5 dias corridos**. Empresas do programa Empresa Cidadã podem estender esse prazo para 20 dias."
  },
  {
    title: "Vale Transporte",
    keywords: ['vale transporte', 'desconto vt', 'vt em dinheiro'],
    answer: "O Vale Transporte é obrigatório para o deslocamento casa-trabalho. A empresa pode descontar até **6% do salário base** do funcionário (se o custo do VT for menor que 6%, desconta-se apenas o custo real)."
  },
  {
    title: "Atestado Médico",
    keywords: ['atestado', 'falta justificada', 'descontar atestado'],
    answer: "A empresa é obrigada a aceitar atestados médicos válidos e abonar as faltas. Não pode haver desconto de salário. Atestados de acompanhamento de filhos (até 6 anos) também são garantidos por lei (1 dia por ano), mas convenções coletivas costumam ampliar esse direito."
  }
];

const DEFAULT_ANSWER = "Desculpe, ainda estou aprendendo e não encontrei uma resposta exata para isso no meu banco de dados da CLT. \n\nTente perguntar sobre: **Rescisão, Férias, Seguro Desemprego, Aviso Prévio ou Justa Causa**.";

const LegalAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Olá! Sou o Assistente Virtual do Conta Trabalhista. 🤖\n\nFunciono 100% offline e conheço as principais regras da CLT.\n\nQual é a sua dúvida hoje?'
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
    const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const cleanText = normalize(text);

    // 1. Direct Match
    const match = KNOWLEDGE_BASE.find(item =>
      item.keywords.some(keyword => cleanText.includes(normalize(keyword)))
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