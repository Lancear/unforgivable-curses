module.exports = 
class FsmScanner {

  static WHITESPACE = Symbol('whitespace');
  static NOT_WHITESPACE = Symbol('not whitespace');

  /**
   * Scans the source with the given fsm.
   * @param {object} fsm 
   * @param {string|array} source 
   * @returns {array} the token-stream
   */
  static scan(fsm, source) {
    let state = fsm.$start;
    let currToken = '';
    const tokens = [];
  
    for (let idx = 0; idx < source.length; idx++) {
      const char = source[idx];
  
      if (char in state) {
        currToken += char;
        state = fsm[state[char]];
      }
      else if (FsmScanner.WHITESPACE in state && ' \t\r\n'.split('').includes(char)) {
        currToken += char;
        state = fsm[state[FsmScanner.WHITESPACE]];
      }
      else if (FsmScanner.NOT_WHITESPACE in state && !' \t\r\n'.split('').includes(char)) {
        currToken += char;
        state = fsm[state[FsmScanner.NOT_WHITESPACE]];
      }
      else {
        if (!state.final) throw new Error(`Invalid token: '${currToken}'`);
  
        tokens.push({ type: state.tokenType, text: currToken });
        state = fsm.$start;
        currToken = '';
        idx--;
      }
    }
  
    if (!state.final) throw new Error(`Invalid token: '${currToken}'`);
    tokens.push({ type: state.tokenType, text: currToken });
    return tokens;
  }
};
