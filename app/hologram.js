const canvas = document.querySelector('#hologram');
const context = canvas.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const dots = Array.from({length: 520}, (_, i) => {
  const y = 1 - 2 * (i + .5) / 520;
  const distance = Math.sqrt(1 - y * y);
  const angle = i * Math.PI * (3 - Math.sqrt(5));
  return [Math.cos(angle) * distance, y, Math.sin(angle) * distance];
});

export function animate(getState) {
  if (!context) return;
  let width = 0;
  let height = 0;
  let scale = 1;
  let frame = 0;
  let lastDraw = 0;
  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  function render(time) {
    frame = 0;
    if (!reduced.matches && time - lastDraw < 30) { schedule(); return; }
    lastDraw = time;
    const {state, wave} = getState();
    draw(width, height, scale, reduced.matches ? 0 : time / 1000, state, wave);
    if (!reduced.matches && !document.hidden) schedule();
  }
  new ResizeObserver(([entry]) => {
    const {width: w, height: h} = entry.contentRect;
    scale = Math.min(devicePixelRatio || 1, 2);
    width = w;
    height = h;
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    schedule();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  reduced.addEventListener('change', schedule);
  return schedule;
}

function draw(w, h, scale, time, state, wave) {
  if (!w || !h) return;
  const ctx = context;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.translate(w / 2, h / 2);
  const radius = Math.min(w * .28, h * .34, 195);
  const energy = {idle:.18, recording:.56, processing:.40, speaking:.85, error:.1}[state] ?? .18;
  const light = ctx.createRadialGradient(0, 0, radius * .06, 0, 0, radius * 1.7);
  light.addColorStop(0, 'rgba(80,208,254,.16)');
  light.addColorStop(1, 'rgba(41,130,180,0)');
  ctx.fillStyle = light;
  ctx.fillRect(-w/2, -h/2, w, h);
  if (wave) {
    for (let band=0; band<5; band++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(142,233,246,${.72-band*.12})`;
      for (let i=0; i<=160; i++) {
        const p = i / 160;
        const x = (p-.5) * Math.min(w*.85,520);
        const y = Math.sin(p*26+time*(2+energy)+band*.52) * Math.sin(Math.PI*p)**2 * radius * (.24+energy*.48);
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    return;
  }
  for (let ring = 0; ring < 4; ring++) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(142,233,246,${.16+ring*.055})`;
    ctx.ellipse(0, 0, radius*(1.16+ring*.1), radius*(.22+ring*.15),
      -.4 + ring*.54 + Math.sin(time*.35+ring)*.22, 0, Math.PI*2);
    ctx.stroke();
  }
  const angle = time * (.26 + energy * .24);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const pulse = 1 + Math.sin(time * 4) * energy * .045;
  for (const [x,y,z] of dots) {
    const depth = z*cos-x*sin;
    const px = (x*cos+z*sin) * radius * pulse;
    const py = (y*.94+depth*.23) * radius * pulse;
    ctx.fillStyle = `rgba(155,235,255,${.18+(depth+1)*.33})`;
    ctx.fillRect(px, py, 1.35+depth*.7, 1.35+depth*.7);
  }
}
