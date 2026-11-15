const SECTION_ALIASES = [
  { id: 'overview', aliases: ['mission overview', 'overview', 'mission status page'] },
  { id: 'biomonitor', aliases: ['bio monitor', 'biomonitor', 'biometric dashboard', 'physiology dashboard'] },
  { id: 'lifesupport', aliases: ['life support', 'suit systems', 'suit telemetry'] },
  { id: 'medical', aliases: ['medical advisor', 'advisor', 'medical scan'] },
  { id: 'crew', aliases: ['crew and alerts', 'crew alerts', 'crew and alert', 'event log', 'alert log'] },
];

export const SECTION_LABELS = {
  overview: 'Mission Overview',
  biomonitor: 'Bio-Monitor',
  lifesupport: 'Life Support',
  medical: 'Medical Advisor',
  crew: 'Crew & Alerts',
};

export const METRICS = [
  { id: 'hr', label: 'heart rate', aliases: ['heart rate', 'pulse', 'hr', 'bpm'], unit: 'bpm', digits: 0 },
  { id: 'spo2', label: 'blood oxygen saturation (SpO₂)', aliases: ['spo2', 'sp o2', 'blood oxygen', 'oxygen saturation'], unit: '%', digits: 1 },
  { id: 'bloodPressure', label: 'blood pressure', aliases: ['blood pressure', 'bp'], unit: 'mmHg', digits: 0 },
  { id: 'respRate', label: 'respiration rate', aliases: ['respiration rate', 'breathing rate', 'respiratory rate', 'respiration'], unit: 'breaths/min', digits: 0 },
  { id: 'stress', label: 'stress simulation input', aliases: ['stress', 'stress index'], unit: '%', digits: 0 },
  { id: 'suitP', label: 'suit pressure', aliases: ['suit pressure', 'suitp'], unit: 'PSI', digits: 1 },
  { id: 'o2', label: 'suit oxygen reserve', aliases: ['suit oxygen reserve', 'oxygen reserve', 'suit oxygen', 'pack oxygen'], unit: '%', digits: 0 },
];

export const COMMAND_REGISTRY = [
  { id: 'MISSION_STATUS', description: 'Read the current derived mission status', mode: 'read-only', patterns: ['mission status', 'status of the mission', 'how is the mission'] },
  { id: 'MISSION_SUMMARY', description: 'Summarize current shared mission state', mode: 'read-only', patterns: ['summarize mission', 'mission summary', 'situation report'] },
  { id: 'CREW_COUNT', description: 'Count crew in the current roster', mode: 'read-only', patterns: ['how many crew members', 'crew count'] },
  { id: 'SELECTED_CREW', description: 'Identify current crew selection', mode: 'read-only', patterns: ['who is selected', 'current crew member'] },
  { id: 'CURRENT_SECTION', description: 'Identify the currently visible section', mode: 'read-only', patterns: ['current section', 'what page am i on'] },
  { id: 'ANOMALY_STATUS', description: 'Read simulated anomaly state', mode: 'read-only', patterns: ['is the anomaly active', 'anomaly status'] },
  { id: 'LIST_CREW', description: 'List the available crew roster', mode: 'read-only', patterns: ['list crew', 'show all crew', 'crew members'] },
  { id: 'SELECT_CREW', description: 'Select a crew member', mode: 'navigation', patterns: ['select {crew}', 'focus {crew}', 'switch to {crew}'] },
  { id: 'CREW_READINGS', description: 'Read supported simulated crew measurements', mode: 'read-only', patterns: ['show {crew} readings', 'show selected readings', 'show this crew member vitals'] },
  { id: 'CREW_METRIC', description: 'Retrieve one supported current crew measurement', mode: 'read-only', patterns: ['{crew} heart rate', '{crew} blood oxygen', '{crew} suit pressure'] },
  { id: 'COMPARE_CREW', description: 'Compare two crew members for one supported measure', mode: 'read-only', patterns: ['compare {crew} and {crew} {metric}'] },
  { id: 'LIST_ALERTS', description: 'List unresolved, critical, caution, or all alerts', mode: 'read-only', patterns: ['unresolved alerts', 'critical alerts', 'caution alerts', 'all alerts'] },
  { id: 'ALERT_COUNTS', description: 'Count acknowledged or unresolved events', mode: 'read-only', patterns: ['how many alerts acknowledged', 'how many alerts unresolved'] },
  { id: 'INSPECT_ALERT', description: 'Inspect selected alert details and association', mode: 'read-only', patterns: ['inspect selected alert', 'alert subsystem', 'alert status', 'crew association'] },
  { id: 'SELECT_ALERT', description: 'Select an alert by title or identifier', mode: 'navigation', patterns: ['select alert {title}', 'inspect alert {id}'] },
  { id: 'OPEN_SELECTED_ALERT', description: 'Open the selected alert in its supported dashboard destination', mode: 'navigation', patterns: ['open selected alert', 'open this alert'] },
  { id: 'ACKNOWLEDGE_ALERT', description: 'Acknowledge an alert after confirmation', mode: 'state-changing', patterns: ['acknowledge selected alert', 'acknowledge {alert}'] },
  { id: 'NAVIGATE', description: 'Navigate among the five dashboard sections', mode: 'navigation', patterns: ['open {section}', 'take me to {section}', 'show {section}'] },
  { id: 'START_ANOMALY', description: 'Start the existing simulated anomaly after confirmation', mode: 'state-changing', patterns: ['start simulated anomaly', 'run anomaly'] },
  { id: 'RESOLVE_ANOMALY', description: 'Resolve the existing simulated anomaly after confirmation', mode: 'state-changing', patterns: ['resolve simulated anomaly', 'clear anomaly'] },
  { id: 'UNAVAILABLE_HISTORY', description: 'Explain when telemetry history is unavailable', mode: 'read-only', patterns: ['trend', 'historical readings', 'last hour'] },
  { id: 'UNSUPPORTED', description: 'Respond honestly outside supported commands', mode: 'read-only', patterns: ['unrecognized request'] },
];

export function normalizeCommand(input) {
  return String(input || '')
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/₂/g, '2')
    .replace(/[’']/g, "'")
    .replace(/\bwhat's\b/g, 'what is')
    .replace(/\bwho's\b/g, 'who is')
    .replace(/\bwhere's\b/g, 'where is')
    .replace(/\bcan't\b/g, 'cannot')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\b([a-z]+)'s\b/g, '$1')
    .replace(/\bbiometric monitor\b/g, 'bio monitor')
    .replace(/\bbiomonitoring\b/g, 'bio monitor')
    .replace(/\bsara\b/g, 'sarah')
    .replace(/\bmarkus\b/g, 'marcus')
    .replace(/\bcrewmen\b/g, 'crew members')
    .replace(/[^a-z0-9%]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const matchesAny = (text, expressions) => expressions.some(expression => expression.test(text));
const includesAny = (text, phrases) => phrases.some(phrase => text.includes(phrase));
const compact = (text) => text.replace(/[^a-z0-9]/g, '');
const hasWords = (text, words) => words.some(word => new RegExp(`\\b${word}\\b`).test(text));

function personAliases(member) {
  const tokens = normalizeCommand(member.name).split(' ');
  const withoutTitle = tokens.filter(token => !['cmdr', 'dr', 'eng', 'pilot'].includes(token));
  const aliases = [
    withoutTitle.join(' '),
    withoutTitle[0],
    withoutTitle[withoutTitle.length - 1],
    normalizeCommand(member.id),
  ].filter(Boolean);
  return [...new Set(aliases)];
}

export function findCrewMatches(text, crew = []) {
  const found = [];
  for (const member of crew) {
    const aliases = personAliases(member);
    if (aliases.some(alias => alias.length >= 3 && (text.includes(alias) || compact(text).includes(compact(alias))))) found.push(member);
  }
  return found;
}

function matchingAlerts(text, alerts = []) {
  return alerts.filter(alert => {
    const title = normalizeCommand(alert.title);
    const id = normalizeCommand(alert.id);
    return (title && text.includes(title)) || (id && (text.includes(id) || compact(text).includes(compact(id))));
  });
}

function findMetric(text) {
  const ordered = [...METRICS].sort((a, b) => Math.max(...b.aliases.map(alias => alias.length)) - Math.max(...a.aliases.map(alias => alias.length)));
  return ordered.find(metric => includesAny(text, metric.aliases.map(normalizeCommand))) || null;
}

function findSection(text) {
  for (const section of SECTION_ALIASES) {
    if (section.aliases.some(alias => text.includes(normalizeCommand(alias)))) return section.id;
  }
  return null;
}

const result = (intent, kind, data = {}) => ({ intent, kind, ...data });

export function recognizeCommand(input, context) {
  const text = normalizeCommand(input);
  if (!text) return result('EMPTY', 'empty');

  if (matchesAny(text, [/\b(trend|trending|history|historical|over time|last hour|previous|earlier)\b/])) {
    return result('UNAVAILABLE_HISTORY', 'response');
  }

  const crewMatches = findCrewMatches(text, context.crew);
  const alertMatches = matchingAlerts(text, context.alerts);
  const metric = findMetric(text);

  if (matchesAny(text, [/\b(open|go|take|navigate|view)\b/]) && (text.includes('selected alert') || text.includes('this alert'))) {
    if (!context.selectedAlert) return result('NO_SELECTED_ALERT', 'response');
    return result('OPEN_SELECTED_ALERT', 'action', { alert: context.selectedAlert });
  }

  if (matchesAny(text, [/\b(compare|comparison|versus|vs)\b/]) && metric) {
    if (crewMatches.length === 2) return result('COMPARE_CREW', 'response', { crewMembers: crewMatches, metric });
    if (crewMatches.length > 2) return result('AMBIGUOUS_CREW', 'response');
    return result('COMPARE_CREW', 'clarify', { question: 'Which two crew members should I compare?' });
  }

  const section = findSection(text);
  const navigationVerb = matchesAny(text, [/\b(open|go|take|navigate|switch|show|view|return|back)\b/]);
  if (section && navigationVerb) {
    if (crewMatches.length > 1) return result('AMBIGUOUS_CREW', 'response');
    return result('NAVIGATE', 'action', { section, crewMember: crewMatches[0] || null });
  }

  const selectAlertVerb = matchesAny(text, [/\b(select|choose|focus|inspect|open)\b/]) && text.includes('alert');
  if (selectAlertVerb) {
    if (alertMatches.length > 1) return result('AMBIGUOUS_ALERT', 'response');
    if (!alertMatches.length) return result('ALERT_NOT_FOUND', 'response');
    return result('INSPECT_ALERT', 'selectAlert', { alert: alertMatches[0] });
  }

  const selectCrewVerb = matchesAny(text, [/\b(select|choose|focus|monitor|make active|set active)\b/]);
  if (selectCrewVerb && crewMatches.length) {
    if (crewMatches.length > 1) return result('AMBIGUOUS_CREW', 'response');
    return result('SELECT_CREW', 'action', { crewMember: crewMatches[0] });
  }
  if (selectCrewVerb && !crewMatches.length) return result('CREW_NOT_FOUND', 'response');

  const anomalyStart = matchesAny(text, [/\b(start|run|trigger|simulate|activate)\b/]) && text.includes('anomaly');
  const anomalyResolve = matchesAny(text, [/\b(resolve|clear|stop|end|deactivate)\b/]) && text.includes('anomaly');
  if (anomalyStart) {
    if (!context.activeAstronaut) return result('NO_SELECTED_CREW', 'response');
    if (context.isAlarmActive) return result('ANOMALY_ALREADY_ACTIVE', 'response');
    return result('START_ANOMALY', 'confirm', { action: { type: 'startAnomaly', crewId: context.activeAstronaut?.id || null } });
  }
  if (anomalyResolve) {
    if (!context.isAlarmActive) return result('ANOMALY_NOT_ACTIVE', 'response');
    return result('RESOLVE_ANOMALY', 'confirm', { action: { type: 'resolveAnomaly', alertId: context.alarmAlertId || null, crewId: context.alarmAstronautId || null } });
  }

  const acknowledge = matchesAny(text, [/\b(acknowledge|acknowledgement|mark as acknowledged)\b/]);
  if (acknowledge) {
    let alert = alertMatches.length === 1 ? alertMatches[0] : null;
    if (alertMatches.length > 1) return result('AMBIGUOUS_ALERT', 'response');
    if (!alert && (text.includes('selected alert') || text.includes('this alert') || text.includes('the alert'))) alert = context.selectedAlert;
    if (!alert) return result('NO_SELECTED_ALERT', 'response');
    if (alert.acknowledged) return result('ALERT_ALREADY_ACKNOWLEDGED', 'response', { alert });
    return result('ACKNOWLEDGE_ALERT', 'confirm', { action: { type: 'acknowledgeAlert', alertId: alert.id, title: alert.title } });
  }

  const alertList = matchesAny(text, [/\b(list|show|display|what are|which are)\b/]) && text.includes('alert');
  if (alertList) {
    const severity = text.includes('critical') ? 'CRITICAL' : text.includes('caution') ? 'CAUTION' : null;
    const unresolvedOnly = !text.includes('resolved') && !text.includes('acknowledged') && !text.includes('all alerts');
    const filtered = context.alerts.filter(alert => (!severity || alert.severity === severity) && (!unresolvedOnly || !alert.resolved));
    return result('LIST_ALERTS', 'response', { alerts: filtered, severity, unresolvedOnly });
  }

  if (alertMatches.length) {
    if (alertMatches.length > 1) return result('AMBIGUOUS_ALERT', 'response');
    return result('INSPECT_ALERT', 'selectAlert', { alert: alertMatches[0] });
  }

  if (matchesAny(text, [/\b(inspect|details|tell me about|what is the status of|status of|what subsystem|which subsystem|what severity|which crew)\b/]) && (text.includes('selected alert') || text.includes('this alert') || text.includes('the alert'))) {
    if (!context.selectedAlert) return result('NO_SELECTED_ALERT', 'response');
    const field = text.includes('subsystem') ? 'subsystem' : text.includes('severity') ? 'severity' : text.includes('crew') ? 'crew' : 'details';
    return result('INSPECT_ALERT', 'response', { alert: context.selectedAlert, field });
  }
  if (matchesAny(text, [/\b(how many|count|number of)\b/]) && text.includes('acknowledged')) {
    return result('ACKNOWLEDGED_COUNT', 'response', { count: context.alerts.filter(alert => alert.acknowledged).length });
  }
  if (matchesAny(text, [/\b(how many|count|number of)\b/]) && (text.includes('unresolved') || text.includes('open alerts'))) {
    return result('UNRESOLVED_COUNT', 'response', { count: context.alerts.filter(alert => !alert.resolved).length });
  }

  const asksRoster = (matchesAny(text, [/\b(list|who are)\b/]) && text.includes('crew'))
    || /\bshow (all )?crew( members| roster)?\b/.test(text)
    || includesAny(text, ['crew roster', 'all crew', 'crew members']);
  if (asksRoster && !metric && !text.includes('selected crew')) {
    return result('LIST_CREW', 'response', { crew: context.crew });
  }

  if (matchesAny(text, [/\b(readings|vitals|measurements|telemetry)\b/])) {
    if (crewMatches.length > 1) return result('AMBIGUOUS_CREW', 'response');
    const targetCrew = crewMatches[0] || context.activeAstronaut;
    return targetCrew
      ? result('CREW_READINGS', 'response', { crewMember: targetCrew })
      : result('NO_SELECTED_CREW', 'response');
  }

  if (matchesAny(text, [/\b(who is|which crew|selected crew|current astronaut|who am i monitoring|current crew member)\b/])) {
    return context.activeAstronaut
      ? result('SELECTED_CREW', 'response', { crewMember: context.activeAstronaut })
      : result('NO_SELECTED_CREW', 'response');
  }

  if (metric) {
    const targetCrew = crewMatches.length === 1 ? crewMatches[0] : context.activeAstronaut;
    if (crewMatches.length > 1) return result('AMBIGUOUS_CREW', 'response');
    if (!targetCrew) return result('NO_SELECTED_CREW', 'response');
    return result('CREW_METRIC', 'response', { crewMember: targetCrew, metric });
  }

  if (matchesAny(text, [/\b(mission status|status of mission|how is the mission|mission doing)\b/])) {
    return result('MISSION_STATUS', 'response', { missionStatus: context.missionStatus });
  }
  if (matchesAny(text, [/\b(summarize|summary|overview|brief me|situation report)\b/])) {
    return result('MISSION_SUMMARY', 'response');
  }
  if (matchesAny(text, [/\b(how many|count|number of)\b/]) && text.includes('crew')) {
    return result('CREW_COUNT', 'response', { count: context.crew.length });
  }
  if (matchesAny(text, [/\b(current|active|open|what)\b/]) && (text.includes('section') || text.includes('page'))) {
    return result('CURRENT_SECTION', 'response', { section: context.activeTab });
  }
  if (text.includes('anomaly') && matchesAny(text, [/\b(active|running|status|on)\b/])) {
    return result('ANOMALY_STATUS', 'response', { active: context.isAlarmActive, crewMember: context.alarmAstronaut || null });
  }
  if (matchesAny(text, [/\b(selected alert|this alert|current alert)\b/])) {
    if (!context.selectedAlert) return result('NO_SELECTED_ALERT', 'response');
    const field = text.includes('subsystem') ? 'subsystem' : text.includes('severity') ? 'severity' : text.includes('crew') ? 'crew' : 'details';
    return result('INSPECT_ALERT', 'response', { alert: context.selectedAlert, field });
  }

  return result('UNSUPPORTED', 'response');
}
