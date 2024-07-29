const sidebarOpen = (() => {
  const desired = getBrowserCookie('sidebar_state')
  if (desired === 'true') return true
  if (desired === 'false') return false
  return window.matchMedia('(min-width: 1024px)').matches
})()

document.documentElement.dataset.preHydrationSidebar = sidebarOpen

let scrollY = 0;
try {
  scrollY = Object.entries(JSON.parse(sessionStorage.getItem('sveltekit:scroll'))).at(-1)[1].y
} catch {}

document.documentElement.style.setProperty('--topbar-border', `var(--${(sidebarOpen && scrollY) || scrollY ? 'visible' : 'hidden'}-topbar-border)`);
