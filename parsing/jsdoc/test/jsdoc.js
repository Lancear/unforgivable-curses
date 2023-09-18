const { assert } = require('chai');
const jsdoc = require('../src/jsdoc');

describe('Scanner', ()=> {

  describe('Simple jsdoc comment without tags', () => {

    it('single line jsdoc comment', () => {
      const comment = '/** A simple jsdoc comment */';
      const actual = jsdoc.scan(comment);
      const expected = [
        {type: 'docStart', text: '/**'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'A'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'simple'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'jsdoc'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'comment'},
        {type: 'whitespace', text: ' '},
        {type: 'docEnd', text: '*/'},
      ];
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment', () => {
      const comment = '/**\n * A simple jsdoc comment\r\n */';
      const actual = jsdoc.scan(comment);
      const expected = [
        {type: 'docStart', text: '/**'},
        {type: 'linePrefix', text: '\n *'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'A'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'simple'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'jsdoc'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'comment'},
        {type: 'whitespace', text: '\r'},
        {type: 'docEnd', text: '\n */'},
      ];
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment with multi line content', () => {
      const comment = '/**\r\n * A\n* simple\n* jsdoc\n * comment\r\n */';
      const actual = jsdoc.scan(comment);
      const expected = [
        {type: 'docStart', text: '/**'},
        {type: 'whitespace', text: '\r'},
        {type: 'linePrefix', text: '\n *'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'A'},
        {type: 'linePrefix', text: '\n*'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'simple'},
        {type: 'linePrefix', text: '\n*'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'jsdoc'},
        {type: 'linePrefix', text: '\n *'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'comment'},
        {type: 'whitespace', text: '\r'},
        {type: 'docEnd', text: '\n */'},
      ];
  
      assert.deepEqual(actual, expected);
    });

    it('indented multi line jsdoc comment', () => {
      const comment = '    /**\n\t\t A simple jsdoc comment\r\n     */';
      const actual = jsdoc.scan(comment);
      const expected = [
        {type: 'whitespace', text: '    '},
        {type: 'docStart', text: '/**'},
        {type: 'whitespace', text: '\n\t\t '},
        {type: 'word', text: 'A'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'simple'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'jsdoc'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'comment'},
        {type: 'whitespace', text: '\r'},
        {type: 'docEnd', text: '\n     */'},
      ];
  
      assert.deepEqual(actual, expected);
    });
  
  });

  describe('jsdoc comment with tags', () => {

    it('single line jsdoc comment with a tag and type', () => {
      const comment = '/** @return {number} a random number */';
      const actual = jsdoc.scan(comment);
      const expected = [
        {type: 'docStart', text: '/**'},
        {type: 'whitespace', text: ' '},
        {type: 'tag', text: '@return'},
        {type: 'whitespace', text: ' '},
        {type: 'type', text: '{number}'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'a'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'random'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'number'},
        {type: 'whitespace', text: ' '},
        {type: 'docEnd', text: '*/'},
      ];
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment with content and a tag', () => {
      const comment = '/**\n * A simple jsdoc comment\r\n * @returns a magic number\r\n */';
      const actual = jsdoc.scan(comment);
      const expected = [
        {type: 'docStart', text: '/**'},
        {type: 'linePrefix', text: '\n *'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'A'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'simple'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'jsdoc'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'comment'},
        {type: 'whitespace', text: '\r'},
        {type: 'linePrefix', text: '\n *'},
        {type: 'whitespace', text: ' '},
        {type: 'tag', text: '@returns'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'a'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'magic'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'number'},
        {type: 'whitespace', text: '\r'},
        {type: 'docEnd', text: '\n */'},
      ];
  
      assert.deepEqual(actual, expected);
    });

    it('single line jsdoc comment with a tag and type', () => {
      const comment = '/** @author Some guy <some-girl@mail.com> */';
      const actual = jsdoc.scan(comment);
      const expected = [
        {type: 'docStart', text: '/**'},
        {type: 'whitespace', text: ' '},
        {type: 'tag', text: '@author'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'Some'},
        {type: 'whitespace', text: ' '},
        {type: 'word', text: 'guy'},
        {type: 'whitespace', text: ' '},
        {type: 'email', text: '<some-girl@mail.com>'},
        {type: 'whitespace', text: ' '},
        {type: 'docEnd', text: '*/'},
      ];
  
      assert.deepEqual(actual, expected);
    });
  
  });

});

describe('Parser', ()=> {

  describe('Simple jsdoc comment without tags', () => {

    it('single line jsdoc comment', () => {
      const comment = '/** A simple jsdoc comment */';
      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment'
      };
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment', () => {
      const comment = '/**\n * A simple jsdoc comment\r\n */';
      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment'
      };
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment with multi line content', () => {
      const comment = '/**\r\n * A\n* simple\n* jsdoc\n * comment\r\n */';
      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment'
      };
  
      assert.deepEqual(actual, expected);
    });

    it('indented multi line jsdoc comment', () => {
      const comment = '    /**\n\t\t A simple jsdoc comment\r\n     */';
      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment'
      };
  
      assert.deepEqual(actual, expected);
    });

    it('single line jsdoc comment', () => {
      const comment = '/** Jsdoc comment with random tokens /** <email> {type} @tag */';
      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'Jsdoc comment with random tokens /** <email> {type} @tag'
      };
  
      assert.deepEqual(actual, expected);
    });
  
  });

  describe('jsdoc comment with tags', () => {

    it('single line jsdoc comment a return tag', () => {
      const comment = '/** @return {number} a random number */';
      const actual = jsdoc.parse(comment);
      const expected = {
        tags: [
          { 
            tag: 'return',
            type: 'number',
            description: 'a random number'
          }
        ]
      };
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment with content and a returns tag', () => {
      const comment = '/**\n * A simple jsdoc comment\r\n * @returns a magic number\r\n */';
      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment',
        tags: [
          {
            tag: 'returns',
            description: 'a magic number'
          }
        ]
      };
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment with content and param and return tags', () => {
      const comment = `
        /**
         * A simple jsdoc comment
         * @param {number} num a random number
         * @returns a magic number
         */
      `;

      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment',
        tags: [
          {
            tag: 'param',
            type: 'number',
            name: 'num',
            description: 'a random number'
          },
          {
            tag: 'returns',
            description: 'a magic number'
          }
        ]
      };
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment with content and an example tag', () => {
      const comment = `
        /**
         * A simple jsdoc comment
         * @example
         * const fs     = require("fs");
         * fs.readFileSync("some-file.txt", "utf8");
         */
      `;

      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment',
        tags: [
          {
            tag: 'example',
            code: 'const fs     = require("fs");\nfs.readFileSync("some-file.txt", "utf8");'
          }
        ]
      };
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment with content and an access tag', () => {
      const comment = `
        /**
         * A simple jsdoc comment
         * @access protected
         */
      `;

      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment',
        tags: [
          {
            tag: 'access',
            access: 'protected'
          }
        ]
      };
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment with content and an alias tag', () => {
      const comment = `
        /**
         * A simple jsdoc comment
         * @alias MyFancyAlias
         */
      `;

      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment',
        tags: [
          {
            tag: 'alias',
            name: 'MyFancyAlias'
          }
        ]
      };
  
      assert.deepEqual(actual, expected);
    });
  
    it('multi line jsdoc comment with content and an async tag', () => {
      const comment = `
        /**
         * A simple jsdoc comment
         * @async
         */
      `;

      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment',
        tags: [
          {
            tag: 'async',
          }
        ]
      };
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment with content and an ignore tag', () => {
      const comment = `
        /**
         * A simple jsdoc comment
         * @ignore
         */
      `;

      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment',
        tags: [
          {
            tag: 'ignore',
          }
        ]
      };
  
      assert.deepEqual(actual, expected);
    });

    it('multi line jsdoc comment with content and a name tag', () => {
      const comment = `
        /**
         * A simple jsdoc comment
         * @name FancyName
         */
      `;

      const actual = jsdoc.parse(comment);
      const expected = {
        description: 'A simple jsdoc comment',
        tags: [
          {
            tag: 'name',
            name: 'FancyName'
          }
        ]
      };
  
      assert.deepEqual(actual, expected);
    });

  });

});
