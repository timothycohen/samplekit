// corresponding css vars set in app.css
// derived css var defaults set in app.html

// --open-topbar-top: 0px;
export const OPEN_TOPBAR_TOP_PX = 0;
// --closed-topbar-top: calc(var(--full-nav-height) * -1);
export const CLOSED_TOPBAR_TOP_PX = -56;
// --topbar-top: var(--open-topbar-top);
export const DEFAULT_TOPBAR_TOP_PX = OPEN_TOPBAR_TOP_PX;

// --hidden-topbar-border: transparent;
export const HIDDEN_TOPBAR_BORDER = 'transparent';
// --visible-topbar-border: hsl(var(--gray-5));
export const VISIBLE_TOPBAR_BORDER = 'hsl(var(--gray-5))';
// --topbar-border: var(--hidden-topbar-border);
export const DEFAULT_TOPBAR_BORDER = HIDDEN_TOPBAR_BORDER;

// --sidebar-width: 288px;
export const OPEN_SIDEBAR_WIDTH_PX = 288;

// --full-nav-height: 56px;
export const OPEN_NAV_HEIGHT_PX = 56;
// --nav-height: var(--full-nav-height);
export const DEFAULT_NAV_HEIGHT_PX = OPEN_NAV_HEIGHT_PX;

// --content-max-width: 1024px;
export const CONTENT_MAX_WIDTH_PX = 1024;
