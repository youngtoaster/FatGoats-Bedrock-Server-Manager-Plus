/**
 * Finite State Machine (FSM) Engine for Bedrock Server Manager Plus
 * Provides explicit, deterministic state transitions, validation guards,
 * and machine-readable state telemetry for Users (UX), Developers (DX), and AI Agents (AX).
 */

class FsmError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'FsmError';
    this.code = code;
    this.details = details;
  }
}

class FiniteStateMachine {
  /**
   * @param {Object} config
   * @param {string} config.id - Identifier for the machine
   * @param {string} config.initial - Initial state
   * @param {Object} config.context - Initial context payload
   * @param {Object} config.states - State definitions with transitions and allowed actions
   *   e.g. {
   *     STOPPED: { on: { START: 'STARTING', LOCK: 'LOCKED' }, allowedActions: ['START', 'LOCK'] },
   *     STARTING: { on: { STARTED: 'RUNNING', ERROR: 'STOPPED', CRASH: 'CRASHED' }, allowedActions: ['KILL'] },
   *     ...
   *   }
   * @param {Object} [config.guards] - Condition functions (context, payload) => boolean
   */
  constructor(config) {
    if (!config || !config.initial || !config.states) {
      throw new FsmError('INVALID_CONFIG', 'FSM requires initial state and states definition.');
    }

    this.id = config.id || 'fsm';
    this.current = config.initial;
    this.context = { ...(config.context || {}) };
    this.states = config.states;
    this.guards = config.guards || {};
    this.history = [{ state: this.current, timestamp: Date.now(), event: 'INIT' }];
    this.listeners = new Set();
  }

  /**
   * Get current state identifier
   * @returns {string}
   */
  getState() {
    return this.current;
  }

  /**
   * Get current context
   * @returns {Object}
   */
  getContext() {
    return { ...this.context };
  }

  /**
   * Check whether a given event can be processed in the current state
   * @param {string} event
   * @param {Object} [payload]
   * @returns {boolean}
   */
  can(event, payload = {}) {
    const stateDef = this.states[this.current];
    if (!stateDef || !stateDef.on) return false;

    const transition = stateDef.on[event];
    if (!transition) return false;

    // Transition can be a string target state or an object with target & guard
    if (typeof transition === 'object' && transition.guard) {
      const guardFn = typeof transition.guard === 'function' ? transition.guard : this.guards[transition.guard];
      if (guardFn && !guardFn(this.context, payload)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Return a list of all permissible actions/events from the current state
   * @returns {string[]}
   */
  getAllowedActions() {
    const stateDef = this.states[this.current];
    if (!stateDef) return [];
    if (Array.isArray(stateDef.allowedActions)) {
      return stateDef.allowedActions.filter((action) => this.can(action));
    }
    if (stateDef.on) {
      return Object.keys(stateDef.on).filter((event) => this.can(event));
    }
    return [];
  }

  /**
   * Trigger a state transition via an event
   * @param {string} event
   * @param {Object} [payload]
   * @returns {Object} Transition result
   */
  transition(event, payload = {}) {
    const stateDef = this.states[this.current];
    if (!stateDef) {
      throw new FsmError(
        'UNKNOWN_STATE',
        `Current state "${this.current}" is not defined in FSM "${this.id}".`,
        { currentState: this.current }
      );
    }

    const targetDef = stateDef.on ? stateDef.on[event] : null;

    if (!targetDef) {
      const allowed = this.getAllowedActions();
      throw new FsmError(
        'INVALID_TRANSITION',
        `Cannot execute "${event}" while in state "${this.current}". Allowed actions: [${allowed.join(', ')}]`,
        {
          currentState: this.current,
          attemptedEvent: event,
          allowedActions: allowed,
        }
      );
    }

    let nextState = typeof targetDef === 'string' ? targetDef : targetDef.target;
    let guardName = typeof targetDef === 'object' ? targetDef.guard : null;

    if (guardName) {
      const guardFn = typeof guardName === 'function' ? guardName : this.guards[guardName];
      if (guardFn && !guardFn(this.context, payload)) {
        throw new FsmError(
          'GUARD_REJECTED',
          `Transition "${event}" was rejected by guard condition.`,
          { currentState: this.current, attemptedEvent: event }
        );
      }
    }

    if (!this.states[nextState]) {
      throw new FsmError(
        'INVALID_TARGET_STATE',
        `Target state "${nextState}" is not defined in FSM "${this.id}".`,
        { targetState: nextState }
      );
    }

    const prevState = this.current;
    this.current = nextState;

    // Merge payload into context if specified
    if (payload && typeof payload === 'object') {
      this.context = { ...this.context, ...payload };
    }

    // Record transition history (capped at 25 entries)
    const historyEntry = {
      from: prevState,
      to: nextState,
      event,
      timestamp: Date.now(),
    };
    this.history.unshift(historyEntry);
    if (this.history.length > 25) {
      this.history.pop();
    }

    // Call state exit/enter handlers if provided
    if (stateDef.onExit) {
      try { stateDef.onExit(this.context, payload); } catch (_) {}
    }
    const nextStateDef = this.states[nextState];
    if (nextStateDef && nextStateDef.onEnter) {
      try { nextStateDef.onEnter(this.context, payload); } catch (_) {}
    }

    // Notify subscribers
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      try { listener(snapshot, historyEntry); } catch (_) {}
    }

    return {
      success: true,
      previousState: prevState,
      currentState: nextState,
      event,
      context: this.getContext(),
      allowedActions: this.getAllowedActions(),
    };
  }

  /**
   * Subscribe to transition changes
   * @param {Function} listener
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
    return () => {};
  }

  /**
   * Return a complete, serializable snapshot for API and agent inspection
   * @returns {Object}
   */
  getSnapshot() {
    return {
      id: this.id,
      state: this.current,
      allowedActions: this.getAllowedActions(),
      context: this.getContext(),
      history: [...this.history],
      timestamp: Date.now(),
    };
  }
}

module.exports = FiniteStateMachine;
module.exports.FiniteStateMachine = FiniteStateMachine;
module.exports.FsmError = FsmError;
