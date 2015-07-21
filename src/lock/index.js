import Immutable, { Map } from 'immutable';
import { LockStates, LockModes } from '../control/constants';

export function setup(attrs) {
  const { clientID, lockID, domain, options } = attrs;

  return Immutable.fromJS({
    clientID: clientID,
    domain: domain,
    id: lockID,
    options: options,
    show: false,
    mode: LockModes.LOADING,
    state: LockStates.WAITING_CLIENT_CONFIG,

    submitting: false,
    email: '',
    validEmail: false,
    validateEmail: false,
    credentials: {
      phoneNumber: {countryCode: "+1", number: "", valid: false, validate: false}
    }
  });
}

export function prepareShowOptions(options) {
  const responseType = options.responseType || options.callbackURL ? "code" : "token";

  return new Map({
    container: options.container || false,
    icon: options.icon || false,
    closable: undefined === options.closable ? !options.container : !!options.closable,
    focusInput: undefined === options.focusInput ? !options.container : !!options.focusInput,
    gravatar: undefined === options.gravatar ? true : !!options.gravatar,
    signInCallback: options.signInCallback,
    responseType: responseType,
    callbackURL: options.callbackURL || null,
    callbackOnLocationHash: responseType === "token" || null,
  });
}

export function changeEmail(lock, email, valid) {
  return lock.merge(Map({email: email, validEmail: valid}));
}

export function hasClient(lock, clientID) {
  return lock.get("clientID") === clientID;
}

export function hasCrashed(lock) {
  return lock.get("state") === LockStates.CRASHED;
}

function isLoading(lock) {
  return lock.get("mode") === LockModes.LOADING;
}

export function markCrashed(lock) {
  return lock.set("mode", LockModes.CRASHED);
}

export function markReady(lock) {
  return lock.set("state", LockStates.READY);
}

export function show(lock, options) {
  const { mode } = options;
  const send = options.send || "link";

  if (!lock.get("showOptions")) {
    lock = lock.set("showOptions", prepareShowOptions(options));
  }

  if (lock.get("mode") === LockModes.LOADING) {
    if (lock.get("state") === LockStates.READY) {
      return lock.merge(Map({show: true, mode: mode, send: send}));
    } else {
      return lock.merge(Map({show: true, loading: mode, send: send}));
    }
  } else if (lock.get("mode") === LockModes.CRASHED || lock.get("mode") === mode) {
    return lock.set("show", true);
  } else {
    throw new Error("can't show the lock in a different mode");
  }
}

export function hide(lock) {
  return lock.set("show", false);
}