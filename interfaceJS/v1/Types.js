function Nullable(type) {
    this.type = type;
}

function Integer(val) {
    return val;
}

///////////////////////////////////////

function Enum(...values) {
    for(let value of values) {
        this[value] = value;
    }
}

Enum.values = function(_enum) {
    return Object.keys(_enum);
};

Enum.includes = function(_enum, value) {
    return (value in _enum);
};

///////////////////////////////////////

function Interface(schema, Prototype = Object) {
    const schemaChecks = createSchemaChecks(schema);

    this.isImplementedBy = (obj) => {
        try {
            validate(obj, schemaChecks);
            return true;
        }
        catch(_) {
            return false;
        }
    };

    this.from = function(objOrjson) {
        let obj = objOrjson;
        
        if (typeof objOrjson == 'string') {
            obj = JSON.parse(objOrjson);
        }

        validate(obj, schemaChecks);
        return Object.assign(new Prototype(), obj);
    };
}

Interface.for = function(Prototype) {
    this.with = (schema) => {
        return new Interface(schema, Prototype);
    };
};

Interface.with = function(schema) {
    return new Interface(schema);
};

JSON.parse.as = function(jsonString, interface) {
    return interface.from(jsonString);
};

// helpers
function validate(obj, schemaChecks) {
    schemaChecks.forEach((check) => {
        check(obj);
    });
}

function createSchemaChecks(schema) {
    let schemaChecks = [];

    for (const key in schema) {
        let type = schema[key];
        let optional = false;
        let nullable = false;

        if(Array.isArray(type)) {
            type = type[0];
            optional = true;
        }

        if(type instanceof Nullable) {
            type = type.type;
            nullable = true;
        }

        if(type instanceof Enum) {
            addTypeCheck(schemaChecks, key, 'Enum', optional, nullable, (val) => (Enum.includes(type, val)));
        }
        if(type instanceof Interface) {
            addTypeCheck(schemaChecks, key, 'Interface', optional, nullable, (val) => (type.isImplementedBy(val)));
        }
        else if (typeof type == 'object') {
            if (!optional) addNotOptionalCheck(schemaChecks, key);
            if (!nullable) addNotNullableCheck(schemaChecks, key);
        
            const innerChecks = createSchemaChecks(type);
            schemaChecks.push((obj) => {
                validate(obj[key], innerChecks);
            });
        }
        if (type === Number) {
            addTypeCheck(schemaChecks, key, 'Number', optional, nullable, (val) => (typeof val == 'number'));
        }
        else if(type === String) {
            addTypeCheck(schemaChecks, key, 'String', optional, nullable, (val) => (typeof val == 'string'));
        }
        else if(type === Boolean) {
            addTypeCheck(schemaChecks, key, 'Boolean', optional, nullable, (val) => (typeof val == 'boolean'));
        }
        else if(type === Array) {
            addTypeCheck(schemaChecks, key, 'Array', optional, nullable, (val) => (Array.isArray(val)));
        }
        else if(type === Object) {
            addTypeCheck(schemaChecks, key, 'Object', optional, nullable, (val) => (typeof val == 'object'));
        }
        else if(type === Error) {
            addTypeCheck(schemaChecks, key, 'Error', optional, nullable, (val) => (val instanceof Error));
        }
        else if(type == Integer) {
            addTypeCheck(schemaChecks, key, 'Integer', optional, nullable, (val) => (typeof val == 'number' && Number.isInteger(val)));
        }
    }

    return schemaChecks;
}

function addTypeCheck(schemaChecks, key, type, optional, nullable, condition) {
    if (!optional) addNotOptionalCheck(schemaChecks, key);
    if (!nullable) addNotNullableCheck(schemaChecks, key);

    schemaChecks.push((obj) => {
        fail_unless(
            `${key} is not a valid ${type}, value: ${JSON.stringify(obj[key])}`, 
            obj[key] === undefined || obj[key] === null || condition(obj[key])
        );
    });
}

function addNotOptionalCheck(schemaChecks, key) {
    schemaChecks.push((obj) => {
        fail_unless(
            `${key} is not optional, value: ${obj[key]}`, 
            (obj[key] !== undefined)
        );
    });
}

function addNotNullableCheck(schemaChecks, key) {
    schemaChecks.push((obj) => {
        fail_unless(
            `${key} is not nullable, value: ${obj[key]}`, 
            (obj[key] !== null)
        );
    });
}

function fail_unless(msg, condition) {
    if(!condition) {
        throw new Error(msg);
    }
}

///////////////////////////////////////



module.exports = { Nullable, Integer, Enum, Interface };