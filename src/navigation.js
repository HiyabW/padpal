/** Registered from App so non-React modules can navigate without full page reloads. */
let navigateFn = null;

export function setAppNavigate(fn) {
  navigateFn = fn;
}

export function appNavigate(to, options) {
  if (navigateFn) {
    navigateFn(to, options);
    return;
  }
  window.location.assign(typeof to === 'string' ? to : String(to));
}
