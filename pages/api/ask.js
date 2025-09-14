export default async function handler(req, res) {
  try {
    // 校验请求方法
    if (req.method !== "POST") {
      return res.status(405).json({ answer: "仅支持 POST 请求" });
    }

    // 校验请求体
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ answer: "请输入问题" });
    }

    // 校验环境变量
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const appId = process.env.BAILIAN_APP_ID;
    
    if (!apiKey || !appId) {
      console.error("缺少必要的环境变量: DASHSCOPE_API_KEY 或 BAILIAN_APP_ID");
      return res.status(500).json({ answer: "服务器配置错误" });
    }

    // 调用百炼API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            input: { prompt },
            parameters: {},
            debug: {},
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API响应错误:", response.status, errorText);
        return res.status(500).json({ answer: `百炼服务异常: ${response.status}` });
      }

      // 解析响应数据
      const data = await response.json();

      // 处理响应数据
      if (data && data.output && typeof data.output.text === "string") {
        return res.status(200).json({ answer: data.output.text });
      } else {
        console.error("响应数据格式异常:", data);
        return res.status(500).json({ answer: "服务响应数据不完整" });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("API请求失败:", fetchError.message);
      return res.status(500).json({ answer: "网络请求超时或失败" });
    }
  } catch (error) {
    console.error("请求处理失败:", error.message);
    return res.status(500).json({ answer: "服务器内部错误" });
  }
}
