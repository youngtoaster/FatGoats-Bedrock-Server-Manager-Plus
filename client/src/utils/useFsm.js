import { useState, useCallback, useRef } from 'react';

/**
 * useFsm: Declarative Finite State Machine Hook for React
 * Eliminates boolean explosion (loading, isSubmitting, isDeleting, hasError, etc.)
 * Provides single-source-of-truth state, transition guards, and telemetry.
 *
 * @param {Object} config
 * @param {string} config.initial - Initial state identifier
 * @param {Object} config.states - State definition map { [state]: { on: { [event]: targetState }, allowedActions?: string[] } }
 * @param {Object} [config.context={}] - Initial context payload
 */
export function useFsm(config) {
  const [state, setState] = useState(config.initial);
  const [context, setContext] = useState(config.context || {});
  const [lastError, setLastError] = useState(null);
  const historyRef = useRef([{ state: config.initial, timestamp: Date.now() }]);

  const currentStateDef = config.states[state] || {};

  /**
   * Check if the current state matches one or more candidate states
   * @param {string|string[]} candidates
   * @returns {boolean}
   */
  const matches = useCallback(
    (candidates) => {
      if (Array.isArray(candidates)) {
        return candidates.includes(state);
      }
      return state === candidates;
    },
    [state]
  );

  /**
   * Check if an event can transition out of current state
   * @param {string} event
   * @returns {boolean}
   */
  const can = useCallback(
    (event) => {
      const transitions = currentStateDef.on || {};
      return Boolean(transitions[event]);
    },
    [currentStateDef]
  );

  /**
   * Check if an action is allowed in current state
   * @param {string} action
   * @returns {boolean}
   */
  const allows = useCallback(
    (action) => {
      const actions = currentStateDef.allowedActions;
      if (!actions) return true; // If undefined, all actions permitted
      return actions.includes(action);
    },
    [currentStateDef]
  );

  /**
   * Transition to the next state according to the state definition
   * @param {string} event
   * @param {Object} [newContext]
   */
  const send = useCallback(
    (event, newContext = null) => {
      const transitions = currentStateDef.on || {};
      const targetState = transitions[event];

      if (!targetState) {
        console.warn(`[useFsm] Invalid transition "${event}" from state "${state}". Ignored.`);
        return false;
      }

      setState(targetState);
      if (newContext !== null) {
        setContext((prev) => ({ ...prev, ...newContext }));
      }
      if (event === 'ERROR' && newContext?.error) {
        setLastError(newContext.error);
      } else if (event === 'SUCCESS' || event === 'RESET') {
        setLastError(null);
      }

      historyRef.current.push({
        from: state,
        to: targetState,
        event,
        timestamp: Date.now(),
      });

      return true;
    },
    [currentStateDef, state]
  );

  /**
   * Safe async execution wrapper: sends START -> awaits task -> sends SUCCESS or ERROR
   */
  const runAction = useCallback(
    async (startEvent, asyncFn, options = {}) => {
      if (!can(startEvent)) {
        console.warn(`[useFsm] Cannot trigger "${startEvent}" while in "${state}".`);
        return null;
      }

      send(startEvent, options.startContext);
      try {
        const result = await asyncFn();
        send('SUCCESS', { ...(options.successContext || {}), result });
        return result;
      } catch (err) {
        send('ERROR', { error: err.message || 'Action failed' });
        throw err;
      }
    },
    [can, send, state]
  );

  return {
    state,
    context,
    lastError,
    matches,
    can,
    allows,
    send,
    runAction,
    allowedActions: currentStateDef.allowedActions || [],
    history: historyRef.current,
  };
}
