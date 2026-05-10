import React, { useEffect, useState } from "react";
import { ArrowLeft, Check, Rocket, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

const Dashboard = () => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [websites, setWebsites] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const handleDeploy = async (id) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/website/deployWebsite/${id}`,
        { withCredentials: true },
      );

      if (result.data.url) {
        window.open(result.data.url, "_blank");

        const refreshed = await axios.get(
          `${serverUrl}/api/website/userWebsites`,
          { withCredentials: true },
        );
        setWebsites(refreshed.data || []);
      } else {
        alert("Deployment successful but URL not returned");
      }
    } catch (error) {
      console.error("Deploy error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to deploy website");
    }
  };

  const handleCopy = async (site) => {
    if (!site.deployed) {
      alert("Please deploy the website first.");
      return;
    }

    if (!site.deployUrl) {
      alert("Deployment link missing. Try refreshing.");
      return;
    }

    await navigator.clipboard.writeText(site.deployUrl);
    setCopiedId(site._id);

    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const handleGetAllWebsites = async () => {
      setLoading(true);
      try {
        const result = await axios.get(
          `${serverUrl}/api/website/userWebsites`,
          { withCredentials: true },
        );
        setWebsites(result.data || []);
      } catch (error) {
        console.error("Full error:", error.response?.data || error.message);
        setError(error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };
    handleGetAllWebsites();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          <button
            onClick={() => navigate("/generate")}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 transition"
          >
            Create New Website
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-sm text-zinc-400 mb-1">
            Welcome to Dashboard of WebSite Builder using Gen-AI
          </p>
          <h1 className="text-3xl font-bold">{userData?.name}</h1>
        </motion.div>
        {loading && (
          <div className="mt-24 text-center text-zinc-400">
            Loading All websites....
          </div>
        )}
        {error && !loading && (
          <div className="mt-24 text-center text-red-400">{error}</div>
        )}
        {!loading && !error && websites?.length === 0 && (
          <div className="mt-24 text-center text-zinc-400">
            You have not created any websites yet.
            <br />
            Click on "Create New Website"
          </div>
        )}

        {!loading && !error && websites?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {websites.map((w, i) => {
              const copied = copiedId === w._id;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/editor/${w._id}`)}
                  className="rounded-2xl bgg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition flex flex-col"
                >
                  <div className="relative h-40 bg-black cursor-pointer">
                    <iframe
                      srcDoc={w.latestCode}
                      className="absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    <h3 className="text-base font-semibold line-clamp-2">
                      {w.title}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Last Updated{" "}
                      {(() => {
                        const date = w.updatedAt || w.createdAt;
                        if (!date) return "N/A";
                        return new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }).format(new Date(date));
                      })()}
                    </p>
                    {!w.deployed ? (
                      <button
                        onClick={() => handleDeploy(w._id)}
                        className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-linear-to-r from-indigo-500 to-pink-500 hover:scale-105 transition"
                      >
                        <Rocket size={18} /> Deploy
                      </button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(w)}
                        className={`mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/10 hover:bg-white/20 border border-white/10"}`}
                      >
                        {copied ? (
                          <>
                            <Check size={14} /> Link Copied
                          </>
                        ) : (
                          <>
                            <Share2 size={14} /> Copy Link
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
