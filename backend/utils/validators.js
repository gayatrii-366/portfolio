/**
 * Validates contact form payload.
 * Returns an error string if invalid, null if valid.
 *
 * @param {{ name: string, email: string, message: string }} fields
 * @returns {string | null}
 */
const validateContactInput = ({ name, email, message }) => {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }

  if (!email || typeof email !== 'string') {
    return 'Email is required.';
  }

  // RFC 5322 simplified email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please provide a valid email address.';
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return 'Message must be at least 10 characters.';
  }

  return null; // ✅ all valid
};

module.exports = { validateContactInput };
