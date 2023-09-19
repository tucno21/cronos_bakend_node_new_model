import mysql, { Pool, PoolConnection } from 'mysql2/promise';
const dotenv = require('dotenv');
dotenv.config();

// parametros
const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USERNAME || 'root';
const password = process.env.DB_PASSWORD || 'root';
const database = process.env.DB_DATABASE || 'cronos';
const portData = process.env.DB_PORT || 3306;
const port = parseInt(portData.toString());


class Database {

    private connection: Pool;

    constructor() {
        try {
            this.connection = mysql.createPool({
                host: host,
                user: user,
                password: password,
                database: database,
                port: port,
                // waitForConnections: true,
                // connectionLimit: 10,
                // queueLimit: 0,
            });
        } catch (error) {
            console.error('Error al crear la pool de conexiones:', error);
            throw error; // Lanza el error para que el llamador pueda manejarlo
        }
    }

    async query(sql: any, params: any) {
        const connection: PoolConnection = await this.connection.getConnection();
        try {
            const values = Object.values(params);
            // console.log(sql, values)
            const [rows] = await connection.query(sql, values);
            return rows;
        } finally {
            connection.release();
        }
    }
}

const dataBase = new Database();

export default dataBase;