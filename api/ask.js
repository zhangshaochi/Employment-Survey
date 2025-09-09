// 阿里百炼 对话接口
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ answer: '缺少 prompt' });

  try {
    const response = await fetch('https://bailian.aliyuncs.com/v2/app/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BAILIAN_API_KEY}` // 密钥藏在环境变量
      },
      body: JSON.stringify({
        app_id: process.env.BAILIAN_APP_ID, // 你的百炼应用 ID
        prompt,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const result = await response.json();
    const text = result?.output?.text || result?.text || '无返回内容';
    return res.status(200).json({ answer: text });
    console.log('百炼原始返回：', JSON.stringify(result, null, 2));
  } catch (e) {
    return res.status(500).json({ answer: '后端调用失败：' + e.message });
  }
}
