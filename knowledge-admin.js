function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setOutput(data) {
  const out = document.getElementById('output');
  out.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function parseEntriesInput() {
  const raw = getVal('entriesInput');
  if (!raw) throw new Error('Please paste entries JSON first.');
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return { entries: parsed };
  }

  if (parsed && Array.isArray(parsed.entries)) {
    return { entries: parsed.entries };
  }

  throw new Error('Input must be an array or an object with `entries` array.');
}

async function postAdmin(path, body) {
  const backendUrl = getVal('backendUrl');
  const adminToken = getVal('adminToken');

  if (!backendUrl) throw new Error('Backend URL is required.');
  if (!adminToken) throw new Error('Admin token is required.');

  const res = await fetch(`${backendUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken
    },
    body: JSON.stringify(body || {})
  });

  const text = await res.text();
  let parsed = text;
  try { parsed = JSON.parse(text); } catch {}

  if (!res.ok) {
    throw new Error(typeof parsed === 'string' ? parsed : JSON.stringify(parsed));
  }

  return parsed;
}

async function getPublic(path) {
  const backendUrl = getVal('backendUrl');
  if (!backendUrl) throw new Error('Backend URL is required.');

  const res = await fetch(`${backendUrl}${path}`);
  const text = await res.text();
  let parsed = text;
  try { parsed = JSON.parse(text); } catch {}
  if (!res.ok) {
    throw new Error(typeof parsed === 'string' ? parsed : JSON.stringify(parsed));
  }
  return parsed;
}

document.getElementById('btnValidate').addEventListener('click', () => {
  try {
    const payload = parseEntriesInput();
    setOutput({ ok: true, entries: payload.entries.length, message: 'JSON is valid.' });
  } catch (err) {
    setOutput(`Validation failed: ${err.message}`);
  }
});

document.getElementById('btnUpsert').addEventListener('click', async () => {
  try {
    const payload = parseEntriesInput();
    const result = await postAdmin('/api/plant-knowledge/upsert', payload);
    setOutput(result);
  } catch (err) {
    setOutput(`Upsert failed: ${err.message}`);
  }
});

document.getElementById('btnRefresh').addEventListener('click', async () => {
  try {
    const result = await postAdmin('/api/plant-knowledge/daily-refresh', {});
    setOutput(result);
  } catch (err) {
    setOutput(`Refresh failed: ${err.message}`);
  }
});

document.getElementById('btnRefs').addEventListener('click', async () => {
  try {
    const refs = await getPublic('/api/plant-knowledge/references?q=leaf%20spot');
    setOutput(refs);
  } catch (err) {
    setOutput(`Reference check failed: ${err.message}`);
  }
});
