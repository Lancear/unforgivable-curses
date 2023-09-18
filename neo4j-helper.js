const neo4j = require('neo4j-driver');

module.exports = {
  int: neo4j.int,
  updateClauseFor,
  getAll,
  getFirst,
};

/**
 * Creates an update clause for all fields in the `changeSet` as properties of `variableName`.
 *
 * It only accesses direct fields and therefore ignores inner objects and arrays.
 */
function updateClauseFor(variableName, changeset) {
  return Object
    .keys(changeset)
    .filter(field => typeof changeset[field] !== 'object')
    .map(field => `${variableName}.${field} = $${field}`)
    .join(', ');
}

/**
 * Runs a neo4j query with the given params.
 * @returns a promise with the selected records as objects
 */
async function getAll(db, query, params = {}) {
  const session = db.session();
  const result = await session.run(query, params);
  await session.close();

  const records = result.records.map(recordToObject);
  return records;
}

/**
 * Runs a neo4j query with the given params.
 * @returns a promise with the first selected record as an object
 */
async function getFirst(db, query, params = {}) {
  return getAll(db, query, params).then(records => records[0]);
}

/**
 * Turns a neo4j record into an object.
 * @param {neo4j.Record} record
 */
function recordToObject(record) {
  const keys = record.keys;
  const values = record._fields;
  const emptyObj = {};

  return keys.reduce((obj, key, valueIdx) => {
    const value = values[valueIdx];
    obj[key] = (value && typeof value === 'object' && !Array.isArray(value))
      ? value.properties
      : value;
    return obj;
  }, emptyObj);
}
