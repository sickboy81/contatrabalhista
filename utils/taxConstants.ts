// ARQUIVO MESTRE DE TABELAS OFICIAIS
// Atualize este arquivo anualmente para refletir as novas regras da CLT/Governo.

export const CURRENT_YEAR = new Date().getFullYear();

export const MINIMUM_WAGE = 1412.00; // Salário Mínimo 2024

// Teto do Seguro Desemprego 2024
export const UNEMPLOYMENT_CEILING = 2313.78; 

// Faixas do Seguro Desemprego
export const UNEMPLOYMENT_TABLE = [
    { limit: 2041.53, multiplier: 0.8, added: 0 },
    { limit: 3402.65, multiplier: 0.5, added: 1633.22 },
    { limit: Infinity, multiplier: 0, added: 2313.78 } // Teto fixo
];

// Tabela INSS 2024 (Progressiva)
// O cálculo é feito fatia por fatia.
export const INSS_TABLE = [
    { limit: 1412.00, rate: 0.075 },
    { limit: 2666.68, rate: 0.09 },
    { limit: 4000.03, rate: 0.12 },
    { limit: 7786.02, rate: 0.14 }
];
export const INSS_CEILING = 908.85; // Teto máximo de desconto (calculado ou fixo)

// Tabela IRRF 2024 (Imposto de Renda)
export const IRRF_TABLE = [
    { limit: 2259.20, rate: 0, deduction: 0 },
    { limit: 2826.65, rate: 0.075, deduction: 169.44 },
    { limit: 3751.05, rate: 0.15, deduction: 381.44 },
    { limit: 4664.68, rate: 0.225, deduction: 662.77 },
    { limit: Infinity, rate: 0.275, deduction: 896.00 }
];

export const DEDUCTION_PER_DEPENDENT = 189.59;
export const IRRF_SIMPLIFIED_DISCOUNT = 564.80; // Desconto simplificado (novo 2024)

// Salário Família 2024
export const FAMILY_SALARY_LIMIT = 1819.26;
export const FAMILY_SALARY_VALUE = 62.04;

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