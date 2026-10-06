import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuración de la conexión a Neon
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido por Neon y servicios Cloud
    }
});

// Probar la conexión al iniciar
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos (Neon):', err.message);
    } else {
        console.log('✅ Conexión exitosa a la base de datos Neon PostgreSQL');
        release();
    }
});

export default pool;
