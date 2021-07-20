String.prototype.replaceAll = function(search, replacement) {
  return this.split(search).join(replacement);
};

class EmojiNumber {
  static MAPPING = {
    '➖': '-',
    '🕳': '.',
    '0️⃣': '0',
    '1️⃣': '1',
    '2️⃣': '2',
    '3️⃣': '3',
    '4️⃣': '4',
    '5️⃣': '5',
    '6️⃣': '6',
    '7️⃣': '7',
    '8️⃣': '8',
    '9️⃣': '9',
    '🔟': '10',
    '💯': '100',
    '🇦': 'A',
    '🇧': 'B',
    '🇨': 'C',
    '🇩': 'D',
    '🇪': 'E',
    '🇫': 'F',
  };

  constructor(emojiNumber, base = 10) {
    this.emojiNumber = emojiNumber;
    this.base = base;
  }

  valueOf() {
    const mappedNumber = Object
      .keys(EmojiNumber.MAPPING)
      .reduce((value, key) => value.replaceAll(key, EmojiNumber.MAPPING[key]), this.emojiNumber);

    return mappedNumber.includes('.') ? Number(mappedNumber) : parseInt(mappedNumber, this.base);
  }
}

function λ(emojiNumber) {
  if (Array.isArray(emojiNumber)) emojiNumber = emojiNumber.join('');
  return new EmojiNumber(emojiNumber);
}

function d(emojiNumber) {
  return λ(emojiNumber);
}

function b(emojiNumber) {
  if (Array.isArray(emojiNumber)) emojiNumber = emojiNumber.join('');
  return new EmojiNumber(emojiNumber, 2);
}

function h(emojiNumber) {
  if (Array.isArray(emojiNumber)) emojiNumber = emojiNumber.join('');
  return new EmojiNumber(emojiNumber, 16);
}

const favNumber = b`1️⃣0️⃣0️⃣1️⃣1️⃣0️⃣0️⃣1️⃣`;
console.log(d`💯` * favNumber);

const discount = d`➖0️⃣🕳2️⃣0️⃣`;
const orgPrice = h`🇨4️⃣`;
console.log(1 * orgPrice);
console.log(orgPrice + discount * orgPrice);
