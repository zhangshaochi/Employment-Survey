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
      return res.status(500).json({ answer: "环境变量未配置（API Key 或 App ID 缺失）" });
    }

    // 百炼官方 API Endpoint
    const apiUrl = "https://dashscope.aliyuncs.com/api/v1/chat/completions";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: appId, // 用 App ID 指定调用的模型/智能体
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const responseText = await response.text();
    console.log("百炼API返回的原始文本：", responseText); 

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON 解析失败！原始文本：", responseText);
      return res.status(500).json({ 
        answer: "百炼返回内容不是合法JSON，原始内容：" + responseText 
      });
    }

    // 处理百炼 API 的错误响应
    if (data.error) {
      return res.status(500).json({ 
        answer: `百炼API返回错误：${data.error.message || "未知错误"}` 
      });
    }

    // 处理正常响应（需确保格式符合 { choices: [{ message: { content: "..." } }] }）
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      return res.status(200).json({ answer: data.choices[0].message.content });
    } else {
      console.error("百炼返回格式不符合预期：", JSON.stringify(data, null, 2));
      return res.status(500).json({ 
        answer: "百炼返回内容格式异常，无法提取回答" 
      });
    }

  } catch (error) {
    console.error("后端整体异常：", error);
    return res.status(500).json({ answer: "后端处理请求时发生未知错误" });
  }
}
