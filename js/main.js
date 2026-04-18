function updateClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

window.addEventListener('load', () => {
  initThree();
  App.init();
});
