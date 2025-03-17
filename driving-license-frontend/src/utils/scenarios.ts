export type Car = {
  id: string;
  color: string;
  position: { x: number; y: number };
  blinker: 'left' | 'right' | 'off';
  direction: 'north' | 'south' | 'east' | 'west';
};

export type TrafficSign = {
  type: 'stop' | 'main-road';
  position: { x: number; y: number };
  direction: 'north' | 'south' | 'east' | 'west';
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  cars: Car[];
  signs: TrafficSign[];
  rules: string[];
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
        id: 'car1',
        color: 'placeholder',
        position: { x: 39, y: 64 },
        blinker: 'off',
        direction: 'west',
      },
      {
        id: 'car2',
        color: 'placeholder',
        position: { x: 21, y: 44 },
        blinker: 'off',
        direction: 'south',
      },
      {
        id: 'car3',
        color: 'placeholder',
        position: { x: 75, y: 51 },
        blinker: 'off',
        direction: 'north',
      },
    ],
    signs: [],
    rules: ['Yield to the right'],
    correctOrder: ['car2', 'car1', 'car3'],
  },
  {
    id: 'crossroad2',
    name: 'Simple Crossroad (No Signs)',
    description: 'A simple crossroad with no signs. Yield to the right.',
    cars: [
      {
        id: 'car1',
        color: 'placeholder',
        position: { x: 52, y: 28 },
        blinker: 'left',
        direction: 'east',
      },
      {
        id: 'car2',
        color: 'placeholder',
        position: { x: 39, y: 64 },
        blinker: 'off',
        direction: 'west',
      },
      {
        id: 'car3',
        color: 'placeholder',
        position: { x: 75, y: 51 },
        blinker: 'left',
        direction: 'north',
      },
    ],
    signs: [],
    rules: ['Yield to the right'],
    correctOrder: ['car2', 'car3', 'car1'],
  },
  {
    id: 'crossroad3',
    name: 'Simultaneous Movement Example',
    description:
      'You go first, then car3, then car1 & car2 together. (Custom validation)',
    cars: [
      {
        id: 'car1',
        color: 'placeholder',
        position: { x: 21, y: 47 },
        blinker: 'left',
        direction: 'south',
      },
      {
        id: 'car2',
        color: 'placeholder',
        position: { x: 21, y: 41 },
        blinker: 'off',
        direction: 'south',
      },
      {
        id: 'car3',
        color: 'placeholder',
        position: { x: 52, y: 28 },
        blinker: 'off',
        direction: 'north',
      },
      {
        id: 'car4',
        color: 'placeholder',
        position: { x: 75, y: 51 },
        blinker: 'off',
        direction: 'north',
      },
    ],
    signs: [],
    rules: ['Yield to the right'],
    validateOrder: (selectedOrder: string[]) => {
      if (selectedOrder.length !== 4) return false;
      if (selectedOrder[0] !== 'car4') return false;
      if (selectedOrder[1] !== 'car3') return false;
      const lastTwo = [selectedOrder[2], selectedOrder[3]].sort();
      return JSON.stringify(lastTwo) === JSON.stringify(['car1', 'car2']);
    },
  },
  {
    id: 'crossroad4',
    name: 'Main Road East-West (Side Road from North)',
    description:
      'East-west road is the main road. The north approach is a side road with a stop sign. Signs are offset and oriented correctly.',
    cars: [
      {
        id: 'car1',
        color: 'placeholder',
        position: { x: 39, y: 64 },
        blinker: 'off',
        direction: 'west',
      },
      {
        id: 'car2',
        color: 'placeholder',
        position: { x: 75, y: 51 },
        blinker: 'off',
        direction: 'north',
      },
      {
        id: 'car3',
        color: 'placeholder',
        position: { x: 52, y: 28 },
        blinker: 'off',
        direction: 'east',
      },
    ],
    signs: [
      {
        type: 'main-road',
        position: { x: 69, y: 31 },
        direction: 'east',
      },
      {
        type: 'main-road',
        position: { x: 30, y:67 },
        direction: 'west',
      },
      {
        type: 'stop',
        position: { x: 80, y: 60 },
        direction: 'north',
      },
    ],
    rules: [
      'East-west is the main road; north approach must stop.',
      'Main-road cars have priority.',
    ],
    validateOrder: (selectedOrder: string[]) => {
      if (selectedOrder.length !== 3) return false;
      if (selectedOrder[2] !== 'car2') return false;
      const firstTwo = [selectedOrder[0], selectedOrder[1]].sort();
      return JSON.stringify(firstTwo) === JSON.stringify(['car1', 'car3']);
    },
  },
  {
    id: 'crossroad5',
    name: 'Left-Turn Example (Driver’s Perspective)',
    description:
      'The driver (car1) is turning left from the south, the red car (car2) is on the left turning right, the green car (car3) is on the right turning left. No signs. Yield to the right.',
    cars: [
      {
        id: 'car1',
        color: 'placeholder',
        position: { x: 75, y: 51 },
        blinker: 'left',
        direction: 'north',
      },
      {
        id: 'car2',
        color: 'placeholder',
        position: { x: 39, y: 64 },
        blinker: 'left',
        direction: 'west',
      },
      {
        id: 'car3',
        color: 'placeholder',
        position: { x: 52, y: 28 },
        blinker: 'left',
        direction: 'east',
      },
    ],
    signs: [],
    rules: ['Yield to the right'],
    correctOrder: ['car2', 'car1', 'car3'],
  },
  {
    id: 'crossroad6',
    name: 'Main Road on Right, Stop on Top (Driver from Bottom)',
    description:
      'The green car (east approach) is on the main road, the top approach has a stop sign, and you (from the south) are turning left. The yield sign was replaced with a stop sign at the top.',
    cars: [
      {
        id: 'car1',
        color: 'placeholder',
        position: { x: 75, y: 51 },
        blinker: 'left',
        direction: 'north',
      },
      {
        id: 'car2',
        color: 'placeholder',
        position: { x: 21, y: 44 },
        blinker: 'off',
        direction: 'south',
      },
      {
        id: 'car3',
        color: 'placeholder',
        position: { x: 39, y: 64 },
        blinker: 'left',
        direction: 'west',
      },
    ],
    signs: [
      {
        type: 'main-road',
        position: { x: 25, y: 40 },
        direction: 'south',
      },
      {
        type: 'stop',
        position: { x: 30, y:66 },
        direction: 'west',
      },
      {
        type: 'main-road',
        position: { x: 80, y: 60 },
        direction: 'north',
      },
    ],
    rules: [
      'The right (east) approach is the main road.',
      'The top (north) approach has a stop sign.',
      'You are coming from the bottom (south), turning left. Yield to the main road first.',
      'The top approach (stop sign) goes last.',
    ],
    correctOrder: ['car2', 'car1', 'car3'],
  }
];