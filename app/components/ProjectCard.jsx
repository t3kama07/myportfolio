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

export default function ProjectCard({ project }) {
  const hasGithub = project.githubUrl && project.githubUrl !== "#";

  return (
    <article className="glass-card project-card">
      {project.thumbnailSrc ? (
        <img
          className="project-thumb"
          src={project.thumbnailSrc}
          alt={project.thumbnailAlt || `${project.title} thumbnail`}
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
          Live Demo
        </ProjectButton>
        {hasGithub ? (
          <ProjectButton className="btn btn-secondary" href={project.githubUrl}>
            GitHub
          </ProjectButton>
        ) : null}
      </div>
    </article>
  );
}
