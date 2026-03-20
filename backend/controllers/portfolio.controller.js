const portfolioService = require('../services/portfolio.service');

/**
 * GET /api/portfolio
 * Returns the full structured portfolio data from JSON.
 */
const getPortfolio = async (req, res, next) => {
  try {
    const data = await portfolioService.getPortfolioData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPortfolio };
