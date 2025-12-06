import React, { useState, useEffect } from 'react';
import { HourlyData } from '../types';
import { formatCurrency } from '../utils/calculations';

const HourlyWidget: React.FC = () => {
  const [data, setData] = useState<HourlyData>({ monthlySalary: 0, weeklyHours: 44 });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hourlyData');
    if (saved) {
      setData(JSON.parse(saved));
    } else {
        setIsOpen(true); // Open by default if no data
    }
  }, []);

  const save = (newData: HourlyData) => {
    setData(newData);
    localStorage.setItem('hourlyData', JSON.stringify(newData));
  };

  const calculateRates = () => {
    if (data.monthlySalary === 0) return null;
    const weeklyHours = data.weeklyHours || 44;
    const monthlyHours = weeklyHours * 5; // Approx 5 weeks or 220 rule often used
    const hourRate = data.monthlySalary / 220; // CLT standard divisor
    const minuteRate = hourRate / 60;
    
    return { hourRate, minuteRate };
  };

  const rates = calculateRates();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end print:hidden">
      {isOpen && (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 mb-4 w-72 animate-fade-in-up">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800 text-sm">Quanto vale sua hora?</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Salário Mensal (R$)</label>
              <input 
                type="number" 
                className="w-full border rounded px-2 py-1 text-sm bg-white"
                value={data.monthlySalary || ''}
                onChange={(e) => save({ ...data, monthlySalary: Number(e.target.value) })}
                placeholder="Ex: 3000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Horas Semanais</label>
              <input 
                type="number" 
                className="w-full border rounded px-2 py-1 text-sm bg-white"
                value={data.weeklyHours}
                onChange={(e) => save({ ...data, weeklyHours: Number(e.target.value) })}
                placeholder="44"
              />
            </div>
            {rates && (
              <div className="bg-brand-50 p-2 rounded text-center">
                <p className="text-xs text-brand-600 font-semibold">Sua hora vale: {formatCurrency(rates.hourRate)}</p>
                <p className="text-[10px] text-brand-400">Seu minuto vale: {formatCurrency(rates.minuteRate)}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-brand-600 text-white p-3 rounded-full shadow-lg hover:bg-brand-700 transition-colors flex items-center justify-center w-12 h-12"
          title="Quanto vale seu tempo?"
        >
          <span className="font-bold">$</span>
        </button>
      )}
    </div>
  );
};

export default HourlyWidget;