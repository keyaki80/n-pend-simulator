
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { PendulumState, PendulumParameters, Coordinates } from './types';
import { useNthPendulum } from './hooks/useNthPendulum';
import Pendulum from './components/Pendulum';
import Controls from './components/Controls';

const PIXEL_SCALE = 100; // 1 meter = 100 pixels
const MAX_TRACE_POINTS = 1500;

const DEFAULT_PARAMS = {
  mass: 10,
  length: 1.0,
  theta: Math.PI / 1.5
};

const RAINBOW_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
];

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

const App: React.FC = () => {
  const [params, setParams] = useState<PendulumParameters>({
    masses: [15, 10],
    lengths: [1.5, 1.0],
    g: 9.81,
  });

  const [initialState, setInitialState] = useState<PendulumState>({
    thetas: [Math.PI / 2, Math.PI / 1.5],
    omegas: [0, 0],
  });
  
  const pendulumCount = params.masses.length;

  const { pendulumState, step, reset } = useNthPendulum(initialState, params);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showTrace, setShowTrace] = useState<boolean>(true);
  const [showRods, setShowRods] = useState<boolean>(true);
  const [trace, setTrace] = useState<Coordinates[]>([]);

  const animationFrameId = useRef<number | null>(null);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    reset(initialState);
    setTrace([]);
  }, [reset, initialState]);

  const handlePendulumCountChange = useCallback((count: number) => {
    setParams(prevParams => {
      const currentCount = prevParams.masses.length;
      if (count === currentCount) return prevParams;

      const newMasses = [...prevParams.masses];
      const newLengths = [...prevParams.lengths];

      if (count > currentCount) {
        for (let i = currentCount; i < count; i++) {
          newMasses.push(DEFAULT_PARAMS.mass);
          newLengths.push(DEFAULT_PARAMS.length);
        }
      } else {
        newMasses.length = count;
        newLengths.length = count;
      }
      return { ...prevParams, masses: newMasses, lengths: newLengths };
    });

    setInitialState(prevInitialState => {
      const currentCount = prevInitialState.thetas.length;
      if (count === currentCount) return prevInitialState;
      
      const newThetas = [...prevInitialState.thetas];
      const newOmegas = [...prevInitialState.omegas];

      if (count > currentCount) {
        for (let i = currentCount; i < count; i++) {
          newThetas.push(DEFAULT_PARAMS.theta);
          newOmegas.push(0);
        }
      } else {
        newThetas.length = count;
        newOmegas.length = count;
      }
      return { thetas: newThetas, omegas: newOmegas };
    });
  }, []); // Empty deps are correct due to functional updates

  const handleRandomize = useCallback(() => {
    setIsRunning(false);
    setTrace([]);

    const newCount = Math.floor(getRandom(1, 8));

    const newMasses = Array.from({ length: newCount }, () => getRandom(1, 50));
    const newLengths = Array.from({ length: newCount }, () => getRandom(0.5, 5));
    const newG = getRandom(1, 30);

    setParams({
      masses: newMasses,
      lengths: newLengths,
      g: newG
    });
    
    const newThetas = Array.from({ length: newCount }, () => getRandom(-Math.PI, Math.PI));
    const newOmegas = Array.from({ length: newCount }, () => 0);

    setInitialState({
      thetas: newThetas,
      omegas: newOmegas,
    });
  }, []);

  // Effect to reset the simulation whenever parameters are changed by the user.
  useEffect(() => {
    setIsRunning(false);
    reset(initialState);
    setTrace([]);
  }, [params, initialState, reset]);

  const animate = useCallback(() => {
    step();
    animationFrameId.current = requestAnimationFrame(animate);
  }, [step]);

  useEffect(() => {
    if (isRunning) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      if(animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    return () => {
      if(animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isRunning, animate]);

  const handleStartPause = () => {
    setIsRunning(prev => !prev);
  };

  const totalLength = useMemo(() => {
    return params.lengths.reduce((sum, length) => sum + length, 0);
  }, [params.lengths]);

  const viewBox = useMemo(() => {
    const padding = 1.1; // 10% padding
    const maxReach = totalLength * PIXEL_SCALE * padding;
    const size = maxReach * 2;
    // Center the viewbox at (0,0)
    return `${-maxReach} ${-maxReach} ${size} ${size}`;
  }, [totalLength]);
  
  const pivot: Coordinates = useMemo(() => ({ x: 0, y: 0 }), []);


  const bobs = useMemo(() => {
    const coords: Coordinates[] = [];
    let lastX = pivot.x;
    let lastY = pivot.y;

    for (let i = 0; i < pendulumCount; i++) {
      const x = lastX + params.lengths[i] * PIXEL_SCALE * Math.sin(pendulumState.thetas[i]);
      const y = lastY + params.lengths[i] * PIXEL_SCALE * Math.cos(pendulumState.thetas[i]);
      coords.push({ x, y });
      lastX = x;
      lastY = y;
    }
    return coords;
  }, [pendulumState, params, pivot, pendulumCount]);
  
  const bobRadii = useMemo(() => params.masses.map(m => 4 + Math.sqrt(m)), [params.masses]);

  const bobColors = useMemo(() => {
    return Array.from({ length: pendulumCount }, (_, i) => RAINBOW_COLORS[i % RAINBOW_COLORS.length]);
  }, [pendulumCount]);

  const lastBob = bobs[bobs.length - 1];
  useEffect(() => {
    if (isRunning && showTrace && lastBob) {
      setTrace(prevTrace => {
        const newTrace = [...prevTrace, lastBob];
        if (newTrace.length > MAX_TRACE_POINTS) {
          return newTrace.slice(newTrace.length - MAX_TRACE_POINTS);
        }
        return newTrace;
      });
    }
  }, [lastBob, isRunning, showTrace]);

  useEffect(() => {
    if (!showTrace) {
        setTrace([]);
    }
  }, [showTrace]);


  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 pb-2">
            N-Pendulum Simulator
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            An interactive simulation of a multi-pendulum system, a classic example of chaotic motion.
            Adjust the parameters and initial angles to see how sensitive the system is to initial conditions.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 aspect-square bg-slate-900/50 rounded-2xl shadow-inner-lg overflow-hidden border border-slate-700">
            <Pendulum 
              viewBox={viewBox}
              pivot={pivot} 
              bobs={bobs} 
              trace={trace}
              bobRadii={bobRadii}
              bobColors={bobColors}
              showRods={showRods}
            />
          </div>
          <div className="lg:col-span-1">
            <Controls
              params={params}
              setParams={setParams}
              initialState={initialState}
              setInitialState={setInitialState}
              isRunning={isRunning}
              onStartPause={handleStartPause}
              onReset={handleReset}
              onRandomize={handleRandomize}
              showTrace={showTrace}
              setShowTrace={setShowTrace}
              showRods={showRods}
              setShowRods={setShowRods}
              pendulumCount={pendulumCount}
              setPendulumCount={handlePendulumCountChange}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;