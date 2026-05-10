import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

const LiveSite = () => {
  const { slug } = useParams();
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/website/site/${slug}`,
          {
            withCredentials: true,
          },
        );
        setHtml(result.data.latestCode);
      } catch (error) {
        console.error("Error fetching website:", error);
        setError("This website is not available or has been removed.");
      }
    };

    if (slug) handleGetWebsite();
  }, [slug]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        {error}
      </div>
    );
  }
  return (
    <iframe
      title="Live Site"
      srcDoc={html}
      className="w-screen h-screen border-none"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
};

export default LiveSite;
