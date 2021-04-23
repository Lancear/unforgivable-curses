/**
 * @token ' ' | '\t' | '\r' | '\n'
 * @returns {Void}
 */
function whitespace() {
  // ignore/skip whitespace
}

/**
 * @token DIGIT+
 * @param {String} token 
 * @returns {Number}
 */
function number(token) {
  return parseInt(token);
}

/**
 * @token 'True' | 'False'
 * @param {String} token\
 * @returns {Boolean} 
 */
function boolean(token) {
  return (token === 'True');
}

/**
 * @token '"' ([^\r\n"] | '\\"')* '"'
 * @param {String} token
 * @returns {String} 
 */
function string(token) {
  return token.substring(1, token.length - 1);
}

/**
 * @token (LETTER | '_') (LETTER | DIGIT | '_')*
 * @param {String} token
 * @returns {Symbol} 
 */
function id(token) {
  return Symbol(token);
}

/**
 * @token '/*' .*? '*' '/'
 * @param {String} token 
 * @returns {String}
 */
function comment(token) {
  return token;
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @rule 'Program' $( <id> (<declarationBlock> | <procedure>)* 'Begin' <statementList> )$ 'End' <id> '.' EOF
 * @param {Symbol} $id 
 * @param {*} declarations 
 * @param {Function[]} procedures 
 * @param {*} statements 
 * @param {Symbol} endId 
 */
function program($id, declarations, procedures, statements, endId) {
  if (id.description !== endId.description)
    throw new Error('Identifiers do not match! :O');
}
