export const GLOSSARY: Record<string, string> = {
  // Rescisão (Existente)
  motivo_rescisao: "A razão da saída define quais direitos você recebe. Ex: 'Sem Justa Causa' dá direito a tudo + multa de 40%. 'Justa Causa' perde quase tudo.",
  salario_bruto: "O valor registrado na sua carteira de trabalho, sem descontos de INSS, Vale Transporte, etc.",
  saldo_fgts: "O valor total acumulado na sua conta do FGTS durante este contrato. Você pode consultar isso no app oficial do FGTS ou na Caixa.",
  data_admissao: "A data exata que consta na sua Carteira de Trabalho (CTPS) como início do vínculo.",
  data_saida: "O último dia efetivamente trabalhado. O sistema calculará o aviso prévio automaticamente com base nessa data e no tipo de aviso.",
  ferias_vencidas: "Marque APENAS se você trabalhou 1 ano inteiro (12 meses) e a empresa ainda NÃO te deu os 30 dias de descanso desse período.",
  dependentes: "Filhos menores de 21 anos, cônjuge ou outros dependentes declarados no Imposto de Renda. Isso reduz o desconto do IRRF.",
  aviso_previo: "Indenizado: A empresa paga 1 salário a mais e você sai na hora. Trabalhado: Você trabalha mais 30 dias (ou menos horas) antes de sair.",
  multa_fgts: "Compensação de 40% sobre todo o FGTS depositado pela empresa durante o contrato. Em caso de Acordo, a multa cai para 20%.",
  ferias_proporcionais: "Dias de férias que você acumulou no ano atual, mas ainda não completaram 12 meses para virarem 'vencidas'.",
  saldo_salario: "O pagamento referente apenas aos dias que você trabalhou no mês da demissão (ex: se saiu dia 10, recebe 10 dias).",
  inss: "Desconto obrigatório para a Previdência Social (aposentadoria). A alíquota varia de 7.5% a 14% dependendo do salário.",
  irrf: "Imposto de Renda Retido na Fonte. É um desconto sobre seus ganhos que vai para a Receita Federal.",
  tipo_aviso: "Indenizado: Você sai na hora e recebe. Trabalhado: Você trabalha os 30 dias finais. Não Cumprido: Você pediu demissão e não quis trabalhar (sofre desconto).",
  decimo_terceiro_adiantado: "Se você recebeu a primeira parcela do 13º no meio do ano, esse valor será descontado do total a receber agora.",

  // Salário Líquido
  outros_descontos: "Valores descontados diretamente na folha, como Vale Transporte (até 6%), Coparticipação em Plano de Saúde ou Pensão Alimentícia.",
  
  // Seguro Desemprego
  ultimos_salarios: "A média dos últimos 3 salários anteriores à demissão é usada para calcular o valor da parcela do seguro.",
  meses_trabalhados: "Tempo de vínculo empregatício comprovado em carteira nos últimos 36 meses.",
  quantidade_solicitacoes: "O número de parcelas (3, 4 ou 5) depende de quantas vezes você já pediu o seguro anteriormente.",
  
  // Férias
  abono_pecuniario: "Popularmente conhecido como 'vender férias'. É trocar 10 dias de descanso por dinheiro no bolso.",
  terco_constitucional: "Adicional de 1/3 (33%) sobre o valor das férias que todo trabalhador tem direito garantido pela Constituição.",
  
  // CLT vs PJ
  beneficios_mensais: "Soma de benefícios que a empresa paga além do salário: Vale Refeição, Plano de Saúde, Seguro de Vida, etc.",
  imposto_pj: "Estimativa de imposto para nota fiscal. O Simples Nacional começa em 6% para maioria dos serviços (Anexo III).",
  
  // Horas Extras
  salario_base: "Seu salário mensal registrado em carteira, sem contar benefícios.",
  adicional_hora_extra: "A porcentagem paga a mais pela hora. Geralmente 50% em dias úteis e 100% em domingos e feriados.",
  dsr: "Descanso Semanal Remunerado. Quando você faz hora extra, também recebe um valor proporcional referente ao seu dia de folga.",
  
  // Doméstico
  esocial_domestico: "Sistema onde o patrão paga os impostos. Se pago em dia, a multa de 40% do FGTS já está incluída na guia mensal (3.2%).",
  
  // FGTS
  saque_aniversario: "Modalidade onde você saca uma parte do FGTS todo ano no mês do aniversário, mas perde o direito de sacar o saldo total na demissão.",
  saque_rescisao: "Modalidade padrão. Você só saca o FGTS quando é demitido sem justa causa, aposentadoria ou compra da casa própria.",
  
  // Melhor Data
  fracao_15_dias: "Regra da CLT: Se você trabalhar 15 dias ou mais no mês, ganha o direito a 1/12 avos de férias e 13º referentes àquele mês.",
  
  // Ponto
  jornada_mensal: "Total de horas trabalhadas no mês. O padrão CLT é 220 horas (44h semanais)."
};