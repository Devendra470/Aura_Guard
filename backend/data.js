const { faker } = require('@faker-js/faker');

const HIGH_RISK_MERCHANTS = ['DarkWebGoods', 'Shady VPN Services', 'Questionable E-Store'];

function generateRandomTransaction() {
    const id = faker.string.uuid();
    const amount = parseFloat(faker.commerce.price({ min: 10, max: 2000 }));
    const card = faker.finance.creditCardNumber().replace(/./g, '*').slice(0, -4) + faker.finance.creditCardNumber().slice(-4);
    const merchant = faker.helpers.arrayElement(HIGH_RISK_MERCHANTS.concat(faker.company.name()));
    const location = faker.location.country();

    let suspicion_score = faker.number.int({ min: 10, max: 99 });
    const reasons = [];

    // Simulate fraud patterns
    if (amount > 1000) {
        suspicion_score += 15;
        reasons.push("Unusually large transaction amount.");
    }
    if (HIGH_RISK_MERCHANTS.includes(merchant)) {
        suspicion_score += 20;
        reasons.push("Transaction from a high-risk merchant.");
    }
    if (faker.datatype.boolean(0.3)) { // 30% chance
        suspicion_score += 10;
        reasons.push("Unusual location for cardholder.");
    }
    if (faker.datatype.boolean(0.2)) { // 20% chance
        suspicion_score += 5;
        reasons.push("Multiple transactions in a short period.");
    }

    // Ensure score doesn't exceed 99
    suspicion_score = Math.min(suspicion_score, 99);
    
    // Status is 'Pending Review' if score is 70 or higher, otherwise 'Legitimate'
    const status = suspicion_score >= 70 ? 'Pending Review' : 'Legitimate';

    return {
        id,
        amount,
        suspicion_score,
        card,
        merchant,
        location,
        reasons,
        status,
    };
}

module.exports = {
    generateRandomTransaction,
};