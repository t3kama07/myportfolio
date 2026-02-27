import ContactSection from "./components/ContactSection";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import ProjectsSection from "./components/ProjectsSection";
import ServicesSection from "./components/ServicesSection";
import SkillScroller from "./components/SkillScroller";
import { projects } from "./data/projects";
import { services } from "./data/services";
import { skills } from "./data/skills";

export default function Home() {
  return (
    <main className="portfolio-page" id="top">
      <Navbar />
      <HeroSection />
      <ServicesSection services={services} />

      <section className="section shell" id="skills">
        <div className="glass-card tech-stack-section">
          <SkillScroller skills={skills} />
        </div>
      </section>

      <ProjectsSection projects={projects} />
      <ContactSection />
    </main>
  );
}
