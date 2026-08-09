// ORBITAL CRASH — gameplay capture, video + the game's own audio.
// Paste-able into the browser console after a page load, same family as `.oracle.js`.
//
// WHY THIS EXISTS AT ALL: macOS `Cmd+Shift+5` records MICROPHONE ONLY. It cannot capture what the Mac
// is playing — the Options menu lists input devices, and speaker output is not one, so a screen capture
// of this game comes out silent unless a loopback driver is installed. This records both, with no
// driver and no install.
//
// Why each piece is the way it is:
//  - VIDEO COMES FROM getDisplayMedia, NOT canvas.captureStream(). The HUD — score, Epoch label, HP and
//    Capacitor bars, the Overdrive button — is DOM sitting ON TOP of the canvas, not painted into it.
//    A canvas capture yields the playfield with NO UI on it, which looks like a broken build rather
//    than a game. Capturing the surface is the only way to get the composited picture.
//  - AUDIO COMES FROM THE AUDIO GRAPH, not from the display capture's own track. Tapping
//    `__orbital.bus().comp` is the post-compressor mix — bit-for-bit what the speakers are being sent,
//    with no resampling, no device round-trip, and no dependency on the user remembering to tick
//    "Also share tab audio" in the picker. The display track is kept as a FALLBACK only.
//  - IT CAPS CAPTURE AT 1080p BY DEFAULT, AND THAT IS THE WHOLE POINT ON THIS MACHINE. The complaint
//    that started this was "it was kinda laggy when i'm capturing the video of game" — on a 15" M2 Air
//    (`Mac14,15`, FANLESS) with a 2880x1864 panel, an uncapped capture is 5.4 Mpx/frame rendered AND
//    THEN ENCODED, sustained, with no fan to carry it. `getDisplayMedia` takes width/height and the
//    downscale happens in the CAPTURE pipeline rather than in the encoder, so capping costs the game
//    nothing: 1920x1080 is 2.6x less pixel work and the player keeps playing at a comfortable window
//    size. Before this file existed the only lever was shrinking the window.
//    ⚠️ It also fixes the bitrate. 12 Mbps at 2880x1864 is a TIGHT budget the encoder strains to hit;
//    at 1080p the same number is generous. The cap improves quality and load in the same move.
//  - IT STOPS ON THE BROWSER'S OWN "Stop sharing" BUTTON. No stop control is drawn on the page,
//    because anything drawn on the page is in the recording. `track.onended` is the signal.
//  - MUTE IS CHECKED AND REFUSED, LOUDLY. `.oracle.js` leaves `store.mute` persisted true for every
//    later load in that profile, so the single most likely way to get a silent file is to have run the
//    test suite earlier. Starting a recording that cannot contain audio is the failure this whole file
//    exists to prevent, so it is a hard stop rather than a warning.
(() => {
  const g = window.__orbital;
  if (!g) return 'ERROR: window.__orbital missing — is this the game page, fully loaded?';

  const PREFS = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  const pickMime = () => PREFS.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';

  let rec = null, chunks = [], started = 0, disp = null, tapDest = null, tick = null;

  const stamp = () => {
    // No Date-free constraint here (this is not a workflow script), but keep it filename-safe.
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  };

  window.__rec = {
    // opts: {fps=60, mbps=12, w=1920, h=1080, audio='graph'|'display'|'both'}
    //   w/h cap the CAPTURE, not the window. Pass w:0 to record at native panel resolution — expect
    //   the capture itself to cost frames on a fanless machine. 60fps is kept because a fast arcade
    //   game at 30 is a visible downgrade; resolution is the cheaper thing to spend.
    async start(opts = {}) {
      if (rec) return 'already recording — __rec.stop()';
      const fps = opts.fps || 60, mbps = opts.mbps || 12, want = opts.audio || 'graph';
      const w = opts.w === undefined ? 1920 : opts.w, h = opts.h === undefined ? 1080 : opts.h;

      // ---- refuse to record silence -------------------------------------------------
      const bus = g.bus && g.bus();
      if (!bus) return 'ERROR: no AudioContext yet. Click the page once (the game builds audio on first input), then retry.';
      if (bus.ctx.state !== 'running') {
        try { await bus.ctx.resume(); } catch (_) {}
        if (bus.ctx.state !== 'running') return `ERROR: AudioContext is "${bus.ctx.state}". Click the page, then retry.`;
      }
      if (g.store && g.store.mute) {
        return 'ERROR: the game is MUTED, so the recording would be silent. This is usually .oracle.js, which leaves mute persisted. Unmute with the speaker button (or __orbital.store.mute=false and click it), then retry.';
      }

      // ---- video: the composited surface, so the DOM HUD is in it --------------------
      try {
        const video = { frameRate: fps };
        if (w && h) { video.width = { max: w }; video.height = { max: h }; }
        disp = await navigator.mediaDevices.getDisplayMedia({
          video,
          audio: true,          // fallback track only; the graph tap is preferred below
        });
      } catch (e) {
        return 'ERROR: screen capture was cancelled or blocked (' + e.name + '). Pick the TAB, not the whole screen — it is both sharper AND cheaper to encode, which matters on a fanless machine.';
      }

      // ---- audio: post-compressor, straight off the graph ----------------------------
      const tracks = [...disp.getVideoTracks()];
      let audioSrc = 'none';
      const node = bus.comp || bus.master;          // comp is what ships; master is a graceful older-build path
      if (want !== 'display' && node) {
        tapDest = bus.ctx.createMediaStreamDestination();
        node.connect(tapDest);                       // ADDITIVE — the speakers keep their own path
        tracks.push(...tapDest.stream.getAudioTracks());
        audioSrc = bus.comp ? 'graph (post-compressor)' : 'graph (master — build predates the comp seam)';
      }
      if ((want === 'display' || want === 'both' || audioSrc === 'none') && disp.getAudioTracks().length) {
        tracks.push(...disp.getAudioTracks());
        audioSrc = audioSrc === 'none' ? 'display capture (tab audio)' : audioSrc + ' + display';
      }
      if (!tracks.some(t => t.kind === 'audio')) {
        disp.getTracks().forEach(t => t.stop());
        disp = null;
        return 'ERROR: no audio track could be obtained. Retry, and tick "Also share tab audio" in the picker.';
      }

      const stream = new MediaStream(tracks);
      const mimeType = pickMime();
      rec = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: mbps * 1e6 } : undefined);
      chunks = [];
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        const type = (chunks[0] && chunks[0].type) || mimeType || 'video/webm';
        const blob = new Blob(chunks, { type });
        const ext = type.includes('mp4') ? 'mp4' : 'webm';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orbital-crash-${stamp()}.${ext}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        const secs = ((performance.now() - started) / 1000).toFixed(1);
        console.log(`%c[rec] saved ${a.download} — ${secs}s, ${(blob.size / 1048576).toFixed(1)} MB`,
                    'color:#38e0ff;font-weight:bold');
        if (tapDest && node) { try { node.disconnect(tapDest); } catch (_) {} }
        if (disp) disp.getTracks().forEach(t => t.stop());
        rec = null; disp = null; tapDest = null;
        if (tick) { clearInterval(tick); tick = null; }
      };

      // The browser's own "Stop sharing" control is the stop button, so nothing is drawn on the page.
      disp.getVideoTracks()[0].addEventListener('ended', () => { if (rec && rec.state !== 'inactive') rec.stop(); });

      rec.start(1000);                 // 1s chunks, so a crash still leaves most of the take
      started = performance.now();
      tick = setInterval(() => {
        if (rec) console.log(`[rec] ${((performance.now() - started) / 1000).toFixed(0)}s`);
      }, 15000);

      const s = disp.getVideoTracks()[0].getSettings();
      return `RECORDING at ${s.width}x${s.height}@${s.frameRate || fps} (cap ${w && h ? w + 'x' + h : 'none'}).
audio = ${audioSrc}; codec = ${rec.mimeType || 'browser default'}; ${mbps}Mbps.
Play now. Stop with the browser's "Stop sharing" button, or __rec.stop(). The file downloads itself.`;
    },

    stop() {
      if (!rec || rec.state === 'inactive') return 'not recording';
      rec.stop();
      return 'stopping — the file will download in a moment';
    },

    get status() {
      return rec ? `recording, ${((performance.now() - started) / 1000).toFixed(0)}s` : 'idle';
    },
  };

  return 'recorder ready — __rec.start() to begin, __rec.stop() to finish. __rec.status any time.';
})()
