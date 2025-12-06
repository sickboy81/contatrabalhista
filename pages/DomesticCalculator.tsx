import React, { useState, useRef } from 'react';
import { calculateTermination, formatCurrency, calculateINSS, calculateIRRF, numberToWordsPTBR } from '../utils/calculations';
import { TerminationInputs, TerminationReason } from '../types';
import Tooltip from '../components/Tooltip';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import { Link } from 'react-router-dom';
import RelatedTools from '../components/RelatedTools';

const currentYear = new Date().getFullYear();
const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

// --- SUB-COMPONENT: MONTHLY PAYROLL (HOLERITE) ---
const MonthlyPayrollCalculator = () => {
    const [salary, setSalary] = useState(1500);
    const [transportVoucher, setTransportVoucher] = useState(0); 
    
    // Variables
    const [extra50, setExtra50] = useState(0); // hours
    const [extra100, setExtra100] = useState(0); // hours
    const [nightHours, setNightHours] = useState(0); // hours
    const [dependents, setDependents] = useState(0);
    const [daysInMonth, setDaysInMonth] = useState(30);
    const [sundaysAndHolidays, setSundaysAndHolidays] = useState(4); // For DSR

    const calculate = () => {
        const hourlyRate = salary / 220;

        // 1. Overtime
        const valExtra50 = (hourlyRate * 1.5) * extra50;
        const valExtra100 = (hourlyRate * 2.0) * extra100;
        const totalOvertime = valExtra50 + valExtra100;

        // 2. Night Shift (20% + Redução da Hora para 52m30s = ~1.1428 factor on time, but calculation usually is Rate * 1.2 * Hours)
        // Correct logic: Pay 20% over normal hour.
        const valNightShift = (hourlyRate * 0.2) * nightHours;

        // 3. DSR (Descanso Semanal Remunerado) on Overtime/Night
        // Formula: (Total Variáveis / Dias Úteis) * Domingos+Feriados
        const businessDays = daysInMonth - sundaysAndHolidays;
        const dsrValue = ((totalOvertime + valNightShift) / businessDays) * sundaysAndHolidays;

        const totalGross = salary + totalOvertime + valNightShift + dsrValue;

        // 4. Discounts (Employee Share)
        const inssEmployee = calculateINSS(totalGross);
        const irrfEmployee = calculateIRRF(totalGross - inssEmployee, dependents);
        // VT: Up to 6% of basic salary, limited to cost
        const vtDiscount = Math.min(salary * 0.06, transportVoucher); 

        const totalNet = totalGross - inssEmployee - irrfEmployee - vtDiscount;

        // 5. Employer Cost (DAE)
        // INSS Patronal (8%) + Seguro (0.8%) + FGTS (8%) + Reserva (3.2%)
        // NOTE: The DAE guide includes the EMPLOYEE's INSS and IRRF collected.
        // But the "Cost to Employer" is the sum of Employer Taxes + Gross Salary + VT Cost - Employee Discounts (kept by employer to pay DAE)
        // Easier way: Cost = Net Salary + VT Provided + DAE Total
        
        const employerTaxesBase = totalGross;
        const inssPatronal = employerTaxesBase * 0.08;
        const insurance = employerTaxesBase * 0.008;
        const fgts = employerTaxesBase * 0.08;
        const reserve = employerTaxesBase * 0.032;

        const daeTotalValue = inssPatronal + insurance + fgts + reserve + inssEmployee + irrfEmployee;
        
        const totalEmployerCost = totalNet + daeTotalValue + (transportVoucher - vtDiscount); // Net paid + Taxes paid + VT paid by employer part

        return {
            hourlyRate,
            valExtra50,
            valExtra100,
            valNightShift,
            dsrValue,
            totalGross,
            inssEmployee,
            irrfEmployee,
            vtDiscount,
            totalNet,
            dae: {
                inssPatronal,
                insurance,
                fgts,
                reserve,
                inssEmployee,
                irrfEmployee,
                total: daeTotalValue
            },
            totalEmployerCost
        };
    };

    const res = calculate();

    return (
        <div className="grid md:grid-cols-12 gap-8 items-start animate-fade-in">
             {/* Inputs */}
             <div className="md:col-span-5 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-purple-100 space-y-5">
                 <h3 className="font-bold text-gray-800 border-b pb-2">Dados do Mês</h3>
                 
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Salário Contratual</label>
                     <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400">R$</span>
                        <input type="number" className="w-full p-2 pl-10 border rounded bg-white text-gray-900 font-semibold" value={salary} onChange={e => setSalary(Number(e.target.value))} />
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Horas Extras 50%</label>
                        <input type="number" className="w-full p-2 border rounded bg-white text-gray-900" value={extra50} onChange={e => setExtra50(Number(e.target.value))} />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Horas Extras 100%</label>
                        <input type="number" className="w-full p-2 border rounded bg-white text-gray-900" value={extra100} onChange={e => setExtra100(Number(e.target.value))} />
                     </div>
                 </div>

                 <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                     <label className="block text-xs font-bold text-purple-800 mb-1">
                        <Tooltip termKey="adicional_noturno">Horas Noturnas (22h às 05h)</Tooltip>
                     </label>
                     <input type="number" className="w-full p-2 border rounded bg-white text-gray-900" value={nightHours} onChange={e => setNightHours(Number(e.target.value))} />
                     <p className="text-[10px] text-purple-600 mt-1">A hora noturna tem adicional de 20%.</p>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                     <div>
                         <label className="block text-xs text-gray-500 mb-1">Custo Vale Transporte</label>
                         <input type="number" className="w-full p-2 border rounded bg-white text-gray-900" value={transportVoucher} onChange={e => setTransportVoucher(Number(e.target.value))} />
                     </div>
                     <div>
                         <label className="block text-xs text-gray-500 mb-1">Dependentes (IR)</label>
                         <input type="number" className="w-full p-2 border rounded bg-white text-gray-900" value={dependents} onChange={e => setDependents(Number(e.target.value))} />
                     </div>
                 </div>
                 
                 <div className="pt-2 border-t">
                     <details className="text-xs text-gray-500 cursor-pointer">
                         <summary>Configuração Avançada (DSR)</summary>
                         <div className="grid grid-cols-2 gap-3 mt-2">
                             <div>
                                 <label>Dias no Mês</label>
                                 <input type="number" className="w-full p-1 border rounded bg-white text-gray-900" value={daysInMonth} onChange={e => setDaysInMonth(Number(e.target.value))} />
                             </div>
                             <div>
                                 <label>Domingos/Feriados</label>
                                 <input type="number" className="w-full p-1 border rounded bg-white text-gray-900" value={sundaysAndHolidays} onChange={e => setSundaysAndHolidays(Number(e.target.value))} />
                             </div>
                         </div>
                     </details>
                 </div>
             </div>

             {/* Results */}
             <div className="md:col-span-7 space-y-6">
                 
                 {/* Holerite Card */}
                 <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                     <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
                         <h4 className="font-bold uppercase tracking-wider text-sm">Holerite Estimado</h4>
                         <div className="text-right">
                             <p className="text-[10px] opacity-70 uppercase">Líquido a Pagar</p>
                             <p className="text-2xl font-bold text-emerald-400">{formatCurrency(res.totalNet)}</p>
                         </div>
                     </div>
                     <div className="p-4 text-sm overflow-x-auto">
                         <table className="w-full min-w-[300px]">
                             <thead>
                                 <tr className="text-xs text-gray-500 uppercase border-b">
                                     <th scope="col" className="text-left py-2">Evento</th>
                                     <th scope="col" className="text-right py-2">Vencimentos</th>
                                     <th scope="col" className="text-right py-2">Descontos</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50">
                                 <tr>
                                     <td className="py-2">Salário Base</td>
                                     <td className="text-right text-gray-700">{formatCurrency(salary)}</td>
                                     <td></td>
                                 </tr>
                                 {(res.valExtra50 > 0 || res.valExtra100 > 0) && (
                                     <tr>
                                         <td className="py-2">Horas Extras</td>
                                         <td className="text-right text-gray-700">{formatCurrency(res.valExtra50 + res.valExtra100)}</td>
                                         <td></td>
                                     </tr>
                                 )}
                                 {res.valNightShift > 0 && (
                                     <tr>
                                         <td className="py-2">Adicional Noturno</td>
                                         <td className="text-right text-gray-700">{formatCurrency(res.valNightShift)}</td>
                                         <td></td>
                                     </tr>
                                 )}
                                 {res.dsrValue > 0 && (
                                     <tr>
                                         <td className="py-2">DSR s/ Variáveis</td>
                                         <td className="text-right text-gray-700">{formatCurrency(res.dsrValue)}</td>
                                         <td></td>
                                     </tr>
                                 )}
                                 <tr>
                                     <td className="py-2 text-red-600">INSS (Funcionário)</td>
                                     <td></td>
                                     <td className="text-right text-red-600">{formatCurrency(res.inssEmployee)}</td>
                                 </tr>
                                 {res.irrfEmployee > 0 && (
                                     <tr>
                                         <td className="py-2 text-red-600">IRRF</td>
                                         <td></td>
                                         <td className="text-right text-red-600">{formatCurrency(res.irrfEmployee)}</td>
                                     </tr>
                                 )}
                                 {res.vtDiscount > 0 && (
                                     <tr>
                                         <td className="py-2 text-red-600">Vale Transporte (6%)</td>
                                         <td></td>
                                         <td className="text-right text-red-600">{formatCurrency(res.vtDiscount)}</td>
                                     </tr>
                                 )}
                             </tbody>
                         </table>
                     </div>
                 </div>

                 {/* DAE & Cost Card */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                         <h5 className="text-purple-800 font-bold text-sm mb-2">Guia DAE (eSocial)</h5>
                         <p className="text-2xl font-bold text-purple-900 mb-2">{formatCurrency(res.dae.total)}</p>
                         <ul className="text-xs text-purple-700 space-y-1">
                             <li>• FGTS (8%): {formatCurrency(res.dae.fgts)}</li>
                             <li>• Reserva (3.2%): {formatCurrency(res.dae.reserve)}</li>
                             <li>• INSS Patronal: {formatCurrency(res.dae.inssPatronal)}</li>
                             <li>• Seg. Acidente: {formatCurrency(res.dae.insurance)}</li>
                             <li className="opacity-70 pt-1 border-t border-purple-200 italic">+ INSS/IRRF do funcionário</li>
                         </ul>
                     </div>
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-center text-center">
                         <h5 className="text-gray-500 font-bold text-xs uppercase mb-1">Custo Total Real</h5>
                         <p className="text-3xl font-bold text-gray-800">{formatCurrency(res.totalEmployerCost)}</p>
                         <p className="text-xs text-gray-400 mt-2">Salário + DAE + VT</p>
                     </div>
                 </div>

             </div>
        </div>
    );
};

// --- SUB-COMPONENT: TIMESHEET GENERATOR (PONTO) ---
const TimesheetGenerator = () => {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [employer, setEmployer] = useState('');
    const [employee, setEmployee] = useState('');
    const [schedule, setSchedule] = useState({ in: '08:00', out: '17:00', lunchIn: '12:00', lunchOut: '13:00' });
    const [isGenerating, setIsGenerating] = useState(false);
    
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        if (!printRef.current) return;
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        try {
            const canvas = await html2canvas(printRef.current, { 
                scale: 2, 
                backgroundColor: '#ffffff',
                useCORS: true
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`folha-ponto-${month}-${employee.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        } catch (error) {
            console.error('Erro ao gerar PDF', error);
            alert('Houve um erro ao gerar o PDF. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    const getDaysInMonth = (y: number, m: number) => {
        return new Date(y, m, 0).getDate();
    };

    const [y, m] = month.split('-');
    const days = getDaysInMonth(parseInt(y), parseInt(m));
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
    const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const rows = [];
    for (let i = 1; i <= days; i++) {
        const d = new Date(parseInt(y), parseInt(m)-1, i);
        const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        rows.push({
            day: i,
            weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
            isWeekend
        });
    }

    return (
        <div className="animate-fade-in">
            <div className="max-w-4xl mx-auto mb-8 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-purple-100 no-print">
                <h3 className="font-bold text-gray-800 mb-4">Configurar Folha de Ponto</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <input className="border p-2 rounded bg-white text-gray-900" type="month" value={month} onChange={e => setMonth(e.target.value)} />
                    <input className="border p-2 rounded bg-white text-gray-900" placeholder="Nome do Empregador" value={employer} onChange={e => setEmployer(e.target.value)} />
                    <input className="border p-2 rounded bg-white text-gray-900" placeholder="Nome do Funcionário" value={employee} onChange={e => setEmployee(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    <input className="border p-2 rounded text-sm bg-white text-gray-900" type="time" value={schedule.in} onChange={e => setSchedule({...schedule, in: e.target.value})} />
                    <input className="border p-2 rounded text-sm bg-white text-gray-900" type="time" value={schedule.lunchIn} onChange={e => setSchedule({...schedule, lunchIn: e.target.value})} />
                    <input className="border p-2 rounded text-sm bg-white text-gray-900" type="time" value={schedule.lunchOut} onChange={e => setSchedule({...schedule, lunchOut: e.target.value})} />
                    <input className="border p-2 rounded text-sm bg-white text-gray-900" type="time" value={schedule.out} onChange={e => setSchedule({...schedule, out: e.target.value})} />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handleDownloadPdf} disabled={isGenerating} className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2">
                        {isGenerating ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/> : '📄'} 
                        Baixar PDF
                    </button>
                    <button onClick={handlePrint} className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 flex items-center justify-center gap-2">
                        🖨️ Imprimir
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Dica: A impressão sairá formatada apenas com a folha de ponto.</p>
            </div>

            {/* Printable Area */}
            <div ref={printRef} className="bg-white p-8 max-w-[210mm] mx-auto shadow-2xl print:shadow-none print:w-full print:max-w-none text-black">
                <div className="text-center border-b-2 border-black pb-4 mb-4">
                    <h1 className="text-xl font-bold uppercase text-black">Folha de Ponto Individual</h1>
                    <p className="capitalize text-black">{monthName}</p>
                </div>
                
                <div className="flex justify-between mb-4 text-sm text-black">
                    <div><strong>Empregador:</strong> {employer}</div>
                    <div><strong>Funcionário:</strong> {employee}</div>
                </div>

                <table className="w-full text-xs border-collapse border border-black text-center bg-white text-black">
                    <thead>
                        <tr className="bg-gray-100 text-black">
                            <th scope="col" className="border border-black p-1 font-bold">Dia</th>
                            <th scope="col" className="border border-black p-1 font-bold">Entrada</th>
                            <th scope="col" className="border border-black p-1 font-bold">Almoço (Ida)</th>
                            <th scope="col" className="border border-black p-1 font-bold">Almoço (Volta)</th>
                            <th scope="col" className="border border-black p-1 font-bold">Saída</th>
                            <th scope="col" className="border border-black p-1 w-32 font-bold">Assinatura</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.day} className={r.isWeekend ? 'bg-gray-200 text-black' : 'bg-white text-black'}>
                                <td className="border border-black p-1">{r.day} - {r.weekday}</td>
                                <td className="border border-black p-1 text-black">{!r.isWeekend ? schedule.in : '-'}</td>
                                <td className="border border-black p-1 text-black">{!r.isWeekend ? schedule.lunchIn : '-'}</td>
                                <td className="border border-black p-1 text-black">{!r.isWeekend ? schedule.lunchOut : '-'}</td>
                                <td className="border border-black p-1 text-black">{!r.isWeekend ? schedule.out : '-'}</td>
                                <td className="border border-black p-1"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="mt-8 flex justify-between text-sm pt-8 text-black">
                    <div className="text-center w-1/3 border-t border-black pt-2">
                        Assinatura do Empregador
                    </div>
                    <div className="text-center w-1/3 border-t border-black pt-2">
                        Assinatura do Funcionário
                    </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-4 text-center no-print">
                    * Preenchimento automático com horários sugeridos. O funcionário deve conferir e assinar.
                </p>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: VACATION & 13th SIMULATOR ---
const Vacation13thSimulator = () => {
    const [type, setType] = useState<'vacation' | '13th'>('13th');
    const [salary, setSalary] = useState(1500);
    const [monthsWorked, setMonthsWorked] = useState(12);
    const [dependents, setDependents] = useState(0); 
    const [sell10Days, setSell10Days] = useState(false);
    
    // Receipt Config
    const [employerName, setEmployerName] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    // --- Calculations ---
    const calculate13th = () => {
        const gross13th = salary * (monthsWorked / 12);
        const firstInstallment = gross13th / 2;
        
        // 2nd installment discounts taxes based on TOTAL 13th
        const inss = calculateINSS(gross13th);
        const irrf = calculateIRRF(gross13th - inss, dependents);
        
        const secondInstallment = gross13th - firstInstallment - inss - irrf;
        
        return { gross13th, firstInstallment, inss, irrf, secondInstallment };
    };

    const calculateVacation = () => {
        const daysVacation = sell10Days ? 20 : 30;
        const daysSold = sell10Days ? 10 : 0;
        
        const vacationPay = (salary / 30) * daysVacation;
        const vacationThird = vacationPay / 3;
        const grossTaxable = vacationPay + vacationThird;
        
        const inss = calculateINSS(grossTaxable);
        const irrf = calculateIRRF(grossTaxable - inss, dependents);
        
        const abono = (salary / 30) * daysSold;
        const abonoThird = abono / 3;
        const totalAbono = abono + abonoThird; // Exempt
        
        const totalNet = (grossTaxable - inss - irrf) + totalAbono;
        
        return { vacationPay, vacationThird, grossTaxable, inss, irrf, abono, abonoThird, totalAbono, totalNet };
    };

    const res13th = calculate13th();
    const resVacation = calculateVacation();

    const handleDownloadPdf = async () => {
        if (!receiptRef.current) return;
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        try {
            const canvas = await html2canvas(receiptRef.current, { 
                scale: 2, 
                backgroundColor: '#ffffff',
                useCORS: true
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`recibo-${type}-${employeeName.replace(/\s+/g, '-').toLowerCase() || 'funcionario'}.pdf`);
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-xl border border-purple-100 animate-fade-in">
            {/* Header Tabs */}
            <div className="flex gap-4 mb-8 justify-center no-print">
                <button onClick={() => setType('13th')} className={`px-4 md:px-6 py-2 rounded-lg font-bold transition-all text-sm md:text-base ${type === '13th' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>13º Salário</button>
                <button onClick={() => setType('vacation')} className={`px-4 md:px-6 py-2 rounded-lg font-bold transition-all text-sm md:text-base ${type === 'vacation' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Férias</button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Inputs */}
                <div className="lg:col-span-5 space-y-5 no-print">
                     <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                         <h3 className="font-bold text-purple-900 mb-4 border-b border-purple-200 pb-2">Dados para Cálculo</h3>
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm text-gray-600 mb-1">Salário Mensal</label>
                                 <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                                    <input className="w-full p-2 pl-10 border rounded bg-white text-gray-900 font-semibold" type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} />
                                 </div>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-3">
                                 {type === '13th' && (
                                     <div>
                                         <label className="block text-sm text-gray-600 mb-1">Meses Trabalhados</label>
                                         <input className="w-full p-2 border rounded bg-white text-gray-900" type="number" max={12} min={1} value={monthsWorked} onChange={e => setMonthsWorked(Number(e.target.value))} />
                                     </div>
                                 )}
                                 <div>
                                      <label className="block text-sm text-gray-600 mb-1">Dependentes (IR)</label>
                                      <input className="w-full p-2 border rounded bg-white text-gray-900" type="number" min={0} value={dependents} onChange={e => setDependents(Number(e.target.value))} />
                                 </div>
                             </div>

                             {type === 'vacation' && (
                                <div className="flex items-center gap-2 bg-white p-3 rounded border border-purple-200">
                                     <input type="checkbox" id="abono" checked={sell10Days} onChange={e => setSell10Days(e.target.checked)} className="rounded text-purple-600 w-5 h-5 shrink-0" />
                                     <label htmlFor="abono" className="text-sm text-gray-700 cursor-pointer select-none">Vender 10 dias (Abono Pecuniário)</label>
                                </div>
                             )}
                         </div>
                     </div>

                     <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                         <h3 className="font-bold text-gray-700 mb-4 border-b border-gray-200 pb-2">Personalizar Recibo</h3>
                         <div className="space-y-3">
                             <input className="w-full p-2 border rounded bg-white text-gray-900 text-sm" placeholder="Nome do Empregador" value={employerName} onChange={e => setEmployerName(e.target.value)} />
                             <input className="w-full p-2 border rounded bg-white text-gray-900 text-sm" placeholder="Nome do Funcionário" value={employeeName} onChange={e => setEmployeeName(e.target.value)} />
                         </div>
                     </div>

                     <button onClick={handleDownloadPdf} disabled={isGenerating} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-md flex items-center justify-center gap-2">
                         {isGenerating ? 'Gerando...' : '📄 Baixar Recibo em PDF'}
                     </button>
                </div>

                {/* Right: Receipt Preview */}
                <div className="lg:col-span-7">
                    <div className="bg-gray-200 p-4 rounded-xl overflow-hidden flex justify-center overflow-x-auto">
                        <div ref={receiptRef} className="bg-white w-full min-w-[210mm] max-w-[210mm] p-8 shadow-2xl text-black font-sans text-sm relative shrink-0">
                             {/* Border decoration */}
                             <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
                                 <div>
                                     <h1 className="text-xl font-bold uppercase text-black">Recibo de {type === '13th' ? '13º Salário' : 'Férias'}</h1>
                                     <p className="text-xs text-gray-500 uppercase">{employerName || 'Empregador'}</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-xs text-gray-400">Data de Emissão</p>
                                     <p className="font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
                                 </div>
                             </div>

                             {/* Employee Info */}
                             <div className="bg-gray-50 p-3 mb-6 border border-gray-200 rounded">
                                 <p className="text-xs text-gray-500 uppercase font-bold">Funcionário</p>
                                 <p className="font-bold text-lg">{employeeName || 'Nome do Funcionário'}</p>
                             </div>

                             {/* Table */}
                             <table className="w-full mb-6 border-collapse">
                                 <thead>
                                     <tr className="bg-gray-100 border-y border-black text-xs uppercase">
                                         <th scope="col" className="py-2 text-left pl-2">Descrição</th>
                                         <th scope="col" className="py-2 text-right">Referência</th>
                                         <th scope="col" className="py-2 text-right">Vencimentos</th>
                                         <th scope="col" className="py-2 text-right pr-2">Descontos</th>
                                     </tr>
                                 </thead>
                                 <tbody className="text-xs">
                                     {type === '13th' ? (
                                         <>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pl-2">13º Salário Integral</td>
                                                <td className="text-right">{monthsWorked}/12 avos</td>
                                                <td className="text-right text-gray-800 font-bold">{formatCurrency(res13th.gross13th)}</td>
                                                <td className="text-right pr-2"></td>
                                            </tr>
                                            <tr className="border-b border-gray-100 text-gray-500">
                                                <td className="py-2 pl-2">(-) Adiantamento 1ª Parcela</td>
                                                <td className="text-right">50%</td>
                                                <td className="text-right"></td>
                                                <td className="text-right pr-2">{formatCurrency(res13th.firstInstallment)}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100 text-red-600">
                                                <td className="py-2 pl-2">INSS sobre 13º</td>
                                                <td className="text-right"></td>
                                                <td className="text-right"></td>
                                                <td className="text-right pr-2">{formatCurrency(res13th.inss)}</td>
                                            </tr>
                                            {res13th.irrf > 0 && (
                                                <tr className="border-b border-gray-100 text-red-600">
                                                    <td className="py-2 pl-2">IRRF sobre 13º</td>
                                                    <td className="text-right"></td>
                                                    <td className="text-right"></td>
                                                    <td className="text-right pr-2">{formatCurrency(res13th.irrf)}</td>
                                                </tr>
                                            )}
                                         </>
                                     ) : (
                                         <>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pl-2">Férias Gozadas</td>
                                                <td className="text-right">{sell10Days ? '20' : '30'} dias</td>
                                                <td className="text-right text-gray-800 font-bold">{formatCurrency(resVacation.vacationPay)}</td>
                                                <td className="text-right pr-2"></td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 pl-2">1/3 Constitucional Férias</td>
                                                <td className="text-right">33.33%</td>
                                                <td className="text-right text-gray-800 font-bold">{formatCurrency(resVacation.vacationThird)}</td>
                                                <td className="text-right pr-2"></td>
                                            </tr>
                                            {sell10Days && (
                                                <>
                                                    <tr className="border-b border-gray-100 bg-green-50/50">
                                                        <td className="py-2 pl-2 text-green-800">Abono Pecuniário (Venda)</td>
                                                        <td className="text-right text-green-800">10 dias</td>
                                                        <td className="text-right text-green-800 font-bold">{formatCurrency(resVacation.abono)}</td>
                                                        <td className="text-right pr-2"></td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100 bg-green-50/50">
                                                        <td className="py-2 pl-2 text-green-800">1/3 do Abono</td>
                                                        <td className="text-right text-green-800">33.33%</td>
                                                        <td className="text-right text-green-800 font-bold">{formatCurrency(resVacation.abonoThird)}</td>
                                                        <td className="text-right pr-2"></td>
                                                    </tr>
                                                </>
                                            )}
                                            <tr className="border-b border-gray-100 text-red-600">
                                                <td className="py-2 pl-2">INSS s/ Férias</td>
                                                <td className="text-right"></td>
                                                <td className="text-right"></td>
                                                <td className="text-right pr-2">{formatCurrency(resVacation.inss)}</td>
                                            </tr>
                                            {resVacation.irrf > 0 && (
                                                <tr className="border-b border-gray-100 text-red-600">
                                                    <td className="py-2 pl-2">IRRF s/ Férias</td>
                                                    <td className="text-right"></td>
                                                    <td className="text-right"></td>
                                                    <td className="text-right pr-2">{formatCurrency(resVacation.irrf)}</td>
                                                </tr>
                                            )}
                                         </>
                                     )}
                                 </tbody>
                                 <tfoot className="border-t-2 border-black font-bold">
                                     <tr className="bg-gray-100">
                                         <td colSpan={2} className="py-3 pl-2 text-right uppercase">Total Líquido a Receber</td>
                                         <td colSpan={2} className="py-3 pr-2 text-right text-xl">
                                             {formatCurrency(type === '13th' ? res13th.secondInstallment : resVacation.totalNet)}
                                         </td>
                                     </tr>
                                 </tfoot>
                             </table>

                             {type === '13th' && (
                                 <div className="text-[10px] text-gray-500 mb-6">
                                     * O valor líquido acima refere-se à <strong>2ª parcela</strong> (paga até 20/12), já descontando o adiantamento e os impostos totais. A 1ª parcela ({formatCurrency(res13th.firstInstallment)}) deve ter sido paga até 30/11 sem descontos.
                                 </div>
                             )}

                             <div className="mt-12 pt-4 border-t border-black flex justify-between items-end">
                                 <div className="text-center w-1/2 pr-4">
                                     <div className="h-px bg-black w-full mb-1"></div>
                                     <p className="text-[10px] uppercase font-bold">{employerName || 'Assinatura Empregador'}</p>
                                 </div>
                                 <div className="text-center w-1/2 pl-4">
                                     <div className="h-px bg-black w-full mb-1"></div>
                                     <p className="text-[10px] uppercase font-bold">{employeeName || 'Assinatura Funcionário'}</p>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- SUB-COMPONENT: TRAVEL CALCULATOR ---
const TravelCalculator = () => {
    const [salary, setSalary] = useState(1500);
    const [travelHours, setTravelHours] = useState(8);
    const [travelDays, setTravelDays] = useState(1);

    const calculate = () => {
        const hourlyRate = salary / 220;
        const travelHourlyRate = hourlyRate * 1.25; // +25%
        const totalTravelPay = travelHourlyRate * travelHours * travelDays;
        
        return { hourlyRate, travelHourlyRate, totalTravelPay };
    };

    const res = calculate();

    return (
        <div className="bg-white p-4 md:p-6 rounded-xl border border-purple-100 animate-fade-in">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Cálculo de Viagem (Adicional 25%)</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Salário Mensal</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                            <input className="w-full p-2 pl-10 border rounded bg-white text-gray-900 font-semibold" type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Dias de Viagem</label>
                            <input className="w-full p-2 border rounded bg-white text-gray-900" type="number" value={travelDays} onChange={e => setTravelDays(Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Horas Trab./Dia</label>
                            <input className="w-full p-2 border rounded bg-white text-gray-900" type="number" value={travelHours} onChange={e => setTravelHours(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
                        <p>A Lei Complementar 150/2015 determina que a hora trabalhada em viagem deve ser paga com adicional de, no mínimo, <strong>25%</strong> sobre a hora normal.</p>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl flex flex-col justify-center items-center text-center border border-gray-200">
                    <p className="text-sm text-gray-500 uppercase font-bold mb-2">Valor Total a Pagar</p>
                    <p className="text-3xl font-bold text-purple-700">{formatCurrency(res.totalTravelPay)}</p>
                    <div className="mt-4 text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-200 w-full">
                        <p>Valor da Hora Normal: {formatCurrency(res.hourlyRate)}</p>
                        <p>Valor da Hora Viagem: {formatCurrency(res.travelHourlyRate)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT: DOMESTIC CALCULATOR ---
const DomesticCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'termination' | 'vacation' | 'timesheet' | 'travel'>('monthly');

  // TERMINATION STATE
  const [inputs, setInputs] = useState<TerminationInputs>({
    salary: 1500,
    startDate: '2023-01-01',
    endDate: new Date().toISOString().split('T')[0],
    reason: TerminationReason.DISMISSAL_NO_CAUSE,
    noticeType: 'Indenizado', 
    vacationOverdueDays: 0,
    fgtsBalance: 0,
    dependents: 0,
    thirteenthAdvanced: false
  } as any);

  const [paidEsocial, setPaidEsocial] = useState(true);
  const [result, setResult] = useState<any>(null);

  const handleCalculateTermination = () => {
    const rawResult = calculateTermination(inputs);
    let adjustedResult = { ...rawResult };
    
    if (paidEsocial && inputs.reason === TerminationReason.DISMISSAL_NO_CAUSE) {
        adjustedResult.fgtsFine = 0; // Already paid monthly
    }
    setResult(adjustedResult);
  };

  const faqItems = [
    {
        question: "Empregada doméstica tem direito a FGTS?",
        answer: "Sim. Desde a PEC das Domésticas (2015), o recolhimento do FGTS (8%) é obrigatório e deve ser pago mensalmente pelo empregador através da guia DAE do eSocial."
    },
    {
        question: "Como funciona o banco de horas para doméstica?",
        answer: "É permitido o regime de compensação de horas (banco de horas). O excesso de horas de um dia pode ser compensado em outro dia. Se a compensação ocorrer no mesmo mês, não há acréscimo. Se for em até 1 ano, deve haver acordo escrito."
    },
    {
        question: "O patrão paga multa de 40% se pagar o DAE em dia?",
        answer: "Não. Na guia mensal do DAE, o empregador já paga 3,2% referente à antecipação da multa rescisória (Reserva Indenizatória). Se a doméstica for demitida sem justa causa, ela saca esse valor acumulado. O patrão não precisa pagar os 40% de uma vez na rescisão, pois já foi pagando aos poucos."
    },
    {
        question: "Posso descontar alimentação e moradia?",
        answer: "Regra geral: <strong>Não</strong>. A lei proíbe descontos por alimentação, vestuário, moradia e higiene, pois entende-se que são fornecidos para viabilizar o trabalho. Exceção: Se a moradia for em local diverso do trabalho (ex: alugar uma casa para ela) e houver acordo escrito, pode haver desconto limitado."
    },
    {
        question: "Falta injustificada desconta o DSR?",
        answer: "Sim. Se a doméstica faltar sem justificativa legal (atestado médico, etc) e não cumprir a jornada semanal integralmente, o patrão pode descontar o dia da falta E TAMBÉM o valor do Descanso Semanal Remunerado (domingo)."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <SEO 
        title={`Calculadora Empregada Doméstica ${currentYear} - Rescisão e Holerite`}
        description={`Ferramentas completas para patrões e domésticas ${currentYear}. Calcule rescisão, férias, 13º, horas extras e custo mensal com eSocial e INSS.`}
        keywords="calculadora empregada doméstica, rescisão domestica, calculo ferias domestica, esocial domestico, custo empregada"
        ratingValue={4.8}
        reviewCount={320}
      />

      <div className="text-center mb-8 no-print">
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-2">
            Hub do <span className="text-purple-600">Empregador Doméstico</span>
        </h1>
        <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
            Todas as ferramentas para estar em dia com a Lei Complementar 150 (PEC das Domésticas).
        </p>
        <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <span>★★★★★</span>
            <span className="text-slate-400 text-xs ml-1">(4.8/5)</span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex justify-start md:justify-center mb-8 gap-2 overflow-x-auto pb-2 no-print hide-scrollbar pl-2 md:pl-0">
          {[
              { id: 'monthly', label: '💰 Holerite & DAE' },
              { id: 'termination', label: '❌ Rescisão' },
              { id: 'vacation', label: '🏖️ Férias & 13º' },
              { id: 'timesheet', label: '📅 Folha de Ponto' },
              { id: 'travel', label: '✈️ Viagem' },
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap border ${activeTab === tab.id ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50'}`}
              >
                {tab.label}
              </button>
          ))}
      </div>

      {/* CONTENT AREA */}
      <div className="mb-12">
          
          {/* TAB 1: MONTHLY COST */}
          {activeTab === 'monthly' && (
              <MonthlyPayrollCalculator />
          )}

          {/* TAB 2: VACATION & 13th */}
          {activeTab === 'vacation' && (
              <Vacation13thSimulator />
          )}

          {/* TAB 3: TIMESHEET */}
          {activeTab === 'timesheet' && (
              <TimesheetGenerator />
          )}

          {/* TAB 4: TRAVEL */}
          {activeTab === 'travel' && (
              <TravelCalculator />
          )}

          {/* TAB 5: TERMINATION */}
          {activeTab === 'termination' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                {/* Form */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white p-4 md:p-8 rounded-2xl shadow-soft border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                            Dados da Rescisão
                        </h2>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Motivo</label>
                                <select 
                                    className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-700"
                                    value={inputs.reason}
                                    onChange={(e) => setInputs({...inputs, reason: e.target.value as TerminationReason})}
                                >
                                    {Object.values(TerminationReason).map(r => (
                                    <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Data Início</label>
                                <input type="date" className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none" value={inputs.startDate} onChange={e => setInputs({...inputs, startDate: e.target.value})} />
                                </div>
                                <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Data Saída</label>
                                <input type="date" className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none" value={inputs.endDate} onChange={e => setInputs({...inputs, endDate: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Salário Mensal</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-slate-400 font-medium">R$</span>
                                    <input type="number" className="w-full p-3 pl-10 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-800" value={inputs.salary} onChange={e => setInputs({...inputs, salary: Number(e.target.value)})} />
                                </div>
                            </div>

                            {inputs.reason === TerminationReason.DISMISSAL_NO_CAUSE && (
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <div className="flex items-start gap-3">
                                        <div className="flex items-center h-5">
                                            <input 
                                                type="checkbox" 
                                                id="esocial" 
                                                checked={paidEsocial} 
                                                onChange={e => setPaidEsocial(e.target.checked)}
                                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                            />
                                        </div>
                                        <label htmlFor="esocial" className="text-sm text-gray-800 cursor-pointer">
                                            <strong><Tooltip termKey="esocial_domestico">O DAE (eSocial) foi pago em dia?</Tooltip></strong>
                                            <p className="text-xs text-gray-500 mt-1">Isso significa que a Reserva Indenizatória (3.2%) foi recolhida mensalmente, dispensando a multa de 40% na rescisão.</p>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <button onClick={handleCalculateTermination} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-[0.98]">
                                Calcular Rescisão
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-5">
                    <div className="sticky top-24">
                        {!result ? (
                            <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 text-center flex flex-col items-center justify-center min-h-[300px]">
                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                </div>
                                <p className="text-slate-400 text-sm">Preencha os dados da rescisão.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in-up">
                                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                                    <div className="bg-purple-900 text-white p-6 text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-800 to-purple-900 z-0"></div>
                                        <div className="relative z-10">
                                            <p className="text-purple-200 text-xs uppercase tracking-widest font-bold mb-1">Custo Total da Rescisão</p>
                                            <p className="text-4xl font-bold">{formatCurrency(result.totalNet)}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-3 text-sm">
                                        <div className="flex justify-between border-b border-slate-50 pb-2">
                                            <span className="text-slate-600">Saldo Salário ({Math.round(result.salaryBalance/(inputs.salary/30))} dias)</span>
                                            <span className="font-medium text-slate-900">{formatCurrency(result.salaryBalance)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-50 pb-2">
                                            <span className="text-slate-600">Férias (+1/3)</span>
                                            <span className="font-medium text-slate-900">{formatCurrency(result.vacationProportional + result.vacationThird + result.vacationDue)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-50 pb-2">
                                            <span className="text-slate-600">13º Proporcional</span>
                                            <span className="font-medium text-slate-900">{formatCurrency(result.thirteenthProportional)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-50 pb-2">
                                            <span className="text-slate-600">Aviso Prévio</span>
                                            <span className="font-medium text-slate-900">{formatCurrency(result.noticeWarning)}</span>
                                        </div>
                                        
                                        <div className={`p-3 rounded-lg mt-2 ${result.fgtsFine === 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                            <div className="flex justify-between font-bold">
                                                <span>Multa FGTS (Rescisão)</span>
                                                <span>
                                                    {result.fgtsFine === 0 ? 'R$ 0,00 (Isento)' : formatCurrency(result.fgtsFine)}
                                                </span>
                                            </div>
                                            <p className="text-xs mt-1 opacity-80">
                                                {result.fgtsFine === 0 
                                                    ? 'Isento pois a reserva de 3.2% foi paga mensalmente via DAE.'
                                                    : 'Atenção: Se não pagou o DAE corretamente, o custo é alto.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              </div>
          )}
      </div>

      {/* SEO CONTENT SECTION */}
      <section className="mt-12 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed no-print">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900">Guia Essencial: PEC das Domésticas e eSocial {currentYear}</h2>
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Atualizado: {currentMonthName}/{currentYear}
             </span>
           </div>
           
           <div className="space-y-4">
               <p>
                   A Lei Complementar 150/2015, conhecida como PEC das Domésticas, equiparou os direitos dos trabalhadores domésticos aos demais trabalhadores urbanos e rurais, trazendo obrigações importantes para o empregador.
               </p>
               
               <h3 className="text-lg font-bold text-purple-700 mt-6 mb-2">O que deve ser pago mensalmente?</h3>
               <p>O empregador deve emitir a guia DAE (Documento de Arrecadação do eSocial) que engloba:</p>
               <ul className="list-disc pl-5 space-y-1">
                   <li><strong>FGTS:</strong> 8% do salário (reserva do trabalhador).</li>
                   <li><strong>Reserva Indenizatória:</strong> 3,2% (antecipação da multa rescisória).</li>
                   <li><strong>Seguro Acidente (GILRAT):</strong> 0,8%.</li>
                   <li><strong>INSS Patronal:</strong> 8%.</li>
                   <li><strong>INSS do Empregado:</strong> Descontado do salário (7.5% a 14%).</li>
               </ul>
           </div>
       </section>

       <section className="mt-8 bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed no-print">
           <h2 className="text-2xl font-bold text-slate-900 mb-6">Descontos no Salário: O que é permitido?</h2>
           <p className="mb-4">
               Uma das maiores dúvidas dos patrões é sobre o que pode ser descontado do salário da empregada. A regra geral é protetiva, mas existem exceções:
           </p>
           
           <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                   <h3 className="font-bold text-red-800 mb-2">🚫 PROIBIDO DESCONTAR</h3>
                   <ul className="text-sm text-red-700 space-y-2 list-disc pl-4">
                       <li><strong>Alimentação:</strong> Fornecida no local de trabalho.</li>
                       <li><strong>Vestuário e Higiene:</strong> Produtos de limpeza, uniforme e itens de higiene pessoal.</li>
                       <li><strong>Moradia (Regra Geral):</strong> Se a moradia for indispensável para o trabalho (caseiros em sítios), não pode descontar.</li>
                   </ul>
               </div>

               <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                   <h3 className="font-bold text-green-800 mb-2">✅ PERMITIDO DESCONTAR</h3>
                   <ul className="text-sm text-green-700 space-y-2 list-disc pl-4">
                       <li><strong>Vale Transporte:</strong> Até 6% do salário base (se a funcionária utilizar).</li>
                       <li><strong>Faltas e Atrasos:</strong> Dias não trabalhados sem justificativa legal.</li>
                       <li><strong>INSS:</strong> A parte do empregado (7.5% a 14%).</li>
                       <li><strong>Adiantamentos:</strong> Comprovados por recibo.</li>
                       <li><strong>Danos:</strong> Apenas se houver dolo (intenção) ou se previsto em contrato (culpa).</li>
                   </ul>
               </div>
           </div>
       </section>

      <RelatedTools current="/domestico" />
      <FAQ items={faqItems} />
    </div>
  );
};

export default DomesticCalculator;