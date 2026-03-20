const path = require('path');
const fs = require('fs');

const RESUME_PATH = path.join(__dirname, '..', 'data', 'resume.pdf');

/**
 * Returns the absolute path to the resume file.
 * Throws a structured error if the file is missing.
 */
const getResumePath = async () => {
  if (!fs.existsSync(RESUME_PATH)) {
    const err = new Error('Resume file not found. Please upload data/resume.pdf.');
    err.statusCode = 404;
    throw err;
  }
  return RESUME_PATH;
};

module.exports = { getResumePath };
