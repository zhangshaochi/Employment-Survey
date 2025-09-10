export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ answer: "仅支持 POST 请求" });
    }

    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ answer: "请输入问题" });

    const apiKey = process.env.DASHSCOPE_API_KEY;
    const appId = process.env.BAILIAN_APP_ID;
    if (!apiKey || !appId) {
      return res.status(500).json({ answer: "环境变量未配置" });
    }

    // 官方最新 API Endpoint
    const apiUrl = "https://dashscope.aliyuncs.com/api/v1/chat/completions";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: appId, // 用 APP_ID 指定调用的模型/智能体
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.error) {
      return res.status(500).json({ answer: `百炼错误：${data.error.message}` });
    }

    return res.status(200).json({ answer: data.choices[0].message.content });
  } catch (error) {
    console.error("请求失败：", error);
    return res.status(500).json({ answer: "后端请求出错" });
  }
}
