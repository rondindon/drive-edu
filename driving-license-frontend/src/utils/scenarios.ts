export type Car = {
    id: string;
    color: string;
    position: { x: number; y: number };
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
        { id: 'red', color: 'red', position: { x: 1, y: 2 } },
        { id: 'blue', color: 'blue', position: { x: 0, y: 1 } },
        { id: 'you', color: 'green', position: { x: 2, y: 1 } },
      ],
      signs: [],
      rules: ['Yield to the right'],
    },
    {
      id: 'crossroad2',
      name: 'Crossroad with Stop Signs',
      description: 'A crossroad where two roads have stop signs.',
      cars: [
        { id: 'red', color: 'red', position: { x: 1, y: 2 } },
        { id: 'blue', color: 'blue', position: { x: 0, y: 1 } },
        { id: 'you', color: 'green', position: { x: 2, y: 1 } },
      ],
      signs: [
        { type: 'stop', position: { x: 0, y: 1 } },
        { type: 'stop', position: { x: 1, y: 2 } },
      ],
      rules: ['Stop at stop signs, yield to other vehicles'],
    },
  ];  