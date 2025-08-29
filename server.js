const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const dataFile = path.join(__dirname, 'data', 'transactions.json');

function readTransactions() {
  const rawData = fs.readFileSync(dataFile, 'utf-8');
  return JSON.parse(rawData);
}

function writeTransactions(transactions) {
  fs.writeFileSync(dataFile, JSON.stringify(transactions, null, 2));
}

// ---------------------- APIs ----------------------

// Get all transactions
app.get('/transactions', (req, res) => {
  const transactions = readTransactions();
  res.json(transactions);
});

// Get only flagged transactions
app.get('/flagged-transactions', (req, res) => {
  const transactions = readTransactions();
  const flagged = transactions.filter(t => t.suspicionScore > 70 || t.status === 'Pending Review');
  res.json(flagged);
});

// KPI reports
app.get('/reports', (req, res) => {
  const transactions = readTransactions();
  const confirmedFraud = transactions.filter(t => t.status === 'Confirmed Fraud').length;
  res.json({ confirmedFraud });
});

// Update transaction status
app.patch('/transactions/:id/status', (req, res) => {
  const transactions = readTransactions();
  const txnId = req.params.id;
  const { status } = req.body;
  const txnIndex = transactions.findIndex(t => t.id === txnId);
  if (txnIndex === -1) return res.status(404).json({ error: 'Transaction not found' });
  transactions[txnIndex].status = status;
  writeTransactions(transactions);
  res.json({ success: true, transaction: transactions[txnIndex] });
});

// ---------------------- Fake Transaction Generator ----------------------

function generateRandomTransaction() {
  const merchants = ['Amazon','Flipkart','Walmart','Apple Store','Best Buy','Netflix'];
  const locations = ['Delhi','Mumbai','Bangalore','Chennai','Hyderabad','Pune'];
  const cards = ['**** **** **** 1234','**** **** **** 5678','**** **** **** 9012'];

  return {
    id: uuidv4(),
    amount: parseFloat((Math.random()*1000+10).toFixed(2)),
    merchant: merchants[Math.floor(Math.random()*merchants.length)],
    location: locations[Math.floor(Math.random()*locations.length)],
    card: cards[Math.floor(Math.random()*cards.length)],
    suspicionScore: Math.floor(Math.random()*100),
    status: 'Pending Review',
    reasons: ['High amount','Unusual location','New merchant'].filter(() => Math.random() > 0.5)
  };
}

// Add a new transaction every 2 seconds
setInterval(() => {
  const transactions = readTransactions();
  transactions.push(generateRandomTransaction());
  writeTransactions(transactions);
  console.log('New transaction generated. Total:', transactions.length);
}, 5000);

// ---------------------- Start Server ----------------------
app.listen(PORT, () => {
  console.log(`AuraGuard backend running on http://localhost:${PORT}`);
});
