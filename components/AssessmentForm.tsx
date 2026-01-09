
import React, { useState } from 'react';
import { PCOSAssessmentData } from '../types';

interface AssessmentFormProps {
  onSubmit: (data: PCOSAssessmentData) => void;
  isLoading: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PCOSAssessmentData>({
    age: 24,
    weight: 65,
    height: 165,
    bmi: 23.88,
    bloodGroup: 'O+',
    pulseRate: 72,
    cycleLength: 30,
    cycleStatus: 'Regular',
    pregnant: false,
    weightGain: true,
    hairGrowth: false,
    skinDarkening: false,
    hairLoss: false,
    pimples: true,
    fastFood: true,
    exercise: false,
    waistHipRatio: 0.8,
    fsh: 4.8,
    lh: 10.2,
    tsh: 2.1,
    amh: 3.5,
    prolactin: 15.0,
    vitaminD3: 20.0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? Number(value) : value);
    
    setFormData(prev => {
      const updated = { ...prev, [name]: val };
      if (name === 'weight' || name === 'height') {
        const w = name === 'weight' ? Number(val) : prev.weight;
        const h = (name === 'height' ? Number(val) : prev.height) / 100;
        updated.bmi = h > 0 ? Number((w / (h * h)).toFixed(2)) : 0;
      }
      return updated;
    });
  };

  const InputField = ({ label, name, type = "number", step = "1", options = null }: any) => (
    <div className="space-y-2">
      <label className="text-xs font-black text-gray-900 uppercase tracking-widest">{label}</label>
      {options ? (
        <div className="relative">
          <select 
            name={name} 
            value={(formData as any)[name]} 
            onChange={handleChange} 
            className="w-full p-4 bg-white border-2 border-gray-200 focus:border-pink-500 rounded-2xl outline-none font-black text-black text-lg transition-all appearance-none cursor-pointer"
          >
            {options.map((opt: string) => <option key={opt} value={opt} className="text-black">{opt}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
        </div>
      ) : (
        <input 
          type={type} 
          step={step} 
          name={name} 
          value={(formData as any)[name]} 
          onChange={handleChange} 
          className="w-full p-4 bg-white border-2 border-gray-200 focus:border-pink-500 rounded-2xl outline-none font-black text-black text-lg transition-all"
        />
      )}
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-12 bg-white p-8 lg:p-16 rounded-[3rem] shadow-xl border border-pink-100 max-w-5xl mx-auto mb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Physical Metrics */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-xl shadow-sm">👤</div>
            <h3 className="text-2xl font-black text-black tracking-tighter">Biometric Data</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Age" name="age" />
            <InputField label="Blood Group" name="bloodGroup" options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} />
            <InputField label="Weight (kg)" name="weight" step="0.1" />
            <InputField label="Height (cm)" name="height" />
          </div>

          <div className="p-6 bg-black rounded-[2rem] shadow-lg text-center text-white">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-70 block mb-1">Live BMI Calculation</span>
             <span className="text-5xl font-black italic">{formData.bmi}</span>
          </div>
        </div>

        {/* Clinical Profile */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl shadow-sm">🔬</div>
            <h3 className="text-2xl font-black text-black tracking-tighter">Lab Values</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <InputField label="FSH (mIU/mL)" name="fsh" step="0.01" />
            <InputField label="LH (mIU/mL)" name="lh" step="0.01" />
            <InputField label="AMH (ng/mL)" name="amh" step="0.01" />
            <InputField label="TSH (mIU/L)" name="tsh" step="0.01" />
            <InputField label="Prolactin (ng/mL)" name="prolactin" step="0.01" />
            <InputField label="Vit D3 (ng/mL)" name="vitaminD3" step="0.01" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Cycle Info */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl shadow-sm">📅</div>
            <h3 className="text-2xl font-black text-black tracking-tighter">Cycle Metrics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Status" name="cycleStatus" options={['Regular', 'Irregular']} />
            <InputField label="Avg Days" name="cycleLength" />
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-xl shadow-sm">⚠️</div>
            <h3 className="text-2xl font-black text-black tracking-tighter">Physical Markers</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'weightGain', label: 'Weight Gain' },
              { id: 'hairGrowth', label: 'Hirsutism' },
              { id: 'hairLoss', label: 'Hair Loss' },
              { id: 'pimples', label: 'Acne' },
              { id: 'skinDarkening', label: 'Darkening' },
              { id: 'fastFood', label: 'Fast Food' }
            ].map(item => (
              <label key={item.id} className="flex items-center gap-3 p-3 bg-white border-2 border-gray-100 hover:border-pink-500 rounded-xl cursor-pointer transition-all">
                <input 
                  type="checkbox" 
                  name={item.id} 
                  checked={(formData as any)[item.id]} 
                  onChange={handleChange} 
                  className="w-5 h-5 accent-pink-600" 
                />
                <span className="text-xs font-black text-black uppercase tracking-tight">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-6 bg-pink-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-black transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? 'ANALYZING CLINICAL DATA...' : 'SUBMIT ASSESSMENT'}
        </button>
      </div>
    </form>
  );
};

export default AssessmentForm;
