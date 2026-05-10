const extractJson = async (text) => {
  if (!text) return null;
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) return null;
  return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
};

export default extractJson;
