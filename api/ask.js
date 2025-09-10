// api/ask.js - 百炼官方 SDK 调用（Node.js + Vercel 适配版）
import { Application } from '@dashscope/sdk';

// 从 Vercel 环境变量获取密钥和 APP_ID
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const BAILIAN_APP_ID = process.env.BAILIAN_APP_ID;

// 验证环境变量是否存在
if (!DASHSCOPE_API_KEY) {
  console.error('错误：环境变量 DASHSCOPE_API_KEY 未配置');
}
if (!BAILIAN_APP_ID) {
  console.error('错误：环境变量 BAILIAN_APP_ID 未配置');
}

export default async function handler(req, res) {
  try {
    // 校验请求方法
    if (req.method !== 'POST') {
      return res.status(405).json({ answer: '仅支持 POST 请求' });
    }

    // 校验请求体中的 prompt
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ answer: '请输入提问内容' });
    }
    console.log('收到用户提问：', prompt);

    // 校验环境变量
    if (!DASHSCOPE_API_KEY || !BAILIAN_APP_ID) {
      return res.status(500).json({ answer: '后端环境变量未配置完整' });
    }

    // 配置百炼 SDK 的 API Key
    Application.api_key = DASHSCOPE_API_KEY;

    // 调用百炼智能体 API
    console.log('开始调用百炼智能体，APP_ID：', BAILIAN_APP_ID);
    const response = await Application.call({
      app_id: BAILIAN_APP_ID,
      prompt: prompt,
      parameters: {
        temperature: 0.7,
        stream: false
      }
    });

    // 处理百炼响应
    console.log('百炼返回原始响应：', JSON.stringify(response, null, 2));
    if (response.status_code !== 200) {
      const errorMsg = `百炼调用失败：${response.message || '未知错误'}（错误码：${response.status_code}）`;
      console.error(errorMsg);
      return res.status(500).json({ answer: errorMsg });
    }

    // 提取回答
    const answer = response.output?.text?.trim() || '百炼智能体未返回有效回答';
    console.log('百炼返回回答：', answer);
    return res.status(200).json({ answer: answer });

  } catch (error) {
    const errorMsg = `后端代码异常：${error.message || '未知异常'}`;
    console.error(errorMsg);
    return res.status(500).json({ answer: errorMsg });
  }
}
