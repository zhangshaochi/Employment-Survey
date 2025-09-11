export default async function handler(req, res) {
    try {
        // 校验请求方法
        if (req.method !== "POST") {
            return res.status(405).json({ answer: "仅支持 POST 请求" });
        }

        // 校验请求体
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ answer: "请输入问题" });

        // 校验环境变量
        const apiKey = process.env.DASHSCOPE_API_KEY;
        const agentId = process.env.BAILIAN_APP_ID; // 注意：变量名更清晰（对应官方的 agentId）
        if (!apiKey || !agentId) {
            console.error("缺少必要的环境变量: DASHSCOPE_API_KEY 或 BAILIAN_APP_ID");
            return res.status(500).json({ answer: "服务器配置错误" });
        }

        // 调用百炼API（修正 URL 和请求体）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

        const response = await fetch(
            `https://dashscope.aliyuncs.com/api/v1/agents/${agentId}/invoke`, // 修正：agents 而非 applications
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    messages: [ // 修正：按官方要求，用 messages 数组传对话
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
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

        // 安全解析JSON
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error("JSON解析失败:", text);
            return res.status(500).json({ answer: "服务响应格式错误" });
        }

        // 处理响应数据（修正：从 output.messages 取回答）
        if (
            data &&
            data.output &&
            Array.isArray(data.output.messages) &&
            data.output.messages.length > 0
        ) {
            const answer = data.output.messages[0].content; // 官方结构：output.messages[0].content
            return res.status(200).json({ answer });
        } else {
            console.error("响应数据格式异常:", data);
            return res.status(500).json({ answer: "服务响应数据不完整" });
        }
    } catch (error) {
        console.error("请求处理失败:", error.message);
        return res.status(500).json({ answer: "服务器内部错误" });
    }
}
