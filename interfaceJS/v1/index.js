const express = require('express');
const bodyParser = require('body-parser');

const hostname = 'localhost';
const port = 8080;
const app = express();
app.use(bodyParser.json());

const { Interface, Integer, Nullable, Enum } = require('./Types');
const addInterfaceMiddleware = require('./Interface-middleware');
addInterfaceMiddleware(Interface);

const model = new Interface.with({
    name: String,
    age: Integer,
    duration: {
        min: Number,
        max: [Number]     // optional
    },
    partners: new Nullable(String),  // nullable
    status: new Enum('alive', 'death')
});

app.post('/test', model.validatePayload(), (_, res) => {
    res.sendStatus(200);
});

app.listen(port, hostname, () => {
    console.log(`The server is running at http://${hostname}:${port}`);
});
