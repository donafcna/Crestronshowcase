import React, { useState, useEffect, useRef } from "react";
import { bgVideos, bgGradients } from "../data/projects";

export const BackgroundVideo = ({ sectionId }) => {
  const [currentVideo, setCurrentVideo] = useState(bgVideos[sectionId] || bgVideos.dashboard);
  const [prevVideo, setPrevVideo] = useState(null);
  const [isFading, setIsFading] = useState(false);
  const currentVideoRef = useRef(null);
  const prevVideoRef = useRef(null);

  useEffect(() => {
    const nextVideo = bgVideos[sectionId] || bgVideos.dashboard;
    if (nextVideo !== currentVideo) {
      setPrevVideo(currentVideo);
      setCurrentVideo(nextVideo);
      setIsFading(true);
    }
  }, [sectionId, currentVideo]);

  return (
    <div
      className="bg-video-container"
      style={{ background: bgGradients[sectionId] || bgGradients.dashboard }}
    >
      <div className="bg-video-overlay" />
      {prevVideo && (
        <video
          ref={prevVideoRef}
          src={prevVideo}
          autoPlay
          muted
          loop
          playsInline
          className="bg-video fade-out"
          key={prevVideo}
        />
      )}
      <video
        ref={currentVideoRef}
        src={currentVideo}
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => {
          if (isFading) {
            const timer = setTimeout(() => {
              setIsFading(false);
              setPrevVideo(null);
            }, 500);
            return () => clearTimeout(timer);
          }
        }}
        className={`bg-video ${isFading ? "fade-in-video" : "visible"}`}
        key={currentVideo}
      />
    </div>
  );
};
