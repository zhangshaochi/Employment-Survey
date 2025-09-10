// api/ask.js - 百炼纯 HTTP 调用（无需任何依赖，Vercel 直接运行）
export default async function handler(req, res) {
  try {
    // 1. 只允许 POST 请求
    if (req.method !== 'POST') {
      return res.status(405).json({ answer: '仅支持 POST 请求，请使用正确的请求方式' });
    }

    // 2. 检查是否有用户提问内容
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ answer: '请输入你的问题，不能为空哦～' });
    }
    console.log('收到用户提问：', prompt);

    // 3. 从 Vercel 环境变量获取百炼的密钥和 APP ID
    const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
    const BAILIAN_APP_ID = process.env.BAILIAN_API_KEY;

    // 4. 检查环境变量是否配置完整
    if (!DASHSCOPE_API_KEY || !BAILIAN_APP_ID) {
      return res.status(500).json({ answer: '后端配置不完整，请检查 API Key 和 APP ID' });
    }

    // 5. 调用百炼官方 REST API（无需 SDK，直接 HTTP 请求）
    const bailianApiUrl = "https://dashscope.aliyuncs.com/api/v1/chat/completions";
    const response = await fetch(bailianApiUrl, {
      method: 'POST',
      headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.DASHSCOPE_API_KEY}`
    }
      body: JSON.stringify({
        prompt: prompt,          // 用户的问题
        parameters: {
          temperature: 0.7,      // 回答随机性（0.0~2.0）
          stream: false          // 关闭流式输出，简化调试
        }
      })
    });

    // 6. 解析百炼返回的结果
    const result = await response.json();
    console.log('百炼返回原始数据：', JSON.stringify(result, null, 2));

    // 7. 处理百炼的成功/失败响应
    if (result.status_code === 200) {
      // 成功：提取回答内容
      const answer = result.output?.text?.trim() || '百炼智能体暂时没有回复哦～';
      return res.status(200).json({ answer: answer });
    } else {
      // 失败：返回具体错误信息
      const errorMsg = `百炼调用失败：${result.message || '未知错误'}（错误码：${result.status_code}）`;
      console.error(errorMsg);
      return res.status(500).json({ answer: errorMsg });
    }

  } catch (error) {
    // 捕获其他意外错误（如网络问题）
    const errorMsg = `后端运行出错：${error.message || '未知异常'}`;
    console.error(errorMsg);
    return res.status(500).json({ answer: errorMsg });
  }
}
