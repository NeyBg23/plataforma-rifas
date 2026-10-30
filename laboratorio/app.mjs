const themeButton = document.getElementById('themeBtn');
const status = document.getElementById('sessionStatus');
if (status) status.textContent = 'Integración V12 pendiente de verificación';
if (themeButton) themeButton.addEventListener('click', () => {
  const light = document.body.dataset.theme !== 'light';
  document.body.dataset.theme = light ? 'light' : 'dark';
  themeButton.textContent = light ? '☾ Tema oscuro' : '☀ Tema claro';
});
for (const link of document.querySelectorAll('.side > a')) {
  link.addEventListener('click', () => {
    document.querySelectorAll('.side > a').forEach(x => x.classList.remove('active'));
    link.classList.add('active');
  });
}
