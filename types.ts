export enum TerminationReason {
  DISMISSAL_NO_CAUSE = "Demissão sem Justa Causa",
  DISMISSAL_WITH_CAUSE = "Demissão por Justa Causa",
  RESIGNATION = "Pedido de Demissão",
  AGREEMENT = "Acordo (Comum Acordo - Reforma Trab.)",
  EXPERIENCE_END = "Término de Contrato de Experiência",
  EXPERIENCE_EARLY_EMPLOYER = "Rescisão Antecipada Exp. (Pelo Empregador)",
  EXPERIENCE_EARLY_EMPLOYEE = "Rescisão Antecipada Exp. (Pelo Empregado)",
  DEATH = "Falecimento do Empregado"
}

export enum NoticeType {
  WORKED = "Trabalhado",
  INDEMNIFIED = "Indenizado (Pago pela empresa)",
  NOT_FULFILLED = "Não Cumprido (Descontado)",
  NONE = "Não se aplica" // Para término de contrato
}

export interface TerminationInputs {
  salary: number;
  startDate: string;
  endDate: string;
  reason: TerminationReason;
  noticeType: NoticeType;
  vacationOverdueDays: number; // Quantidade de dias de férias vencidas
  fgtsBalance: number;
  dependents: number;
  thirteenthAdvanced: boolean; // Se já recebeu a 1ª parcela
}

export interface CalculationResult {
  salaryBalance: number; 
  vacationProportional: number;
  vacationDue: number;
  vacationThird: number;
  thirteenthProportional: number;
  noticeWarning: number; // Pode ser positivo (receber) ou negativo (desconto)
  totalGross: number;
  inss: number;
  irrf: number;
  totalNet: number;
  fgtsFine: number;
  discounts: {
      inss: number;
      irrf: number;
      noticeDeduction: number;
      thirteenthAdvance: number;
  };
  earnings: {
      salaryBalance: number;
      noticeIndemnified: number;
      vacationTotal: number; // Vencidas + Prop + 1/3
      thirteenthTotal: number;
      fgtsFine: number;
  };
  meta: {
      yearsWorked: number;
      noticeDays: number;
      projectedDate: string;
  }
}

export interface HourlyData {
  monthlySalary: number;
  weeklyHours: number;
}