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
    timeLeft(deadline) + '</span><span>' + entries + ' entries</span><span>' + status + '</span></p>';
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
          '</span><span>' + (item.submissionCount ?? 0) + ' entries</span><span>' +
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
    let html = '<h1>' + esc(c.title) + '</h1><p class="subtitle">' + esc((c.sponsor && c.sponsor.name) || c.category || '') + '</p>';
    html += metaRow(pot, money(c.entryFeeUsd ?? 0), c.deadline, (c.submissionCount ?? 0),
      (isOpen(c) ? 'Open' : 'Closed'));
    const rewards = c.rewardsNow || c.rewards;
    if (Array.isArray(rewards) && rewards.length) {
      html += '<table class="rewards"><thead><tr><th>Place</th><th>Reward</th></tr></thead><tbody>';
      for (const r of rewards) {
        html += '<tr><td>' + esc(r.place ?? r.label ?? '') + '</td><td>' + money(r.amountUsd ?? r.amount) + '</td></tr>';
      }
      html += '<tr><td>Live pot</td><td>' + pot + '</td></tr></tbody></table>';
    }
    if (c.description) html += '<p class="description">' + esc(c.description) + '</p>';
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
    el.innerHTML = '<p class="muted">Loading…</p>';
    const d = await getJSON('/competitions/' + encodeURIComponent(slug) + '/leaderboard');
    let html = '<h1>' + esc(d.competition.title) + ' — Leaderboard</h1><p class="subtitle">' + esc(d.phase.title || '') + '</p>';
    const entries = d.entries || [];
    if (!entries.length) {
      html += '<p class="muted">No entries yet.</p>';
    } else {
      html += '<table class="leaderboard"><thead><tr><th>Rank</th><th>Entry</th>';
      for (const col of d.columns || []) html += '<th>' + esc(col.title) + '</th>';
      html += '</tr></thead><tbody>';
      for (const entry of entries) {
        html += '<tr><td class="rank">' + entry.rank + '</td><td>' + esc(entry.title || '') + ' by <a href="#/account/' +
          encodeURIComponent(entry.handle) + '">' + esc(entry.handle) + '</a></td>';
        for (const col of d.columns || []) {
          const v = (entry.display && entry.display[col.key]) ?? (entry.values && entry.values[col.key]) ?? '—';
          html += '<td>' + esc(v) + '</td>';
        }
        html += '</tr>';
      }
      html += '</tbody></table>';
    }
    html += '<p><a href="#/bounty/' + slug + '">Back to bounty</a></p>';
    el.innerHTML = html;
  } catch (err) {
    el.innerHTML = '<p class="muted">Could not load data.</p>';
  }
  window.__shotReady = true;
}

export async function renderProfile(el, handle) {
  try {
    el.innerHTML = '<p class="muted">Loading…</p>';
    const p = await getJSON('/profiles/' + encodeURIComponent(handle));
    let html = '';
    if (p.avatar && p.avatar.url && p.avatar.url.startsWith('/')) {
      html += '<img src="https://make.fun' + p.avatar.url + '" crossorigin="anonymous" alt="" style="width:96px;height:96px;border-radius:50%">';
    }
    html += '<h1>' + esc(p.display_name || p.handle) + '</h1><p class="subtitle">@' + esc(p.handle) + '</p>';
    if (p.bio) html += '<p class="description">' + esc(p.bio) + '</p>';
    if (p.joined_at) html += '<p class="meta"><span>Joined ' + esc(p.joined_at.slice(0, 10)) + '</span></p>';
    if (p.record) {
      html += '<p class="meta"><span>' + p.record.competitions_entered + ' entered</span><span>' +
        p.record.competitions_placed + ' placed</span><span>' + p.record.competitions_won + ' won</span><span>' +
        money(p.record.prize_usd || 0) + ' prizes</span></p>';
    }
    if (Array.isArray(p.solutions) && p.solutions.length) {
      html += '<h2>Solutions</h2><ul>';
      for (const s of p.solutions) {
        html += '<li><a href="#/bounty/' + s.competition.slug + '">' + esc(s.title) + '</a> — ' + esc(s.competition.title) +
          (s.placement ? ' · place ' + s.placement : '') + (s.prize_usd ? ' · ' + money(s.prize_usd) : '') + '</li>';
      }
      html += '</ul>';
    }
    el.innerHTML = html;
  } catch (err) {
    el.innerHTML = '<p class="muted">Could not load data.</p>';
  }
  window.__shotReady = true;
}
