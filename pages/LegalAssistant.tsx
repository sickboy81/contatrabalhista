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
  // --- DEMISSÃO E RESCISÃO ---
  {
    title: "Direitos na Demissão sem Justa Causa",
    keywords: ['sem justa causa', 'fui demitido', 'demissao sem justa', 'direitos demissao', 'me mandaram embora', 'direitos ao ser despedido'],
    answer: "Na demissão **sem justa causa**, você tem direito a:\n\n1. **Saldo de Salário:** Dias trabalhados no mês.\n2. **Aviso Prévio:** Trabalhado ou indenizado (+3 dias por ano de casa).\n3. **13º Proporcional:** Meses trabalhados no ano.\n4. **Férias Vencidas + 1/3:** Se houver.\n5. **Férias Proporcionais + 1/3:** Meses trabalhados no período aquisitivo atual.\n6. **Saque do FGTS:** Valor total depositado.\n7. **Multa de 40%:** Sobre o saldo do FGTS.\n8. **Seguro Desemprego:** Se cumprir os requisitos de tempo."
  },
  {
    title: "Direitos no Pedido de Demissão",
    keywords: ['pedido de demissao', 'pedir demissao', 'pedir as contas', 'quero sair', 'me demitir', 'pedindo as contas', 'quais os meus direitos se eu pedir demissao'],
    answer: "Ao **pedir demissão**, seus direitos são:\n\n1. **Saldo de Salário**\n2. **13º Salário Proporcional**\n3. **Férias Vencidas + 1/3**\n4. **Férias Proporcionais + 1/3**\n\n⚠️ **O que você PERDE:**\n❌ Não saca o FGTS.\n❌ Não recebe multa de 40%.\n❌ Não tem direito ao Seguro Desemprego.\n❌ Se não cumprir o aviso prévio, a empresa pode descontar o valor."
  },
  {
    title: "Demissão por Justa Causa",
    keywords: ['justa causa', 'falta grave', 'motivo grave', 'roubo', 'agressao', 'abandono de emprego', 'desidia', 'como funciona a justa causa'],
    answer: "A demissão por **Justa Causa** (Art. 482 da CLT) elimina a maioria dos direitos.\n\n✅ **Você recebe apenas:**\n• Saldo de Salário\n• Férias Vencidas + 1/3 (se tiver mais de um ano)\n\n🚫 **Você perde:** Aviso Prévio, 13º, Férias Proporcionais, Saque FGTS, Multa 40% e Seguro Desemprego."
  },
  {
    title: "Demissão por Acordo (Distrato)",
    keywords: ['acordo', 'comum acordo', 'distrato', 'acordo trabalhista', 'sair por acordo'],
    answer: "O **Acordo Trabalhista** (Art. 484-A da CLT) é um meio termo legal:\n\n• **Aviso Prévio:** Indenizado pago pela metade (50%).\n• **Multa FGTS:** 20% (metade).\n• **Saque FGTS:** Você pode sacar até 80% do saldo.\n• **Demais verbas:** Pagas integralmente (13º, Férias, Saldo).\n\n🚫 **Atenção:** Quem faz acordo NÃO recebe Seguro Desemprego."
  },
  {
    title: "Prazo para Pagamento da Rescisão",
    keywords: ['prazo pagamento', 'quando recebo', 'dias para pagar', 'prazo rescisao', 'multa atraso', 'quanto tempo pra pagar', 'quanto tempo para pagar a rescisao'],
    answer: "A empresa tem **10 dias corridos** após o último dia de contrato para pagar as verbas rescisórias.\n\nIsso vale para aviso trabalhado ou indenizado. Se o pagamento atrasar, a empresa deve pagar uma multa no valor de **um salário seu** (Art. 477 da CLT)."
  },

  // --- AVISO PRÉVIO ---
  {
    title: "Regras do Aviso Prévio",
    keywords: ['aviso previo', 'aviso prévio', 'tipos de aviso', 'aviso trabalhado', 'aviso indenizado'],
    answer: "🔹 **Trabalhado:** Você trabalha mais 30 dias após a demissão.\n🔹 **Indenizado:** A empresa paga o mês e te libera na hora.\n🔹 **Proporcional:** Para cada ano completo de empresa, você ganha 3 dias a mais de aviso indenizado (Lei 12.506), limitado a 90 dias totais."
  },
  {
    title: "Redução de Jornada no Aviso",
    keywords: ['reducao de jornada', 'sair mais cedo', '7 dias corridos', 'duas horas a menos', 'folgar aviso'],
    answer: "Se você foi demitido (sem justa causa) e vai cumprir aviso trabalhado, pode escolher:\n\n1. **Sair 2 horas mais cedo** todo dia (sem desconto).\n2. **Folgar os últimos 7 dias** corridos (recebe o mês cheio).\n\n⚠️ Se VOCÊ pediu demissão, não tem direito a essa redução; cumpre o horário normal."
  },
  {
    title: "Desconto de Aviso Prévio",
    keywords: ['desconto aviso', 'nao cumprir aviso', 'nao quero cumprir aviso', 'empresa pode descontar'],
    answer: "Se você **pediu demissão** e não quer cumprir os 30 dias, a empresa pode descontar esse valor da sua rescisão (o equivalente a um salário mensal). Se a empresa te demitiu e te dispensou do cumprimento, ela deve pagar esse mês como indenizado."
  },

  // --- FÉRIAS ---
  {
    title: "Direito a Férias",
    keywords: ['direito a ferias', 'quando tiro ferias', 'ferias vencidas', 'periodo aquisitivo'],
    answer: "A cada 12 meses trabalhados (período aquisitivo), você ganha o direito a 30 dias de férias. A empresa tem os 12 meses seguintes (período concessivo) para te dar esse descanso. Se passar desse prazo, ela deve pagar o valor em **dobro**."
  },
  {
    title: "Venda de Férias (Abono Pecuniário)",
    keywords: ['vender ferias', 'vender férias', 'abono pecuniario', 'vender 10 dias', 'posso vender minhas ferias'],
    answer: "Sim, é seu direito vender 1/3 das férias (10 dias) em troca de dinheiro. Isso se chama **Abono Pecuniário**.\n\n✅ A empresa **não pode recusar** se você pedir por escrito até 15 dias antes de completar o período aquisitivo.\n✅ Sobre esse valor não incide imposto de renda nem INSS (dinheiro limpo)."
  },
  {
    title: "Faltas e Férias",
    keywords: ['faltas ferias', 'desconto ferias', 'faltei muito', 'faltas injustificadas'],
    answer: "Faltas injustificadas no ano reduzem seus dias de férias:\n\n• Até 5 faltas: 30 dias (normal)\n• 6 a 14 faltas: 24 dias\n• 15 a 23 faltas: 18 dias\n• 24 a 32 faltas: 12 dias\n• Mais de 32 faltas: Perde as férias."
  },

  // --- SEGURO DESEMPREGO ---
  {
    title: "Quem tem direito ao Seguro Desemprego?",
    keywords: ['direito seguro desemprego', 'quem recebe seguro', 'regras seguro', 'pegar seguro', 'quem tem direito ao seguro desemprego'],
    answer: "Tem direito quem foi demitido **sem justa causa** e não possui outra fonte de renda.\n\n📅 **Tempo de trabalho necessário:**\n• 1ª Solicitação: Pelo menos 12 meses trabalhados.\n• 2ª Solicitação: Pelo menos 9 meses.\n• 3ª em diante: Pelo menos 6 meses.\n\nO valor depende da média dos últimos 3 salários (teto R$ 2.313,78 em 2024)."
  },
  {
    title: "Valor e Parcelas do Seguro",
    keywords: ['valor seguro', 'quantas parcelas', 'calculo seguro', 'teto seguro'],
    answer: "O valor é a média dos últimos 3 salários multiplicada por 0.8 (ou regra da faixa). O teto Maximo é R$ 2.313,78.\n\n📦 **Parcelas:**\n• De 3 a 5 parcelas, dependendo do tempo de serviço nos últimos 36 meses."
  },

  // --- FGTS ---
  {
    title: "O que é FGTS?",
    keywords: ['o que e fgts', 'fundo de garantia', 'deposito fgts', '8 por cento'],
    answer: "O FGTS (Fundo de Garantia) é uma poupança forçada. A empresa deve depositar **8% do seu salário bruto** todo mês em uma conta na Caixa. Esse valor NÃO é descontado de você; é um custo extra do patrão."
  },
  {
    title: "Saque-Aniversário vs Saque-Rescisão",
    keywords: ['saque aniversario', 'saque rescisao', 'modalidade fgts', 'bloqueio fgts'],
    answer: "• **Saque-Rescisão (Padrão):** Se demitido, saca tudo + multa de 40%.\n• **Saque-Aniversário:** Saca uma parte todo ano no mês do aniversário.\n\n⚠️ **Cuidado:** No Saque-Aniversário, se você for demitido, **só recebe a multa de 40%**. O saldo fica retido. Para voltar ao padrão, demora 25 meses (2 anos e 1 mês)."
  },
  {
    title: "Multa de 40%",
    keywords: ['multa 40', 'multa fgts', 'quarenta por cento', 'multa rescisoria'],
    answer: "Na demissão sem justa causa, a empresa paga uma multa de **40% sobre todo o valor que ela já depositou** no seu FGTS durante o contrato. Esse dinheiro é seu."
  },

  // --- JORNADA, HORAS EXTRAS E ADICIONAIS ---
  {
    title: "Horas Extras",
    keywords: ['hora extra', 'valor hora extra', 'banco de horas', '50%', '100%'],
    answer: "A hora extra deve ser paga com adicional de:\n• **50%** (mínimo) em dias úteis.\n• **100%** (dobro) em domingos e feriados.\n\nAs horas extras habituais entram na média para pagar Férias, 13º, FGTS e Aviso Prévio. O banco de horas é permitido se houver acordo escrito."
  },
  {
    title: "Adicional Noturno",
    keywords: ['adicional noturno', 'trabalho a noite', 'hora noturna', '22h as 5h'],
    answer: "Trabalho urbano entre **22h e 05h** tem adicional de **20%** sobre a hora normal. Além disso, a 'hora noturna' é mais curta: 52 minutos e 30 segundos contam como 1 hora de trabalho."
  },
  {
    title: "Adicional de Insalubridade e Periculosidade",
    keywords: ['insalubridade', 'periculosidade', 'adicional risco', 'trabalho perigoso'],
    answer: "☢️ **Periculosidade:** 30% sobre o salário base (risco de vida, eletricidade, explosivos, moto).\n🤢 **Insalubridade:** 10%, 20% ou 40% sobre o salário MÍNIMO (agentes nocivos à saúde, ruído, calor, químicos).\n\nNão se acumulam (você recebe o mais vantajoso)."
  },
  {
    title: "Intervalo de Almoço (Intrajornada)",
    keywords: ['almoco', 'intervalo', 'hora de almoco', 'descanso', 'pausa'],
    answer: "Regras de intervalo:\n• Acima de 6h trabalho: Mínimo **1 hora** de almoço.\n• De 4h a 6h: 15 minutos.\n• Até 4h: Sem intervalo obrigatório.\n\nSe a empresa não der o intervalo, deve pagar o tempo suprimido como hora extra indenizatória."
  },

  // --- BENEFÍCIOS E OUTROS ---
  {
    title: "Vale Transporte",
    keywords: ['vale transporte', 'desconto vt', 'vt em dinheiro', 'transporte'],
    answer: "A empresa é obrigada a fornecer VT se você precisar. Pode descontar até **6% do seu salário básico** (ou o custo real do transporte, o que for menor). O pagamento em dinheiro é permitido apenas em casos excepcionais ou acordo coletivo, mas tem natureza salarial (incide imposto)."
  },
  {
    title: "Estabilidade Gestante",
    keywords: ['gestante', 'gravida', 'estabilidade gravidez', 'demissao gravida'],
    answer: "A gestante tem estabilidade provisória desde a **confirmação da gravidez** (mesmo que a empresa não saiba) até **5 meses após o parto**. Não pode ser demitida sem justa causa, nem mesmo no período de experiência."
  },
  {
    title: "Licença Paternidade",
    keywords: ['paternidade', 'licenca pai', 'quantos dias pai'],
    answer: "O pai tem direito a **5 dias corridos** de licença remunerada logo após o nascimento. Empresas do programa Empresa Cidadã podem estender para 20 dias."
  },
  {
    title: "Atestado Médico",
    keywords: ['atestado', 'falta justificada', 'descontar atestado', 'atestado filho'],
    answer: "Atestado médico válido abona a falta (não desconta salário). Você também tem direito a acompanhar filho de até 6 anos ao médico (1 dia por ano pela CLT, mas convenções costumam dar mais)."
  },
  {
    title: "Salário Família",
    keywords: ['salario familia', 'abono filho', 'quem recebe salario familia'],
    answer: "É um valor pago pelo INSS (via empresa) para trabalhadores de baixa renda com filhos até 14 anos ou inválidos. O valor em 2024 é de R$ 62,04 por filho para quem ganha até R$ 1.819,26."
  },
  {
    title: "Contribuição Sindical",
    keywords: ['imposto sindical', 'contribuicao sindical', 'desconto sindicato'],
    answer: "A Contribuição Sindical (um dia de trabalho) **NÃO é mais obrigatória** desde 2017. Ela só pode ser descontada se você autorizar prévia e expressamente por escrito."
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

  // Auto-scroll logic
  useEffect(() => {
    // Scroll strictly only when a new message is added
    // and ONLY if it's from the user.
    // We intentionally ignore 'isTyping' changes to avoid scrolling when the AI starts/stops thinking.
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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