class DBSource {

    name;
    constructor(name) {
        this.name = name;
    }

    select(projection) {
        const query = Query.select(projection, this.name);
        return new Statement(query);
    }

}

class IndexedDBSource {

    constructor(name) {
        const dbSource = new DBSource(name);
        const proxyHandlers = { get: this.#indexHandler };
        return new Proxy(dbSource, proxyHandlers);
    }

    #indexHandler = (dbSource, key) => {
        if (key in dbSource) return dbSource[key];

        const query = Query.select('*', dbSource.name);
        query.filter = `${dbSource.name}.id == ${key}`;
        return new Statement(query);
    }

}

class Query {
    action;
    source;
    filter;
    orders;

    projection;
    updates;

    constructor(action, source) {
        this.action = action;
        this.source = source;
    }

    static select(projection, source) {
        const query = new Query('SELECT', source);
        query.projection = projection;
        return query;
    }

    execute() {
        console.log('sent to db:', this.toString());
    }

    toString() {
        let query =  `${this.action} ${this.projection} FROM ${this.source}`;
        if (this.filter) query += ` WHERE ${this.filter}`;
        if (this.orders) query += ` ORDER BY ${this.orders}`;
        return query;
    }

}

class Statement {
    query;
    constructor(query) {
        this.query = query;
        queueMicrotask($=> this.query.execute());
    }

    where(condition) {
        if (typeof condition === 'function') {
            let alias, check;
            [alias, check] = condition.toString().split(' => ');
            this.query.filter = check.split(alias).join(this.query.source);
        }
        else {
            this.query.filter = condition;
        }

        return this;
    }

    orderBy(orders) {
        this.query.orders = orders;
        return this;
    }
}



const Cars = new IndexedDBSource('cars');

Cars.select('*');
Cars.select('id').where('cars.id > 10');
Cars.select('name').orderBy('name');
Cars.select('id, name').where(car => car.id % 2 == 0).orderBy('name ASC, id DESC');

const myCarId = 153;
Cars[myCarId];