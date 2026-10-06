import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js'; // Importamos la conexión a Neon

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
    res.json({ mensaje: 'Bienvenido a la API de AlojAR' });
});

// Ruta de prueba para ver si la base de datos responde
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS fecha_actual');
        res.json({ 
            mensaje: 'Conexión a Neon exitosa', 
            hora_servidor: result.rows[0].fecha_actual 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
