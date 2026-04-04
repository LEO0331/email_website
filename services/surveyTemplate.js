module.exports = survey => {
  const baseUrl = process.env.DOMAIN || process.env.APP_BASE_URL || 'http://localhost:5000';

  return `
  <html>
    <body>
      <div style="text-align: center;">
        <h2>We would like to hear from you!</h2>
        <p>Please answer the following question:</p>
        <p>${survey.body}</p>
        <div>
          <a href="${baseUrl}/api/surveys/${survey.id}/yes">Yes</a>
        </div>
        <div>
          <a href="${baseUrl}/api/surveys/${survey.id}/no">No</a>
        </div>
      </div>
    </body>
  </html>
  `;
};
