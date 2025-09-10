// 百炼 SDK 调用（Node.js 版）
import fetch from 'node-fetch';   // Vercel 自带，不用装

const API_KEY = process.env.DASHSCOPE_API_KEY;
const APP_ID  = '353cca36c633460b982bc42ca2c2ed28';   // 你的房门号

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ answer: '缺少 prompt' });

  console.log('请求体:', prompt);

  try {
    // === 官方 SDK 等价的一行 HTTP ===
    const rsp = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`,
      {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ prompt })   // 只传这句
      }
    );

    const result = await rsp.json();
    console.log('百炼原始返回：', JSON.stringify(result, null, 2));

    const text = result?.output?.text || result?.text || '无返回内容';
    return res.status(200).json({ answer: text });
  } catch (e) {
    console.error('调用百炼异常：', e);
    return res.status(500).json({ answer: '后端调用失败：' + e.message });
  }
}
