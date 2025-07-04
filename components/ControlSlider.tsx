
import React from 'react';

interface ControlSliderProps {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const ControlSlider: React.FC<ControlSliderProps> = ({ label, name, value, min, max, step, unit, onChange, disabled }) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center text-sm">
        <label htmlFor={label} className="font-medium text-slate-300">{label}</label>
        <span className="px-2 py-1 bg-slate-700 rounded-md text-slate-100 text-xs font-mono">
          {value.toFixed(2)} {unit}
        </span>
      </div>
      <input
        id={label}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
};

export default ControlSlider;