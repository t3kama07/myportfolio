import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProjectsSection from "../components/ProjectsSection";
import { projects } from "../data/projects";

export default function ProjectsPage() {
  return (
    <main className="portfolio-page" id="top">
      <Navbar />
      <ProjectsSection projects={projects} />
      <footer className="contact-footer">
        <div className="shell">
          <Footer />
        </div>
      </footer>
    </main>
  );
}
