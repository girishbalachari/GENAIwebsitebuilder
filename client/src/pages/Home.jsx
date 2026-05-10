import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import logo from "../assets/logo.png";
import LoginModal from "../components/LoginModal";
import { useSelector } from "react-redux";
import Coins from "lucide-react/dist/esm/icons/coins";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [websites, setWebsites] = useState(null);
  const { userData } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      setOpenProfile(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (!userData) return;
    const handleGetAllWebsites = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/website/userWebsites`,
          { withCredentials: true },
        );
        setWebsites(result.data || []);
      } catch (error) {
        console.error("Full error:", error.response?.data || error.message);
      }
    };
    handleGetAllWebsites();
    [userData];
  });

  const highlights = [
    {
      title: "AI Generate Code",
      description:
        "Gen-AI generates clean, efficient code for your website based on your description.",
    },
    {
      title: "Modern and Responsive Design",
      description:
        "Creates visually stunning layouts that adapt perfectly across all devices.",
    },
    {
      title: "Production-Ready Output",
      description:
        "Delivers scalable, optimized code ready for real-world deployment.",
    },
  ];
  return (
    <div className="relative min-h-screen bg-[#040404] text-white overflow-hidden">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/30"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-lg font-semibold flex items-center gap-4">
            <img src={logo} alt="logo" className="w-12 h-12" />
            <div className="flex flex-col items-center-safe text-sm font-bold bg-linear-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-red-500 bg-clip-text text-transparent cursor-pointer hover:scale-125 transition">
              <span>WebSite Builder</span>
              <span>Using Gen-AI</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div
              className="hidden px-4 py-2 md:inline text-sm text-zinc-400 rounded-2xl border border-white/30 hover:text-white hover:border-white cursor-pointer"
              onClick={() => navigate("/pricing")}
            >
              Pricing
            </div>
            {userData && (
              <div
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/30 text-sm cursor-pointer hover:bg-white/10 transition"
                onClick={() => navigate("/pricing")}
              >
                <Coins size={14} className="text-yellow-400" />
                <span className="text-zinc-300">Credits</span>
                <span>{userData.credits}</span>
                <span className="font-semibold">+</span>
              </div>
            )}
            {!userData ? (
              <button
                onClick={() => setOpenLogin(true)}
                className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-sm"
              >
                Login
              </button>
            ) : (
              <div className="relative">
                <button
                  className="flex items-center"
                  onClick={() => setOpenProfile(!openProfile)}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${userData.name}`}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border border-white/20 object-cover hover:scale-125 transition"
                  />
                </button>
                <AnimatePresence>
                  {openProfile && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-60 bg-[#0b0b0b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-medium truncate">
                            {userData.name}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            {userData.email}
                          </p>
                        </div>
                        <button className="md:hidden w-full px-4 py-3 flex items-center gap-2 text-sm border-b border-white/10 hover:bg-white/5">
                          <Coins size={14} className="text-yellow-400" />
                          <span className="text-zinc-300">Credits</span>
                          <span>{userData.credits}</span>
                          <span className="font-semibold">+</span>
                        </button>
                        <button
                          onClick={() => navigate("/dashboard")}
                          className="w-full px-4 py-3 text-left text-sm border border-white/10 hover:bg-white/5"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={handleLogOut}
                          className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5"
                        >
                          LogOut
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <section className="pt-44 pb-32 px-6 text-center">
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight"
        >
          Build Beautiful Websites
          <br />
          <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent text-3xl md:text-5xl">
            Using Gen-AI
          </span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 max-w-2xl mx-auto text-lg text-zinc-400"
        >
          WebSite Builder is a powerful tool that allows you to create beautiful
          websites using Gen-AI. Describe your idea and let AI generate a Modern
          and Responsive, production-ready website.
        </motion.p>
        <button
          onClick={() =>
            userData ? navigate("/dashboard") : setOpenLogin(true)
          }
          className="px-10 py-4 rounded-xl bg-white text-black font-semibold hover:scale-105 transition mt-12"
        >
          {userData ? "Dashboard" : "Get Started"}
        </button>
      </section>

      {!userData && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white/5 border border-white/10 p-8"
              >
                <h1 className="text-xl font-semibold mb-3">{item.title}</h1>
                <p className="text-sm text-zinc-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {userData && websites?.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <h1 className="text-2xl font-semibold mb-6">
            Websites you had generated using Website Builder(Gen-AI)
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {websites.map((w) => (
              <motion.div
                key={w._id}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/editor/${w._id}`)}
                className=" cursor-pointer rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
              >
                <div className="h-40">
                  <iframe
                    srcDoc={w.latestCode}
                    className="w-[140%] h-[110%] origin-top-left pointer-events-none bg-white"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold line-clamp-2">
                    {w.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2">
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
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-white/10 py-10 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} - {new Date().getFullYear() + 1}{" "}
        <span className="font-semibold text-blue-700 cursor-pointer hover:text-blue-400 transition">
          WebSite Builder
        </span>{" "}
        <span className="text-sm underline">All rights reserved.</span>
      </footer>
      {openLogin && (
        <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      )}
    </div>
  );
};

export default Home;
