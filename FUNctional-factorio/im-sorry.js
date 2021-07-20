import Factory from './factory.js';

class Counter extends Factory {
  static BLUEPRINT = [
    ['🧙‍♂️', '📝', '➕'],
    [  '',  '👆', '🤛'],
  ];

  static LEGENDS = {
    '👆': 'up',
    '👇': 'down',
    '🤛': 'left',
    '🤜': 'right',
    '🧙‍♂️': 'initValue',
    '📝': 'printor',
    '➕': 'incrementor',
  };

  constructor() {
    super(Counter.BLUEPRINT, Counter.LEGENDS);
  }

  /** 
   * @producer
   */
  initValue() {
    return 0;
  }

  /**
   * @actor
   */
  printor(valueToPrint) {
    console.log(valueToPrint);
  }
  
  /**
   * @transformer
   * @return {down}
   */
  incrementor(numberToIncrement) {
    return numberToIncrement + 1;
  }
}

const ohno = new Counter();
ohno.run();
