// Dashboard Analytics — Frontend JavaScript
const API_BASE = window.location.origin;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 min

async function fetchJSON(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch ${endpoint}:`, err);
    return null;
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

function setCard(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showLoading(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">Loading...</div>';
}

function drawBarChart(containerId, data, labelKey, valueKey, color = '#22863A') {
  const el = document.getElementById(containerId);
  if (!el || !data || data.length === 0) {
    if (el) el.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">No data yet</div>';
    return;
  }
  const maxVal = Math.max(...data.map(d => d[valueKey]));
  const barWidth = Math.floor(100 / data.length) - 2;
  
  let svg = `<svg viewBox="0 0 ${data.length * 60} 200" style="width:100%;height:200px;">`;
  data.forEach((d, i) => {
    const h = maxVal > 0 ? (d[valueKey] / maxVal) * 160 : 0;
    const x = i * 60 + 10;
    svg += `<rect x="${x}" y="${180 - h}" width="40" height="${h}" fill="${color}" rx="4" opacity="0.85"/>`;
    svg += `<text x="${x + 20}" y="196" text-anchor="middle" fill="#666" font-size="10">${d[labelKey]?.slice(-5) || ''}</text>`;
    svg += `<text x="${x + 20}" y="${175 - h}" text-anchor="middle" fill="#333" font-size="10">${d[valueKey]}</text>`;
  });
  svg += '</svg>';
  el.innerHTML = svg;
}

function renderTopProducts(containerId, products) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!products || products.length === 0) {
    el.innerHTML = '<div style="padding:20px;color:#888;">No sales data yet</div>';
    return;
  }
  el.innerHTML = products.map((p, i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #eee;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="background:#22863A;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;">${i + 1}</span>
        <span style="font-weight:500;">${p._id || p.name}</span>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:600;">${p.totalSold} sold</div>
        <div style="font-size:12px;color:#888;">${formatCurrency(p.revenue)}</div>
      </div>
    </div>
  `).join('');
}

function renderScannerStats(containerId, stats) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!stats) {
    el.innerHTML = '<div style="padding:20px;color:#888;">No scanner data</div>';
    return;
  }
  let html = `<div style="display:flex;gap:20px;margin-bottom:16px;">
    <div style="flex:1;background:#f0fdf4;padding:16px;border-radius:12px;text-align:center;">
      <div style="font-size:24px;font-weight:700;color:#22863A;">${stats.totalScans}</div>
      <div style="font-size:12px;color:#666;">Total Scans</div>
    </div>
    <div style="flex:1;background:#f0fdf4;padding:16px;border-radius:12px;text-align:center;">
      <div style="font-size:24px;font-weight:700;color:#22863A;">${stats.successRate}%</div>
      <div style="font-size:12px;color:#666;">Healthy Rate</div>
    </div>
  </div>`;
  if (stats.topDiseases?.length > 0) {
    html += '<div style="font-weight:600;margin-bottom:8px;">Top Issues:</div>';
    html += stats.topDiseases.slice(0, 5).map(d => `
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;">
        <span>${d._id || 'Unknown'}</span><span style="font-weight:600;">${d.count}</span>
      </div>
    `).join('');
  }
  el.innerHTML = html;
}

async function loadDashboard() {
  const [overview, revenue, topProducts, scannerStats, communityStats] = await Promise.all([
    fetchJSON('/api/analytics/overview'),
    fetchJSON('/api/analytics/revenue?period=30d'),
    fetchJSON('/api/analytics/top-products?limit=5'),
    fetchJSON('/api/analytics/scanner-stats'),
    fetchJSON('/api/analytics/community-stats'),
  ]);

  if (overview) {
    setCard('stat-revenue', formatCurrency(overview.revenue));
    setCard('stat-orders', overview.totalOrders);
    setCard('stat-users', overview.totalUsers);
    setCard('stat-products', overview.totalProducts);
    setCard('stat-scans', overview.totalScans);
    setCard('stat-posts', overview.totalPosts);
  }

  if (revenue) drawBarChart('chart-revenue', revenue, '_id', 'revenue');
  if (topProducts) renderTopProducts('list-top-products', topProducts);
  if (scannerStats) renderScannerStats('section-scanner', scannerStats);

  if (communityStats) {
    setCard('stat-community-posts', communityStats.totalPosts);
    setCard('stat-community-weekly', communityStats.postsThisWeek);
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  setInterval(loadDashboard, REFRESH_INTERVAL);
});