import React, { createContext, useContext, useState, ReactNode } from 'react';

type Vehicle = {
  id: string;
  type: 'car' | 'bus' | 'tram';
  position: { x: number; y: number };
  direction: 'north' | 'south' | 'east' | 'west';
};

type Scenario = {
  id: string;
  layout: string;
  rules: string[];
};

type SimulationState = {
  vehicles: Vehicle[];
  scenario: Scenario | null;
  errors: number;
  order: string[];
};

type SimulationContextType = {
  state: SimulationState;
  addVehicle: (vehicle: Vehicle) => void;
  loadScenario: (scenarioId: string) => void;
  resetSimulation: () => void;
};

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SimulationState>({
    vehicles: [],
    scenario: null,
    errors: 0,
    order: [],
  });

  const addVehicle = (vehicle: Vehicle) => {
    setState((prev) => ({ ...prev, vehicles: [...prev.vehicles, vehicle] }));
  };

  const loadScenario = (scenarioId: string) => {
    const scenarios: Scenario[] = [
      { id: '1', layout: 'T-intersection', rules: ['Yield to right'] },
      { id: '2', layout: 'Roundabout', rules: ['Yield to traffic in circle'] },
    ];
    const scenario = scenarios.find((s) => s.id === scenarioId) || null;
    setState((prev) => ({ ...prev, scenario }));
  };

  const resetSimulation = () => {
    setState({ vehicles: [], scenario: null, errors: 0, order: [] });
  };

  return (
    <SimulationContext.Provider value={{ state, addVehicle, loadScenario, resetSimulation }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within a SimulationProvider');
  return context;
};