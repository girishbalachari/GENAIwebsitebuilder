import { generateResponse } from "../config/openRouter.js";
import extractJson from "../utils/extractJson.js";
import Website from "../models/website.model.js";

// Grok prompt testing for website generation

const masterPrompt = `
YOU ARE A WORLD-CLASS PRINCIPAL FRONTEND ARCHITECT AND SENIOR UI/UX DESIGNER.
YOUR GOAL IS TO CREATE BEAUTIFUL, MODERN, PREMIUM, PRODUCTION-GRADE WEBSITES.

USER REQUIREMENT:
{USER_PROMPT}

CREATE A HIGH-END SINGLE-PAGE WEBSITE WITH THE FOLLOWING STANDARDS:

━━━ MANDATORY DESIGN QUALITY ━━━
- Premium, contemporary 2026–2027 aesthetic
- Elegant typography, excellent spacing, beautiful color harmony
- Smooth animations, hover effects, and micro-interactions
- Fully responsive (mobile-first, perfect on all devices)
- Professional navigation with logo + menu
- Strong hero section
- Multiple well-designed sections
- Modern footer

━━━ TECHNICAL REQUIREMENTS ━━━
- ONE complete HTML file
- Use Tailwind CSS via CDN
- Vanilla JavaScript only
- Fully responsive with mobile menu
- SPA-style navigation (smooth transitions between sections)
- Clean, readable, well-commented code

━━━ OUTPUT FORMAT (RAW JSON ONLY) ━━━
{
  "message": "Short enthusiastic confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}

Return ONLY valid JSON. No explanations, no markdown.
`;

export const generateWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    // const user = await User.findById(req.user._id);
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (user.credits < 10) {
      return res.status(400).json({
        message:
          "Not enough credits. Each website generation costs 10 credits.",
      });
    }

    const finalPrompt = masterPrompt.replace("{USER_PROMPT}", prompt);
    let raw = "";
    let parsed = null;
    for (let i = 0; i < 2 && !parsed; i++) {
      raw = await generateResponse(finalPrompt);
      parsed = await extractJson(raw);
      if (!parsed) {
        raw = await generateResponse(
          finalPrompt + "\n\n RETURN ONLY RAW JSON.",
        );
        parsed = await extractJson(raw);
      }
    }
    if (!parsed.code) {
      console.log("ai returned invalid response", raw);
      return res.status(400).json({ message: "ai returned invalid response" });
    }

    const newWebsite = await Website.create({
      user: user._id,
      title: prompt.slice(0, 80),
      slug: prompt
        .slice(0, 80)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      latestCode: parsed.code,
      conversation: [
        { role: "user", content: prompt },
        {
          role: "ai",
          content: parsed.message || "Website generated successfully",
        },
      ],
    });
    user.credits = user.credits - 10;
    await user.save();
    return res.status(200).json({
      success: true,
      websiteId: newWebsite._id,
      remainingCredits: user.credits,
      message: parsed.message,
    });
  } catch (error) {
    return res.status(500).json({
      error: `Internal server error while generating website ${error}`,
    });
  }
};

export const getWebsiteById = async (req, res) => {
  try {
    const websiteDoc = await Website.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!websiteDoc) {
      return res.status(404).json({ message: "Website not found" });
    }

    return res.status(200).json(websiteDoc);
  } catch (error) {
    console.error("Get website error:", error);
    return res.status(500).json({ error: "Failed to fetch website" });
  }
};

export const changes = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    const websiteDoc = await Website.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!websiteDoc) {
      return res.status(404).json({ message: "Website not found" });
    }
    // const user = await User.findById(req.user._id);
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (user.credits < 5) {
      return res.status(400).json({
        message: "For each request 5 credits will be debited.",
      });
    }

    // const updatePrompt = `UPDATE THIS HTML WEBSITE.
    // CURRENT CODE:${websiteDoc.latestCode}
    // USER REQUEST:${prompt}
    // RETURN RAW JSON ONLY:{"message":"Short confirmation", "code": "<UPDATED FULL HTML>"}
    // `;

    const updatePrompt = `You are an expert frontend developer.
CURRENT WEBSITE CODE:
${websiteDoc.latestCode}

USER REQUEST: ${prompt}

Update the website according to the request while maintaining premium design, responsiveness, and code quality.
Return ONLY raw JSON in this format:
{"message": "Short confirmation", "code": "<FULL UPDATED HTML>"}
`;
    let raw = "";
    let parsed = null;
    for (let i = 0; i < 2 && !parsed; i++) {
      raw = await generateResponse(updatePrompt);
      parsed = await extractJson(raw);
      if (!parsed) {
        raw = await generateResponse(
          updatePrompt + "\n\n RETURN ONLY RAW JSON.",
        );
        parsed = await extractJson(raw);
      }
    }
    if (!parsed.code) {
      console.log("ai returned invalid response", raw);
      return res.status(400).json({ message: "ai returned invalid response" });
    }
    websiteDoc.conversation.push(
      { role: "user", content: prompt },
      { role: "ai", content: parsed.message },
    );
    websiteDoc.latestCode = parsed.code;
    await websiteDoc.save();
    user.credits = user.credits - 5;
    await user.save();
    return res.status(200).json({
      success: true,
      remainingCredits: user.credits,
      message: parsed.message,
      code: parsed.code,
    });
  } catch (error) {
    return res.status(500).json({
      error: `Internal server error while updating website ${error}`,
    });
  }
};

export const userWebsites = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Please login to see your websites" });
    }

    const websites = await Website.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("title slug createdAt deployed latestCode deployUrl")
      .lean(); // faster response

    return res.status(200).json(websites);
  } catch (error) {
    console.error("User websites error:", error);
    return res.status(500).json({ error: "Failed to fetch your websites" });
  }
};

export const deployWebsite = async (req, res) => {
  try {
    const websiteDoc = await Website.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!websiteDoc) {
      return res.status(404).json({ message: "Website not found" });
    }
    if (!websiteDoc.slug) {
      websiteDoc.slug =
        websiteDoc.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        websiteDoc._id.toString().slice(-6);
    }
    websiteDoc.deployed = true;
    websiteDoc.deployUrl = `http://localhost:5173/site/${websiteDoc.slug}`;
    await websiteDoc.save();
    return res.status(200).set("Cache-Control", "no-store").json({
      success: true,
      message: "Website deployed successfully",
      url: websiteDoc.deployUrl,
      slug: websiteDoc.slug,
    });
  } catch (error) {
    console.error("Deploy error:", error);
    return res.status(500).json({
      message: `Failed to deploy website: ${error}`,
    });
  }
};

export const getBySlugPublic = async (req, res) => {
  try {
    const website = await Website.findOne({
      slug: req.params.slug,
    }).lean();
    if (!website) {
      return res.status(404).json({ message: "Website not found" });
    }
    return res.status(200).json(website);
  } catch (error) {
    console.error("Failed to fetch website:", error);
    return res
      .status(500)
      .json({ message: `Failed to fetch website: ${error}` });
  }
};
