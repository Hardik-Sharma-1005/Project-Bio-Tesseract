'use client';

import CrewPortrait from '../crew/CrewPortrait';
import ThemeToggle from '../theme/ThemeToggle';

const NAV_ITEMS = [
  { id: 'overview', label: 'Mission Overview', num: '01', icon: 'mission' },
  { id: 'biomonitor', label: 'Bio-Monitor', num: '02', icon: 'biology' },
  { id: 'lifesupport', label: 'Life Support', num: '03', icon: 'life' },
  { id: 'medical', label: 'AI Medical Advisor', num: '04', icon: 'medical' },
  { id: 'crew', label: 'Crew & Alerts', num: '05', icon: 'crew' },
];

function NavigationIcon({ name }) {
  const paths = {
    mission: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 1v3M23 12h-3M12 23v-3M1 12h3"/></>,
    biology: <><path d="M2 12h4l2.4-5 4.1 10 2.3-6H22"/><path d="M4 4h.01M20 20h.01"/></>,
    life: <><path d="M12 2.5 20 6v5.5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3.5Z"/><path d="M8 12h8M12 8v8"/></>,
    medical: <><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></>,
    crew: <><circle cx="9" cy="8" r="3"/><path d="M3 20c.4-3.2 2.5-5 6-5s5.6 1.8 6 5M16 5.5a3 3 0 0 1 0 5.8M17 15c2.4.4 3.7 2 4 5"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export default function Sidebar({ activeTab, onTabChange, activeAstronaut, isOpen, onClose, collapsed = false, onToggleCollapse }) {
  if (!activeAstronaut) return null;

  return (
    <aside
      id="dashboard-sidebar"
      className={`dashboard-sidebar${isOpen ? ' dashboard-sidebar--open' : ''}${collapsed ? ' dashboard-sidebar--collapsed' : ''}`}
      aria-label="Dashboard navigation"
    >
      <div className="dashboard-sidebar__primary">
        <div className="dashboard-sidebar__topline"><div className="dashboard-sidebar__eyebrow">CURRENT CREW MEMBER</div><button className="dashboard-sidebar__collapse" type="button" onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><span aria-hidden="true">{collapsed ? '›' : '‹'}</span></button></div>
        <div className="dashboard-crew-summary">
          <CrewPortrait member={activeAstronaut} className="dashboard-crew-summary__avatar" />
          <div className="dashboard-crew-summary__copy">
            <div className="dashboard-crew-summary__name">{activeAstronaut.name}</div>
            <div className="dashboard-crew-summary__role">{activeAstronaut.role}</div>
          </div>
        </div>
        <div className="dashboard-crew-status">
          <span>SIMULATED STATE</span>
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
                aria-label={item.label}
                title={collapsed ? item.label : undefined}
              >
                <span className="dashboard-nav-item__icon"><NavigationIcon name={item.icon} /></span>
                <span className="dashboard-nav-item__label">{item.label}</span>
                <span className="dashboard-nav-item__num">{item.num}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="dashboard-sidebar__footer">
        <ThemeToggle className="theme-toggle--sidebar" />
      </div>
    </aside>
  );
}
