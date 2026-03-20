require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio backend running at http://localhost:${PORT}`);
  console.log(`   → GET  /api/resume`);
  console.log(`   → GET  /api/portfolio`);
  console.log(`   → POST /api/contact\n`);
});
