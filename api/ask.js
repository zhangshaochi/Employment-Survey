export default async function handler(req, res) {
  // 1. 基础校验
  if (req.method !== "POST") {
    return res.status(405).json({ answer: "仅支持 POST 请求" });
  }

  // 2. 环境变量检查
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const appId = process.env.BAILIAN_APP_ID;
  if (!apiKey || !appId) {
    console.error("未配置环境变量");
    return res.status(500).json({ answer: "服务配置错误" });
  }

  // 3. 业务逻辑
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ answer: "请输入问题" });

    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/applications/${appId}/invoke`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ prompt }),
      }
    );

    const data = await response.json();
    return res.status(200).json({ answer: data.output?.text || "无响应内容" });

  } catch (error) {
    console.error("API调用失败:", error);
    return res.status(500).json({ answer: "服务繁忙，请重试" });
  }
}
