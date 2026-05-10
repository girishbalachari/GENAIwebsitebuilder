import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { motion } from "motion/react";
import axios from "axios";
import { serverUrl } from "../App";

const PHASES = [
  "Analyzing your Idea...",
  "Designing layout and content...",
  "Writing HTML and CSS...",
  "Adding Animations and Interactivity...",
  "Finalizing...",
];

const Generate = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [error, setError] = useState("");

  const handleGenerateWebsite = async () => {
    setLoading(true);
    if (!prompt.trim()) {
      alert("Please enter a description of your website");
      return;
    }
    setLoading(true);
    setProgress(0);
    setPhaseIndex(0);
    setError("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/website/generate`,
        { prompt },
        { withCredentials: true },
      );

      console.log("Success:", result.data);
      setProgress(100);
      setLoading(false);
      navigate(`/editor/${result.data.websiteId}`);
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || "Failed to generate website");
      console.error(
        "Error generating website:",
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    if (!loading) return;

    let value = 0;
    let phase = 0;

    const interval = setInterval(() => {
      const increment = value < 30 ? 2 : value < 70 ? 1.2 : 0.8;
      value += increment;

      if (value > 98) value = 98;

      phase = Math.min(
        Math.floor((value / 100) * PHASES.length),
        PHASES.length - 1,
      );

      setProgress(Math.floor(value));
      setPhaseIndex(phase);
    }, 800);

    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050505] via-[#0b0b0b] to-[#050505] text-white">
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="text-lg font-semibold flex items-center gap-4">
                <img src={logo} alt="logo" className="w-12 h-12" />
                <div className="flex flex-col items-center-safe text-sm font-bold bg-linear-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-red-500 bg-clip-text text-transparent cursor-pointer hover:scale-125 transition">
                  <span>WebSite Builder</span>
                  <span>Using Gen-AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Create Your Website using{" "}
            <span className="block bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              GEN-AI
            </span>
          </h1>
          <p className="text-zinc-400 max-w-2sl mx-auto">
            This Build process take several minutes. Gen-AI focus on quality,
            efficiency, and user experience.
          </p>
        </motion.div>
        <div className="mb-14">
          <h1 className="text-xl font-semibold mb-2">
            Describe your website in detail, what you want to build, and how it
            should look like.
          </h1>
          <div className="relative">
            <textarea
              onChange={(e) => setPrompt(e.target.value)}
              value={prompt}
              placeholder="Enter the complete details, how to build your website"
              className="w-full h-56 p-6 rounded-3xl bg-black/60 border border-white/10 outline-none resize-none text-sm leading-relaxed focus:right-2"
            ></textarea>
          </div>
          {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </div>
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateWebsite}
            disabled={!prompt.trim() && loading}
            className={`px-14 py-4 rounded-2xl font-semibold text-lg ${prompt.trim() && !loading ? "bg-white text-black" : "bg-white/20 text-zinc-400 cursor-not--allowed"}`}
          >
            {loading ? "Generating..." : "Generate Website"}
          </motion.button>
        </div>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-xl mx-auto mt-12"
          >
            <div className="flex justify-between mb-2 text-xs text-zinc-400">
              <span>{PHASES[phaseIndex]}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-white to-zinc-300"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            <div className="text-center text-xs text-zinc-400 mt-4">
              Estimated time remaining:{""}
              <span className="text-white font-medium">~8-12 minutes</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Generate;
