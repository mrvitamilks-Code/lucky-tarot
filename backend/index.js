const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FREE_LIMIT = 3;

function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

app.get('/', (req, res) => {
  res.json({ status: 'Lucky Tarot API running ✦' });
});

app.get('/api/limit', async (req, res) => {
  const ip = getIP(req);
  const today = new Date().toISOString().split('T')[0];
  try {
    const { data } = await supabase
      .from('daily_limits')
      .select('count')
      .eq('ip_address', ip)
      .eq('date', today)
      .single();
    const used = data?.count || 0;
    res.json({ used, limit: FREE_LIMIT, remaining: Math.max(0, FREE_LIMIT - used) });
  } catch {
    res.json({ used: 0, limit: FREE_LIMIT, remaining: FREE_LIMIT });
  }
});

app.post('/api/reading', async (req, res) => {
  const ip = getIP(req);
  const today = new Date().toISOString().split('T')[0];

  // ── ตรวจ limit ──
  try {
    const { data } = await supabase
      .from('daily_limits')
      .select('count')
      .eq('ip_address', ip)
      .eq('date', today)
      .single();

    const currentCount = data?.count || 0;
    if (currentCount >= FREE_LIMIT) {
      return res.status(429).json({
        error: 'daily_limit_reached',
        message: `ครบ ${FREE_LIMIT} ครั้งแล้ววันนี้ กรุณาลองใหม่พรุ่งนี้`,
        used: currentCount,
        limit: FREE_LIMIT,
        remaining: 0
      });
    }
  } catch (err) {
    console.log('Limit check (new user):', err.message);
  }

  const { question, cards, spread } = req.body;
  if (!question || !cards) {
    return res.status(400).json({ error: 'Missing question or cards' });
  }

  const cardDesc = cards.map(c =>
    `- ${c.th || c.name}${c.reversed ? ' (กลับหัว)' : ''} ตำแหน่ง "${c.position}" ความหมาย: ${c.meaning}`
  ).join('\n');

  const prompt = `คุณคือหมอดูไพ่ทาโร่ผู้เชี่ยวชาญ ให้คำทำนายเป็นภาษาไทยที่ลึกซึ้ง อ่านง่าย และให้กำลังใจ

คำถาม: ${question}
รูปแบบไพ่: ${spread}
ไพ่ที่จั่วได้:
${cardDesc}

วิเคราะห์ไพ่แต่ละใบและความเชื่อมโยงกัน ให้คำทำนายที่เป็นประโยชน์และสร้างแรงบันดาลใจ ความยาวประมาณ 200-300 คำ ไม่ต้องใช้ Markdown`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.8,
    });

    const reading = completion.choices[0].message.content;

    // ── เพิ่ม count ──
    const { data: existing } = await supabase
      .from('daily_limits')
      .select('count')
      .eq('ip_address', ip)
      .eq('date', today)
      .single();

    const newCount = (existing?.count || 0) + 1;
    await supabase
      .from('daily_limits')
      .upsert({ ip_address: ip, date: today, count: newCount }, { onConflict: 'ip_address,date' });

    res.json({ reading, used: newCount, limit: FREE_LIMIT, remaining: Math.max(0, FREE_LIMIT - newCount) });

  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ error: 'AI reading failed', detail: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✦ Tarot API running on port ${PORT}`));
