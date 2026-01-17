import React, { useEffect, useRef } from "react";
import { bannerHomeStyles } from "../assets/dummyStyles";
import Navbar from "./Navbar";
import video from "../assets/bannervideo.mp4";

const BannerHome = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("auto");
    }
  }, []);

  return (
    <div className={bannerHomeStyles.container}>
      <div className={bannerHomeStyles.navbarWrapper}>
        <Navbar />
      </div>

      {/* bg video */}
      <div className={bannerHomeStyles.videoContainer}>
        <video
          ref={videoRef}
          className={bannerHomeStyles.video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/fallback.jpg"
          role="presentation"
        >
          <source src={video} type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default BannerHome;
