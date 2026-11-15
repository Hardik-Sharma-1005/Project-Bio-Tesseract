import Link from 'next/link';
import BioTesseractLogo from '../logo/BioTesseractLogo';
import CrewPortrait from '../crew/CrewPortrait';
import LifeSystemsIllustration from './LifeSystemsIllustration';
import ThemeToggle from '../theme/ThemeToggle';

const VIEWS = ['Mission Overview', 'Bio-Monitor', 'Life Support', 'AI Medical Advisor', 'Crew & Alerts'];
const CREW = [
  { initials: 'SV', name: 'Cmdr. Sarah Vance', role: 'Mission Commander' },
  { initials: 'MC', name: 'Dr. Marcus Chen', role: 'Medical Specialist' },
  { initials: 'ER', name: 'Eng. Elena Rostova', role: 'Flight Engineer' },
  { initials: 'DK', name: 'Pilot David Kalu', role: 'Command Pilot' },
];

export default function HeroView() {
  return (
    <main className="bt-landing">
      <header className="bt-nav">
        <Link href="/" className="bt-brand" aria-label="Bio-Tesseract home"><BioTesseractLogo size={38} /><span><small>HUMAN SYSTEMS / SPACEFLIGHT</small><strong>Bio-Tesseract</strong></span></Link>
        <nav aria-label="Main navigation"><a href="#platform">Platform</a><a href="#crew">Crew</a><ThemeToggle className="theme-toggle--landing" /><Link className="bt-nav__cta" href="/dashboard" aria-label="Explore dashboard"><span className="bt-nav__cta-full" aria-hidden="true">Explore dashboard</span><span className="bt-nav__cta-compact" aria-hidden="true">Dashboard</span><span aria-hidden="true">↗</span></Link></nav>
      </header>

      <section className="bt-hero" aria-labelledby="bt-title">
        <div className="bt-hero__copy">
          <h1 id="bt-title">The mission is<br /><em>human.</em></h1>
          <div className="bt-actions"><Link className="bt-button bt-button--primary" href="/dashboard">Explore dashboard <span aria-hidden="true">↗</span></Link><a className="bt-button bt-button--text" href="#platform">Platform <span aria-hidden="true">↓</span></a></div>
        </div>
        <div className="bt-diagram"><div className="bt-diagram__topline"><span>CREW SYSTEMS</span><span>01 — 05</span></div><LifeSystemsIllustration /></div>
      </section>

      <section className="bt-platform" id="platform" aria-labelledby="bt-platform-title">
        <div className="bt-section-head"><h2 id="bt-platform-title">Five views</h2></div>
        <div className="bt-domain-list">{VIEWS.map((title, index) => <article className="bt-domain" key={title}><span className="bt-domain__number">0{index + 1}</span><div><h3>{title}</h3></div><Link className="bt-domain__arrow" href="/dashboard" aria-label={`Open ${title}`}>↗</Link></article>)}</div>
      </section>

      <section className="bt-crew" id="crew" aria-labelledby="bt-crew-title">
        <div className="bt-crew__intro"><h2 id="bt-crew-title">Crew</h2></div>
        <div className="bt-crew__list">{CREW.map((member, index) => <article className="bt-crew-member" key={member.initials}><span className="bt-crew-member__index">0{index + 1}</span><CrewPortrait member={{ ...member, id: `AST-0${index + 1}` }} className="bt-crew-member__portrait"/><span className="bt-crew-member__identity"><strong>{member.name}</strong><small>{member.role}</small></span></article>)}</div>
      </section>

      <footer className="bt-footer"><Link href="/" className="bt-footer__brand"><BioTesseractLogo size={30} /><span>Bio-Tesseract</span></Link><nav aria-label="Footer navigation"><Link href="/dashboard">Dashboard</Link><a href="#platform">Platform</a><a href="#crew">Crew</a></nav><span className="bt-footer__copyright">© 2026 BIO-TESSERACT</span></footer>
    </main>
  );
}
