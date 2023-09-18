Array.prototype.first = function() { return this[0]; };
Array.prototype.last = function() { return this[this.length - 1]; };
Object.copy = function(obj) { const copy = Object.assign({}, obj); Object.setPrototypeOf(copy, Object.getPrototypeOf(obj)); return copy; };

let input = `class SourceReader {

  static NEWLINE = '\\n';

  constructor(source) {
    this.source = source;
    this.charIdx = 0;
    this.line = 1;
    this.column = 1;
  }

  curr({ lookAhead = 0 } = {}) {
    return this.source.substring(this.charIdx, this.charIdx + 1 + lookAhead);
  }

  peek() {
    return this.source[this.charIdx + 1];
  }

  next() {
    this.charIdx++;
    this.column++;

    if (this.curr() == SourceReader.NEWLINE) {
      this.line++;
      this.column = 0;
    }

    return this.curr();
  }

  has_next() {
    return this.charIdx < this.source.length;
  }

  get_copy() {
    return Object.assign(new SourceReader(), this);
  }

}`;

class TokenInfo {

  constructor(value, category = 'identifier', subCategory = '') {
    this.value = value;
    this.category = category;
    this.subCategory = subCategory;
  }

  toString() {
    return `${this.category}: ${this.value} [${this.position}]`;
  }

}

const WHITESPACE = ' \t\r\n';
const NEWLINE = '\n';
const COMMENT = {
  START: ['//', '/*'],
  SINGLELINE: '//',
  MULTILINE: {
    START: '/*',
    END: '*/'
  }
};
const STRING = {
  START: ['"', "'", '`'],
  MULTILINE: '`'
};
const NUMBER_START_CHARS = '-+.0123456789';
const NUMBER_CHARS = '+-_.e0123456789';
const IDENTIFIER_START_CHARS = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const IDENTIFIER_CHARS = '_0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const TOKENS = [
  new TokenInfo('case', 'keyword', 'conditional'),
  new TokenInfo('class', 'keyword'),
  new TokenInfo('const', 'keyword', 'assignment'),
  new TokenInfo('do', 'keyword', 'loop'),
  new TokenInfo('else', 'keyword', 'conditional'),
  new TokenInfo('for', 'keyword', 'loop'),
  new TokenInfo('function', 'keyword'),
  new TokenInfo('if', 'keyword', 'conditional'),
  new TokenInfo('in', 'keyword'),
  new TokenInfo('let', 'keyword', 'assignment'),
  new TokenInfo('of', 'keyword'),
  new TokenInfo('this', 'keyword'),
  new TokenInfo('static', 'keyword'),
  new TokenInfo('switch', 'keyword', 'conditional-scope'),
  new TokenInfo('return', 'keyword'),
  new TokenInfo('var', 'keyword', 'assignment'),
  new TokenInfo('while', 'keyword', 'loop'),
  new TokenInfo('{', 'symbol'),
  new TokenInfo('}', 'symbol'),
  new TokenInfo('(', 'symbol'),
  new TokenInfo(')', 'symbol'),
  new TokenInfo('[', 'symbol', 'possible-identifier-access'),
  new TokenInfo(']', 'symbol'),
  new TokenInfo(':', 'symbol'),
  new TokenInfo(';', 'symbol'),
  new TokenInfo(',', 'symbol'),
  new TokenInfo('?', 'symbol'),
  new TokenInfo('?.', 'symbol', 'identifier-access'),
  new TokenInfo('.', 'symbol', 'identifier-access'),
  new TokenInfo('=', 'symbol', 'assignment'),
  new TokenInfo('==', 'operator', 'logical'),
  new TokenInfo('===', 'operator', 'logical'),
  new TokenInfo('||', 'operator', 'boolean'),
  new TokenInfo('&&', 'operator', 'boolean'),
  new TokenInfo('!', 'operator', 'boolean'),
  new TokenInfo('!=', 'operator', 'logical'),
  new TokenInfo('!==', 'operator', 'logical'),
  new TokenInfo('<', 'operator', 'logical'),
  new TokenInfo('<=', 'operator', 'logical'),
  new TokenInfo('>', 'operator', 'logical'),
  new TokenInfo('>=', 'operator', 'logical'),
  new TokenInfo('=>', 'symbol'),
  new TokenInfo('-', 'operator'),
  new TokenInfo('-=', 'operator', 'assignment'),
  new TokenInfo('--', 'operator'),
  new TokenInfo('+', 'operator'),
  new TokenInfo('+=', 'operator', 'assignment'),
  new TokenInfo('++', 'operator'),
  new TokenInfo('/', 'operator'),
  new TokenInfo('/=', 'operator', 'assignment'),
  new TokenInfo('*', 'operator'),
  new TokenInfo('*=', 'operator', 'assignment'),
  new TokenInfo('%', 'operator'),
  new TokenInfo('%=', 'operator', 'assignment'),
];

class SourceReader {

  static NEWLINE = '\n';

  constructor(source) {
    this.source = source;
    this.charIdx = 0;
    this.line = 1;
    this.column = 1;
  }

  curr({ lookAhead = 0 } = {}) {
    return this.source.substring(this.charIdx, this.charIdx + 1 + lookAhead);
  }

  peek() {
    return this.source[this.charIdx + 1];
  }

  next() {
    this.charIdx++;
    this.column++;

    if (this.curr() == SourceReader.NEWLINE) {
      this.line++;
      this.column = 0;
    }

    return this.curr();
  }

  has_next() {
    return this.charIdx < this.source.length;
  }

  get_copy() {
    return Object.assign(new SourceReader(), this);
  }

}

class Scanner {

  static scan(source) {
    let reader = new SourceReader(source);
    const tokens = [];

    while (reader.has_next()) {
      reader = Scanner.skip_whitespace_and_comments(reader);
      const result = Scanner.scan_token(reader);
      reader = result.reader;
      tokens.push( result.tokenInfo );
    }

    return tokens;
  }

  static scan_token(readerStartState, token = '', possibleTokens = TOKENS) {
    // TODO refactor

    const reader = readerStartState.get_copy();
    const nextToken = token + reader.curr();
    const nextPossibleTokens = possibleTokens.filter(t => t.value.startsWith(nextToken));

    if (reader.has_next() && nextPossibleTokens.length > 0) {
      reader.next();
      return Scanner.scan_token(reader, nextToken, nextPossibleTokens);
    }
    else {
      const possibleToken = possibleTokens.find(t => t.value.length == token.length);
      const isValidIdentifier = IDENTIFIER_START_CHARS.includes(nextToken[0]) && nextToken.split('').every( char => IDENTIFIER_CHARS.includes(char) );
      const isValidNumber = NUMBER_START_CHARS.includes(nextToken[0]) && nextToken.split('').every( char => NUMBER_CHARS.includes(char) );

      if ((reader.has_next() || !possibleToken) && isValidIdentifier) {
        const result = Scanner.read_while(reader, IDENTIFIER_CHARS);
        const tokenInfo = new TokenInfo(token + result.value);
        return { reader: result.reader, tokenInfo };
      }
      else if ((reader.has_next() || !possibleToken) && isValidNumber) {
        const result = Scanner.read_while(reader, NUMBER_CHARS);
        const tokenInfo = new TokenInfo(token + result.value, 'number');
        return { reader: result.reader, tokenInfo };
      }
      else if (possibleToken) {
        return { tokenInfo: possibleToken, reader };
      }
      else if (STRING.START.includes(nextToken)) {
        reader.next(); // move to first char within the string
        const result = Scanner.read_till(reader, nextToken, '', nextToken == STRING.MULTILINE);

        if (result.value.split('').last() == nextToken) {
          const tokenInfo = new TokenInfo(nextToken + result.value, 'string');
          return { reader: result.reader, tokenInfo };
        }

        throw new Error(`Unexpected newline in the string '${nextToken + result.value}' at line: ${reader.line} column: ${reader.column}`);
      }
      else {
        throw new Error(`Unknown/Invalid token '${nextToken}' at line: ${reader.line} column: ${reader.column}`);
      }
    }
  }

  static skip_whitespace_and_comments(readerStartState) {
    let reader = readerStartState.get_copy();

    while (reader.has_next() && (WHITESPACE.includes( reader.curr() ) || COMMENT.START.includes( reader.curr({ lookAhead: 1 }) ))) {
      if (reader.curr({ lookAhead: 1 }) == COMMENT.SINGLELINE) {
        reader.next(); // read the lookAhead
        reader = this.read_till(reader, NEWLINE).reader;
      }
      else if (reader.curr({ lookAhead: 1 }) == COMMENT.MULTILINE.START) {
        reader.next(); // read the lookAhead
        reader = this.read_till(reader, COMMENT.MULTILINE.END).reader;
      }
      else {
        reader.next();
      }
    }

    return reader;
  }

  static read_till(readerStartState, end, readBefore = '', allowNewline = true) {
    const reader = readerStartState.get_copy();
    const matchBuffer = readBefore.split('');
    let read = '' + readBefore;
    
    while (reader.has_next() && matchBuffer.join('') != end && (allowNewline || reader.curr() != NEWLINE)) {
      read += reader.curr();
      matchBuffer.push(reader.curr());
      if (matchBuffer.length > end.length) matchBuffer.shift();

      reader.next();
    }

    return { reader, value: read };
  }

  static read_while(readerStartState, allowedChars) {
    const reader = readerStartState.get_copy();
    let read = '';
    
    while (reader.has_next() && allowedChars.includes(reader.curr())) {
      read += reader.curr();
      reader.next();
    }

    return { reader, value: read };
  }

}

// TODO create minimal parser

module.exports = { input, TokenInfo, Scanner, SourceReader } ;