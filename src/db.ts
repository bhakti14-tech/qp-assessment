import { Pool } from "pg";


const pool = new Pool({
  user: 'dev_read_write_user',
  host: '192.168.2.213',
  database: 'instarem_development',
  password: 'rDsb9NEnynX7wpdMAS',
  port: 5432,
});


export default pool;
