import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "bookabook",
  password: "2005",
  port: 5432,
});

export default pool;