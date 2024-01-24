// Importieren der erforderlichen Module
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const { createPool } = require('generic-pool');
const cors = require('cors');
require('express-async-errors');

// Erstellen einer Express-Anwendung
const app = express();
const port = 3000;

// Middleware für CORS und JSON-Body-Parser konfigurieren
app.use(cors());
app.use(bodyParser.json());

// MongoDB-Verbindungszeichenfolge
const mongoUrl = 'mongodb://atlas-sql-65b0dc29dae8c60026c4143c-ylzot.a.query.mongodb.net/sample_airbnb?ssl=true&authSource=admin';

// Erstellen Sie einen Verbindungspool für MongoDB
const mongoPool = createPool({
  create: async () => {
    // Verbindung zur MongoDB herstellen
    const client = await MongoClient.connect(mongoUrl);
    return client;
  },
  destroy: async (client) => await client.close(),
}, {
  max: 10,  // Maximale Anzahl gleichzeitiger Verbindungen im Pool
  min: 2,   // Minimale Anzahl offener Verbindungen im Pool
});

// Endpunkt zum Aktualisieren des Themas
app.post('/api/setTheme', async (req, res) => {
  const { userId, isDark } = req.body;

  let client;
  try {
    // Verbindung aus dem Pool abrufen
    client = await mongoPool.acquire();

    // MongoDB-Datenbank und -Sammlung auswählen
    const database = client.db('sample_airbnb');
    const collection = database.collection('themes');

    console.log(`Updating theme for userId ${userId}...`);

    // MongoDB-Dokument aktualisieren oder ein neues erstellen
    await collection.updateOne(
      { userId },
      { $set: { isDark } },
      { upsert: true }
    );

    console.log('Theme updated successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating theme:', error);
    throw error;
  } finally {
    // Verbindung zurück in den Pool legen, auch im Fehlerfall
    if (client) {
      mongoPool.release(client);
    }
  }
});

// Endpunkt zum Abrufen des Themas
app.get('/api/getTheme/:userId', async (req, res) => {
  const userId = req.params.userId;

  let client;
  try {
    // Verbindung aus dem Pool abrufen
    client = await mongoPool.acquire();

    // MongoDB-Datenbank und -Sammlung auswählen
    const database = client.db('sample_airbnb');
    const collection = database.collection('themes');

    console.log(`Fetching theme for userId ${userId}...`);

    // Thema für die angegebene Benutzer-ID abrufen
    const theme = await collection.findOne({ userId });

    if (!theme) {
      console.log(`No theme found for userId ${userId}`);
      return res.status(404).json({ error: 'Theme not found' });
    }

    console.log('Theme fetched successfully');
    res.json({ isDark: theme.isDark });
  } catch (error) {
    console.error('Error fetching theme:', error);
    throw error;
  } finally {
    // Verbindung zurück in den Pool legen, auch im Fehlerfall
    if (client) {
      mongoPool.release(client);
    }
  }
});

// Globale Fehlerbehandlung
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Server starten und auf Port warten
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  
});

