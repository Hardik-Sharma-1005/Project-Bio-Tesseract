'use client';

const NAV_ITEMS = [
  { id: 'overview', label: 'Mission Overview', num: '01', icon: '◈' },
  { id: 'biomonitor', label: 'Bio-Monitor', num: '02', icon: '⌁' },
  { id: 'lifesupport', label: 'Life Support', num: '03', icon: '◇' },
  { id: 'medical', label: 'AI Medical Advisor', num: '04', icon: '✳' },
  { id: 'crew', label: 'Crew & Alerts', num: '05', icon: '◎' },
];

export default function Sidebar({ activeTab, onTabChange, activeAstronaut, isOpen, onClose }) {
  if (!activeAstronaut) return null;

  return (
    <aside
      id="dashboard-sidebar"
      className={`dashboard-sidebar${isOpen ? ' dashboard-sidebar--open' : ''}`}
      aria-label="Dashboard navigation"
    >
      <div className="dashboard-sidebar__primary">
        <div className="dashboard-sidebar__eyebrow">CURRENT CREW MEMBER</div>
        <div className="dashboard-crew-summary">
          <div className="dashboard-crew-summary__avatar" aria-hidden="true">{activeAstronaut.initials}</div>
          <div className="dashboard-crew-summary__copy">
            <div className="dashboard-crew-summary__name">{activeAstronaut.name}</div>
            <div className="dashboard-crew-summary__role">{activeAstronaut.role}</div>
          </div>
        </div>
        <div className="dashboard-crew-status">
          <span>TELEMETRY</span>
          <span className={`dashboard-inline-status dashboard-inline-status--${activeAstronaut.status === 'Warning' ? 'warning' : 'nominal'}`}>
            <span className="dashboard-inline-status__mark" aria-hidden="true">{activeAstronaut.status === 'Warning' ? '!' : '✓'}</span>
            {activeAstronaut.status.toUpperCase()}
          </span>
        </div>

        <div className="dashboard-sidebar__eyebrow dashboard-sidebar__eyebrow--nav">WORKSPACE</div>
        <nav className="dashboard-nav-list" aria-label="Dashboard sections">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange?.(item.id);
                  onClose?.();
                }}
                className={`dashboard-nav-item${isActive ? ' dashboard-nav-item--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="dashboard-nav-item__icon" aria-hidden="true">{item.icon}</span>
                <span className="dashboard-nav-item__label">{item.label}</span>
                <span className="dashboard-nav-item__num">{item.num}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="dashboard-ground-link">
        <div className="dashboard-ground-link__heading">
          <span>GROUND STATION</span>
          <span className="dashboard-ground-link__status" aria-hidden="true">✓</span>
        </div>
        <div className="dashboard-ground-link__state">SIMULATED LINK · NOMINAL</div>
        <div className="dashboard-ground-link__detail">DEMO TELEMETRY FEED</div>
      </div>
    </aside>
  );
}
