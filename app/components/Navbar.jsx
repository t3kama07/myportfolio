"use client";

import { useState } from "react";
import Image from "next/image";

export default function Navbar({ locale, nav, currentPath = "/" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const enPath = `/en${currentPath === "/" ? "" : currentPath}`;
  const fiPath = `/fi${currentPath === "/" ? "" : currentPath}`;
  const menuId = `mobile-menu-${locale}${currentPath === "/" ? "-home" : currentPath.replace(/\//g, "-")}`;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const renderLanguageSwitch = (extraClass) => (
    <div className={`lang-switch ${extraClass}`} role="group" aria-label={nav.languageSwitch}>
      <a
        className={`lang-btn${locale === "en" ? " is-active" : ""}`}
        href={enPath}
        aria-current={locale === "en" ? "page" : undefined}
        onClick={closeMenu}
      >
        EN
      </a>
      <a
        className={`lang-btn${locale === "fi" ? " is-active" : ""}`}
        href={fiPath}
        aria-current={locale === "fi" ? "page" : undefined}
        onClick={closeMenu}
      >
        FI
      </a>
    </div>
  );

  return (
    <header className="navbar">
      <div className="nav-content shell">
        <a className="nav-brand" href={`/${locale}`}>
          <Image
            className="nav-brand-logo"
            src="/assets/logo.webp"
            alt="Manjula logo"
            width={180}
            height={52}
            priority
          />
        </a>
        {renderLanguageSwitch("lang-switch-mobile")}
        <button
          className={`nav-toggle${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-controls={menuId}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`nav-menu${menuOpen ? " is-open" : ""}`} id={menuId}>
          <nav className="nav-links" aria-label="Primary">
            <a href={`/${locale}/#projects`} onClick={closeMenu}>
              {nav.projects}
            </a>
            <a href={`/${locale}/tools`} onClick={closeMenu}>
              {nav.tools}
            </a>
            <a href={`/${locale}/#skills`} onClick={closeMenu}>
              {nav.skills}
            </a>
            <a href={`/${locale}/#contact`} onClick={closeMenu}>
              {nav.contact}
            </a>
          </nav>
          {renderLanguageSwitch("lang-switch-desktop")}
          <a className="btn btn-primary btn-cv" href={`/${locale}/#contact`} onClick={closeMenu}>
            {nav.requestCv}
          </a>
        </div>
      </div>
    </header>
  );
}
