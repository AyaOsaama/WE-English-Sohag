// Self-contained confetti (no library). Draws on a temporary full-screen canvas.
export function triggerConfetti() {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:70';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const colors = ['#5C2483', '#8E3AC4', '#B82987', '#00C49F', '#FFB703', '#FFFFFF'];
  const particles = Array.from({ length: 90 }, () => ({
    x: canvas.width / 2, y: canvas.height / 2, r: Math.random() * 5 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.5) * 14 - 3, alpha: 1,
  }));
  (function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = 0;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.alpha -= 0.012;
      if (p.alpha <= 0) continue;
      active++;
      ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    if (active > 0) requestAnimationFrame(frame);
    else canvas.remove();
  })();
}
