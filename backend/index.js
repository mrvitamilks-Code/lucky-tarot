const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.json({ status: 'Lucky Tarot API running ✦' });
});

app.post('/api/reading', async (req, res) => {
  const { question, cards, spread } = req.body;
  if (!question || !cards) {
    return res.status(400).json({ error: 'Missing question or cards' });
  }

  const cardDesc = cards.map(c =>
    `- ${c.name}${c.reversed ? ' (กลับหัว)' : ''} ตำแหน่ง "${c.position}" ความหมาย: ${c.meaning}`
  ).join('\n');

  const prompt = `คุณคือหมอดูไพ่ทาโร่ผู้เชี่ยวชาญ ให้คำทำนายเป็นภาษาไทยที่ลึกซึ้ง อ่านง่าย และให้กำลังใจ

คำถาม: ${question}
รูปแบบไพ่: ${spread}
ไพ่ที่จั่วได้:
${cardDesc}

กรุณาวิเคราะห์ไพ่แต่ละใบและความเชื่อมโยงกัน ให้คำทำนายที่เป็นประโยชน์และสร้างแรงบันดาลใจ ความยาวประมาณ 200-300 คำ ไม่ต้องใช้ Markdown`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const reading = result.response.text();
    res.json({ reading });
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: 'AI reading failed', detail: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✦ Tarot API running on port ${PORT}`));
