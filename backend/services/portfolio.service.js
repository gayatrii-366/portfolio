const path = require('path');
const fs = require('fs').promises;

const DATA_PATH = path.join(__dirname, '..', 'data', 'portfolio.json');

/**
 * Reads and parses the portfolio JSON data file.
 * Using fs.promises for non-blocking I/O.
 */
const getPortfolioData = async () => {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    const err = new Error('Portfolio data could not be loaded.');
    err.statusCode = 500;
    throw err;
  }
};

module.exports = { getPortfolioData };
