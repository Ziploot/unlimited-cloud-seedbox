const express = require('express');
const torrentStream = require('torrent-stream');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 7860;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store active torrent engines
const engines = new Map();

app.get('/', (req, res) => {
  res.send(getHtmlDashboard());
});

app.post('/api/add', (req, res) => {
  const { magnet } = req.body;
  if (!magnet) return res.status(400).json({ error: 'Magnet link is required' });

  const id = Buffer.from(magnet).toString('base64').slice(0, 24).replace(/[+/=]/g, '_');

  if (engines.has(id)) {
    return res.json(getEngineMetadata(id, engines.get(id)));
  }

  const engine = torrentStream(magnet, {
    tmp: '/tmp/seedbox-tmp',
    path: '/tmp/seedbox-data/' + id
  });

  const stored = { engine, magnet, name: null, files: [], ready: false };
  engines.set(id, stored);

  engine.on('ready', () => {
    stored.name = engine.torrent ? engine.torrent.name : 'Unknown';
    stored.files = engine.files || [];
    stored.ready = true;
    engine.files.forEach(file => file.select());
    console.log('Torrent ready:', stored.name);
  });

  engine.on('error', err => console.error('Engine error:', err.message));

  setTimeout(() => res.json(getEngineMetadata(id, stored)), 500);
});

app.get('/api/status', (req, res) => {
  const status = [];
  for (const [id, stored] of engines.entries()) {
    status.push(getEngineMetadata(id, stored));
  }
  res.json(status);
});

app.get('/stream/:id/:fileIndex', (req, res) => {
  const { id, fileIndex } = req.params;
  const stored = engines.get(id);
  if (!stored || !stored.ready) return res.status(404).send('Torrent not found or not ready yet');

  const idx = parseInt(fileIndex);
  if (isNaN(idx) || idx < 0 || idx >= stored.files.length) return res.status(400).send('Invalid file index');

  const file = stored.files[idx];
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      'Content-Length': file.length,
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="' + file.name + '"'
    });
    file.createReadStream().pipe(res);
  } else {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + file.length,
      'Accept-Ranges': 'bytes',
      'Content-Length': (end - start) + 1,
      'Content-Type': 'video/mp4'
    });
    file.createReadStream({ start, end }).pipe(res);
  }
});

app.delete('/api/delete/:id', (req, res) => {
  const stored = engines.get(req.params.id);
  if (stored) {
    stored.engine.destroy();
    engines.delete(req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Torrent not found' });
  }
});

function getEngineMetadata(id, stored) {
  const engine = stored.engine;
  const swarm = engine.swarm;
  let downloadSpeed = '0.00', numPeers = 0, progress = '0.00';
  if (swarm) {
    downloadSpeed = (swarm.downloadSpeed() / (1024 * 1024)).toFixed(2);
    numPeers = swarm.wires ? swarm.wires.length : 0;
  }
  if (engine.torrent && engine.torrent.pieces) {
    const total = engine.torrent.pieces.length;
    const have = engine.torrent.pieces.filter(p => p === null).length;
    progress = total > 0 ? ((have / total) * 100).toFixed(2) : '0.00';
  }
  return {
    id, infoHash: id,
    name: stored.name || 'Loading metadata...',
    progress, downloadSpeed, numPeers,
    files: (stored.files || []).map((f, index) => ({
      name: f.name,
      size: (f.length / (1024 * 1024)).toFixed(2),
      index
    }))
  };
}

app.listen(PORT, () => {
  console.log('Cloud Seedbox server running on port ' + PORT);
});

function getHtmlDashboard() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZipLoot - Cloud Seedbox</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Syne:wght@700;800&family=Space+Mono&display=swap" rel="stylesheet">
  <style>
    :root { --bg:#0b0f19; --card-bg:rgba(255,255,255,0.02); --border:rgba(255,255,255,0.05); --primary:#818cf8; --text:#cbd5e1; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; min-height:100vh; }
    header { border-bottom:1px solid var(--border); padding:20px 40px; background:rgba(11,15,25,0.8); backdrop-filter:blur(12px); position:sticky; top:0; z-index:100; }
    .logo { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; background:linear-gradient(135deg,#818cf8 0%,#10b981 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .container { max-width:1000px; margin:40px auto; padding:0 20px; }
    .card { background:var(--card-bg); border:1px solid var(--border); border-radius:16px; padding:30px; margin-bottom:30px; }
    h2 { font-family:'Syne',sans-serif; font-size:18px; margin-bottom:15px; color:#fff; }
    input { width:100%; padding:14px 16px; background:rgba(0,0,0,0.2); border:1px solid var(--border); border-radius:8px; color:#fff; font-family:'Space Mono',monospace; font-size:14px; margin-bottom:20px; }
    input:focus { border-color:var(--primary); outline:none; }
    .btn { padding:12px 28px; border-radius:50px; border:none; font-family:'Syne',sans-serif; font-weight:700; font-size:14px; cursor:pointer; background:linear-gradient(135deg,#818cf8 0%,#10b981 100%); color:#fff; box-shadow:0 4px 15px rgba(129,140,248,0.3); transition:all 0.2s; }
    .btn:hover { transform:translateY(-2px); }
    .torrent-item { border:1px solid var(--border); border-radius:12px; padding:20px; margin-bottom:20px; }
    .torrent-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .torrent-title { font-weight:600; color:#fff; font-size:15px; }
    .stats { font-size:13px; color:#94a3b8; margin-bottom:12px; display:flex; gap:20px; }
    .progress-bar-wrapper { background:rgba(255,255,255,0.05); border-radius:10px; height:8px; overflow:hidden; margin-bottom:20px; }
    .progress-bar { background:linear-gradient(90deg,#818cf8 0%,#10b981 100%); height:100%; transition:width 0.5s; }
    .file-list { border-top:1px solid var(--border); padding-top:15px; }
    .file-item { display:flex; justify-content:space-between; align-items:center; padding:10px 0; font-size:14px; }
    .file-item a { color:#818cf8; text-decoration:none; margin-left:15px; font-weight:600; }
    .btn-delete { background:rgba(239,68,68,0.1); color:#ef4444; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; }
  </style>
</head>
<body>
  <header><div class="logo">⚡ ZIPLOOT SEEDBOX</div></header>
  <div class="container">
    <div class="card">
      <h2>🧲 Add Torrent Magnet Link</h2>
      <input type="text" id="magnetLink" placeholder="Paste your magnet link here..." />
      <button class="btn" onclick="addTorrent()">ADD TORRENT</button>
    </div>
    <div class="card">
      <h2>🚀 Active Downloads &amp; Streams</h2>
      <div id="torrentList"></div>
    </div>
  </div>
  <script>
    async function addTorrent() {
      const magnet = document.getElementById("magnetLink").value.trim();
      if (!magnet) return;
      const res = await fetch('/api/add', { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({magnet}) });
      if (res.ok) { document.getElementById("magnetLink").value=""; loadStatus(); }
      else alert("Error adding torrent.");
    }
    async function loadStatus() {
      const res = await fetch('/api/status');
      const torrents = await res.json();
      const listDiv = document.getElementById("torrentList");
      if (!torrents.length) { listDiv.innerHTML="<p style='color:#64748b;font-size:14px;'>No active torrents. Paste a magnet link above to start.</p>"; return; }
      listDiv.innerHTML="";
      torrents.forEach(function(t) {
        const item = document.createElement("div");
        item.className="torrent-item";
        let fileItems="";
        t.files.forEach(function(f) {
          fileItems+='<div class="file-item"><span>📁 '+f.name+' ('+f.size+' MB)</span><div><a href="/stream/'+t.id+'/'+f.index+'" target="_blank">Stream/Download</a></div></div>';
        });
        item.innerHTML='<div class="torrent-header"><span class="torrent-title">⚡ '+(t.name||'Loading...')+'</span><button class="btn-delete" onclick="deleteTorrent(\''+t.id+'\')">Remove</button></div><div class="stats"><span>Peers: '+t.numPeers+'</span><span>Speed: '+t.downloadSpeed+' MB/s</span><span>Progress: '+t.progress+'%</span></div><div class="progress-bar-wrapper"><div class="progress-bar" style="width:'+t.progress+'%"></div></div><div class="file-list">'+fileItems+'</div>';
        listDiv.appendChild(item);
      });
    }
    async function deleteTorrent(id) {
      if (confirm("Remove this torrent?")) { await fetch('/api/delete/'+id,{method:"DELETE"}); loadStatus(); }
    }
    setInterval(loadStatus, 2000);
    loadStatus();
  </script>
</body>
</html>`;
}
