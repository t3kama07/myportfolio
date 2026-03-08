import Image from "next/image";

function isExternalUrl(url) {
  return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"));
}

function ProjectButton({ href, className, children }) {
  const external = isExternalUrl(href);

  return (
    <a
      className={className}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

export default function ProjectCard({ project, liveDemoLabel = "Live Demo", githubLabel = "GitHub" }) {
  const hasGithub = project.githubUrl && project.githubUrl !== "#";
  const primaryLabel = project.demoLabel || liveDemoLabel;

  return (
    <article className="glass-card project-card">
      {project.thumbnailSrc ? (
        <Image
          className="project-thumb"
          src={project.thumbnailSrc}
          alt={project.thumbnailAlt || `${project.title} thumbnail`}
          width={1200}
          height={675}
          sizes="(max-width: 768px) 100vw, 33vw"
          style={project.thumbnailPosition ? { objectPosition: project.thumbnailPosition } : undefined}
        />
      ) : (
        <div className={`project-thumb ${project.thumbnailClass || ""}`} aria-hidden="true" />
      )}

      <h3>{project.title}</h3>
      <p className="tech">{project.stack}</p>
      <p className="project-description">{project.description}</p>
      <div className={`project-actions${hasGithub ? "" : " project-actions-single"}`}>
        <ProjectButton className="btn btn-primary" href={project.demoUrl}>
          {primaryLabel}
        </ProjectButton>
        {hasGithub ? (
          <ProjectButton className="btn btn-secondary" href={project.githubUrl}>
            {githubLabel}
          </ProjectButton>
        ) : null}
      </div>
    </article>
  );
}
