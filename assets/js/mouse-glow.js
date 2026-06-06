/* Mouse-follow glow */

(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const hoverSelector = [
    'a',
    'button',
    'input',
    'select',
    'textarea',
    'label',
    '[role="button"]',
    '.format-card-button',
    '.queue-output-button',
    '.line-button',
    '.upload-main',
    '.upload-menu-button'
  ].join(',');

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let glowX = targetX;
  let glowY = targetY;

  window.addEventListener('mousemove', event => {
    targetX = event.clientX;
    targetY = event.clientY;

    document.body.classList.add('mouse-glow-ready');
    document.body.classList.toggle(
      'mouse-glow-hover',
      Boolean(event.target.closest(hoverSelector))
    );
  });

  window.addEventListener('mouseleave', () => {
    document.body.classList.remove('mouse-glow-ready', 'mouse-glow-hover');
  });

  function animateGlow() {
    glowX += (targetX - glowX) * 0.18;
    glowY += (targetY - glowY) * 0.18;

    document.documentElement.style.setProperty('--mouse-x', `${glowX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${glowY}px`);

    requestAnimationFrame(animateGlow);
  }

  animateGlow();
})();
