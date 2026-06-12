/** Shared route paths for App shell and navigation. */
export const ROUTES = {
  SIGN_IN: "/",
  SURVEY: "/survey",
  FEED: "/feed",
  ROOMS: "/rooms",
  CHAT: "/chat",
  VIEW_PROFILE: "/viewProfile",
  EDIT_PROFILE: "/editProfile",
};

export const AUTH_ROUTES = [ROUTES.SIGN_IN, ROUTES.SURVEY];

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
