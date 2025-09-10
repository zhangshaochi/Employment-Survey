// 阿里百炼对话接口（临时用 DashScope 模型级网关验证 KEY）
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ answer: '缺少 prompt' });

  console.log('请求体:', JSON.stringify({ prompt, temperature: 0.7, max_tokens: 800 }));

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BAILIAN_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-max',          // 模型级接口必填
        input: { prompt },
        parameters: { temperature: 0.7, max_tokens: 800 }
      })
    });

    const result = await response.json();
    console.log('百炼原始返回：', JSON.stringify(result, null, 2));

    const text = result?.output?.text || result?.text || '无返回内容';
    return res.status(200).json({ answer: text });
  } catch (e) {
    console.error('调用百炼异常：', e);
    return res.status(500).json({ answer: '后端调用失败：' + e.message });
  }
}
