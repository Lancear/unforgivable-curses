class ServiceModel {

  constructor(checks) {
    this.checks = checks;
  }

  full() {
    return {validate: body => validate(this.checks, body)};
  }

  partial() {
    return {validate: body => validate(this.checks, body, true)};
  }

}

class ServiceCollectionModel extends ServiceModel {

  constructor(checks) {
    super(checks);
  }

  full() {
    return {validate: body => validateCollection(this.checks, body)};
  }

  partial() {
    return {validate: body => validateCollection(this.checks, body, true)};
  }

}


// Semantical base errors
class InvalidDataError extends Error {
  constructor(errors = {}, msg = 'Invalid data!') {
    super(msg);
    this.errors = errors;
  }
}

class InvalidDataCollectionError extends Error {
  constructor(errors = {}, msg = 'Invalid data collection!') {
    super(msg);
    this.errors = errors;
  }
}


// Restaurant Examples
const AddressModel = new ServiceModel({
  country: 'string',
  zipcode: 'any',
  place: 'string',
  street: 'string',
});

const RestaurantModel = new ServiceModel({
  name: 'string',
  description: 'string',
  tables: {type: 'number', min: 0},
  categories: {
    type: 'array',
    baseType: 'string',
    check(labels = []) {
      if (labels.some(label => !enumValues.restaurantLabels.includes(label))) {
        throw `Unknown category!`;
      }
    },
  },
  paymentOptions: {
    type: 'array',
    baseType: 'string',
    check: (options = []) => {
      if (options.some(option => !enumValues.paymentOptions.includes(option))) {
        throw `Invalid payment option, valid payment options are: ${enumValues.paymentOptions.map(option => `'${option}'`).join(', ')}!`;
      }
    },
  },
  address: AddressModel,
});

const TableStateModel = new ServiceModel({
  state: 'string',
});



module.exports = {
  ServiceModel, ServiceCollectionModel, InvalidDataError, InvalidDataCollectionError,
  AddressModel, RestaurantModel, TableStateModel,
};



function validate(model, obj, partial = false) {
  const fields = Object.keys(model);
  const errors = {};

  for (const field of fields) {
    try {
      if ( !(field in obj) ) {
        if (!partial) throw 'Missing field!';
        continue;
      }

      const type = Array.isArray(obj[field]) ? 'array' : typeof obj[field];

      if (typeof model[field] === 'string') {
        if (model[field] !== 'any' && type !== model[field]) throw `Invalid type, got: ${type}, expected: ${model[field]}!`;
        continue;
      }

      if (model[field] instanceof ServiceCollectionModel) {
        validateCollection(model[field].checks, obj[field], partial);
        continue;
      }
      else if (model[field] instanceof ServiceModel) {
        validate(model[field].checks, obj[field], partial);
        continue;
      }

      if (model[field].type !== 'any' && type !== model[field].type) throw `Invalid type, got: ${type}, expected: ${model[field].type}!`;
      if ('check' in model[field]) model[field].check(obj[field]);

      if (type === 'string') {
        if ('pattern' in model[field] && !obj[field].match(model[field].pattern)) throw `Invalid ${field}!`;
        if ('minLength' in model[field] && obj[field].length < model[field].minLength) throw `${field} must be at least ${model[field].minLength} characters long!`;
        if ('maxLength' in model[field] && obj[field].length > model[field].maxLength) throw `${field} must be at most ${model[field].maxLength} characters long!`;
      }
      else if (type === 'number') {
        if ('min' in model[field] && obj[field] < model[field].min) throw `${field} must be at least ${model[field].min}!`;
        if ('max' in model[field] && obj[field] > model[field].max) throw `${field} must be at most ${model[field].max}!`;
      }
      else if (type == 'array') {
        if ('baseType' in model[field] && model[field].baseType !== 'any' && obj[field].some(element => typeof element !== model[field].baseType)) {
          throw `Not all elements of ${field} are of type ${model[field].baseType}!`;
        }
      }
    }
    catch (err) {
      errors[field] = err;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new InvalidDataError(errors);
  }
}

function validateCollection(model, coll, partial = false) {
  if (!Array.isArray(coll)) throw new InvalidDataCollectionError();
  const errors = [];

  for (let idx = 0; idx < coll.length; idx++) {
    try {
      validate(model, coll[idx], partial);
    }
    catch (err) {
      errors.push({idx, errors: err.errors});
    }
  }

  if (errors.length > 0) {
    throw new InvalidDataCollectionError(errors);
  }
}
