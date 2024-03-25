"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const bodyParser = require('bodyParser');
const routes_1 = require("./routes");
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use("/", routes_1.default);
app.listen(port, () => {
    console.log(`server is listening on http://localhost:${port}....`);
});
