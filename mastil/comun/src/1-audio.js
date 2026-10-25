/* Roka audio v1: independiente de DOM, sesiones y controles de cualquier app. */
const RokaAudio = (() => {
  let context, silent;
  const rooms = new WeakMap();
  function ac() {
    if (!context) context = new (globalThis.AudioContext || globalThis.webkitAudioContext)({latencyHint:'interactive'});
    return context;
  }
  async function unlockAudio() {
    const c = ac();
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) {}
    // Un elemento multimedia saca a iOS del canal de sonidos de interfaz.
    if (!silent && typeof Audio !== 'undefined') {
      silent = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAAAA==');
      silent.setAttribute('playsinline','');
    }
    if (silent) silent.play().catch(() => {});
    await c.resume();
    const s = c.createBufferSource(); s.buffer = c.createBuffer(1,1,22050); s.connect(c.destination); s.start();
    return c;
  }
  function outLat(c = context) { return c ? Math.max(0, (c.outputLatency || 0) + (c.baseLatency || 0)) : 0; }
  function room(c) {
    if (rooms.has(c)) return rooms.get(c);
    const n = Math.floor(c.sampleRate * 1.4), b = c.createBuffer(2,n,c.sampleRate);
    let seed = 127;
    for (let ch=0;ch<2;ch++) {
      const d=b.getChannelData(ch);
      for(let i=0;i<n;i++) { seed=(Math.imul(seed,1664525)+1013904223)|0; d[i]=(seed/2147483648)*Math.pow(1-i/n,3.2); }
    }
    rooms.set(c,b); return b;
  }
  function reverb(c, destination, wet=.16) {
    const node=c.createConvolver(), gain=c.createGain(); node.buffer=room(c); gain.gain.value=wet;
    node.connect(gain); gain.connect(destination); return node;
  }
  return {ac,unlockAudio,outLat,room,reverb};
})();
const ac=RokaAudio.ac, unlockAudio=RokaAudio.unlockAudio, outLat=RokaAudio.outLat;
