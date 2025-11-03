const PASSWORD_WORDS = [
  'Aero',
  'Blaze',
  'Comet',
  'Delta',
  'Echo',
  'Frost',
  'Glimmer',
  'Helio',
  'Iris',
  'Jade',
  'Kite',
  'Lumen',
  'Nova',
  'Orion',
  'Pip',
  'Quill',
  'Rune',
  'Sol',
  'Terra',
  'Vivid',
  'Wisp',
  'Xeno',
  'Yarrow',
  'Zephyr',
];

const PASSWORD_SYMBOLS = ['!', '?', '@', '#', '$'];

function selectRandom(list, randomSource = Math.random) {
  if (!Array.isArray(list) || list.length === 0) {
    return '';
  }
  const index = Math.floor(randomSource() * list.length);
  return list[Math.max(0, Math.min(list.length - 1, index))];
}

export function generatePassword(randomSource = Math.random) {
  const word = selectRandom(PASSWORD_WORDS, randomSource);
  const number = Math.floor(randomSource() * 90) + 10;
  const symbol = selectRandom(PASSWORD_SYMBOLS, randomSource);
  return `${word}${number}${symbol}`;
}

export { PASSWORD_WORDS, PASSWORD_SYMBOLS };


