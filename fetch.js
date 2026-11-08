(function() {
  // Citi Bike Data Fetcher - Last 365 Days to CSV
  const NOW = Date.now();
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  const START_DATE = NOW - ONE_YEAR_MS;
  const END_DATE = NOW;

  // Check if we're on the right site (strict validation)
  const ALLOWED_HOSTS = [
    'citibikenyc.com',
    'account.citibikenyc.com',
    'member.citibikenyc.com',
    'lyft.com',
    'account.lyft.com',
    'baywheels.com',
    'account.baywheels.com',
  ];

  const hostname = window.location.hostname;
  const isAllowedHost = ALLOWED_HOSTS.some(host =>
    hostname === host || hostname.endsWith('.' + host)
  );

  if (!isAllowedHost) {
    alert('Please run this on your Citi Bike account page (citibikenyc.com)');
    return;
  }

  // Require HTTPS for security
  if (window.location.protocol !== 'https:') {
    alert('Please use HTTPS to access this page securely');
    return;
  }

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'citibike-wrapped-overlay';
  overlay.innerHTML = `
    <style>
      #citibike-wrapped-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #FAFAFA;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .wrapped-modal {
        background: #FFFFFF;
        border: 1px solid #E5E5E5;
        border-radius: 24px;
        padding: 40px 32px;
        max-width: 380px;
        width: 90%;
        text-align: center;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      }
      .wrapped-modal .bike-icon {
        font-size: 48px;
        margin-bottom: 16px;
        animation: bike-bounce 1.5s ease-in-out infinite;
      }
      @keyframes bike-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      .wrapped-modal h2 {
        color: #141414;
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 8px 0;
        letter-spacing: -0.01em;
      }
      .wrapped-modal .subtitle {
        color: #525252;
        font-size: 15px;
        margin-bottom: 28px;
        line-height: 1.4;
      }
      .wrapped-modal .progress-container {
        background: #F5F5F5;
        border-radius: 100px;
        height: 8px;
        overflow: hidden;
        margin-bottom: 20px;
      }
      .wrapped-modal .progress-bar {
        height: 100%;
        background: #0072CE;
        border-radius: 100px;
        transition: width 0.3s ease;
        width: 0%;
      }
      .wrapped-modal .progress-text {
        color: #0072CE;
        font-size: 48px;
        font-weight: 800;
        margin: 16px 0 8px;
        line-height: 1;
        letter-spacing: -0.02em;
      }
      .wrapped-modal .progress-label {
        color: #A3A3A3;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 4px;
      }
      .wrapped-modal .time-remaining {
        color: #A3A3A3;
        font-size: 12px;
        margin-top: 12px;
      }
      .wrapped-modal button.primary-btn {
        background: #141414;
        color: white;
        border: none;
        padding: 16px 32px;
        border-radius: 100px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 28px;
        transition: opacity 0.15s ease, transform 0.15s ease;
        width: 100%;
      }
      .wrapped-modal button.primary-btn:hover:not(:disabled) {
        opacity: 0.85;
      }
      .wrapped-modal button.primary-btn:active:not(:disabled) {
        transform: scale(0.98);
      }
      .wrapped-modal button.primary-btn:disabled {
        background: #E5E5E5;
        color: #A3A3A3;
        cursor: not-allowed;
      }
      .wrapped-modal .ghost-btn {
        background: transparent;
        color: #A3A3A3;
        border: none;
        padding: 12px 16px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin-top: 12px;
        transition: color 0.15s ease;
      }
      .wrapped-modal .ghost-btn:hover {
        color: #525252;
      }
      .wrapped-modal .success-check {
        display: none;
        width: 56px;
        height: 56px;
        background: #22C55E;
        border-radius: 50%;
        margin: 0 auto 16px;
        align-items: center;
        justify-content: center;
      }
      .wrapped-modal .success-check svg {
        width: 28px;
        height: 28px;
        color: white;
      }
      .wrapped-modal.done .bike-icon { display: none; }
      .wrapped-modal.done .success-check { display: flex; animation: pop-in 0.3s ease; }
      .wrapped-modal.done h2 { margin-bottom: 12px; }
      @keyframes pop-in {
        0% { transform: scale(0); }
        70% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    </style>
    <div class="wrapped-modal" id="wrapped-modal">
      <div class="success-check">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <div class="bike-icon">🚲</div>
      <h2>Citi Bike Exporter</h2>
      <p class="subtitle" id="wrapped-subtitle">Fetching rides from the last 365 days</p>
      <div class="progress-container">
        <div class="progress-bar" id="wrapped-progress"></div>
      </div>
      <div class="progress-text" id="wrapped-progress-text">0</div>
      <p class="progress-label" id="wrapped-progress-label">rides found</p>
      <p class="time-remaining" id="wrapped-time">This may take a minute...</p>
      <button class="primary-btn" id="wrapped-download" disabled>Download Rides CSV</button>
      <button class="ghost-btn" id="wrapped-cancel">Cancel</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const progressBar = document.getElementById('wrapped-progress');
  const subtitle = document.getElementById('wrapped-subtitle');
  const progressText = document.getElementById('wrapped-progress-text');
  const progressLabel = document.getElementById('wrapped-progress-label');
  const timeRemaining = document.getElementById('wrapped-time');
  const modal = document.getElementById('wrapped-modal');
  const downloadBtn = document.getElementById('wrapped-download');
  const cancelBtn = document.getElementById('wrapped-cancel');

  let cancelled = false;
  let allRides = [];

  cancelBtn.onclick = () => {
    cancelled = true;
    overlay.remove();
  };

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function toISO(timestampMs) {
    if (!timestampMs) return '';
    const date = new Date(Number(timestampMs));
    return isNaN(date.getTime()) ? '' : date.toISOString();
  }

  function parseDate(dateStr) {
    try {
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? null : parsed.getTime();
    } catch (e) {
      return null;
    }
  }

  function parseDurationToMs(durationStr) {
    if (!durationStr) return 600000;
    let totalMs = 0;
    const hrMatch = durationStr.match(/(\d+)\s*hr/i);
    const minMatch = durationStr.match(/(\d+)\s*min/i);
    if (hrMatch) totalMs += parseInt(hrMatch[1]) * 60 * 60 * 1000;
    if (minMatch) totalMs += parseInt(minMatch[1]) * 60 * 1000;
    return totalMs || 600000;
  }

  function scrapeVisibleRides() {
    const rides = [];
    const rideElements = document.querySelectorAll('[data-testid="ride-history-item"], .ride-history-item, [class*="RideHistoryItem"], [class*="ride-item"]');

    if (rideElements.length > 0) {
      rideElements.forEach((el, index) => {
        const text = el.innerText;
        const dateMatch = text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/);
        const priceMatch = text.match(/\$[\d.]+/);
        const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(AM|PM))/i);
        const durationMatch = text.match(/(\d+\s*hr\s*)?(\d+\s*min)/i);

        if (dateMatch) {
          let startMs = parseDate(dateMatch[0]);
          if (timeMatch && startMs) {
            const timeParts = timeMatch[1].match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (timeParts) {
              let hours = parseInt(timeParts[1]);
              const mins = parseInt(timeParts[2]);
              const isPM = timeParts[3].toUpperCase() === 'PM';
              if (isPM && hours !== 12) hours += 12;
              if (!isPM && hours === 12) hours = 0;
              startMs += hours * 60 * 60 * 1000 + mins * 60 * 1000;
            }
          }

          const durationMs = parseDurationToMs(durationMatch ? durationMatch[0] : '');
          const endMs = startMs + durationMs;
          const isEbike = text.toLowerCase().includes('ebike') || text.toLowerCase().includes('e-bike');

          rides.push({
            rideId: `scraped-${index}-${Date.now()}`,
            startTime: toISO(startMs),
            endTime: toISO(endMs),
            rawStartMs: startMs, // retained temporarily for filtering
            price: priceMatch ? priceMatch[0] : '$0.00',
            duration: durationMs,
            startAddress: `Station ${index + 1}`,
            endAddress: `Station ${index + 1}B`,
            rideableName: isEbike ? 'ebike' : 'classic',
          });
        }
      });
    }
    return rides;
  }

  async function fetchGraphQL(query, variables) {
    const response = await fetch('/bikesharefe-gql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      credentials: 'include'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  const LIST_QUERY = `
    query GetCurrentUserRides($startTimeMs: String, $memberId: String) {
      member(id: $memberId) {
        id
        rideHistory(startTimeMs: $startTimeMs) {
          limit
          hasMore
          rideHistoryList {
            rideId
            startTimeMs
            endTimeMs
            price { formatted }
            duration
            rideableName
          }
        }
      }
    }
  `;

  const DETAIL_QUERY = `
    query GetCurrentUserRideDetails($rideId: String!) {
      me {
        rideDetails(rideId: $rideId) {
          rideId
          startAddressStr
          endAddressStr
        }
      }
    }
  `;

  function getMemberId() {
    const urlMatch = window.location.href.match(/member[_-]?id[=\/]([^&\/]+)/i);
    if (urlMatch) return urlMatch[1];

    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      const memberMatch = content.match(/"memberId"\s*:\s*"([^"]+)"/);
      if (memberMatch) return memberMatch[1];
      const idMatch = content.match(/"id"\s*:\s*"([^"]+)".*?"__typename"\s*:\s*"Member"/);
      if (idMatch) return idMatch[1];
    }

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (value && value.includes('memberId')) {
          const match = value.match(/"memberId"\s*:\s*"([^"]+)"/);
          if (match) return match[1];
        }
      }
    } catch (e) {}

    return null;
  }

  async function fetchAllRidesFromAPI() {
    let cursor = String(END_DATE);
    let totalRides = [];
    const memberId = getMemberId();

    subtitle.textContent = 'Finding your rides...';

    while (!cancelled) {
      try {
        const variables = { startTimeMs: cursor };
        if (memberId) variables.memberId = memberId;

        const result = await fetchGraphQL(LIST_QUERY, variables);
        const rideHistory = result.data?.member?.rideHistory;
        if (!rideHistory) throw new Error('Could not fetch rides. Are you logged in?');

        const { rideHistoryList, hasMore } = rideHistory;
        const rides = rideHistoryList || [];

        // Filter to last 365 days
        const rides365 = rides.filter(r => {
          const ts = parseInt(r.startTimeMs);
          return ts >= START_DATE && ts <= END_DATE;
        });

        totalRides.push(...rides365);
        progressText.textContent = totalRides.length;

        if (rides.length > 0) {
          const oldestRide = parseInt(rides[rides.length - 1].startTimeMs);
          if (oldestRide < START_DATE) break; // Out of range, stop fetching
          cursor = rides[rides.length - 1].startTimeMs;
        }

        if (!hasMore) break;
        progressBar.style.width = '15%';
        await sleep(500);
      } catch (e) {
        console.error('[Exporter] API fetch failed:', e);
        throw e;
      }
    }

    return totalRides;
  }

  async function enrichRidesWithDetails(rides) {
    const enriched = [];
    const startTime = Date.now();
    const total = rides.length;

    subtitle.textContent = 'Processing your rides...';
    progressLabel.textContent = `of ${total} rides processed`;

    for (let i = 0; i < rides.length && !cancelled; i++) {
      const ride = rides[i];
      const progress = 20 + (i / rides.length) * 75;
      progressBar.style.width = `${progress}%`;
      progressText.textContent = i + 1;

      if (i > 5) {
        const elapsed = Date.now() - startTime;
        const avgTime = elapsed / i;
        const remaining = Math.ceil((rides.length - i) * avgTime / 1000);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        timeRemaining.textContent = mins > 0 ? `~${mins}m ${secs}s remaining` : `~${secs}s remaining`;
      }

      try {
        const result = await fetchGraphQL(DETAIL_QUERY, { rideId: ride.rideId });
        const details = result.data?.me?.rideDetails || {};

        enriched.push({
          rideId: ride.rideId,
          startTime: toISO(ride.startTimeMs),
          endTime: toISO(ride.endTimeMs),
          duration: ride.duration,
          price: ride.price?.formatted || '$0.00',
          rideableName: ride.rideableName || 'classic',
          startAddress: details.startAddressStr || 'Unknown Station',
          endAddress: details.endAddressStr || 'Unknown Station',
        });
      } catch (e) {
        enriched.push({
          rideId: ride.rideId,
          startTime: toISO(ride.startTimeMs),
          endTime: toISO(ride.endTimeMs),
          duration: ride.duration,
          price: ride.price?.formatted || '$0.00',
          rideableName: ride.rideableName || 'classic',
          startAddress: 'Unknown Station',
          endAddress: 'Unknown Station',
        });
      }

      await sleep(200);
    }

    return enriched;
  }

  async function scrollAndCollect(maxScrolls = 50) {
    let allScrapedRides = [];
    let lastCount = 0;
    let noNewRidesCount = 0;

    for (let i = 0; i < maxScrolls && !cancelled; i++) {
      const currentRides = scrapeVisibleRides();
      const newRides = currentRides.filter(r =>
        !allScrapedRides.some(existing => existing.startTime === r.startTime)
      );

      allScrapedRides.push(...newRides);
      progressText.textContent = allScrapedRides.length;
      progressBar.style.width = `${Math.min(90, (i / maxScrolls) * 100)}%`;

      if (allScrapedRides.length === lastCount) {
        noNewRidesCount++;
        if (noNewRidesCount >= 3) break;
      } else {
        noNewRidesCount = 0;
        lastCount = allScrapedRides.length;
      }

      if (allScrapedRides.length > 0) {
        const oldestRide = allScrapedRides.reduce((oldest, r) => {
          const ts = r.rawStartMs;
          return ts < oldest ? ts : oldest;
        }, Date.now());

        if (oldestRide < START_DATE) break;
      }

      window.scrollTo(0, document.body.scrollHeight);
      await sleep(1000);
    }

    return allScrapedRides.filter(r => {
      const ts = r.rawStartMs;
      return ts >= START_DATE && ts <= END_DATE;
    });
  }

  // Convert array of ride objects into CSV string
  function convertToCSV(rides) {
    const headers = ["rideId", "startTime", "endTime", "duration", "price", "rideableName", "startAddress", "endAddress"];
    
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = rides.map(ride => 
      headers.map(header => escapeCSV(ride[header])).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  function triggerCSVDownload(rides) {
    const csvContent = convertToCSV(rides);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citibike-rides-last-365-days.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function main() {
    try {
      subtitle.textContent = 'Connecting to Citi Bike...';

      try {
        const rides = await fetchAllRidesFromAPI();
        if (rides.length > 0) {
          allRides = await enrichRidesWithDetails(rides);
        } else {
          throw new Error('No rides found via API');
        }
      } catch (apiError) {
        subtitle.textContent = 'Scanning page for rides...';
        await sleep(500);
        allRides = await scrollAndCollect();
      }

      if (cancelled) return;

      if (allRides.length === 0) {
        subtitle.textContent = 'No rides found in the last 365 days';
        progressText.textContent = '0';
        progressLabel.textContent = 'rides';
        progressBar.style.width = '100%';
        return;
      }

      progressBar.style.width = '100%';
      progressText.textContent = allRides.length;
      progressLabel.textContent = 'rides ready!';
      subtitle.textContent = 'All done!';
      timeRemaining.textContent = '';
      downloadBtn.disabled = false;
      modal.classList.add
