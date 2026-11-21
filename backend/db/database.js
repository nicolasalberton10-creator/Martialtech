import mysql from "mysql2/promise";

const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "Ni19100808.@",
    database: "martialtech"
});

export default db;
