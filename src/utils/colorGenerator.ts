const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
  '#FF69B4', '#32CD32', '#FF8C00', '#9370DB'
];

const ADJECTIVES = [
  'Happy', 'Swift', 'Brave', 'Calm', 'Clever',
  'Eager', 'Fancy', 'Gentle', 'Jolly', 'Kind',
  'Lucky', 'Merry', 'Noble', 'Polite', 'Quick'
];

const ANIMALS = [
  'Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox',
  'Koala', 'Lion', 'Owl', 'Rabbit', 'Wolf',
  'Bear', 'Cat', 'Dog', 'Hawk', 'Deer'
];

export function generateColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function generateName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adjective} ${animal}`;
}

export function generateUserInfo(id: string) {
  return {
    id,
    name: generateName(),
    color: generateColor()
  };
}
