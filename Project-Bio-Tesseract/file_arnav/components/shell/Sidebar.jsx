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
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => onClose && onClose()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 89,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      <aside
        className={`sidebar-console ${isOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--bg-space-dark)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 16px',
          height: 'calc(100vh - var(--navbar-height))',
          position: 'sticky',
          top: 'var(--navbar-height)',
          boxSizing: 'border-box',
          flexShrink: 0,
          zIndex: 90,
          overflowY: 'auto'
        }}
      >
        <div>
          {/* Active Astronaut Profile Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '14px',
            marginBottom: '22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-hud)',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--hud-cyan)',
                flexShrink: 0
              }}>
                {activeAstronaut.initials}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="font-orbitron" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeAstronaut.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeAstronaut.role}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                TELEMETRY STATUS
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`status-dot ${activeAstronaut.status === 'Warning' ? 'warning' : 'nominal'}`} />
                <span className="font-mono" style={{ fontSize: '0.72rem', color: activeAstronaut.status === 'Warning' ? 'var(--hud-amber)' : 'var(--hud-emerald)' }}>
                  {activeAstronaut.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '4px' }}>
            NAVIGATION SECTIONS
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange && onTabChange(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '5px',
                    background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                  className="sidebar-btn"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.68rem', color: isActive ? 'var(--hud-cyan)' : 'var(--text-muted)' }}>
                    {item.num}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Ground Station Footer Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '12px',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              HOUSTON GROUND LINK
            </span>
            <span className="status-dot nominal" />
          </div>
          <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--hud-emerald)' }}>
            QUANTUM UPLINK LOCKED
          </div>
          <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            RTT: 1.18s • SNR: 44.2 dB
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          color: #ffffff !important;
        }
        @media (max-width: 1024px) {
          .sidebar-console {
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            height: 100vh !important;
            left: -260px !important;
            transition: transform 0.3s ease !important;
          }
          .sidebar-console.sidebar-open {
            transform: translateX(260px) !important;
          }
        }
      `}</style>
    </>
  );
}
