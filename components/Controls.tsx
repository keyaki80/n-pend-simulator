import React from 'react';
import ControlSlider from './ControlSlider';
import { PendulumParameters, PendulumState } from '../types';

interface ControlsProps {
  params: PendulumParameters;
  setParams: React.Dispatch<React.SetStateAction<PendulumParameters>>;
  initialState: PendulumState;
  setInitialState: React.Dispatch<React.SetStateAction<PendulumState>>;
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onRandomize: () => void;
  showTrace: boolean;
  setShowTrace: (show: boolean) => void;
  showRods: boolean;
  setShowRods: (show: boolean) => void;
  pendulumCount: number;
  setPendulumCount: (count: number) => void;
}

const Controls: React.FC<ControlsProps> = ({
  params,
  setParams,
  initialState,
  setInitialState,
  isRunning,
  onStartPause,
  onReset,
  onRandomize,
  showTrace,
  setShowTrace,
  showRods,
  setShowRods,
  pendulumCount,
  setPendulumCount,
}) => {
  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, type: 'masses' | 'lengths') => {
    const { value } = e.target;
    setParams(prev => {
      const newValues = [...prev[type]];
      newValues[index] = parseFloat(value);
      return { ...prev, [type]: newValues };
    });
  };

  const handleInitialStateChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    const angleInRad = parseFloat(value) * (Math.PI / 180);
    setInitialState(prev => {
        const newThetas = [...prev.thetas];
        newThetas[index] = angleInRad;
        return { ...prev, thetas: newThetas };
    });
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-center text-white mb-2">Controls</h2>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onStartPause}
          className="w-full px-4 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={onReset}
          className="w-full px-4 py-3 bg-fuchsia-500 text-white font-bold rounded-lg hover:bg-fuchsia-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-opacity-75"
        >
          Reset
        </button>
      </div>
      
       <div>
        <button
            onClick={onRandomize}
            disabled={isRunning}
            className="w-full px-4 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
            Randomize Parameters
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-slate-700/50 p-3 rounded-lg space-y-3">
          <label htmlFor="showTrace" className="flex items-center justify-between cursor-pointer">
            <span className="font-medium text-slate-300">Show Trace</span>
            <div className="relative">
              <input type="checkbox" id="showTrace" className="sr-only peer" checked={showTrace} onChange={(e) => setShowTrace(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </div>
          </label>
          <label htmlFor="showRods" className="flex items-center justify-between cursor-pointer">
            <span className="font-medium text-slate-300">Show Rods</span>
            <div className="relative">
              <input type="checkbox" id="showRods" className="sr-only peer" checked={showRods} onChange={(e) => setShowRods(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </div>
          </label>
        </div>
         <ControlSlider label="Number of Pendulums" name="pendulumCount" value={pendulumCount} min={1} max={7} step={1} unit="" onChange={(e) => setPendulumCount(parseInt(e.target.value, 10))} disabled={isRunning} />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2 mb-4">Initial Angles</h3>
        <div className="space-y-4">
          {Array.from({ length: pendulumCount }).map((_, i) => (
             <ControlSlider key={`theta-${i}`} label={`Theta ${i + 1}`} name={`theta${i}`} value={initialState.thetas[i] * (180 / Math.PI)} min={-180} max={180} step={1} unit="°" onChange={(e) => handleInitialStateChange(e, i)} disabled={isRunning} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2 mb-4">Physical Parameters</h3>
        <div className="space-y-6">
          {Array.from({ length: pendulumCount }).map((_, i) => (
            <div key={`param-group-${i}`} className="p-4 rounded-lg bg-slate-900/70 border border-slate-700 space-y-4">
              <p className="text-base font-bold text-slate-300 text-center">Pendulum {i + 1}</p>
              <ControlSlider 
                key={`m-${i}`} 
                label={`Mass`} 
                name={`m${i}`} 
                value={params.masses[i]} 
                min={1} max={50} 
                step={1} 
                unit="kg" 
                onChange={(e) => handleParamChange(e, i, 'masses')} 
                disabled={isRunning} 
              />
              <ControlSlider 
                key={`l-${i}`} 
                label={`Length`} 
                name={`l${i}`} 
                value={params.lengths[i]} 
                min={0.5} 
                max={5} 
                step={0.1} 
                unit="m" 
                onChange={(e) => handleParamChange(e, i, 'lengths')} 
                disabled={isRunning} 
              />
            </div>
          ))}
          <div className="pt-4 border-t border-slate-700">
            <ControlSlider 
                label="Gravity" 
                name="g" 
                value={params.g} 
                min={1} 
                max={30} 
                step={0.1} 
                unit="m/s²" 
                onChange={(e) => setParams(p => ({...p, g: parseFloat(e.target.value)}))} 
                disabled={isRunning} 
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;