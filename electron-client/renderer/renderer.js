// renderer.js
const messageEl = document.getElementById('message');

window.electronAPI.onStatusUpdate((data) => {
  if (data.message) {
    messageEl.innerText = data.message;
  }
});

window.electronAPI.onForceAction((action) => {
  if (action === 'lock') {
    document.body.style.backgroundColor = '#7f1d1d'; // Dark Red
    messageEl.innerText = "EXAM LOCKED BY ADMINISTRATOR";
    document.querySelector('.spinner').style.display = 'none';
  } else if (action === 'unlock') {
    document.body.style.backgroundColor = '#0f172a';
    messageEl.innerText = "Device Approved. Ready for Exam.";
    document.querySelector('.spinner').style.display = 'block';
  }
});

window.electronAPI.onWarningMessage((msg) => {
  alert(`ADMINISTRATOR WARNING: ${msg}`);
});
