import OpenAI from "openai";
import {
  getLlmProvider,
  getOpenAIApiKey,
  getGeminiApiKey,
  getClaudeApiKey,
  getHuggingFaceApiKey,
  getHuggingFaceModel,
  getApiSettings,
} from "./apiSettings";

export async function callLLM({ adminId, messages, maxTokens = 300 }) {
  try {
    const provider = await getLlmProvider(adminId);
    const settings = await getApiSettings(adminId);
    const selectedModel = settings.selectedModel;

    switch (provider) {
      case "openai": {
        const apiKey = await getOpenAIApiKey(adminId);
        if (!apiKey) return null;
        const model = selectedModel || "gpt-4o-mini";
        console.log("[OpenAI] Using model:", model);
        const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        const result = await client.chat.completions.create({
          model,
          messages,
          max_tokens: maxTokens,
        });
        return result.choices[0]?.message?.content || null;
      }

      case "gemini": {
        const apiKey = await getGeminiApiKey(adminId);
        if (!apiKey) return null;
        const model = selectedModel || "gemini-2.0-flash";
        console.log("[Gemini] Using model:", model);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: messages.map((m) => ({
                role: m.role === "assistant" ? "model" : m.role,
                parts: [{ text: m.content }],
              })),
            }),
          }
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }

      case "claude": {
        const apiKey = await getClaudeApiKey(adminId);
        if (!apiKey) return null;
        const systemMessage = messages.find((m) => m.role === "system")?.content || "";
        const nonSystemMessages = messages.filter((m) => m.role !== "system");
        const model = selectedModel || "claude-sonnet-4-5";
        console.log("[Claude] Using model:", model);
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            system: systemMessage,
            messages: nonSystemMessages,
          }),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.content?.[0]?.text || null;
      }

      case "huggingface": {
        const apiKey = await getHuggingFaceApiKey(adminId);
        if (!apiKey) return null;
        const model = selectedModel || settings.huggingFaceModel || "mistralai/Mistral-7B-Instruct-v0.2";
        console.log("[HuggingFace] Using model:", model);
        const hfResponse = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: "POST",
            headers: {
              "Authorization": "Bearer " + apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: messages.filter(m => m.role !== "system").map(m => m.content).join("\n"),
              parameters: {
                max_new_tokens: maxTokens,
                return_full_text: false,
              },
            }),
          }
        );
        if (!hfResponse.ok) {
          const errText = await hfResponse.text();
          console.log("[HuggingFace] Error response:", errText);
          return null;
        }
        const hfData = await hfResponse.json();
        console.log("[HuggingFace] Raw response:", JSON.stringify(hfData));
        const text = hfData[0]?.generated_text || hfData?.generated_text || null;
        return text;
      }

      default:
        return null;
    }
  } catch (error) {
    console.error("callLLM error:", error);
    return null;
  }
}
