const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
const model = "deepseek/deepseek-chat";

const generateResponse = async (prompt) => {
  const res = await fetch(openRouterUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: "You must return only valid raw JSON" },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const errorData = await res.text();
    console.error("OpenRouter API error:", errorData);
    throw new Error("OpenRouter API error:", errorData);
  }
  const data = await res.json();
  return data.choices[0].message.content;
};

export { generateResponse };
