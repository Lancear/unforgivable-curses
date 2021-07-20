export default class Factory {

  static TYPES = ['@producer', '@actor', '@transformer', '@consumer'];

  constructor(blueprint, legends) {
    this.blueprint = blueprint;
    this.legends = legends;
    this.functions = new.target.toString()
      .match(/[/][*][*][\s\S]*?[*][/]\s*.*?\s*[(].*?[)]\s*[{]/g)
      .filter(fn => Factory.TYPES.some(type => fn.includes(type)))
      .map(fn => ({
        name: fn.match(/(.*)\s*[(](.*)[)]/)[1].trim(),
        args: fn.match(/[(](.*)[)]/)[1].split(',').map(arg => arg.trim()),
        modifiers: fn.match(/[/][*][*][\s\S]*?[*][/]/)[0]
          .split('\n')
          .filter(line => line.includes('@'))
          .map(mod => mod.replace('*', ' ').trim()),
      }))
      .reduce((map, fn) => map.set(fn.name, fn), new Map());
  }

  run() {
    const MAX_HEIGHT = this.blueprint.length;
    const MAX_WIDTH = this.blueprint[0].length;

    const state = [];

    for (let y = 0; y < MAX_HEIGHT; y++) {
      for (let x = 0; x < MAX_WIDTH; x++) {
        let cell = this.blueprint[y][x];
        if (cell.length === 0) break;

        let fn = this.functions.get(this.legends[cell]);
        if (fn.modifiers.includes('@producer')) {
          state.push({
            x, y,
            value: this[fn.name](),
            direction: fn.modifiers.find(mod => mod.includes('@return'))?.match(/@return\s*[{]*(.*)*[}]/)[1]?.trim() ?? 'right',
          });
        }
      }
    }

    queueMicrotask($=> this.tick(state));
  }

  tick(state) {
    const updatedState = state
      .map(msg => { // move the messages
        if (msg.direction === 'left') msg.x--;
        else if (msg.direction === 'right') msg.x++;
        else if (msg.direction === 'up') msg.y--;
        else if (msg.direction === 'down') msg.y++;
        return msg;
      })
      .reduce((newState, msg) => {
        const cell = this.blueprint[msg.y][msg.x];
        if (cell.length === 0) return [...newState, msg];

        if (['left', 'right', 'up', 'down'].includes(this.legends[cell])) {
          msg.direction = this.legends[cell];
          return [...newState, msg];
        }

        const fn = this.functions.get(this.legends[cell]);
        const result = this[fn.name](msg.value);

        if (fn.modifiers.includes('@transformer')) {
          return [...newState, {
            x: msg.x, 
            y: msg.y,
            value: result,
            direction: fn.modifiers.find(mod => mod.includes('@return'))?.match(/@return\s*[{]*(.*)*[}]/)[1]?.trim() ?? 'right',
          }];
        }
        else if (fn.modifiers.includes('@actor')) {
          return [...newState, {
            x: msg.x, 
            y: msg.y,
            value: msg.value,
            direction: fn.modifiers.find(mod => mod.includes('@return'))?.match(/@return\s*[{]*(.*)*[}]/)[1]?.trim() ?? 'right',
          }];
        }

        return newState;
      }, []);

    if (updatedState.length > 0) queueMicrotask($=> this.tick(updatedState));
  }

}
