import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function createOraclePool() {
    const pool = await oracledb.createPool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectionString: process.env.DB_CONNECTION_STRING,
        // poolMax: 10,
        // poolMin: 5,
        // queueMax: 2000,
    });
    return pool;
}


export const pool = createOraclePool();

export const getConnection = async () => {
    const poolInstance = await pool;
    return poolInstance.getConnection();
}
