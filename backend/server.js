const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 5000;

// Configure AWS SDK
AWS.config.update({
  region: 'ap-south-1', // Replace with your region
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json());

// Register Route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const params = {
      TableName: 'Users',
      Item: {
        email,
        password: hashedPassword,
      },
    };

    await dynamodb.put(params).promise();
    res.status(201).send('User registered');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const params = {
      TableName: 'Users',
      Key: {
        email,
      },
    };

    const data = await dynamodb.get(params).promise();

    if (!data.Item) {
      return res.status(404).send('User not found');
    }

    const match = await bcrypt.compare(password, data.Item.password);
    if (match) {
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
