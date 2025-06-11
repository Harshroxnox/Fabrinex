import { db } from '../index.js';

// Function to calculate EAN-13 checksum digit
const calculateEAN13Checksum = (number) => {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(number[i]);
        sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
};

// Generate a unique barcode
const generateUniqueBarcode = async () => {
    let barcode;
    let exists = true;

    while (exists) {
        const base = String(Math.floor(Math.random() * 1e12)).padStart(12, '0');
        const checksum = calculateEAN13Checksum(base);
        barcode = base + checksum;

        // Check if barcode already exists in DB
        const [rows] = await db.execute(
            "SELECT barcode FROM ProductVariants WHERE barcode = ?",
            [barcode]
        );

        if (rows.length === 0) {
            exists = false;
        }
    }

    return barcode;
};

export {generateUniqueBarcode}