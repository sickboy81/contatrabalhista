import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

const FAQ: React.FC<FAQProps> = ({ items }) => {
  // Generate Structured Data for Google (Rich Snippets)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <div className="mt-12 border-t border-slate-200 pt-8 no-print">
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} 
      />
      
      <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Dúvidas Frequentes</h2>
      
      <div className="space-y-4 max-w-3xl mx-auto">
        {items.map((item, index) => (
          <details key={index} className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors list-none">
              <span className="font-semibold text-slate-800 text-sm md:text-base pr-4">{item.question}</span>
              <span className="transition group-open:rotate-180">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 mt-2 pt-2">
              <div dangerouslySetInnerHTML={{ __html: item.answer }} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default FAQ;