const { validateContactInput } = require('../utils/validators');

/**
 * POST /api/contact
 * Accepts { name, email, message } and validates before processing.
 * Currently logs and returns success — ready for email integration.
 */
const submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    const validationError = validateContactInput({ name, email, message });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // TODO: integrate nodemailer / SendGrid here when needed
    console.log(`📧 New contact from ${name} <${email}>:\n${message}\n`);

    res.status(200).json({
      success: true,
      message: 'Message received! Gayatri will get back to you soon.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContact };
