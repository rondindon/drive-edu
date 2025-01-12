// scenarios.ts

export type Car = {
  id: string;
  color: string;
  position: { x: number; y: number };
  blinker: 'left' | 'right' | 'off';
  direction: 'north' | 'south' | 'east' | 'west';
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
  /** The correct crossing order of car IDs, e.g. ["blue", "red", "you"] */
  correctOrder?: string[];
  validateOrder?: (selectedOrder: string[]) => boolean;
};

export const scenarios: Scenario[] = [
  {
    id: 'crossroad1',
    name: 'Simple Crossroad (No Signs)',
    description: 'A simple crossroad with no signs. Yield to the right.',
    cars: [
      {
        id: 'red',
        color: 'red',
        position: { x: 39, y: 64 },
        blinker: 'off',
        direction: 'west',
      },
      {
        id: 'blue',
        color: 'blue',
        position: { x: 21, y: 44 },
        blinker: 'off',
        direction: 'south',
      },
      {
        id: 'you',
        color: 'green',
        position: { x: 75, y: 51 },
        blinker: 'off',
        direction: 'north',
      },
    ],
    signs: [],
    rules: ['Yield to the right'],
    correctOrder: ['blue', 'red', 'you'],
  },
  {
    id: 'crossroad2',
    name: 'Simple Crossroad (No Signs)',
    description: 'A simple crossroad with no signs. Yield to the right.',
    cars: [
      {
        id: 'red',
        color: 'red',
        position: { x: 52, y: 28 },
        blinker: 'left',
        direction: 'east',
      },
      {
        id: 'blue',
        color: 'blue',
        position: { x: 39, y: 64 },
        blinker: 'off',
        direction: 'west',
      },
      {
        id: 'you',
        color: 'green',
        position: { x: 75, y: 51 },
        blinker: 'left',
        direction: 'north',
      },
    ],
    signs: [],
    rules: ['Yield to the right'],
    correctOrder: ['blue', 'you', 'red'],
  },
  {
    id: 'crossroad3',
    name: 'Simultaneous Movement Example',
    description: 'You go first, then green, then red & blue together.',
    cars: [
      {
        id: 'red',
        color: 'red',
        position: { x: 21, y: 47 },
        blinker: 'left',
        direction: 'south',
      },
      {
        id: 'blue',
        color: 'blue',
        position: { x: 21, y: 41 },
        blinker: 'off',
        direction: 'south',
      },
      {
        id: 'green',
        color: 'green',
        position: { x: 52, y: 28 },
        blinker: 'off',
        direction: 'north',
      },
      {
        id: 'you',
        color: 'yellow',
        position: { x: 75, y: 51 },
        blinker: 'off',
        direction: 'north',
      },
    ],
    signs: [],
    rules: ['Yield to the right'],
    // Instead of a simple correctOrder, we define a custom "validateOrder"
    validateOrder: (selectedOrder: string[]) => {
      // We expect 4 clicks total
      if (selectedOrder.length !== 4) return false;

      // 1) "you" must be first
      if (selectedOrder[0] !== 'you') return false;

      // 2) "green" must be second
      if (selectedOrder[1] !== 'green') return false;

      // 3) The last 2 picks must be "red" and "blue" in any order
      const lastTwo = [selectedOrder[2], selectedOrder[3]].sort();
      return JSON.stringify(lastTwo) === JSON.stringify(['blue', 'red']);
    },
  },
];