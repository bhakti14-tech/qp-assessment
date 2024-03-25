"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: 'dev_read_write_user',
    host: '192.168.2.213',
    database: 'instarem_development',
    password: 'rDsb9NEnynX7wpdMAS',
    port: 5432,
});
exports.default = pool;
