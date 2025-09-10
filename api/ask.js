export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ answer: "仅支持 POST 请求" });
    }

    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ answer: "请输入问题" });

    const apiKey = process.env.DASHSCOPE_API_KEY;
    const appId = process.env.BAILIAN_APP_ID;

    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/applications/${appId}/invoke`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ prompt }),
      }
    );

    // 首先检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API响应错误:", response.status, errorText);
      return res.status(500).json({ answer: `百炼服务异常: ${response.status}` });
    }

    // 安全地解析JSON
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON解析失败:", text);
      return res.status(500).json({ answer: "服务响应格式错误" });
    }

    if (data.output && data.output.text) {
      return res.status(200).json({ answer: data.output.text });
    } else {
      console.error("意外响应格式:", data);
      return res.status(500).json({ answer: "无法处理服务响应" });
    }

  } catch (error) {
    console.error("服务器错误:", error);
    return res.status(500).json({ answer: "网络连接异常，请重试" });
  }
}
