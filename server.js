const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Importamos axios
const path = require('path');

const app = express();

// Configurar body-parser para parsear JSON
app.use(bodyParser.json());

// Servir archivos estáticos (como index.html)
app.use(express.static(path.join(__dirname)));

// Almacenar los mensajes en memoria
let mensajes = [];

// URL del webhook (reemplaza con tu URL de n8n)
const WEBHOOK_URL = 'https://primary-production-6b09.up.railway.app/webhook/7449cc76-d513-45b4-9ef4-4c5bf0b3183f';

// Endpoint para recibir mensajes del cliente
app.post('/enviar-mensaje', async (req, res) => {
    const mensajeUsuario = req.body.mensaje;
    console.log('Mensaje del usuario:', mensajeUsuario);

    // Guardar el mensaje del usuario
    mensajes.push({ de: 'usuario', texto: mensajeUsuario });

    try {
        // Enviar el mensaje al webhook de n8n
        const respuestaWebhook = await axios.post(WEBHOOK_URL, { mensaje: mensajeUsuario });

        // Obtener la respuesta del webhook
        const respuestaBot = respuestaWebhook.data.response; // Asumiendo que el webhook devuelve { response: '...' }
        console.log('Respuesta del webhook:', respuestaBot);

        // Guardar la respuesta del bot
        mensajes.push({ de: 'bot', texto: respuestaBot });

        // Enviar la respuesta al cliente
        res.json({ respuesta: respuestaBot });
    } catch (error) {
        console.error('Error al comunicarse con el webhook:', error);
        res.status(500).json({ error: 'Error al comunicarse con el webhook' });
    }
});

// Endpoint para obtener los mensajes
app.get('/mensajes', (req, res) => {
    res.json(mensajes);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
