const path = require('path');
const resumeService = require('../services/resume.service');

/**
 * GET /api/resume
 * Serves the resume PDF for both in-browser viewing and download.
 */
const downloadResume = async (req, res, next) => {
  try {
    const resumePath = await resumeService.getResumePath();
    const fileName = 'Gayatri_Swami_Resume.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    res.sendFile(resumePath, (err) => {
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { downloadResume };
