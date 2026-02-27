import ProjectCard from "./ProjectCard";

export default function ProjectsSection({
  projects,
  title = "Featured Projects",
  subtitle = "Some of my recent work",
}) {
  return (
    <section className="section shell" id="projects">
      <div className="glass-card projects-wrap">
        <h2>{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

