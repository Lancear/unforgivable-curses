const FsmScanner = require('./FsmScanner');

const jsdocFSM = {
  $start: {
    '/': 'nodeA',
    '*': 'nodeC',
    '\n': 'nodeD',
    '@': 'nodeE',
    '{': 'nodeF',
    '<': 'nodeG',
    [FsmScanner.WHITESPACE]: 'whitespace',
    [FsmScanner.NOT_WHITESPACE]: 'word',
  },
  whitespace: {
    final: true,
    tokenType: 'whitespace',
    ' ': 'whitespace',
    '\t': 'whitespace',
    '\r': 'whitespace',
  },
  docStart: {
    final: true,
    tokenType: 'docStart',
    [FsmScanner.NOT_WHITESPACE]: 'word',
  },
  linePrefix: {
    final: true,
    tokenType: 'linePrefix',
    '/': 'docEnd',
  },
  docEnd: {
    final: true,
    tokenType: 'docEnd',
  },
  word: {
    final: true, 
    tokenType: 'word',
    [FsmScanner.NOT_WHITESPACE]: 'word',
  },
  tag: {
    final: true, 
    tokenType: 'tag',
    [FsmScanner.NOT_WHITESPACE]: 'tag',
  },
  type: {
    final: true,
    tokenType: 'type',
    [FsmScanner.NOT_WHITESPACE]: 'word',
  },
  email: {
    final: true,
    tokenType: 'email',
  },
  nodeA: {
    '*': 'nodeB',
  },
  nodeB: {
    '*': 'docStart'
  },
  nodeC: {
    '/': 'docEnd'
  },
  nodeD: {
    final: true, 
    tokenType: 'whitespace',
    ' ': 'nodeD',
    '\t': 'nodeD',
    '\r': 'whitespace',
    '*': 'linePrefix',
  },
  nodeE: {
    final: true, 
    tokenType: 'word',
    [FsmScanner.NOT_WHITESPACE]: 'tag',
  },
  nodeF: {
    final: true, 
    tokenType: 'word',
    [FsmScanner.NOT_WHITESPACE]: 'nodeF',
    '}': 'type',
  },
  nodeG: {
    final: true, 
    tokenType: 'word',
    [FsmScanner.NOT_WHITESPACE]: 'nodeG',
    '>': 'email',
  },
};


module.exports = 
class JSDoc {

  /**
   * Scans the jsdoc source.
   * @param {string|array} source 
   * @returns {array} the token-stream
   */
  static scan = FsmScanner.scan.bind(null, jsdocFSM);

   /**
   * Parses the jsdoc source.
   * @param {string|array} source 
   * @returns {object} the object representation of the jsdoc comment
   */
  static parse = parse.bind(null, JSDoc.scan);

};

/**
 * Parses the jsdoc source.
 * @param {function} scan 
 * @param {string|array} source 
 * @returns {object} the object representation of the jsdoc comment
 */
function parse(scan, source) {
  let tokens = scan(source);
  let result = {};
  let token = tokens[0];

  // ignore whitespace & linePrefix
  while (['whitespace', 'linePrefix'].includes(token.type)) {
    // get next token
    tokens.shift();
    token = tokens[0];
  }

  if (token.type !== 'docStart')
    throw new Error(`Unexpected token ${token.type}!`);

  // get next token
  tokens.shift();
  token = tokens[0];

  // ignore whitespace & linePrefix
  while (['whitespace', 'linePrefix'].includes(token.type)) {
    // get next token
    tokens.shift();
    token = tokens[0];
  }



  if (token.type === 'word') {
    [result, tokens] = parseDescription(result, tokens);
    token = tokens[0];
  }

  while (token.type === 'tag') {
    [result, tokens] = parseTag(result, tokens);
    token = tokens[0];
  }




  // ignore whitespace & linePrefix
  while (['whitespace', 'linePrefix'].includes(token.type)) {
    // get next token
    tokens.shift();
    token = tokens[0];
  }

  if (token.type !== 'docEnd')
    throw new Error(`Unexpected token ${token.type}!`);

  console.dir(result);
  return result;
}


function parseDescription(result, tokens) {
  let token = tokens[0];
  result.description = [];

  while (true) {
    if (['word', 'type', 'tag', 'email', 'docStart'].includes(token.type)) {
      result.description.push(token.text);
      // get next token
      tokens.shift();
      token = tokens[0];
    }
    else if (token.type === 'whitespace') {
      // get next token
      tokens.shift();
      token = tokens[0];
    }
    else if (token.type === 'docEnd') {
      break;
    }
    else if (token.type === 'linePrefix') {
      // get next token
      tokens.shift();
      token = tokens[0];

      while (token.type === 'whitespace') {
        // get next token
        tokens.shift();
        token = tokens[0];
      }

      if (token.type === 'tag') {
        break;
      }
    } 
    else {
      throw new Error(`Ask rune for help! Somethings not going right! token type: ${token.type}`);
    }
  }

  result.description = result.description.join(' ');
  return [result, tokens];
}

/**
 * @access public
 */
function parseTag(result, tokens) {
  if (!result.tags) result.tags = [];
  let token = tokens[0];
  let tagName = token.text.substring(1);
  let tag = {tag: tagName};
  result.tags.push(tag);

  // get next token
  tokens.shift();
  token = tokens[0];

  // ignore whitespace & linePrefix
  while (['whitespace', 'linePrefix'].includes(token.type)) {
    // get next token
    tokens.shift();
    token = tokens[0];
  }

  if (['return', 'returns', 'param'].includes(tagName) && token.type === 'type') {
    let type = token.text.substring(1, token.text.length - 1);
    tag.type = type;

    // get next token
    tokens.shift();
    token = tokens[0];
  }

  // ignore whitespace & linePrefix
  while (['whitespace', 'linePrefix'].includes(token.type)) {
    // get next token
    tokens.shift();
    token = tokens[0];
  }

  if (['param', 'alias', 'augments', 'extends', 'name'].includes(tagName) && token.type === 'word') {
    tag.name = token.text;

    // get next token
    tokens.shift();
    token = tokens[0];
  }
  else if (tagName === 'access') {
    if (!'package|private|protected|public'.split('|').includes(token.text)) 
      throw new Error("Invalid access level!");

    tag.access = token.text;
    // get next token
    tokens.shift();
    token = tokens[0];
  }

  // ignore whitespace & linePrefix
  while (['whitespace', 'linePrefix'].includes(token.type)) {
    // get next token
    tokens.shift();
    token = tokens[0];
  }

  if (['return', 'returns', 'param', 'example', 'ignore'].includes(tagName) && token.type === 'word') {
    tag.description = [];

    while (true) {
      console.dir(token);
  
      if (token.type === 'word') {
        tag.description.push(token.text);
  
        // get next token
        tokens.shift();
        token = tokens[0];
      }
      else if (token.type === 'whitespace') {
        if (['example'].includes(tagName)) {
          tag.description.push(token.text);
        }
  
        // get next token
        tokens.shift();
        token = tokens[0];
      }
      else if (token.type === 'docEnd') {
        break;
      }
      else if (token.type === 'linePrefix') {
        if (['example'].includes(tagName)) {
          tag.description.push('\n');
        }
  
        // get next token
        tokens.shift();
        token = tokens[0];
  
        while (token.type === 'whitespace') {
          // get next token
          tokens.shift();
          token = tokens[0];
        }
  
        if (token.type === 'tag') {
          break;
        }
      }
    }

    tag.description = ['example'].includes(tagName)
      ? tag.description.join('')
      : tag.description.join(' ');
  }

  if (['example'].includes(tagName)) {
    tag.code = tag.description;
    delete tag.description;
  }

  return [result, tokens];
}
