import express from 'express';
import WebTorrent from 'webtorrent';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new WebTorrent();

// Serve dashboard HTML
app.get('/', (req, res) => {
  res.send(getHtmlDashboard());
});

// API: Start / Add Torrent
app.post('/api/add', (req, res) => {
  const { magnet } = req.body;
  if (!magnet) {
    return res.status(400).json({ error: "Magnet link is required" });
  }

  // Check if torrent already exists
  const existing = client.get(magnet);
  if (existing) {
    return res.json(getTorrentMetadata(existing));
  }

  try {
    client.add(magnet, (torrent) => {
      console.log(`Added torrent: ${torrent.name}`);
      res.json(getTorrentMetadata(torrent));
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// API: Get Status of All Torrents
app.get('/api/status', (req, res) => {
  const status = client.torrents.map(t => getTorrentMetadata(t));
  res.json(status);
});

// Stream Endpoint with Range Request Support (crucial for seekable HTML5 video streaming)
app.get('/stream/:infoHash/:fileIndex', (req, res) => {
  const { infoHash, fileIndex } = req.params;
  const torrent = client.get(infoHash);
  if (!torrent) {
    return res.status(404).send("Torrent not found");
  }

  const idx = parseInt(fileIndex);
  if (isNaN(idx) || idx < 0 || idx >= torrent.files.length) {
    return res.status(400).send("Invalid file index");
  }

  const file = torrent.files[idx];
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      'Content-Length': file.length,
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${file.name}"`
    });
    file.createReadStream().pipe(res);
  } else {
    // Parse Range header
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
    const chunksize = (end - start) + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${file.length}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4' // Defaulting to video/mp4 for range seek compatibility
    });

    file.createReadStream({ start, end }).pipe(res);
  }
});

// Delete Torrent API
app.delete('/api/delete/:infoHash', (req, res) => {
  const { infoHash } = req.params;
  const torrent = client.get(infoHash);
  if (torrent) {
    torrent.destroy(() => {
      res.json({ success: true });
    });
  } else {
    res.status(404).json({ error: "Torrent not found" });
  }
});

function getTorrentMetadata(torrent) {
  return {
    name: torrent.name,
    infoHash: torrent.infoHash,
    progress: (torrent.progress * 100).toFixed(2),
    downloadSpeed: (torrent.downloadSpeed / (1024 * 1024)).toFixed(2), // MB/s
    uploadSpeed: (torrent.uploadSpeed / (1024 * 1024)).toFixed(2), // MB/s
    numPeers: torrent.numPeers,
    files: torrent.files.map((f, index) => ({
      name: f.name,
      size: (f.length / (1024 * 1024)).toFixed(2), // MB
      index
    }))
  };
}

app.listen(PORT, () => {
  console.log(`Cloud Seedbox server running on port ${PORT}`);
});

function getHtmlDashboard() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZipLoot - Cloud Seedbox & Streamer</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Syne:wght@700;800&family=Space+Mono&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(255, 255, 255, 0.02);
      --border: rgba(255, 255, 255, 0.05);
      --primary: #818cf8;
      --success: #10b981;
      --text: #cbd5e1;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(11, 15, 25, 0.8);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      font-family: 'Syne', sans-serif;
      font-size: 22px;
      font-weight: 800;
      background: linear-gradient(135deg, #818cf8 0%, #10b981 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }
    .container {
      max-width: 1000px;
      width: 100%;
      margin: 40px auto;
      padding: 0 20px;
      flex: 1;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 30px;
      backdrop-filter: blur(10px);
    }
    h2 { font-family: 'Syne', sans-serif; font-size: 18px; margin-bottom: 15px; color: #fff; }
    input {
      width: 100%;
      padding: 14px 16px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: #fff;
      font-family: 'Space Mono', monospace;
      font-size: 14px;
      margin-bottom: 20px;
    }
    input:focus { border-color: var(--primary); outline: none; }
    .btn {
      padding: 12px 28px;
      border-radius: 50px;
      border: none;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.2s ease;
      background: linear-gradient(135deg, #818cf8 0%, #10b981 100%);
      color: #fff;
      box-shadow: 0 4px 15px rgba(129, 140, 248, 0.3);
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(129, 140, 248, 0.4); }
    
    .torrent-item {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      background: rgba(255,255,255,0.01);
    }
    .torrent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .torrent-title { font-weight: 600; color: #fff; font-size: 15px; }
    .stats { font-size: 13px; color: #94a3b8; margin-bottom: 12px; display: flex; gap: 20px; }
    .progress-bar-wrapper {
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      height: 8px;
      width: 100%;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .progress-bar { background: linear-gradient(90deg, #818cf8 0%, #10b981 100%); height: 100%; }
    
    .file-list { border-top: 1px solid var(--border); padding-top: 15px; }
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      font-size: 14px;
    }
    .file-item a { color: #818cf8; text-decoration: none; margin-left: 15px; font-weight: 600; }
    .file-item a:hover { text-decoration: underline; }
    .btn-delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .btn-delete:hover { background: rgba(239, 68, 68, 0.2); }
  </style>
</head>
<body>
  <header>
    <div class="logo">⚡ ZIPLOOT SEEDBOX</div>
  </header>
  <div class="container">
    <!-- Add Torrent -->
    <div class="card">
      <h2>🧲 Add Torrent Magnet Link</h2>
      <input type="text" id="magnetLink" placeholder="Paste your magnet link here..." />
      <button class="btn" onclick="addTorrent()">ADD TORRENT</button>
    </div>

    <!-- Active List -->
    <div class="card">
      <h2>🚀 Active Downloads & Streams</h2>
      <div id="torrentList">
        <!-- Dynamic content -->
      </div>
    </div>
  </div>

  <script>
    async function addTorrent() {
      const magnet = document.getElementById("magnetLink").value.trim();
      if (!magnet) return;

      const res = await fetch('/api/add', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magnet })
      });
      if (res.ok) {
        document.getElementById("magnetLink").value = "";
        loadStatus();
      } else {
        alert("Error adding torrent.");
      }
    }

    async function loadStatus() {
      const res = await fetch('/api/status');
      const torrents = await res.json();
      const listDiv = document.getElementById("torrentList");
      
      if (torrents.length === 0) {
        listDiv.innerHTML = "<p style='color: #64748b; font-size: 14px;'>No active torrents. Paste a magnet link above to start.</p>";
        return;
      }

      listDiv.innerHTML = "";
      torrents.forEach(t => {
        const item = document.createElement("div");
        item.className = "torrent-item";
        
        let fileItems = "";
        t.files.forEach(f => {
          fileItems += `
            <div class="file-item">
              <span>📁 \${f.name} (\${f.size} MB)</span>
              <div>
                <a href="/stream/\${t.infoHash}/\${f.index}" target="_blank">Stream/Download</a>
              </div>
            </div>
          `;
        });

        item.innerHTML = `
          <div class="torrent-header">
            <span class="torrent-title">⚡ \${t.name || 'Loading Metadata...'}</span>
            <button class="btn-delete" onclick="deleteTorrent('\${t.infoHash}')">Remove</button>
          </div>
          <div class="stats">
            <span>Peers: \${t.numPeers}</span>
            <span>Speed: \${t.downloadSpeed} MB/s</span>
            <span>Progress: \${t.progress}%</span>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar" style="width: \${t.progress}%"></div>
          </div>
          <div class="file-list">
            \${fileItems}
          </div>
        `;
        listDiv.appendChild(item);
      });
    }

    async function deleteTorrent(infoHash) {
      if (confirm("Remove this torrent from cloud?")) {
        await fetch(\`/api/delete/\${infoHash}\`, { method: "DELETE" });
        loadStatus();
      }
    }

    setInterval(loadStatus, 2000);
    loadStatus();
  </script>
</body>
</html>`;
}
