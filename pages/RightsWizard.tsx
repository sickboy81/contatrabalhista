import React, { useState } from 'react';
import { TerminationReason } from '../types';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import RelatedTools from '../components/RelatedTools';
import { Link } from 'react-router-dom';

interface RightsState {
  balance: boolean; // Saldo Salário
  vacation: boolean; // Férias Vencidas/Prop
  thirteenth: boolean; // 13º
  notice: boolean; // Aviso Prévio
  fgtsWithdrawal: boolean; // Saque FGTS
  fgtsFine: boolean; // Multa 40%
  unemployment: boolean; // Seguro Desemprego
}

const RightsWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<TerminationReason | ''>('');
  const [moreThanOneYear, setMoreThanOneYear] = useState<boolean | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const calculateRights = (): RightsState => {
    const base = {
      balance: true,
      vacation: true,
      thirteenth: true,
      notice: false,
      fgtsWithdrawal: false,
      fgtsFine: false,
      unemployment: false,
    };

    if (reason === TerminationReason.DISMISSAL_NO_CAUSE) {
      return {
        ...base,
        notice: true,
        fgtsWithdrawal: true,
        fgtsFine: true,
        unemployment: true, // Generally yes, depends on time worked but rule of thumb is yes
      };
    }

    if (reason === TerminationReason.RESIGNATION) {
      return {
        ...base,
        notice: false, // Usually pays or works, doesn't receive indemnified unless specific
        fgtsWithdrawal: false,
        fgtsFine: false,
        unemployment: false,
      };
    }

    if (reason === TerminationReason.DISMISSAL_WITH_CAUSE) {
      return {
        balance: true,
        // Actually, Justa Causa loses almost everything except Balance and Vencidas (if > 1 year).
        // Let's simplify for the "General Rule"
        vacation: !!moreThanOneYear, // Only if acquired
        thirteenth: false,
        notice: false,
        fgtsWithdrawal: false,
        fgtsFine: false,
        unemployment: false,
      };
    }

    if (reason === TerminationReason.AGREEMENT) {
      return {
        ...base,
        notice: true, // Half (Indemnified)
        fgtsWithdrawal: true, // Up to 80%
        fgtsFine: true, // 20%
        unemployment: false,
      };
    }

    return base;
  };

  const rights = calculateRights();

  const faqItems = [
    {
        question: "Quanto tempo a empresa tem para pagar a rescisão?",
        answer: "A empresa tem até <strong>10 dias corridos</strong> após o término do contrato para pagar as verbas rescisórias. Se atrasar, ela deve pagar uma multa no valor de um salário do funcionário (Art. 477 da CLT)."
    },
    {
        question: "Quem pede demissão saca o FGTS?",
        answer: "Não. No pedido de demissão, o FGTS fica retido na conta (inativo). Você só poderá sacar após 3 anos sem registro em carteira (regime do FGTS), na compra da casa própria ou na aposentadoria."
    },
    {
        question: "O que é o Acordo Comum (Distrato)?",
        answer: "Criado na Reforma Trabalhista, permite que empresa e funcionário concordem com a saída. O trabalhador saca 80% do FGTS, recebe 20% de multa e metade do aviso prévio, mas <strong>não</strong> tem direito ao Seguro Desemprego."
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <SEO 
        title={`Quiz: Quais são meus Direitos Trabalhistas em ${currentYear}?`}
        description={`Responda perguntas simples e descubra exatamente o que você tem direito a receber na demissão em ${currentYear} (multa 40%, seguro desemprego, aviso prévio).`}
        keywords="quais meus direitos trabalhistas, quiz direitos demissão, o que recebo se pedir conta, demissão sem justa causa direitos"
        ratingValue={4.8}
        reviewCount={920}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900">Mago dos Direitos Trabalhistas</h1>
        <p className="text-gray-600">Responda 2 perguntas e descubra o que é seu por direito.</p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.8/5)</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 min-h-[400px] flex flex-col justify-center">
        {step === 0 && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-800 text-center">1. Qual foi o motivo da saída?</h2>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(TerminationReason).map((r) => (
                <button
                  key={r}
                  onClick={() => { setReason(r); setStep(1); }}
                  className="p-4 border-2 border-gray-100 rounded-xl hover:border-brand-500 hover:bg-brand-50 text-left font-medium transition-all"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-800 text-center">2. Você tinha mais de 1 ano de casa?</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setMoreThanOneYear(true); setStep(2); }}
                className="p-6 border-2 border-gray-100 rounded-xl hover:border-brand-500 hover:bg-brand-50 font-bold text-lg"
              >
                Sim
              </button>
              <button
                onClick={() => { setMoreThanOneYear(false); setStep(2); }}
                className="p-6 border-2 border-gray-100 rounded-xl hover:border-brand-500 hover:bg-brand-50 font-bold text-lg"
              >
                Não
              </button>
            </div>
            <button onClick={() => setStep(0)} className="text-sm text-gray-400 hover:text-gray-600 mt-4 mx-auto block">Voltar</button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
             <div className="text-center mb-6">
                <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Seu Resultado</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{reason}</h2>
             </div>

             <div className="space-y-2">
                <ResultItem label="Saldo de Salário" hasRight={rights.balance} />
                <ResultItem label="Férias + 1/3" hasRight={rights.vacation} />
                <ResultItem label="13º Salário Proporcional" hasRight={rights.thirteenth} />
                <ResultItem label="Aviso Prévio" hasRight={rights.notice} note={reason === TerminationReason.AGREEMENT ? '(Pela metade)' : ''} />
                <ResultItem label="Saque do FGTS" hasRight={rights.fgtsWithdrawal} note={reason === TerminationReason.AGREEMENT ? '(Até 80%)' : ''} />
                <ResultItem label="Multa do FGTS" hasRight={rights.fgtsFine} note={reason === TerminationReason.DISMISSAL_NO_CAUSE ? '(40%)' : reason === TerminationReason.AGREEMENT ? '(20%)' : ''} />
                <ResultItem label="Seguro Desemprego" hasRight={rights.unemployment} />
             </div>

             <div className="mt-8 pt-6 border-t text-center space-y-3">
                 <Link to="/" className="block w-full bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 shadow-md">
                    Calcular Valores Agora
                 </Link>
                 <button onClick={() => setStep(0)} className="text-sm text-gray-500 hover:text-brand-600 font-medium">
                    Refazer Teste
                 </button>
             </div>
          </div>
        )}
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Resumo dos Direitos na Rescisão {currentYear}</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   A Consolidação das Leis do Trabalho (CLT) prevê regras claras para cada tipo de desligamento. Entender a diferença é crucial para não perder dinheiro.
                   Para valores exatos, use nossa <Link to="/" className="text-brand-600 font-bold hover:underline">Calculadora de Rescisão</Link>.
               </p>
               
               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Demissão Sem Justa Causa (A mais comum)</h3>
               <p>
                   É quando a empresa decide te desligar sem um motivo grave. É o cenário onde você recebe <strong>todos</strong> os direitos: Aviso Prévio, Férias, 13º, Saque do FGTS com multa de 40% e acesso ao Seguro Desemprego.
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Pedido de Demissão</h3>
               <p>
                   Quando a iniciativa é sua. Você recebe os proporcionais (Férias e 13º) e saldo de salário. Porém, você <strong>abre mão</strong> da multa de 40%, do saque do FGTS (fica retido) e do Seguro Desemprego.
                   Use nosso <Link to="/carta-demissao" className="text-brand-600 font-bold hover:underline">Gerador de Carta de Demissão</Link> para formalizar sua saída.
               </p>

               <h3 className="text-lg font-bold text-brand-700 mt-6 mb-2">Demissão por Justa Causa</h3>
               <p>
                   Ocorre por falta grave (roubo, agressão, abandono). Você perde quase tudo: não recebe 13º nem férias proporcionais, não saca FGTS e não tem seguro. Recebe apenas saldo de salário e férias vencidas (se houver).
               </p>
           </div>
       </section>

      <RelatedTools current="/quiz-direitos" />
      <FAQ items={faqItems} />
    </div>
  );
};

const ResultItem: React.FC<{ label: string; hasRight: boolean; note?: string }> = ({ label, hasRight, note }) => (
  <div className={`flex items-center justify-between p-3 rounded-lg ${hasRight ? 'bg-green-50' : 'bg-red-50 opacity-75'}`}>
     <span className={`font-medium ${hasRight ? 'text-green-900' : 'text-red-900'}`}>{label} {note && <span className="text-xs opacity-75 ml-1">{note}</span>}</span>
     {hasRight ? (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
     ) : (
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
     )}
  </div>
);

export default RightsWizard;