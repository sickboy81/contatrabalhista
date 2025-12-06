
import { TerminationInputs, TerminationReason, NoticeType, CalculationResult } from '../types';
import { 
    INSS_TABLE, 
    IRRF_TABLE, 
    DEDUCTION_PER_DEPENDENT, 
    UNEMPLOYMENT_TABLE,
    FGTS_ANNIVERSARY_TABLE,
    MINIMUM_WAGE,
    INSS_CEILING
} from './taxConstants';

// --- CORE CALCULATORS ---

export const calculateINSS = (grossSalary: number): number => {
  let discount = 0;
  let remainingSalary = grossSalary;
  let previousLimit = 0;

  // Check ceiling first
  const maxLimit = INSS_TABLE[INSS_TABLE.length - 1].limit;
  if (grossSalary > maxLimit) {
      return INSS_CEILING; 
  }

  for (const bracket of INSS_TABLE) {
      if (grossSalary > previousLimit) {
          const range = Math.min(grossSalary, bracket.limit) - previousLimit;
          discount += range * bracket.rate;
          previousLimit = bracket.limit;
      } else {
          break;
      }
  }
  
  return Number(discount.toFixed(2));
};

export const calculateIRRF = (baseSalary: number, dependents: number): number => {
  // Logic: Base - (Dependents * Value)
  const deductionDependents = dependents * DEDUCTION_PER_DEPENDENT;
  const taxableIncome = baseSalary - deductionDependents;

  // Find bracket
  const bracket = IRRF_TABLE.find(b => taxableIncome <= b.limit) || IRRF_TABLE[IRRF_TABLE.length - 1];
  
  if (bracket.rate === 0) return 0;

  const tax = (taxableIncome * bracket.rate) - bracket.deduction;
  return Math.max(0, Number(tax.toFixed(2)));
};

// --- TERMINATION LOGIC ---

// Helper to determine entitlement flags based on reason
const getRights = (reason: TerminationReason) => {
    return {
        hasNoticeIndemnity: [
            TerminationReason.DISMISSAL_NO_CAUSE, 
            TerminationReason.EXPERIENCE_EARLY_EMPLOYER
            // Agreement handles notice separately (half)
        ].includes(reason),
        
        hasNoticeDeduction: [
            TerminationReason.RESIGNATION,
            TerminationReason.EXPERIENCE_EARLY_EMPLOYEE
        ].includes(reason),

        hasMultaFGTS: reason === TerminationReason.DISMISSAL_NO_CAUSE || reason === TerminationReason.EXPERIENCE_EARLY_EMPLOYER,
        isAgreement: reason === TerminationReason.AGREEMENT,
        isJustaCausa: reason === TerminationReason.DISMISSAL_WITH_CAUSE,
        isExperienceEnd: reason === TerminationReason.EXPERIENCE_END
    };
};

export const calculateTermination = (inputs: TerminationInputs): CalculationResult => {
  const start = new Date(inputs.startDate);
  const end = new Date(inputs.endDate);
  
  // Normalize time
  start.setHours(0,0,0,0);
  end.setHours(0,0,0,0);

  // Time Worked
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDaysTotal = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const yearsWorked = Math.floor(diffDaysTotal / 365);
  
  const dailySalary = inputs.salary / 30;
  const rights = getRights(inputs.reason);

  // 1. AVISO PRÉVIO (Notice)
  let noticeDaysBase = 30;
  let noticeDaysExtra = Math.min(yearsWorked * 3, 60);
  let totalNoticeDays = noticeDaysBase + noticeDaysExtra;

  if (rights.isExperienceEnd) {
      totalNoticeDays = 0;
  }

  let noticeValue = 0; 
  let noticeDeduction = 0; 
  let noticeDaysForProjection = 0; 

  if (inputs.noticeType === NoticeType.INDEMNIFIED) {
      if (rights.isAgreement) {
          noticeValue = (dailySalary * totalNoticeDays) / 2;
          noticeDaysForProjection = totalNoticeDays / 2; 
      } else if (rights.hasNoticeIndemnity) {
          noticeValue = dailySalary * totalNoticeDays;
          noticeDaysForProjection = totalNoticeDays;
      }
  } else if (inputs.noticeType === NoticeType.NOT_FULFILLED) {
      if (rights.hasNoticeDeduction) {
          noticeDeduction = dailySalary * 30; 
      }
  } else if (inputs.noticeType === NoticeType.WORKED) {
      noticeDaysForProjection = 0;
  }

  // 2. PROJECTED EXIT DATE
  const projectedEndDate = new Date(end);
  projectedEndDate.setDate(projectedEndDate.getDate() + Math.floor(noticeDaysForProjection));

  // 3. SALDO DE SALÁRIO
  const daysWorkedInExitMonth = end.getDate(); 
  let salaryBalance = 0;
  const lastDayOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
  
  if (daysWorkedInExitMonth === lastDayOfMonth) {
      salaryBalance = inputs.salary; 
  } else {
      salaryBalance = Number((dailySalary * daysWorkedInExitMonth).toFixed(2));
  }

  // 4. FÉRIAS
  let vacationDueValue = 0; 
  if (inputs.vacationOverdueDays > 0) {
      vacationDueValue = (inputs.salary / 30) * inputs.vacationOverdueDays;
  }

  let anniversaryDate = new Date(start);
  anniversaryDate.setFullYear(projectedEndDate.getFullYear());
  if (anniversaryDate > projectedEndDate) {
      anniversaryDate.setFullYear(projectedEndDate.getFullYear() - 1);
  }

  let vacationMonths = 0;
  const diffTimeVac = Math.abs(projectedEndDate.getTime() - anniversaryDate.getTime());
  const diffDaysVac = Math.ceil(diffTimeVac / (1000 * 60 * 60 * 24));
  vacationMonths = Math.floor(diffDaysVac / 30); 
  const remainderDays = diffDaysVac % 30;
  if (remainderDays >= 15) vacationMonths++;
  if (vacationMonths > 12) vacationMonths = 12;

  let vacationPropValue = (inputs.salary / 12) * vacationMonths;

  if (rights.isJustaCausa) {
      vacationPropValue = 0;
  }

  const vacationTotal = vacationDueValue + vacationPropValue;
  const vacationThird = vacationTotal / 3;

  // 5. 13º SALARY
  let thirteenthPropValue = 0;
  let thirteenthMonths = 0;

  if (!rights.isJustaCausa) {
      const jan1st = new Date(projectedEndDate.getFullYear(), 0, 1);
      let start13th = new Date(start) > jan1st ? new Date(start) : jan1st;
      
      let iter = new Date(start13th);
      iter.setDate(1); 
      
      const targetM = projectedEndDate.getMonth();
      const targetY = projectedEndDate.getFullYear();
      
      while (iter.getFullYear() < targetY || (iter.getFullYear() === targetY && iter.getMonth() <= targetM)) {
          const m = iter.getMonth();
          const y = iter.getFullYear();
          
          let startDay = 1;
          if (y === start13th.getFullYear() && m === start13th.getMonth()) startDay = start13th.getDate();
          
          let endDay = new Date(y, m + 1, 0).getDate();
          if (y === projectedEndDate.getFullYear() && m === projectedEndDate.getMonth()) endDay = projectedEndDate.getDate();
          
          const daysWorked = endDay - startDay + 1;
          if (daysWorked >= 15) {
              thirteenthMonths++;
          }
          
          iter.setMonth(iter.getMonth() + 1);
      }
      thirteenthPropValue = (inputs.salary / 12) * thirteenthMonths;
  }

  let thirteenthAdvanceDiscount = 0;
  if (inputs.thirteenthAdvanced) {
      thirteenthAdvanceDiscount = inputs.salary / 2;
  }

  // 6. FGTS
  let fgtsFine = 0;
  if (rights.hasMultaFGTS) {
      fgtsFine = inputs.fgtsBalance * 0.40;
  } else if (rights.isAgreement) {
      fgtsFine = inputs.fgtsBalance * 0.20;
  }

  // 7. TOTALS & TAXES
  const earnings = {
      salaryBalance,
      noticeIndemnified: noticeValue,
      vacationTotal: vacationTotal + vacationThird,
      thirteenthTotal: thirteenthPropValue,
      fgtsFine
  };

  const totalGross = Object.values(earnings).reduce((a, b) => a + b, 0);

  const inssBase = salaryBalance + thirteenthPropValue;
  const inssVal = calculateINSS(inssBase);
  
  const irrfBase = salaryBalance + thirteenthPropValue - inssVal;
  const irrfVal = calculateIRRF(irrfBase, inputs.dependents);

  const discounts = {
      inss: inssVal,
      irrf: irrfVal,
      noticeDeduction: noticeDeduction,
      thirteenthAdvance: thirteenthAdvanceDiscount
  };

  const totalDiscounts = Object.values(discounts).reduce((a, b) => a + b, 0);
  const totalNet = totalGross - totalDiscounts;

  return {
    salaryBalance,
    noticeWarning: noticeValue > 0 ? noticeValue : -noticeDeduction,
    vacationProportional: vacationPropValue,
    vacationDue: vacationDueValue,
    vacationThird,
    thirteenthProportional: thirteenthPropValue,
    totalGross,
    inss: inssVal,
    irrf: irrfVal,
    totalNet,
    fgtsFine,
    discounts,
    earnings,
    meta: {
        yearsWorked,
        noticeDays: totalNoticeDays,
        projectedDate: projectedEndDate.toLocaleDateString('pt-BR')
    }
  };
};


// --- AUX CALCULATIONS ---

export const calculateUnemploymentBenefit = (averageSalary: number, monthsWorked: number, requestCount: number) => {
  let benefitValue = 0;
  const minWage = MINIMUM_WAGE;

  // Use Centralized Table
  const tier1 = UNEMPLOYMENT_TABLE[0];
  const tier2 = UNEMPLOYMENT_TABLE[1];
  const tier3 = UNEMPLOYMENT_TABLE[2];

  if (averageSalary <= tier1.limit) {
    benefitValue = averageSalary * tier1.multiplier;
  } else if (averageSalary <= tier2.limit) {
    benefitValue = tier2.added + ((averageSalary - tier1.limit) * tier2.multiplier);
  } else {
    benefitValue = tier3.added;
  }

  if (benefitValue < minWage) benefitValue = minWage;

  let installments = 0;
  if (requestCount === 1) {
    if (monthsWorked >= 24) installments = 5;
    else if (monthsWorked >= 12) installments = 4;
  } else if (requestCount === 2) {
    if (monthsWorked >= 24) installments = 5;
    else if (monthsWorked >= 12) installments = 4;
    else if (monthsWorked >= 9) installments = 3;
  } else {
    if (monthsWorked >= 24) installments = 5;
    else if (monthsWorked >= 12) installments = 4;
    else if (monthsWorked >= 6) installments = 3;
  }

  return { benefitValue, installments };
};

export const calculateVacation = (salary: number, sellDays: boolean, dependents: number) => {
  const daysVacation = sellDays ? 20 : 30;
  const daysSold = sellDays ? 10 : 0;

  const vacationPay = (salary / 30) * daysVacation;
  const vacationThird = vacationPay / 3;
  
  const abono = (salary / 30) * daysSold;
  const abonoThird = abono / 3;

  const totalGross = vacationPay + vacationThird + abono + abonoThird;

  const taxBase = vacationPay + vacationThird;
  const inss = calculateINSS(taxBase);
  const irrf = calculateIRRF(taxBase - inss, dependents);

  return {
    vacationPay,
    vacationThird,
    abono,
    abonoThird,
    totalGross,
    inss,
    irrf,
    totalNet: totalGross - inss - irrf
  };
};

export const calculateOvertime = (salary: number, hours: number, rate: number, dsrEnabled: boolean = true) => {
    const hourlyRate = salary / 220;
    const overtimeRate = hourlyRate * (1 + (rate / 100));
    const overtimeValue = overtimeRate * hours;
    
    const dsrValue = dsrEnabled ? overtimeValue / 6 : 0;
    
    return {
        hourlyRate,
        overtimeValue,
        dsrValue,
        total: overtimeValue + dsrValue
    };
}

export const calculateFgtsAnniversary = (balance: number) => {
    // Dynamic Logic from Table
    const bracket = FGTS_ANNIVERSARY_TABLE.find(b => balance <= b.limit) || FGTS_ANNIVERSARY_TABLE[FGTS_ANNIVERSARY_TABLE.length - 1];
    
    const annualWithdrawal = (balance * bracket.rate) + bracket.added;
    return { annualWithdrawal, rate: bracket.rate * 100, portion: bracket.added };
}

export const calculateInvestmentProjection = (amount: number, months: number) => {
    const poupancaRate = 0.0055; // ~0.55% month
    const cdbRate = 0.0085; // ~0.85% month (100% CDI roughly)

    const poupancaTotal = amount * Math.pow(1 + poupancaRate, months);
    const cdbTotal = amount * Math.pow(1 + cdbRate, months);

    return {
        poupanca: poupancaTotal,
        cdb: cdbTotal,
        diff: cdbTotal - poupancaTotal
    };
}

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const formatDate = (dateStr: string) => {
    if(!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

export const numberToWordsPTBR = (num: number): string => {
    if (num === 0) return "zero reais";

    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const onzeADezenove = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    const getGroup = (n: number): string => {
        if (n === 0) return "";
        
        let str = "";
        const c = Math.floor(n / 100);
        const d = Math.floor((n % 100) / 10);
        const u = n % 10;

        if (c === 1 && d === 0 && u === 0) return "cem";
        if (c > 0) str += centenas[c];

        if (d === 1) {
            if (str) str += " e ";
            str += onzeADezenove[u];
            return str;
        }

        if (d > 1) {
            if (str) str += " e ";
            str += dezenas[d];
        }

        if (u > 0) {
            if (str) str += " e ";
            str += unidades[u];
        }
        
        return str;
    };

    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let result = "";

    const millions = Math.floor(integerPart / 1000000);
    const thousands = Math.floor((integerPart % 1000000) / 1000);
    const rest = integerPart % 1000;

    if (millions > 0) {
        result += getGroup(millions) + (millions === 1 ? " milhão" : " milhões");
    }

    if (thousands > 0) {
        if (result) result += " e ";
        if (thousands === 1 && millions === 0) {
             result += "mil"; 
        } else {
             if(thousands === 1) result += "um mil";
             else result += getGroup(thousands) + " mil";
        }
    }

    if (rest > 0) {
        if (result) result += " e ";
        result += getGroup(rest);
    }
    
    if (integerPart > 0) {
        result += (integerPart === 1 ? " real" : " reais");
    }

    if (decimalPart > 0) {
        if (result) result += " e ";
        result += getGroup(decimalPart) + (decimalPart === 1 ? " centavo" : " centavos");
    }

    return result;
};
