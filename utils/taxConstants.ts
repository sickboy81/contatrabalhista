// ARQUIVO MESTRE DE TABELAS OFICIAIS
// Atualize este arquivo anualmente para refletir as novas regras da CLT/Governo.

// Governanca de revisao legal (usada na CI)
// Formato ISO obrigatorio: YYYY-MM-DD
export const LEGAL_REVIEW_LAST_UPDATED = '2026-04-29';
export const LEGAL_REVIEW_MAX_AGE_DAYS = 60;
export const LEGAL_OFFICIAL_SOURCES = [
    'https://www.gov.br/trabalho-e-emprego/pt-br',
    'https://www.gov.br/receitafederal/pt-br',
    'https://www.gov.br/previdencia/pt-br',
    'https://www.caixa.gov.br/beneficios-trabalhador/fgts'
];

export const CURRENT_YEAR = new Date().getFullYear();

export const MINIMUM_WAGE = 1621.00; // Salário Mínimo 2026
export const MINIMUM_WAGE_HISTORY: Record<number, number> = {
    2026: 1621.00,
    2025: 1518.00,
    2024: 1412.00
};

// Teto do Seguro Desemprego 2026
export const UNEMPLOYMENT_CEILING = 2518.65; 

// Faixas do Seguro Desemprego 2026
export const UNEMPLOYMENT_TABLE = [
    { limit: 2222.17, multiplier: 0.8, added: 0 },
    { limit: 3703.99, multiplier: 0.5, added: 1777.74 },
    { limit: Infinity, multiplier: 0, added: 2518.65 } // Teto fixo
];
export const UNEMPLOYMENT_FIRST_RANGE_LIMIT = UNEMPLOYMENT_TABLE[0].limit;
export const UNEMPLOYMENT_SECOND_RANGE_LIMIT = UNEMPLOYMENT_TABLE[1].limit;

// Tabela INSS 2026 (Progressiva)
export const INSS_TABLE = [
    { limit: 1621.00, rate: 0.075 },
    { limit: 2902.84, rate: 0.09 },
    { limit: 4354.27, rate: 0.12 },
    { limit: 8475.55, rate: 0.14 }
];
export const INSS_CEILING = 988.09; // Teto máximo de desconto 2026

// Tabela IRRF 2026 (Imposto de Renda - Referência Progressiva)
// Nota: Em 2026 entrou em vigor a isenção de até R$ 5.000,00 (Reforma)
export const IRRF_TABLE = [
    { limit: 5000.00, rate: 0, deduction: 0 },
    { limit: 6000.00, rate: 0.15, deduction: 750.00 }, // Valores estimados para o novo modelo
    { limit: 7500.00, rate: 0.225, deduction: 1200.00 },
    { limit: Infinity, rate: 0.275, deduction: 1575.00 }
];

export const DEDUCTION_PER_DEPENDENT = 189.59;
export const IRRF_SIMPLIFIED_DISCOUNT = 564.80; 

// Salário Família 2026
export const FAMILY_SALARY_LIMIT = 2088.14; // Reajustado proporcionalmente
export const FAMILY_SALARY_VALUE = 71.18;

// MEI
export const MEI_ANNUAL_LIMIT = 81000;
export const MEI_MONTHLY_LIMIT = MEI_ANNUAL_LIMIT / 12;
export const MEI_TOLERANCE_MULTIPLIER = 1.2;
export const MEI_INSS_RATE = 0.05;
export const MEI_DAS_BASE_INSS = MINIMUM_WAGE * MEI_INSS_RATE;
export const MEI_DAS_VALUES = {
    comercio: Number((MEI_DAS_BASE_INSS + 1).toFixed(2)),
    industria: Number((MEI_DAS_BASE_INSS + 1).toFixed(2)),
    servicos: Number((MEI_DAS_BASE_INSS + 5).toFixed(2)),
    misto: Number((MEI_DAS_BASE_INSS + 6).toFixed(2))
};

// Tabela Saque Aniversário FGTS (Geralmente fixa, mas bom centralizar)
export const FGTS_ANNIVERSARY_TABLE = [
    { limit: 500.00, rate: 0.50, added: 0 },
    { limit: 1000.00, rate: 0.40, added: 50.00 },
    { limit: 5000.00, rate: 0.30, added: 150.00 },
    { limit: 10000.00, rate: 0.20, added: 650.00 },
    { limit: 15000.00, rate: 0.15, added: 1150.00 },
    { limit: 20000.00, rate: 0.10, added: 1900.00 },
    { limit: Infinity, rate: 0.05, added: 2900.00 }
];