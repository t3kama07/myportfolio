const sharedData = {
  name: "Manjula Karunanayaka",
  photo: {
    src: "/assets/profileimage.jpeg",
    alt: "Portrait of Manjula Karunanayaka",
  },
};

const cvByLocale = {
  en: {
    ...sharedData,
    role: "Fullstack Developer",
    summary:
      "Graduating Information Technology student at Oulu University of Applied Sciences with hands-on experience in web and mobile application development using JavaScript, React, and modern development tools. Built multiple academic and personal projects including AI-assisted applications, mobile apps, and interactive 3D web experiences. Passionate about modern software development, AI tools, and collaborative product building.",
    about:
      "Graduating developer focused on modern web and mobile applications, AI-assisted development workflows, and collaborative product building through team-based university and personal projects.",
    contact: [
      {
        label: "Website",
        value: "Manjula.live",
        href: "https://manjula.live",
      },
      {
        label: "Email",
        value: "manjulakpmp@gmail.com",
        href: "mailto:manjulakpmp@gmail.com",
      },
      {
        label: "Phone",
        value: "(+358) 415769826",
        href: "tel:+358415769826",
      },
      {
        label: "Address",
        value: "Oulu, Finland",
      },
      {
        label: "GitHub",
        value: "github.com/t3kama07",
        href: "https://github.com/t3kama07",
      },
      {
        label: "LinkedIn",
        value: "linkedin.com/in/kpmp",
        href: "https://www.linkedin.com/in/kpmp/",
      },
    ],
    skillGroups: [
      {
        label: "Programming",
        items: ["JavaScript", "TypeScript", "Python"],
      },
      {
        label: "Frameworks & Libraries",
        items: ["React.js", "Node.js", "Next.js", "Three.js"],
      },
      {
        label: "Development Tools",
        items: ["Git & GitHub", "Cursor AI", "GitHub Copilot", "VS Code"],
      },
      {
        label: "Design Tools",
        items: ["Figma", "Canva", "Photoshop"],
      },
    ],
    education: [
      {
        degree: "Bachelor's Degree in Information Technology",
        school: "Oulu University of Applied Sciences (OAMK), Finland",
        dates: "Expected Graduation: May 2026",
      },
    ],
    projects: [
      {
        title: "KieliBuddy",
        subtitle: "Mobile App for Finnish Language Learners",
        links: [
          {
            label: "GitHub",
            href: "https://github.com/jmadusanka/KieliBuddy",
          },
        ],
        highlights: [
          "Collaborated in a team-based university project developing a mobile application for Finnish language learners using modern mobile development workflows and user-centered UI design.",
          "Contributed to interface design, onboarding flows, and usability improvements together with the development team.",
          "Worked in a collaborative product-building process to improve the user experience and overall application flow.",
        ],
      },
      {
        title: "Job Application Tracker & Skills Analysis System",
        links: [
          {
            label: "GitHub",
            href: "https://github.com/jmadusanka/job-application-tracker",
          },
        ],
        highlights: [
          "Developed a web-based application to track job applications and analyze job descriptions using AI-assisted skill analysis and data processing techniques.",
          "Built features aligned with modern web application workflows and collaborated on improving how skill gaps and relevant job-posting insights were presented.",
        ],
      },
      {
        title: "Three.js Visual Experiments",
        subtitle: "JavaScript 3D Library",
        links: [
          {
            label: "GitHub",
            href: "https://github.com/t3idma00/complex-mappings-3D-visualizations/tree/main",
          },
        ],
        highlights: [
          "Built interactive 3D web experiences with Three.js, including a Moonbase Defender game concept and a Galaxy Simulation.",
          "Explored modern front-end development techniques for rendering, animation, and immersive browser-based interaction.",
        ],
      },
      {
        title: "Computational Simulation Project",
        subtitle: "Blood Flow Modeling (Research Collaboration)",
        highlights: [
          "Collaborated on a research-oriented project developing Python scripts for arterial blood-flow simulations and computational analysis.",
          "Applied numerical methods to model fluid behavior in blood vessels and communicate findings in a collaborative academic setting.",
        ],
      },
    ],
    extras: ["Finnish Driving Licence B", "Own vehicle available"],
  },
  fi: {
    ...sharedData,
    role: "Fullstack-kehittaja",
    summary:
      "Valmistuva tietotekniikan opiskelija Oulun ammattikorkeakoulusta, jolla on kaytannon kokemusta web- ja mobiilisovellusten kehittamisesta JavaScriptilla, Reactilla ja moderneilla kehitystyokaluilla. Olen toteuttanut useita akateemisia ja omia projekteja, kuten AI-avusteisia sovelluksia, mobiilisovelluksia ja interaktiivisia 3D-web-kokemuksia. Olen motivoitunut modernista ohjelmistokehityksesta, AI-tyokaluista ja yhteistoiminnallisesta tuotekehityksesta.",
    about:
      "Valmistuva kehittaja, joka keskittyy moderneihin web- ja mobiilisovelluksiin, AI-avusteisiin kehitystyonkulkuihin ja yhteistoiminnalliseen tuotekehitykseen tiimipohjaisissa opiskelu- ja omissa projekteissa.",
    contact: [
      {
        label: "Verkkosivu",
        value: "Manjula.live",
        href: "https://manjula.live",
      },
      {
        label: "Sahkoposti",
        value: "manjulakpmp@gmail.com",
        href: "mailto:manjulakpmp@gmail.com",
      },
      {
        label: "Puhelin",
        value: "(+358) 415769826",
        href: "tel:+358415769826",
      },
      {
        label: "Sijainti",
        value: "Oulu, Suomi",
      },
      {
        label: "GitHub",
        value: "github.com/t3kama07",
        href: "https://github.com/t3kama07",
      },
      {
        label: "LinkedIn",
        value: "linkedin.com/in/kpmp",
        href: "https://www.linkedin.com/in/kpmp/",
      },
    ],
    skillGroups: [
      {
        label: "Ohjelmointi",
        items: ["JavaScript", "TypeScript", "Python"],
      },
      {
        label: "Kirjastot ja frameworkit",
        items: ["React.js", "Node.js", "Next.js", "Three.js"],
      },
      {
        label: "Kehitystyokalut",
        items: ["Git & GitHub", "Cursor AI", "GitHub Copilot", "VS Code"],
      },
      {
        label: "Suunnittelutyokalut",
        items: ["Figma", "Canva", "Photoshop"],
      },
    ],
    education: [
      {
        degree: "Tietotekniikan insinoori (AMK)",
        school: "Oulun ammattikorkeakoulu (OAMK), Suomi",
        dates: "Arvioitu valmistuminen: Toukokuu 2026",
      },
    ],
    projects: [
      {
        title: "KieliBuddy",
        subtitle: "Mobiilisovellus suomen kielen oppijoille",
        links: [
          {
            label: "GitHub",
            href: "https://github.com/jmadusanka/KieliBuddy",
          },
        ],
        highlights: [
          "Osallistuin tiimipohjaiseen korkeakouluprojektiin, jossa kehitettiin mobiilisovellus suomen kielen oppijoille moderneilla mobiilikehityksen tyonkuluilla ja kayttajakeskeisella UI-suunnittelulla.",
          "Osallistuin kayttoliittyman suunnitteluun, onboarding-polkujen kehittamiseen ja kaytettavyyden parantamiseen yhdessa kehitystiimin kanssa.",
          "Tyoskentelin yhteistoiminnallisessa tuotekehitysprosessissa kayttajakokemuksen ja sovelluksen kokonaisvirran parantamiseksi.",
        ],
      },
      {
        title: "Tyohakemusten seuranta- ja taitoanalyysijarjestelma",
        links: [
          {
            label: "GitHub",
            href: "https://github.com/jmadusanka/job-application-tracker",
          },
        ],
        highlights: [
          "Kehitin web-sovelluksen tyohakemusten seurantaan ja tyoilmoitusten analysointiin AI-avusteisella taitoanalyysilla ja datankasittelytekniikoilla.",
          "Rakensin ominaisuuksia modernien web-sovellusten tyonkulkujen mukaisesti ja osallistuin siihen, miten osaamisvajeet ja tyoilmoituksista saadut havainnot esitettiin kayttajalle.",
        ],
      },
      {
        title: "Three.js-kokeilut",
        subtitle: "JavaScript 3D -kirjasto",
        links: [
          {
            label: "GitHub",
            href: "https://github.com/t3idma00/complex-mappings-3D-visualizations/tree/main",
          },
        ],
        highlights: [
          "Rakensin interaktiivisia 3D-web-kokemuksia Three.js:lla, mukaan lukien Moonbase Defender -pelikonsepti ja Galaxy Simulation.",
          "Tutkin moderneja front-end-kehityksen tekniikoita renderointiin, animaatioihin ja immersiiviseen selaimessa tapahtuvaan vuorovaikutukseen.",
        ],
      },
      {
        title: "Laskennallisen simuloinnin projekti",
        subtitle: "Verenvirtauksen mallinnus (tutkimusyhteistyo)",
        highlights: [
          "Osallistuin tutkimuspainotteiseen projektiin, jossa kehitettiin Python-skripteja valtimoverenvirtauksen simulointiin ja laskennalliseen analyysiin.",
          "Sovelsin numeerisia menetelmia verenkierron fluidin kayttaytymisen mallintamiseen ja tulosten viestimiseen yhteistoiminnallisessa akateemisessa ymparistossa.",
        ],
      },
    ],
    extras: ["Suomalainen ajokortti B", "Oma auto kaytossa"],
  },
};

export function getCvData(locale) {
  return cvByLocale[locale] || cvByLocale.en;
}
