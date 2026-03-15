const { GoogleGenerativeAI } = require('@google/generative-ai');

const KEY = 'AIzaSyBtCU3o0VpkMaff46W3KQp5fcGmKLDkaMU';
const genAI = new GoogleGenerativeAI(KEY);

async function testModels() {
  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
  for (const m of models) {
    console.log(`Testing ${m}...`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Say exactly "Hello"');
      console.log(`✅ ${m} works: ${res.response.text().trim()}`);
    } catch (e) {
      console.error(`❌ ${m} failed: ${e.message}`);
    }
  }
}

testModels();
