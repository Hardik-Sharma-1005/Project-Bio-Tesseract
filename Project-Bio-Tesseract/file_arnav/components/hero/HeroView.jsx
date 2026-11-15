import Link from 'next/link';
import BioTesseractLogo from '../logo/BioTesseractLogo';
import ThemeToggle from '../theme/ThemeToggle';

const DOMAINS = [
  {
    number: '01',
    title: 'Mission Overview',
    description: 'A shared view of crew status, current alerts, and the mission context held by the simulation.',
    mark: '◎',
    wide: true,
  },
  {
    number: '02',
    title: 'Bio-Monitor',
    description: 'Explore simulated crew readings and procedural ECG and PPG waveforms.',
    mark: '∿',
  },
  {
    number: '03',
    title: 'Life Support',
    description: 'Review the suit pressure and oxygen-reserve fields represented in the model.',
    mark: '◌',
  },
  {
    number: '04',
    title: 'AI Medical Advisor',
    description: 'Run an illustrative review of simulated telemetry. It is not a clinical tool.',
    mark: '＋',
  },
  {
    number: '05',
    title: 'Crew & Alerts',
    description: 'Move between the crew roster and a shared feed of simulated operational events.',
    mark: '↗',
    wide: true,
  },
];

const CREW = [
  { initials: 'SV', name: 'Cmdr. Sarah Vance', role: 'Mission Commander' },
  { initials: 'MC', name: 'Dr. Marcus Chen', role: 'Medical Specialist' },
  { initials: 'ER', name: 'Eng. Elena Rostova', role: 'Flight Engineer' },
  { initials: 'DK', name: 'Pilot David Kalu', role: 'Command Pilot' },
];

function LifeSystemsDiagram() {
  return (
    <div className="bt-diagram" aria-label="Illustration of connected crew, biology, and life-support systems">
      <div className="bt-diagram__topline"><span>HUMAN SYSTEMS / MISSION SYSTEMS</span><span>01 — 05</span></div>
      <svg className="bt-diagram__drawing" viewBox="0 0 620 470" role="img" aria-labelledby="systems-title systems-desc">
        <title id="systems-title">Connected life systems</title>
        <desc id="systems-desc">An abstract anatomical contour connected to five orbiting system points by fine measurement lines.</desc>
        <defs>
          <linearGradient id="bt-core" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#dca6bd" />
            <stop offset="1" stopColor="#877b9d" />
          </linearGradient>
          <radialGradient id="bt-glow"><stop stopColor="#a883a6" stopOpacity=".24" /><stop offset="1" stopColor="#a883a6" stopOpacity="0" /></radialGradient>
        </defs>
        <circle cx="311" cy="225" r="184" fill="url(#bt-glow)" />
        <circle cx="311" cy="225" r="146" fill="none" stroke="#d1c8da" strokeOpacity=".14" />
        <circle cx="311" cy="225" r="108" fill="none" stroke="#d1c8da" strokeOpacity=".22" strokeDasharray="2 8" />
        <path d="M311 43V405M128 225H494M182 96L439 353M440 96L183 353" stroke="#d9d2df" strokeOpacity=".12" />
        <path d="M310 109c-31 0-53 24-53 53 0 21 11 37 26 47-9 12-29 22-43 47-16 29-16 73-18 115h177c-2-42-2-86-18-115-14-25-34-35-43-47 15-10 26-26 26-47 0-29-22-53-54-53Z" fill="none" stroke="url(#bt-core)" strokeWidth="2" />
        <path d="M274 222c11-8 20-11 36-11s26 3 37 11M270 244c13 7 24 10 41 10s28-3 41-10M289 213c-5 16-8 31-7 47m56-47c5 16 8 31 7 47M280 279c17 11 28 15 31 15s14-4 31-15M288 314c8-8 15-11 23-11s15 3 23 11m-47 26c9-6 16-8 24-8s15 2 24 8" fill="none" stroke="#d7b1c4" strokeOpacity=".8" strokeWidth="1.5" />
        <path d="M311 235c-8-9-18-5-18 4 0 8 18 19 18 19s18-11 18-19c0-9-10-13-18-4Z" fill="none" stroke="#d7b1c4" strokeWidth="1.6" />
        <path d="M176 110H226L262 145M444 112H394L360 148M150 330H208L251 306M469 329H412L370 304M311 388V356" fill="none" stroke="#c7b7ce" strokeOpacity=".54" />
        <g fill="#e0b6cc" stroke="#17131e" strokeWidth="5"><circle cx="176" cy="110" r="5"/><circle cx="444" cy="112" r="5"/><circle cx="150" cy="330" r="5"/><circle cx="469" cy="329" r="5"/><circle cx="311" cy="388" r="5"/></g>
        <g fill="#bcb0c8" fontFamily="Arial, sans-serif" fontSize="9" letterSpacing="1.5"><text x="117" y="94">CREW</text><text x="444" y="96">BIOLOGY</text><text x="102" y="351">ENVIRONMENT</text><text x="441" y="350">RESPONSE</text><text x="282" y="422">MISSION</text></g>
      </svg>
      <div className="bt-diagram__caption"><span className="bt-diagram__index">FIG. 01</span><span>One crew. Interdependent systems. A single operational picture.</span></div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="bt-preview" aria-label="Representative preview of the Bio-Tesseract simulated mission dashboard">
      <div className="bt-preview__bar"><span className="bt-preview__brand"><i /> BIO-TESSERACT</span><span className="bt-preview__context">MISSION SIMULATION</span><span className="bt-preview__clock">DEMO ENVIRONMENT</span></div>
      <div className="bt-preview__body">
        <aside className="bt-preview__rail"><span className="bt-preview__rail-mark">B</span><span className="is-current">01</span><span>02</span><span>03</span><span>04</span><span>05</span></aside>
        <div className="bt-preview__content">
          <div className="bt-preview__heading"><div><small>MISSION / OVERVIEW</small><strong>Human systems, in context.</strong></div><span>SIMULATED</span></div>
          <div className="bt-preview__metrics"><div><small>CREW RECORDS</small><strong>04</strong><i>DEMO DATA</i></div><div><small>TELEMETRY MODEL</small><strong>READY</strong><i>SIMULATED</i></div><div><small>MEDICAL REVIEW</small><strong>ADVISORY</strong><i>ILLUSTRATIVE</i></div></div>
          <div className="bt-preview__lower"><div className="bt-preview__chart"><div><small>PROCEDURAL WAVEFORM</small><span>ILLUSTRATIVE</span></div><svg viewBox="0 0 480 95" preserveAspectRatio="none" aria-hidden="true"><path d="M0 53h58l9-4 8 7 11-3h37l8-5 8 8 8-3h34l9-38 10 68 11-31 9 5h62l8-5 8 8 9-3h47l8-5 8 8 10-3h43" fill="none" stroke="#bd83a5" strokeWidth="2"/><path d="M0 74H480M0 30H480M80 0V95M160 0V95M240 0V95M320 0V95M400 0V95" stroke="#d8dce4" strokeOpacity=".12" strokeDasharray="2 5"/></svg></div><div className="bt-preview__crew"><small>CREW ROSTER</small>{CREW.slice(0, 3).map((member) => <div key={member.initials}><i>{member.initials}</i><span>{member.name}</span><b>—</b></div>)}</div></div>
          <p className="bt-preview__disclosure">Static product illustration · no live spacecraft or sensor connection</p>
        </div>
      </div>
    </div>
  );
}

export default function HeroView() {
  return (
    <main className="bt-landing">
      <header className="bt-nav">
        <Link href="/" className="bt-brand" aria-label="Bio-Tesseract home"><BioTesseractLogo size={38} /><span><small>HUMAN SYSTEMS / SPACEFLIGHT</small><strong>Bio-Tesseract</strong></span></Link>
        <nav aria-label="Main navigation"><a href="#platform">Platform</a><a href="#crew">Crew</a><ThemeToggle className="theme-toggle--landing" /><Link className="bt-nav__cta" href="/dashboard">Explore dashboard <span aria-hidden="true">↗</span></Link></nav>
      </header>

      <section className="bt-hero" aria-labelledby="bt-title">
        <div className="bt-hero__copy">
          <p className="bt-kicker"><span /> BIOLOGY, BUILT INTO THE MISSION</p>
          <h1 id="bt-title">The mission is<br /><em>human.</em></h1>
          <p className="bt-hero__description">Bio-Tesseract brings crew physiology and spacecraft life-support context into one considered mission interface.</p>
          <div className="bt-actions"><Link className="bt-button bt-button--primary" href="/dashboard">Explore the mission interface <span aria-hidden="true">↗</span></Link><a className="bt-button bt-button--text" href="#platform">See how it works <span aria-hidden="true">↓</span></a></div>
          <p className="bt-demo-note"><span /> A simulated research and interface demonstrator</p>
        </div>
        <LifeSystemsDiagram />
        <div className="bt-hero__foot"><span>01 / A HUMAN-CENTRED MISSION PICTURE</span><span>DESIGNED FOR THE DISTANCE BETWEEN SYSTEMS</span></div>
      </section>

      <section className="bt-purpose" aria-labelledby="bt-purpose-title">
        <p className="bt-kicker"><span /> WHY BIO-TESSERACT</p>
        <div className="bt-purpose__layout"><h2 id="bt-purpose-title">A person is never<br />just a <em>reading.</em></h2><div><p>Human health and life support do not operate in isolation. Bio-Tesseract is a demonstration of how mission teams could read those connected contexts together—clearly, carefully, and with the crew at the centre.</p><p className="bt-purpose__note">The application uses simulated telemetry. It is not connected to spacecraft hardware, real astronaut sensors, or clinical systems.</p></div></div>
      </section>

      <section className="bt-platform" id="platform" aria-labelledby="bt-platform-title">
        <div className="bt-section-head"><div><p className="bt-kicker"><span /> THE OPERATIONAL PICTURE</p><h2 id="bt-platform-title">Five views.<br /><em>One connected crew.</em></h2></div><p>Move from mission-wide context to the details that shape a crew-centred response.</p></div>
        <div className="bt-domain-list">{DOMAINS.map((domain) => <article className={`bt-domain${domain.wide ? ' bt-domain--wide' : ''}`} key={domain.number}><span className="bt-domain__number">{domain.number}</span><span className="bt-domain__mark" aria-hidden="true">{domain.mark}</span><div><h3>{domain.title}</h3><p>{domain.description}</p></div><span className="bt-domain__arrow" aria-hidden="true">↗</span></article>)}</div>
        <p className="bt-platform__footnote">All readings, events, and medical-advisor results in this experience are simulated or illustrative.</p>
      </section>

      <section className="bt-product" aria-labelledby="bt-product-title">
        <div className="bt-product__intro"><p className="bt-kicker"><span /> INSIDE THE INTERFACE</p><h2 id="bt-product-title">Designed to make<br />the <em>connections visible.</em></h2><p>The dashboard brings an overview, individual biometrics, suit fields, simulated medical review, and crew events into a single working environment.</p><Link href="/dashboard" className="bt-inline-link">Step into the dashboard <span aria-hidden="true">↗</span></Link></div>
        <DashboardPreview />
      </section>

      <section className="bt-crew" id="crew" aria-labelledby="bt-crew-title">
        <div className="bt-crew__intro"><p className="bt-kicker"><span /> THE SIMULATED CREW</p><h2 id="bt-crew-title">Every system<br />has a <em>human side.</em></h2><p>Meet the four crew records represented in the Bio-Tesseract demonstration.</p></div>
        <div className="bt-crew__list">{CREW.map((member, index) => <article className="bt-crew-member" key={member.initials}><span className="bt-crew-member__index">0{index + 1}</span><span className="bt-crew-member__initials">{member.initials}</span><span className="bt-crew-member__identity"><strong>{member.name}</strong><small>{member.role}</small></span><span className="bt-crew-member__type">SIMULATED RECORD</span></article>)}</div>
      </section>

      <section className="bt-closing"><div><p className="bt-kicker"><span /> BIO-TESSERACT / MISSION INTERFACE</p><h2>Keep the human<br /><em>in the picture.</em></h2><p>Explore a simulated mission environment built around the relationship between crew, biology, and life support.</p></div><Link href="/dashboard" className="bt-button bt-button--primary">Explore the dashboard <span aria-hidden="true">↗</span></Link></section>

      <footer className="bt-footer"><Link href="/" className="bt-footer__brand"><BioTesseractLogo size={30} /><span>Bio-Tesseract</span></Link><p>Human systems / spaceflight<br /><small>Simulation demonstrator · Not for clinical use</small></p><nav aria-label="Footer navigation"><Link href="/dashboard">Dashboard</Link><a href="#platform">Platform</a><a href="#crew">Crew</a></nav><span className="bt-footer__copyright">© 2026 BIO-TESSERACT</span></footer>
    </main>
  );
}
