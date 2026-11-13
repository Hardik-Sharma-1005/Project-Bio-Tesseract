// Client Application Controller — Project Bio-Tesseract

// Page Navigation
function navigateTo(pageId) {
  document.querySelectorAll(".page-view").forEach(page => {
    page.classList.remove("active");
  });
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const targetPage = document.getElementById(`page-${pageId}`);
  const targetNav = document.getElementById(`nav-${pageId}`);

  if (targetPage) targetPage.classList.add("active");
  if (targetNav) targetNav.classList.add("active");

  window.location.hash = pageId;

  // Scroll to top on page switch
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pageId === "home") {
    loadHome();
    loadAlerts();
    runNeuralScan(false);
  } else if (pageId === "vitals") {
    loadVitals();
  } else if (pageId === "environmental") {
    loadEnvironmental();
  } else if (pageId === "medical") {
    mountMedicalView();
  } else if (pageId === "alerts") {
    mountAlertsView();
  }
}

// Smooth scroll to section on home page
function scrollToSection(sectionId) {
  const currentActive = document.querySelector(".page-view.active");
  if (!currentActive || currentActive.id !== "page-home") {
    navigateTo("home");
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  } else {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

function scrollToBodyMap() {
  scrollToSection("body-map-section");
}

// Attach Nav Listeners
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const pageId = btn.getAttribute("data-page");
    navigateTo(pageId);
  });
});

// ═════════════════════════════════════════════════════════════════════
// 1. HOME & BODY MAP TELEMETRY
// ═════════════════════════════════════════════════════════════════════
async function loadHome() {
  const badge = document.getElementById("body-status-badge");
  const bodyParts = document.querySelectorAll(".body-part");
  const allOrgans = ["brain", "heart", "lungs", "liver", "stomach", "kidneys"];

  try {
    const res = await fetch("/api/vitals");
    const data = await res.json();

    if (!data.success || !data.hasVitalData) {
      if (badge) {
        badge.className = "status-badge status-neutral";
        badge.textContent = "Connecting to telemetry...";
      }
      return;
    }

    let overallStatus = "NORMAL";
    const statusValues = Object.values(data.organs || {});

    if (statusValues.includes("CRITICAL")) {
      overallStatus = "CRITICAL";
    } else if (statusValues.includes("WARNING")) {
      overallStatus = "WARNING";
    }

    if (badge) {
      badge.className = `status-badge status-${overallStatus.toLowerCase()}`;
      badge.textContent = overallStatus === "NORMAL" ? "All Systems Nominal" : `${overallStatus} Status Detected`;
    }

    bodyParts.forEach(part => {
      part.classList.remove("body-neutral");
      part.classList.add("body-normal");
    });

    allOrgans.forEach(org => {
      const orgStatus = (data.organs && data.organs[org]) || "NORMAL";
      const svgOrgan = document.getElementById(`organ-${org}`);

      if (svgOrgan) {
        let cssClass = "organ organ-normal";
        if (orgStatus === "WARNING") cssClass = "organ organ-warning";
        else if (orgStatus === "CRITICAL") cssClass = "organ organ-critical";
        else if (orgStatus === "NO_DATA") cssClass = "organ organ-neutral";
        svgOrgan.className.baseVal = cssClass;
      }

      const listItem = document.getElementById(`organ-item-${org}`);
      if (listItem) {
        const dot = listItem.querySelector(".status-dot");
        const val = listItem.querySelector(".organ-val");
        if (dot) {
          dot.className = `status-dot dot-${orgStatus.toLowerCase()}`;
        }
        if (val) {
          const param = data.vitals ? data.vitals.find(v => v.organ === org) : null;
          if (param && param.latest && param.latest.value !== null && param.latest.value !== undefined) {
            val.textContent = `${param.latest.value} ${param.unit}`;
          } else {
            val.textContent = "Nominal";
          }
        }
      }
    });

  } catch (err) {
    console.error("Error loading home anatomical telemetry:", err);
  }
}

// ═════════════════════════════════════════════════════════════════════
// 2. ASTRONAUT VITALS & TREND SPARKLINES
// ═════════════════════════════════════════════════════════════════════
async function loadVitals() {
  const grid = document.getElementById("vitals-grid");
  if (!grid) return;

  try {
    const res = await fetch("/api/vitals");
    const data = await res.json();

    if (!data.success || !Array.isArray(data.vitals) || data.vitals.length === 0) {
      grid.innerHTML = "<div class='empty-state'>Awaiting telemetry synchronization...</div>";
      return;
    }

    grid.innerHTML = "";

    data.vitals.forEach(vital => {
      const card = document.createElement("div");
      card.className = "telemetry-card";

      const hasVal = vital.latest && vital.latest.value !== null && vital.latest.value !== undefined;
      const displayVal = hasVal ? vital.latest.value : "--";
      const status = vital.status || "NORMAL";

      let statusBadge = `<span class="status-badge status-${status.toLowerCase()}">${status}</span>`;
      if (!hasVal) {
        statusBadge = `<span class="status-badge status-neutral">NO DATA</span>`;
      }

      let graphHtml = "";
      if (vital.hasGraph) {
        if (Array.isArray(vital.history) && vital.history.length > 1) {
          graphHtml = `<div class="card-graph">${renderSparkline(vital.history, status)}</div>`;
        } else {
          graphHtml = `<div class="empty-graph">Tracking trend stream...</div>`;
        }
      }

      let targetDisplay = "Nominal Range";
      if (vital.thresholds) {
        if (Array.isArray(vital.thresholds.normal) && vital.thresholds.normal.length >= 2) {
          targetDisplay = `Target: ${vital.thresholds.normal[0]} - ${vital.thresholds.normal[1]} ${vital.unit}`;
        } else if (vital.thresholds.lowWarning !== undefined && vital.thresholds.highWarning !== undefined) {
          targetDisplay = `Target: ${vital.thresholds.lowWarning} - ${vital.thresholds.highWarning} ${vital.unit}`;
        }
      }

      const timeStr = vital.latest && vital.latest.recorded_at
        ? new Date(vital.latest.recorded_at).toLocaleTimeString()
        : 'Live Sync';

      card.innerHTML = `
        <div class="card-top">
          <div class="param-name">${vital.name}</div>
          ${statusBadge}
        </div>
        <div class="card-reading">
          <span class="param-value">${displayVal}</span>
          <span class="param-unit">${vital.unit}</span>
        </div>
        ${graphHtml}
        <div class="card-footer">
          <span>${targetDisplay}</span>
          <span>${timeStr}</span>
        </div>
      `;

      grid.appendChild(card);
    });

  } catch (err) {
    console.error("Error loading vitals:", err);
    grid.innerHTML = "<div class='empty-state'>Failed to load vital telemetry. Reconnecting...</div>";
  }
}

function renderSparkline(history, status) {
  if (!Array.isArray(history) || history.length < 2) return "";

  const points = history.map(h => typeof h.value === 'number' ? h.value : parseFloat(h.value) || 0);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const w = 280;
  const h = 50;
  const step = w / (points.length - 1);

  let pathD = "";
  points.forEach((val, i) => {
    const x = i * step;
    const y = h - ((val - min) / range) * (h - 10) - 5;
    pathD += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
  });

  let strokeColor = "var(--color-normal)";
  if (status === "WARNING") strokeColor = "var(--color-warning)";
  if (status === "CRITICAL") strokeColor = "var(--color-critical)";

  return `
    <svg viewBox="0 0 ${w} ${h}" class="sparkline-svg" preserveAspectRatio="none" style="width:100%; height:50px;">
      <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

// ═════════════════════════════════════════════════════════════════════
// 3. ENVIRONMENTAL FACTORS
// ═════════════════════════════════════════════════════════════════════
async function loadEnvironmental() {
  const grid = document.getElementById("environmental-grid");
  if (!grid) return;

  try {
    const res = await fetch("/api/environmental");
    const data = await res.json();

    if (!data.success || !Array.isArray(data.environmental) || data.environmental.length === 0) {
      grid.innerHTML = "<div class='empty-state'>Awaiting environmental telemetry...</div>";
      return;
    }

    grid.innerHTML = "";

    data.environmental.forEach(param => {
      const card = document.createElement("div");
      card.className = "env-card";

      const hasVal = param.latest && param.latest.value !== null && param.latest.value !== undefined;
      const displayVal = hasVal ? param.latest.value : "--";

      card.innerHTML = `
        <div class="env-name">${param.name}</div>
        <div class="env-unit">${param.unit}</div>
        <div class="env-reading">
          <span class="env-value">${displayVal}</span>
        </div>
      `;

      grid.appendChild(card);
    });

  } catch (err) {
    console.error("Error loading environmental factors:", err);
    grid.innerHTML = "<div class='empty-state'>Failed to load environmental telemetry. Reconnecting...</div>";
  }
}

// ═════════════════════════════════════════════════════════════════════
// 4. AI MEDICAL ADVISOR (Diagnostics & Protocols)
// ═════════════════════════════════════════════════════════════════════
function runNeuralScan(withAnimation = true) {
  const select = document.getElementById("advisor-astronaut-select");
  const targetName = select ? select.value : "Cmdr. Sarah Vance";

  const targetEl = document.getElementById("advisor-target-name");
  const badgeEl = document.getElementById("advisor-status-badge");
  const textEl = document.getElementById("advisor-diagnosis-text");
  const btnScan = document.getElementById("btn-run-scan");

  if (targetEl) targetEl.textContent = `BIO-ASSESSMENT FOR ${targetName.toUpperCase()}`;

  if (withAnimation) {
    if (btnScan) {
      btnScan.disabled = true;
      btnScan.textContent = "🔄 SCANNING SENSORS...";
    }
    if (textEl) {
      textEl.innerHTML = `<span style="color: #38bdf8;">Synthesizing real-time telemetry from PPG, Galvanic Skin Response (GSR), Core Temp, and Suit Atmospheric sensors for ${targetName}...</span>`;
    }
    if (badgeEl) {
      badgeEl.className = "cyber-badge cyber-badge-cyan";
      badgeEl.textContent = "SCANNING...";
    }

    setTimeout(() => {
      if (btnScan) {
        btnScan.disabled = false;
        btnScan.textContent = "⚡ RUN NEURAL SCAN";
      }
      finalizeDiagnosis(targetName);
    }, 1100);
  } else {
    finalizeDiagnosis(targetName);
  }
}

function finalizeDiagnosis(targetName) {
  const badgeEl = document.getElementById("advisor-status-badge");
  const textEl = document.getElementById("advisor-diagnosis-text");
  const rDecomp = document.getElementById("risk-decompression");
  const rHypox = document.getElementById("risk-hypoxia");
  const rStress = document.getElementById("risk-stress");

  const decompVal = (0.01 + Math.random() * 0.03).toFixed(2);
  const stressVal = Math.floor(16 + Math.random() * 8);

  if (rDecomp) rDecomp.innerHTML = `${decompVal}% <span class="risk-sub">[LOW]</span>`;
  if (rHypox) rHypox.innerHTML = `0.00% <span class="risk-sub">[NIL]</span>`;
  if (rStress) rStress.innerHTML = `${stressVal}% <span class="risk-sub">[NORMAL]</span>`;

  if (badgeEl) {
    badgeEl.className = "cyber-badge cyber-badge-emerald";
    badgeEl.textContent = "STABLE CLASSIFICATION";
  }

  if (textEl) {
    textEl.textContent = `All autonomic nervous system markers indicate optimal physiological adaptation to microgravity for ${targetName}. Cardiac output, oxygenation curve, and hemodynamic stability remain within nominal EVA flight envelopes.`;
  }
}

function dispatchProtocol(protocolKey) {
  const feedbackEl = document.getElementById("protocol-feedback");
  if (!feedbackEl) return;

  const names = {
    hydration: "HYDRATION PACK DISPENSE",
    thermal: "LCVG TEMP REGULATE (+0.5°C)",
    oxygen: "100% PRE-BREATHE FLUSH"
  };

  const name = names[protocolKey] || protocolKey.toUpperCase();
  const time = new Date().toLocaleTimeString();

  feedbackEl.style.display = "block";
  feedbackEl.innerHTML = `✓ Protocol <strong>${name}</strong> transmitted to EMU-X Life Support Controller at ${time}. Telemetry acknowledge received.`;
}

function mountMedicalView() {
  const mount = document.getElementById("medical-view-mount");
  const homePanel = document.getElementById("medical-advisor-section");
  if (mount && homePanel) {
    mount.innerHTML = homePanel.innerHTML;
  }
}

// ═════════════════════════════════════════════════════════════════════
// 5. MISSION ALERTS FEED (Stream, ACK, and Anomaly Trigger)
// ═════════════════════════════════════════════════════════════════════
async function loadAlerts() {
  const feedList = document.getElementById("alerts-feed-list");
  const badgeCount = document.getElementById("alerts-count-badge");

  try {
    const res = await fetch("/api/alerts");
    const data = await res.json();

    if (!data.success || !Array.isArray(data.alerts)) return;

    if (badgeCount) {
      badgeCount.textContent = `${data.alerts.length} EVENTS`;
    }

    if (feedList) {
      feedList.innerHTML = "";
      data.alerts.forEach(alert => {
        let badgeClass = "cyber-badge-cyan";
        if (alert.severity === "CRITICAL") badgeClass = "cyber-badge-crimson";
        if (alert.severity === "CAUTION") badgeClass = "cyber-badge-amber";
        if (alert.severity === "NOMINAL") badgeClass = "cyber-badge-emerald";

        const row = document.createElement("div");
        row.className = "alert-row";

        let ackBtnHtml = "";
        if (!alert.acknowledged) {
          ackBtnHtml = `<button class="btn-ack" onclick="acknowledgeAlert('${alert.id}')">ACK</button>`;
        } else {
          ackBtnHtml = `<span style="font-size:0.7rem; color:var(--text-muted);">ACK'D</span>`;
        }

        row.innerHTML = `
          <div class="alert-content">
            <span class="cyber-badge ${badgeClass}">${alert.severity}</span>
            <div>
              <div class="alert-title-text">${alert.title}</div>
              <div class="alert-meta-text">${alert.time} • ${alert.subsystem}</div>
            </div>
          </div>
          ${ackBtnHtml}
        `;

        feedList.appendChild(row);
      });
    }

  } catch (err) {
    console.error("Error loading mission alerts:", err);
  }
}

async function acknowledgeAlert(alertId) {
  try {
    const res = await fetch("/api/alerts/ack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: alertId })
    });
    if (res.ok) {
      loadAlerts();
    }
  } catch (err) {
    console.error("Error acknowledging alert:", err);
  }
}

async function triggerSimulatedAnomaly() {
  try {
    const res = await fetch("/api/alerts/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      loadAlerts();
      loadHome();
      loadVitals();

      // Audio/Visual Feedback
      const badge = document.getElementById("body-status-badge");
      if (badge) {
        badge.className = "status-badge status-critical";
        badge.textContent = "CRITICAL: TACHYCARDIA ANOMALY DETECTED";
      }

      const stressEl = document.getElementById("risk-stress");
      if (stressEl) {
        stressEl.innerHTML = `78% <span class="risk-sub" style="color:#f87171;">[ELEVATED]</span>`;
      }
    }
  } catch (err) {
    console.error("Error triggering anomaly simulation:", err);
  }
}

function mountAlertsView() {
  const mount = document.getElementById("alerts-view-mount");
  const homePanel = document.getElementById("mission-alerts-section");
  if (mount && homePanel) {
    mount.innerHTML = homePanel.innerHTML;
    loadAlerts();
  }
}

// ═════════════════════════════════════════════════════════════════════
// 6. HERO INTERACTIVE FEATURES (Canvas, Typewriter, Stats, Crew)
// ═════════════════════════════════════════════════════════════════════

// Starfield & Comet Canvas Engine
(function initSpaceCanvas() {
  const canvas = document.getElementById('space-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let W = (canvas.width = window.innerWidth);
  let H = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initStars();
  });

  const NUM_STARS = 160;
  const stars = [];

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.3,
        base: Math.random() * 0.45 + 0.1,
        spd: Math.random() * 0.025 + 0.008,
        off: Math.random() * Math.PI * 2,
      });
    }
  }
  initStars();

  const comets = [];
  const MAX_COMETS = 4;

  function spawnComet() {
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
    const side = Math.random() < 0.6 ? 'top' : 'left';
    const len = 90 + Math.random() * 110;
    const spd = 2.5 + Math.random() * 3;
    const x = side === 'top' ? Math.random() * W : -len;
    const y = side === 'top' ? -len : Math.random() * H * 0.6;
    comets.push({
      x,
      y,
      angle,
      spd,
      len,
      op: 0.6 + Math.random() * 0.35,
      w: 1 + Math.random(),
    });
  }

  for (let i = 0; i < MAX_COMETS; i++) {
    setTimeout(spawnComet, i * 1800 + Math.random() * 800);
  }

  function loop(ts) {
    ctx.clearRect(0, 0, W, H);
    const t = ts * 0.001;

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const op = s.base + Math.sin(t * s.spd + s.off) * 0.18;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, op))})`;
      ctx.fill();
    }

    for (let i = comets.length - 1; i >= 0; i--) {
      const c = comets[i];
      c.x += Math.cos(c.angle) * c.spd;
      c.y += Math.sin(c.angle) * c.spd;

      if (c.x > W + c.len || c.y > H + c.len) {
        comets.splice(i, 1);
        setTimeout(spawnComet, 2000 + Math.random() * 3000);
        continue;
      }

      const tx = c.x - Math.cos(c.angle) * c.len;
      const ty = c.y - Math.sin(c.angle) * c.len;
      const grad = ctx.createLinearGradient(tx, ty, c.x, c.y);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.6, `rgba(242, 190, 221, ${c.op * 0.4})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${c.op})`);

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(c.x, c.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = c.w;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(c.x, c.y, c.w * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${c.op})`;
      ctx.fill();
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();

// Typewriter Effect
(function initTypewriter() {
  const words = ['Astronaut Health.', 'Deep-Space Vitals.', 'Crew Biometrics.'];
  let wordIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const el = document.getElementById('hero-typewriter');
  if (!el) return;

  function tick() {
    const word = words[wordIdx];
    if (!isDeleting) {
      charIdx++;
      el.textContent = word.slice(0, charIdx);
      if (charIdx === word.length) {
        setTimeout(() => {
          isDeleting = true;
          tick();
        }, 1800);
        return;
      }
    } else {
      charIdx--;
      el.textContent = word.slice(0, charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        wordIdx = (wordIdx + 1) % words.length;
      }
    }
    setTimeout(tick, isDeleting ? 45 : 85);
  }

  tick();
})();

// Stats Count-Up Animation
(function initStatsCountUp() {
  function animateValue(id, target, suffix = '', duration = 1400) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  setTimeout(() => {
    animateValue('stat-crew', 4, '');
    animateValue('stat-spo2', 98, '%');
    animateValue('stat-hr', 72, '');
    animateValue('stat-days', 14, 'd');
  }, 300);
})();

// Crew Live Heart-Rate Fluctuation
(function initCrewPulse() {
  const crewIds = ['SV', 'MC', 'ER', 'DK'];
  setInterval(() => {
    crewIds.forEach(id => {
      const el = document.getElementById(`crew-hr-${id}`);
      if (el) {
        const cur = parseInt(el.textContent, 10) || 72;
        const delta = Math.floor(Math.random() * 3) - 1;
        el.textContent = Math.min(105, Math.max(55, cur + delta));
      }
    });
  }, 2500);
})();

// Initial Page Load
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.replace("#", "");
  if (hash === "vitals" || hash === "environmental" || hash === "medical" || hash === "alerts") {
    navigateTo(hash);
  } else {
    navigateTo("home");
  }

  // Periodic Telemetry & Alerts Refresh (Every 3 seconds)
  setInterval(() => {
    const active = document.querySelector(".page-view.active");
    if (!active) return;
    if (active.id === "page-home") {
      loadHome();
      loadAlerts();
    }
    if (active.id === "page-vitals") loadVitals();
    if (active.id === "page-environmental") loadEnvironmental();
    if (active.id === "page-alerts") loadAlerts();
  }, 3000);
});
