function SkillTrack({ skills, hidden = false }) {
  return (
    <ul className="skills-track" aria-hidden={hidden ? "true" : undefined}>
      {skills.map((skill) => (
        <li key={`${hidden ? "copy-" : ""}${skill}`}>{skill}</li>
      ))}
    </ul>
  );
}

export default function SkillScroller({ skills, ariaLabel = "Scrolling tech stack list" }) {
  return (
    <div className="skills-marquee" aria-label={ariaLabel}>
      <SkillTrack skills={skills} />
      <SkillTrack skills={skills} hidden />
    </div>
  );
}
