const express = require('express');
const cors = require('cors');
const { createTransactionTable, addTransaction, getTransactions, getFlaggedTransactions, getReports, updateTransactionStatus } = require('./database');
const { generateRandomTransaction } = require('./data');

const app = express();
app.use(express.json());
app.use(cors());

// Create the transactions table if it doesn't exist
createTransactionTable();

// API routes
app.get('/transactions', async (req, res) => {
    const transactions = await getTransactions();
    res.json(transactions);
});

app.get('/flagged-transactions', async (req, res) => {
    const flaggedTransactions = await getFlaggedTransactions();
    res.json(flaggedTransactions);
});

app.get('/reports', async (req, res) => {
    const reports = await getReports();
    res.json(reports);
});

app.patch('/transactions/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    await updateTransactionStatus(id, status);
    res.json({ message: 'Transaction status updated successfully' });
});

// Automated transaction generation every 5 minutes (300000 ms)
setInterval(() => {
    const newTransaction = generateRandomTransaction();
    addTransaction(newTransaction);
    console.log(`[LOG] New transaction generated and added: ${newTransaction.id}`);
}, 120000);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});