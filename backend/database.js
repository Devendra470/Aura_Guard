const { Pool } = require('pg');

// Use environment variables for production, or a local connection string for development.
const pool = new Pool({
    connectionString: 'postgresql://auraguard_db_user:KQEsYIzqkA3KmMy3clNeNaXm6RkQJFk3@dpg-d2p8eore5dus73at927g-a.oregon-postgres.render.com/auraguard_db',
    ssl: {
        rejectUnauthorized: false
    }
});

async function createTransactionTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(255) PRIMARY KEY,
            amount DECIMAL(10, 2) NOT NULL,
            suspicion_score INT NOT NULL,
            card VARCHAR(255) NOT NULL,
            merchant VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            reasons TEXT[] NOT NULL,
            status VARCHAR(255) NOT NULL
        );
    `;
    try {
        await pool.query(query);
        console.log("Transactions table created successfully.");
    } catch (err) {
        console.error("Error creating transactions table:", err);
    }
}

async function addTransaction(transaction) {
    const { id, amount, suspicion_score, card, merchant, location, reasons, status } = transaction;
    const query = `
        INSERT INTO transactions (id, amount, suspicion_score, card, merchant, location, reasons, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [id, amount, suspicion_score, card, merchant, location, reasons, status];
    try {
        await pool.query(query, values);
    } catch (err) {
        console.error("Error adding transaction:", err);
    }
}

async function getTransactions() {
    const query = 'SELECT * FROM transactions ORDER BY suspicion_score DESC, id DESC';
    const { rows } = await pool.query(query);
    return rows.map(row => ({
        id: row.id,
        amount: parseFloat(row.amount),
        suspicionScore: row.suspicion_score,
        card: row.card,
        merchant: row.merchant,
        location: row.location,
        reasons: row.reasons,
        status: row.status
    }));
}

async function getFlaggedTransactions() {
    const query = `
        SELECT * FROM transactions 
        WHERE suspicion_score >= 70 AND status = 'Pending Review' 
        ORDER BY suspicion_score DESC
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
        id: row.id,
        amount: parseFloat(row.amount),
        suspicionScore: row.suspicion_score,
        card: row.card,
        merchant: row.merchant,
        location: row.location,
        reasons: row.reasons,
        status: row.status
    }));
}

async function getReports() {
    const query = `
        SELECT COUNT(*) AS confirmedFraud FROM transactions WHERE status = 'Confirmed Fraud';
    `;
    const { rows } = await pool.query(query);
    return {
        confirmedFraud: parseInt(rows[0].confirmedfraud, 10),
    };
}

async function updateTransactionStatus(id, status) {
    const query = `
        UPDATE transactions SET status = $1 WHERE id = $2
    `;
    await pool.query(query, [status, id]);
}

module.exports = {
    createTransactionTable,
    addTransaction,
    getTransactions,
    getFlaggedTransactions,
    getReports,
    updateTransactionStatus,
};