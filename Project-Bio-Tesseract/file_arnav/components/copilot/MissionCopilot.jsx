'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COMMAND_REGISTRY, METRICS, SECTION_LABELS, recognizeCommand } from '../../lib/copilot/commands';

const STARTER_MESSAGE = {
  id: 'copilot-welcome',
  role: 'assistant',
  text: 'I can inspect this simulation, retrieve supported crew readings, navigate the dashboard, and request confirmation before existing operations. I use local rules and current application state; I am not a generative AI or a medical system.',
};

const getAlertDestination = (subsystem) => {
  if (['Cardio-Bio', 'Bio-Core'].includes(subsystem)) return 'biomonitor';
  if (subsystem === 'PLSS') return 'lifesupport';
  return 'crew';
};

const displayMetric = (member, metric) => {
  if (metric.id === 'bloodPressure') {
    if (!Number.isFinite(member.bpSys) || !Number.isFinite(member.bpDia)) return 'unavailable';
    return `${member.bpSys}/${member.bpDia} mmHg`;
  }
  const value = member[metric.id];
  if (!Number.isFinite(value)) return 'unavailable';
  return `${Number(value).toFixed(metric.digits).replace(/\.0$/, '')} ${metric.unit}`;
};

const makeMessage = (role, text) => ({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, role, text });

function formatAlert(alert, crew) {
  const state = alert.resolved ? 'resolved' : 'active';
  const acknowledgement = alert.acknowledged ? 'acknowledged' : 'awaiting acknowledgement';
  const associatedCrew = alert.crewId ? crew.find(member => member.id === alert.crewId) : null;
  return `${alert.title || 'Untitled event'} · ${alert.severity || 'unknown severity'} · ${alert.subsystem || 'subsystem unspecified'} · ${state}, ${acknowledgement}${associatedCrew ? ` · associated crew: ${associatedCrew.name} (simulated anomaly record)` : ' · no crew association recorded'}`;
}

function getResponse(command, context) {
  switch (command.intent) {
    case 'MISSION_STATUS':
      return `Mission status is ${context.missionStatus}. This is the current derived status of the local demonstration.`;
    case 'MISSION_SUMMARY': {
      const open = context.alerts.filter(alert => !alert.resolved && ['CRITICAL', 'CAUTION'].includes(alert.severity));
      const critical = open.filter(alert => alert.severity === 'CRITICAL').length;
      const caution = open.filter(alert => alert.severity === 'CAUTION').length;
      return `Mission state: ${context.missionStatus}. Crew on manifest: ${context.crew.length}. Open caution or critical events: ${open.length} (${critical} critical, ${caution} caution). Selected crew: ${context.activeAstronaut?.name || 'none'}. Selected event: ${context.selectedAlert?.title || 'none'}. Simulated anomaly: ${context.isAlarmActive ? 'active' : 'inactive'}.`;
    }
    case 'CREW_COUNT':
      return `${command.count} crew ${command.count === 1 ? 'member is' : 'members are'} in the current roster.`;
    case 'CURRENT_SECTION':
      return `The current section is ${SECTION_LABELS[command.section] || 'unknown'}.`;
    case 'ANOMALY_STATUS':
      return command.active
        ? `The simulated anomaly is active for ${command.crewMember?.name || 'a crew member'}. It does not represent a real spacecraft event.`
        : 'No simulated anomaly is active.';
    case 'LIST_CREW':
      return command.crew.length
        ? `Current crew roster:\n${command.crew.map(member => `• ${member.name} — ${member.role}; ${member.status || 'unknown status'}`).join('\n')}`
        : 'No crew records are available.';
    case 'SELECTED_CREW':
      return `Selected crew member: ${command.crewMember.name} (${command.crewMember.id}), ${command.crewMember.role}. Status: ${command.crewMember.status || 'unknown'}. Readings are simulated.`;
    case 'CREW_READINGS':
      return `${command.crewMember.name} · simulated readings\nHeart rate: ${displayMetric(command.crewMember, METRICS[0])}\nBlood SpO₂: ${displayMetric(command.crewMember, METRICS[1])}\nBlood pressure: ${displayMetric(command.crewMember, METRICS[2])}\nRespiration: ${displayMetric(command.crewMember, METRICS[3])}\nStress input: ${displayMetric(command.crewMember, METRICS[4])}\nSuit pressure: ${displayMetric(command.crewMember, METRICS[5])}\nSuit oxygen reserve: ${displayMetric(command.crewMember, METRICS[6])}.`;
    case 'CREW_METRIC':
      return `${command.crewMember.name}'s current simulated ${command.metric.label} is ${displayMetric(command.crewMember, command.metric)}.`;
    case 'COMPARE_CREW': {
      const [first, second] = command.crewMembers;
      return `Current simulated ${command.metric.label}: ${first.name}, ${displayMetric(first, command.metric)}; ${second.name}, ${displayMetric(second, command.metric)}. This is a comparison of current demo inputs, not a clinical assessment.`;
    }
    case 'LIST_ALERTS':
      return command.alerts.length
        ? `${command.severity ? `${command.severity.toLowerCase()} ` : ''}${command.unresolvedOnly ? 'unresolved ' : ''}events (${command.alerts.length}):\n${command.alerts.map(alert => `• ${formatAlert(alert, context.crew)}`).join('\n')}`
        : `There are no ${command.severity ? `${command.severity.toLowerCase()} ` : ''}${command.unresolvedOnly ? 'unresolved ' : ''}events in the current alert collection.`;
    case 'ACKNOWLEDGED_COUNT':
      return `${command.count} of ${context.alerts.length} recorded events are acknowledged. Acknowledgement and resolution are separate.`;
    case 'UNRESOLVED_COUNT':
      return `${command.count} recorded events remain unresolved.`;
    case 'INSPECT_ALERT': {
      const alert = command.alert;
      const associatedCrew = alert.crewId ? context.crew.find(member => member.id === alert.crewId) : null;
      if (command.field === 'subsystem') return `The selected event concerns ${alert.subsystem || 'an unspecified subsystem'}.`;
      if (command.field === 'severity') return `The selected event severity is ${alert.severity || 'unknown'}. It is ${alert.resolved ? 'resolved' : 'active'} and ${alert.acknowledged ? 'acknowledged' : 'not acknowledged'}.`;
      if (command.field === 'crew') return associatedCrew ? `Crew association recorded: ${associatedCrew.name} on this simulated anomaly.` : 'No crew association is recorded for the selected event.';
      return `Selected event: ${formatAlert(alert, context.crew)}. Event ID: ${alert.id}.`;
    }
    case 'ALERT_ALREADY_ACKNOWLEDGED':
      return `${command.alert.title} is already acknowledged. Its resolution state is unchanged.`;
    case 'ANOMALY_ALREADY_ACTIVE':
      return 'The simulated anomaly is already active. Resolve the current simulation before starting another.';
    case 'ANOMALY_NOT_ACTIVE':
      return 'There is no active simulated anomaly to resolve.';
    case 'NO_SELECTED_CREW':
      return 'No crew member is selected. Select a crew member in the dashboard, or name one in your request.';
    case 'NO_SELECTED_ALERT':
      return 'No alert is selected. Select an event in Mission Overview or Crew & Alerts, or name its title or ID.';
    case 'CREW_NOT_FOUND':
      return 'I could not match that name to a crew member in the current roster. You can use a crew member’s name or ID.';
    case 'AMBIGUOUS_CREW':
      return 'That crew reference matches more than one person. Please use a full name or crew ID.';
    case 'AMBIGUOUS_ALERT':
      return 'That alert reference matches more than one event. Please use its full title or alert ID.';
    case 'ALERT_NOT_FOUND':
      return 'I could not find that alert in the current alert collection. Use an existing alert title or ID.';
    case 'UNAVAILABLE_HISTORY':
      return 'Historical readings and trend records are not available in this simulation. I can report current supported values.';
    case 'UNSUPPORTED':
      return 'I can retrieve mission status, current crew readings and alerts, navigate dashboard sections, and request confirmation for existing simulation operations. That request is outside my local command set.';
    default:
      return command.question || 'I could not complete that request.';
  }
}

export default function MissionCopilot({
  isOpen,
  onClose,
  crew = [],
  activeAstronaut,
  activeTab,
  alerts = [],
  selectedAlert,
  missionStatus,
  isAlarmActive,
  alarmAstronautId,
  alarmAlertId,
  onSelectAstronaut,
  onSelectAlert,
  onNavigate,
  onAcknowledge,
  onToggleAlarm,
}) {
  const [messages, setMessages] = useState([STARTER_MESSAGE]);
  const [input, setInput] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [pendingVerification, setPendingVerification] = useState(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const operationLock = useRef(false);

  const context = useMemo(() => ({
    crew,
    activeAstronaut,
    activeTab,
    alerts,
    selectedAlert,
    missionStatus,
    isAlarmActive,
    alarmAstronautId,
    alarmAlertId,
    alarmAstronaut: crew.find(member => member.id === alarmAstronautId) || null,
  }), [crew, activeAstronaut, activeTab, alerts, selectedAlert, missionStatus, isAlarmActive, alarmAlertId, alarmAstronautId]);

  const suggestions = useMemo(() => {
    const prompts = [
      'Show mission status',
      context.activeAstronaut ? 'Show this crew member’s readings' : 'List crew members',
      context.selectedAlert ? 'Inspect this alert' : 'List unresolved alerts',
      'Open Bio-Monitor',
      'Open Life Support',
    ];
    return [...new Set(prompts)];
  }, [context.activeAstronaut, context.selectedAlert]);

  useEffect(() => {
    if (!isOpen) return undefined;
    inputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, pendingConfirmation, pendingVerification]);

  useEffect(() => {
    if (!pendingVerification) return;
    const frame = window.requestAnimationFrame(() => {
      let verified = false;
      let response = '';
      if (pendingVerification.type === 'acknowledgeAlert') {
        const alert = alerts.find(item => item.id === pendingVerification.alertId);
        verified = Boolean(alert?.acknowledged);
        response = verified
          ? `Acknowledged: ${alert.title}. The event remains ${alert.resolved ? 'resolved' : 'active'}; acknowledgement did not change resolution.`
          : 'The alert no longer exists or was not acknowledged, so no success was recorded.';
      } else if (pendingVerification.type === 'startAnomaly') {
        verified = isAlarmActive && alarmAstronautId === pendingVerification.crewId;
        response = verified
          ? `The simulated anomaly is active for ${crew.find(member => member.id === alarmAstronautId)?.name || 'the selected crew member'}. The associated event is available in the shared alert log.`
          : 'The simulated anomaly did not start for the requested crew member.';
      } else if (pendingVerification.type === 'resolveAnomaly') {
        const alert = alerts.find(item => item.id === pendingVerification.alertId);
        verified = !isAlarmActive && Boolean(alert?.resolved);
        response = verified
          ? `The simulated anomaly was resolved. Its alert remains recorded as ${alert.acknowledged ? 'acknowledged' : 'unacknowledged'} and resolved.`
          : 'The simulated anomaly could not be resolved because its target changed or disappeared.';
      }
      if (response) {
        setMessages(prev => [...prev, makeMessage('assistant', response)]);
        setPendingVerification(null);
        operationLock.current = false;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pendingVerification, alerts, isAlarmActive, alarmAstronautId, crew]);

  const appendResponse = (text) => setMessages(prev => [...prev, makeMessage('assistant', text)]);

  const processInput = (rawInput) => {
    const value = rawInput.trim();
    if (!value || pendingConfirmation || pendingVerification) return;
    setMessages(prev => [...prev, makeMessage('user', value)]);
    setInput('');
    const command = recognizeCommand(value, context);

    if (command.kind === 'empty') return appendResponse('Enter a command or choose one of the suggested prompts.');
    if (command.kind === 'confirm') {
      setPendingConfirmation(command.action);
      const target = command.action.type === 'acknowledgeAlert'
        ? alerts.find(alert => alert.id === command.action.alertId)
        : command.action.type === 'startAnomaly'
          ? crew.find(member => member.id === command.action.crewId)
          : alerts.find(alert => alert.id === command.action.alertId);
      const confirmationText = command.action.type === 'acknowledgeAlert'
        ? `You are about to acknowledge “${target?.title || command.action.title}” (${target?.severity || 'unknown severity'}). This records operator receipt but will not resolve the event. Proceed?`
        : command.action.type === 'startAnomaly'
          ? `You are about to start the existing simulated anomaly for ${target?.name || 'the selected crew member'}. It will alter demonstration readings and add one simulated critical alert. No hardware is contacted. Proceed?`
          : `You are about to resolve the active simulated anomaly for ${context.alarmAstronaut?.name || 'the affected crew member'}. This restores its demo readings and resolves its associated event. Proceed?`;
      return appendResponse(confirmationText);
    }

    if (command.kind === 'clarify') return appendResponse(command.question);
    if (command.kind === 'selectAlert') {
      onSelectAlert?.(command.alert.id);
      return appendResponse(`Selected ${command.alert.title}. ${formatAlert(command.alert, crew)}.`);
    }
    if (command.kind === 'action') {
      if (command.intent === 'SELECT_CREW') {
        onSelectAstronaut?.(command.crewMember.id);
        return appendResponse(`${command.crewMember.name} is now selected across the dashboard.`);
      }
      if (command.intent === 'NAVIGATE') {
        if (command.crewMember) onSelectAstronaut?.(command.crewMember.id);
        onNavigate?.(command.section);
        return appendResponse(`Opened ${SECTION_LABELS[command.section]}.${command.crewMember ? ` ${command.crewMember.name} remains selected.` : ''}`);
      }
      if (command.intent === 'OPEN_SELECTED_ALERT') {
        onSelectAlert?.(command.alert.id);
        const destination = getAlertDestination(command.alert.subsystem);
        onNavigate?.(destination);
        return appendResponse(`Opened ${SECTION_LABELS[destination]} for ${command.alert.title}. The selected alert remains available in the shared context.`);
      }
    }
    appendResponse(getResponse(command, context));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    processInput(input);
  };

  const confirmOperation = () => {
    if (!pendingConfirmation || operationLock.current) return;
    operationLock.current = true;
    const action = pendingConfirmation;
    setPendingConfirmation(null);

    if (action.type === 'acknowledgeAlert') {
      const current = alerts.find(alert => alert.id === action.alertId);
      if (!current) {
        operationLock.current = false;
        return appendResponse('The requested alert is no longer available. No change was made.');
      }
      if (current.acknowledged) {
        operationLock.current = false;
        return appendResponse(`${current.title} is already acknowledged. No further change was made.`);
      }
      onAcknowledge?.(action.alertId);
      setPendingVerification(action);
      return;
    }

    if (action.type === 'startAnomaly') {
      if (isAlarmActive || !crew.some(member => member.id === action.crewId)) {
        operationLock.current = false;
        return appendResponse('The simulation target changed or is unavailable. No anomaly was started.');
      }
      onSelectAstronaut?.(action.crewId);
      onToggleAlarm?.(action.crewId);
      setPendingVerification(action);
      return;
    }

    if (action.type === 'resolveAnomaly') {
      const current = alerts.find(alert => alert.id === action.alertId);
      if (!isAlarmActive || alarmAlertId !== action.alertId || alarmAstronautId !== action.crewId || !current || current.resolved) {
        operationLock.current = false;
        return appendResponse('The active anomaly changed or is unavailable. No resolution was performed.');
      }
      onToggleAlarm?.();
      setPendingVerification(action);
    }
  };

  const cancelOperation = () => {
    if (pendingVerification) return;
    const description = pendingConfirmation?.type === 'acknowledgeAlert'
      ? 'alert acknowledgement'
      : pendingConfirmation?.type === 'resolveAnomaly'
        ? 'anomaly resolution'
        : 'anomaly start';
    setPendingConfirmation(null);
    appendResponse(`Cancelled ${description}. No change was made.`);
  };

  const resetConversation = () => {
    if (pendingVerification) return;
    setPendingConfirmation(null);
    operationLock.current = false;
    setMessages([STARTER_MESSAGE]);
    setInput('');
  };

  return (
    <>
      <button type="button" className={`copilot-backdrop${isOpen ? ' is-open' : ''}`} aria-label="Close Mission Copilot" onClick={onClose} tabIndex={isOpen ? 0 : -1} aria-hidden={!isOpen} />
      <aside id="mission-copilot-panel" className={`mission-copilot${isOpen ? ' is-open' : ''}`} hidden={!isOpen} aria-label="Local rule-based Mission Copilot" aria-describedby="mission-copilot-registry-note">
        <header className="mission-copilot__header">
          <span className="mission-copilot__mark" aria-hidden="true">⌘</span>
          <div className="mission-copilot__heading"><p>MISSION COPILOT</p><span>LOCAL RULE-BASED HELPER</span></div>
          <button type="button" className="mission-copilot__reset" onClick={resetConversation} disabled={Boolean(pendingVerification)} aria-label="Reset conversation" title="Reset conversation">↺</button>
          <button type="button" className="mission-copilot__close" onClick={onClose} aria-label="Close Mission Copilot">×</button>
        </header>

        <section className="mission-copilot__context" aria-label="Current mission context">
          <span><small>SECTION</small><strong>{SECTION_LABELS[activeTab] || 'Dashboard'}</strong></span>
          <span><small>CREW</small><strong>{activeAstronaut?.name || 'None selected'}</strong></span>
          <span><small>EVENT</small><strong>{selectedAlert?.id || 'None selected'}</strong></span>
        </section>

        <div className="mission-copilot__messages" ref={messagesRef} role="log" aria-label="Mission Copilot conversation" aria-live="polite" aria-relevant="additions">
          {messages.map(message => (
            <article className={`copilot-message copilot-message--${message.role}`} key={message.id}>
              <span className="copilot-message__speaker">{message.role === 'user' ? 'YOU' : 'COPILOT · LOCAL RULES'}</span>
              <p>{message.text}</p>
            </article>
          ))}
          {pendingVerification && <p className="copilot-processing" role="status"><i aria-hidden="true" />Checking the updated application state…</p>}
          {pendingConfirmation && (
            <section className="copilot-confirmation" aria-label="Confirm operation">
              <div><span aria-hidden="true">!</span><strong>Confirmation required</strong></div>
              <p>Review the request above. The operation will use the recorded target and recheck it before execution.</p>
              <div className="copilot-confirmation__actions">
                <button type="button" onClick={confirmOperation}>Confirm</button>
                <button type="button" className="is-cancel" onClick={cancelOperation}>Cancel</button>
              </div>
            </section>
          )}
        </div>

        <div className="mission-copilot__suggestions" aria-label="Suggested commands">
          <span>TRY</span>
          {suggestions.map(suggestion => <button type="button" key={suggestion} disabled={Boolean(pendingConfirmation || pendingVerification)} onClick={() => processInput(suggestion)}>{suggestion}</button>)}
        </div>

        <form className="mission-copilot__composer" onSubmit={handleSubmit}>
          <label className="dashboard-visually-hidden" htmlFor="mission-copilot-input">Enter a mission command</label>
          <textarea
            id="mission-copilot-input"
            ref={inputRef}
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSubmit(event); } }}
            placeholder="Ask about crew, alerts, or operations…"
            rows={2}
            disabled={Boolean(pendingConfirmation || pendingVerification)}
          />
          <button type="submit" aria-label="Send command" disabled={!input.trim() || Boolean(pendingConfirmation || pendingVerification)}>Send <span aria-hidden="true">↑</span></button>
          <small>Enter to send · Shift + Enter for a new line</small>
        </form>
        <p className="mission-copilot__disclosure">Local rules only · no external AI, services, sensors, or spacecraft controls</p>
        <span id="mission-copilot-registry-note" className="dashboard-visually-hidden">The local command registry contains {COMMAND_REGISTRY.length} bounded command families.</span>
      </aside>
    </>
  );
}
