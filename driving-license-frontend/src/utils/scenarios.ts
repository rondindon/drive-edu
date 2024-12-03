  export type Car = {
    id: string;
    color: string;
    position: { x: number; y: number };
    blinker: 'left' | 'right' | 'off';
    direction: 'north' | 'south' | 'east' | 'west'; // Restrict to these values
  };
  
  export type TrafficSign = {
    type: 'stop' | 'main-road' | 'yield';
    position: { x: number; y: number };
  };
  
  export type Scenario = {
    id: string;
    name: string;
    description: string;
    cars: Car[];
    signs: TrafficSign[];
    rules: string[];
  };
  
  export const scenarios: Scenario[] = [
    {
      id: 'crossroad1',
      name: 'Simple Crossroad (No Signs)',
      description: 'A simple crossroad with no signs. Yield to the right.',
      cars: [
        { id: 'red', color: 'red', position: { x: 50, y: 75 }, blinker: 'left', direction: 'west' },
        { id: 'blue', color: 'blue', position: { x: 25, y: 50 }, blinker: 'right', direction: 'south' },
        { id: 'you', color: 'green', position: { x: 75, y: 50 }, blinker: 'off', direction: 'north' },
      ],
      signs: [],
      rules: ['Yield to the right'],
    },
  ];  