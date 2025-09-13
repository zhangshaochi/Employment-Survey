export default async function handler(req, res) {
    try {
        // 校验请求方法
        if (req.method !== "POST") {
            return res
                .status(405)
                .setHeader("Content-Type", "application/json")
                .send(JSON.stringify({ answer: "仅支持 POST 请求" }));
        }

        // 校验请求体
        const { prompt } = req.body;
        if (!prompt) {
            return res
                .status(400)
                .setHeader("Content-Type", "application/json")
                .send(JSON.stringify({ answer: "请输入问题" }));
        }

        // 校验环境变量
        const apiKey = process.env.DASHSCOPE_API_KEY;
        const appId = process.env.BAILIAN_APP_ID;
        if (!apiKey || !appId) {
            console.error("缺少必要的环境变量: DASHSCOPE_API_KEY 或 BAILIAN_APP_ID");
            return res
                .status(500)
                .setHeader("Content-Type", "application/json")
                .send(JSON.stringify({ answer: "服务器配置错误" }));
        }

        // 调用百炼API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
            `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    input: {
                        prompt: prompt,
                    },
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
            return res
                .status(500)
                .setHeader("Content-Type", "application/json")
                .send(JSON.stringify({ answer: `百炼服务异常: ${response.status}` }));
        }

        // 安全解析JSON
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error("JSON解析失败:", text);
            return res
                .status(500)
                .setHeader("Content-Type", "application/json")
                .send(JSON.stringify({ answer: "服务响应格式错误" }));
        }

        // 处理响应数据
        if (data && data.output && typeof data.output.text === "string") {
            const answer = data.output.text;
            return res
                .status(200)
                .setHeader("Content-Type", "application/json")
                .send(JSON.stringify({ answer }));
        } else {
            console.error("响应数据格式异常:", data);
            return res
                .status(500)
                .setHeader("Content-Type", "application/json")
                .send(JSON.stringify({ answer: "服务响应数据不完整" }));
        }
    } catch (error) {
        console.error("请求处理失败:", error.message);
        return res
            .status(500)
            .setHeader("Content-Type", "application/json")
            .send(JSON.stringify({ answer: "服务器内部错误" }));
    }
}
