const fs = require('fs/promises');
const ts = require('typescript');

main();
async function main() {
  const dirPath = '../../Documents/work/boomerank/packages/backend/src';
  const files = await getFilePaths(dirPath);
  const codeFiles = filterFileTypes(files, ['ts', 'tsx']);

  const identifiers = new Map();
  for (const filePath of codeFiles) {
    const scanner = await createFileScanner(filePath);
    toCountMap(scanIdentifiers(scanner), identifiers);
  }

  const words = flatMapCountMap(identifiers, getWordsInText);
  await saveAsJsonFile('./identifiers.json', identifiers);
  await saveAsJsonFile('./words.json', words);
}

async function getFilePaths(dirPath) {
  const files = [];

  for (const file of await fs.readdir(dirPath)) {
    const filePath = `${dirPath}/${file}`;

    if ((await fs.stat(filePath)).isDirectory()) {
      files.push(...(await getFilePaths(filePath)));
    }
    else {
      files.push(filePath);
    }
  }

  return files;
}

function filterFileTypes(files, fileTypes) {
  return files.filter(
    file => fileTypes.some(type => file.endsWith(`.${type}`))
  );
}

async function createFileScanner(filePath) {
  const fileCode = await fs.readFile(filePath, 'utf8');

  const scanner = ts.createScanner(ts.ScriptTarget.ES2019, true);
  scanner.setText(fileCode);
  scanner.setOnError(err => {
    console.error(`Error scanning file ${filePath}:`, err);
  });

  return scanner;
}

function scanIdentifiers(scanner) {
  const identifiers = [];

  let token = scanner.scan();
  while (token !== ts.SyntaxKind.EndOfFileToken) {
    if (scanner.getToken() === ts.SyntaxKind.Identifier) {
      identifiers.push(scanner.getTokenText());
    }

    token = scanner.scan();
  }

  return identifiers;
}

function getWordsInText(text) {
  return text.split(/[^a-zA-Z]/)
    .flatMap(camelCaseToWords)
    .filter(Boolean)
    .map(word => word.toLowerCase());
}

function camelCaseToWords(text) {
  if (!text) return text;
  return text.match(/(([A-Z]+(?![a-z]))|[A-Z]?[^A-Z]+)/g) ?? text;
}

async function saveAsJsonFile(filePath, words) {
  const entriesJson = rankedCountMap(words).map(
    ([word, count]) => `  "${word}": ${count}`
  ).join(',\r\n');

  const fullJson = `{\r\n${entriesJson}\r\n}`;
  await fs.writeFile(filePath, fullJson, 'utf8');
}

// Count Maps --------------------------------------------------------------- //

function toCountMap(collection, countMap = new Map(), multiplier = 1) {
  for (const value of collection) {
    addToCountMap(countMap, value, multiplier);
  }

  return countMap;
}

function addToCountMap(countMap, value, count = 1) {
  if (!countMap.has(value)) {
    countMap.set(value, 0);
  }

  countMap.set(value, countMap.get(value) + count);
  return countMap;
}

function flatMapCountMap(countMap, mapper) {
  const mapped = new Map();

  for (const [value, count] of countMap) {
    toCountMap(mapper(value, countMap), mapped, count);
  }

  return mapped;
}

function rankedCountMap(countMap) {
  const entries = [...countMap.entries()];
  return entries.sort(([, aCount], [, bCount]) => bCount - aCount);
}
