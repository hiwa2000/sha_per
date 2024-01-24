const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Verwende deine tatsächliche MongoDB-Verbindungszeichenfolge
const mongoUrl = 'mongodb://atlas-sql-65b0dc29dae8c60026c4143c-ylzot.a.query.mongodb.net/sample_airbnb?ssl=true&authSource=admin';

app.post('/api/setTheme', async (req, res) => {
  const { userId, isDark } = req.body;
  const client = new MongoClient(mongoUrl, { useUnifiedTopology: true });

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('sample_airbnb'); // Ändere dies entsprechend deiner Datenbank
    const collection = database.collection('themes');

    console.log(`Updating theme for userId ${userId}...`);
    await collection.updateOne(
      { userId },
      { $set: { isDark } },
      { upsert: true }
    );
    
    console.log('Theme updated successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

app.get('/api/getTheme/:userId', async (req, res) => {
  const userId = req.params.userId;
  const client = new MongoClient(mongoUrl, { useUnifiedTopology: true });

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('sample_airbnb'); // Ändere dies entsprechend deiner Datenbank
    const collection = database.collection('themes');

    console.log(`Fetching theme for userId ${userId}...`);
    const theme = await collection.findOne({ userId });

    console.log('Theme fetched successfully');
    res.json({ isDark: theme ? theme.isDark : false });
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
