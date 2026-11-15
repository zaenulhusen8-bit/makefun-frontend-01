import { getJSON, money, timeLeft, isOpen } from './api.js';

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function metaRow(pot, fee, deadline, entries, status) {
  return '<p class="meta"><span>Pot ' + pot + '</span><span>Fee ' + fee + '</span><span>' +
    timeLeft(deadline) + ' left</span><span>' + entries + ' entries</span><span>' + status + '</span></p>';
}

export async function renderBoard(el) {
  try {
    el.innerHTML = '<p class="muted">Loading…</p>';
    const data = await getJSON('/competitions?status=open');
    const items = data.items || [];
    if (!items.length) {
      el.innerHTML = '<p class="muted">No open bounties.</p>';
    } else {
      let html = '<h1>Bounties</h1><div class="board">';
      for (const item of items) {
        html += '<article class="card"><h3><a href="#/bounty/' + item.slug + '">' + esc(item.title) + '</a></h3>' +
          '<p class="pot">' + money(item.potUsd ?? item.rewardAmount) + '</p>' +
          '<p class="meta"><span>Fee ' + money(item.entryFeeUsd ?? 0) + '</span><span>' + timeLeft(item.deadline) +
          ' left</span><span>' + (item.submissionCount ?? 0) + ' entries</span><span>' +
          (isOpen(item) ? 'Open' : 'Closed') + '</span></p></article>';
      }
      html += '</div>';
      el.innerHTML = html;
    }
  } catch (err) {
    el.innerHTML = '<p class="muted">Could not load data.</p>';
  }
  window.__shotReady = true;
}

export async function renderBounty(el, slug) {
  try {
    el.innerHTML = '<p class="muted">Loading…</p>';
    const c = await getJSON('/competitions/' + encodeURIComponent(slug));
    const pot = money(c.potUsd ?? c.rewardAmount);
    let html = '<h1>' + esc(c.title) + '</h1><p class="subtitle">' + esc(c.sponsor || c.category || '') + '</p>';
    if (c.description) html += '<p class="description">' + esc(c.description) + '</p>';
    html += metaRow(pot, money(c.entryFeeUsd ?? 0), c.deadline, (c.submissionCount ?? 0) + ' entries',
      (isOpen(c) ? 'Open' : 'Closed'));
    const rewards = c.rewardsNow || c.rewards;
    if (Array.isArray(rewards) && rewards.length) {
      html += '<table class="rewards"><thead><tr><th>Place</th><th>Reward</th></tr></thead><tbody>';
      for (const r of rewards) {
        html += '<tr><td>' + esc(r.place ?? r.label ?? '') + '</td><td>' + money(r.amount) + '</td></tr>';
      }
      html += '<tr><td>Live pot</td><td>' + pot + '</td></tr></tbody></table>';
    }
    if (Array.isArray(c.rules) && c.rules.length) {
      html += '<h2>Rules</h2><ul>';
      for (const rule of c.rules) html += '<li>' + esc(rule) + '</li>';
      html += '</ul>';
    } else if (typeof c.rules === 'string' && c.rules) {
      html += '<h2>Rules</h2><p>' + esc(c.rules) + '</p>';
    }
    html += '<p><a href="#/bounty/' + slug + '/leaderboard">Leaderboard</a> · <a href="#/">All bounties</a></p>';
    el.innerHTML = html;
  } catch (err) {
    el.innerHTML = '<p class="muted">Could not load data.</p>';
  }
  window.__shotReady = true;
}

export async function renderLeaderboard(el, slug) {
  try {
    el.innerHTML = '<h1>Leaderboard</h1><p class="muted">Coming soon.</p>';
  } catch (err) {
    el.innerHTML = '<p class="muted">Could not load data.</p>';
  }
  window.__shotReady = true;
}

export async function renderProfile(el, handle) {
  try {
    el.innerHTML = '<h1>' + esc(handle) + '</h1><p class="muted">Coming soon.</p>';
  } catch (err) {
    el.innerHTML = '<p class="muted">Could not load data.</p>';
  }
  window.__shotReady = true;
}
