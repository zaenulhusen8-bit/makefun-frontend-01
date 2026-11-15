import { renderBoard, renderBounty, renderLeaderboard, renderProfile } from './views.js';

function route() {
  window.__shotReady = false;
  const el = document.getElementById('app');
  const hash = location.hash.replace(/^#/, '');
  if (hash === '' || hash === '/') {
    renderBoard(el);
    return;
  }
  const parts = hash.split('/').filter(Boolean);
  if (parts[0] === 'bounty' && parts.length === 2) {
    renderBounty(el, parts[1]);
    return;
  }
  if (parts[0] === 'bounty' && parts.length === 3 && parts[2] === 'leaderboard') {
    renderLeaderboard(el, parts[1]);
    return;
  }
  if (parts[0] === 'account' && parts.length === 2) {
    renderProfile(el, decodeURIComponent(parts[1]));
    return;
  }
  el.innerHTML = '<h1>Not found</h1><p class="muted">Unknown route.</p>';
  window.__shotReady = true;
}

window.addEventListener('hashchange', route);
route();
