"use client";

import { useEffect, useRef, useState } from "react";
import ProjectCard from "./ProjectCard";

export default function ProjectsSection({
  projects,
  title = "Featured Projects",
  subtitle = "Some of my recent work",
  liveDemoLabel = "Live Demo",
  githubLabel = "GitHub",
}) {
  const marqueeRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0 });
  const scrollPosRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let frameId = 0;
    const speed = 0.25;
    scrollPosRef.current = marquee.scrollLeft;

    const tick = () => {
      const trackWidth = marquee.scrollWidth / 2;
      const canScroll = trackWidth > marquee.clientWidth;
      const shouldPause = dragRef.current.active;

      if (!shouldPause && canScroll) {
        scrollPosRef.current += speed;
        if (scrollPosRef.current >= trackWidth) {
          scrollPosRef.current -= trackWidth;
        }
        marquee.scrollLeft = scrollPosRef.current;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const handlePointerDown = (event) => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: marquee.scrollLeft,
    };
    scrollPosRef.current = marquee.scrollLeft;

    marquee.setPointerCapture?.(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active) return;
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const trackWidth = marquee.scrollWidth / 2;
    const delta = event.clientX - dragRef.current.startX;
    let nextScrollLeft = dragRef.current.startScrollLeft - delta;

    if (trackWidth > 0) {
      nextScrollLeft %= trackWidth;
      if (nextScrollLeft < 0) nextScrollLeft += trackWidth;
    }

    marquee.scrollLeft = nextScrollLeft;
    scrollPosRef.current = marquee.scrollLeft;
  };

  const stopDragging = (event) => {
    const marquee = marqueeRef.current;
    dragRef.current.active = false;
    marquee?.releasePointerCapture?.(event.pointerId);
    if (marquee) {
      scrollPosRef.current = marquee.scrollLeft;
    }
    setIsDragging(false);
  };

  return (
    <section className="section shell" id="projects">
      <div className="glass-card projects-wrap">
        <h2>{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
        <div
          ref={marqueeRef}
          className={`project-marquee${isDragging ? " is-dragging" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          <div className="project-track">
            {projects.map((project) => (
              <ProjectCard
                key={`${project.id}-a`}
                project={project}
                liveDemoLabel={liveDemoLabel}
                githubLabel={githubLabel}
              />
            ))}
          </div>
          <div className="project-track" aria-hidden="true">
            {projects.map((project) => (
              <ProjectCard
                key={`${project.id}-b`}
                project={project}
                liveDemoLabel={liveDemoLabel}
                githubLabel={githubLabel}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
