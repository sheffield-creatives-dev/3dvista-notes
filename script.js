// script.js

// Replace the below config with your Firebase project details!
const firebaseConfig = {
  apiKey: "AIzaSyBFM_a1Das_MXmpZZ1uon-VXMw0jm5_ioQ",
  authDomain: "comment-tool-9b8df.firebaseapp.com",
  projectId: "comment-tool-9b8df",
  storageBucket: "comment-tool-9b8df.appspot.com",
  messagingSenderId: "200596983749",
  appId: "1:200596983749:web:cf0da1032d994b000b85ac",
  measurementId: "G-F0PE34DWVN"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const tourId = getQueryParam('tour') || 'default-tour';
const sceneId = getQueryParam('scene') || 'default-scene';

const commentsToggle = document.getElementById('commentsToggle');
const commentsPanel = document.getElementById('commentsPanel');
const commentsList = document.getElementById('commentsList');
const commentForm = document.getElementById('commentForm');
const commentTextarea = commentForm.querySelector('textarea');
const markersContainer = document.getElementById('markers');

let commentsVisible = false;

commentsToggle.onclick = () => {
  commentsVisible = !commentsVisible;
  commentsPanel.style.display = commentsVisible ? 'block' : 'none';
  commentsToggle.textContent = commentsVisible ? '💬 Hide Comments' : '💬 Show Comments';
};

// Converts yaw/pitch (degrees) to screen position (approximate)
function yawPitchToScreenPos(yaw, pitch) {
  let x = ((yaw + 180) / 360) * window.innerWidth;
  let y = ((-pitch + 90) / 180) * window.innerHeight;
  return { x, y };
}

function loadComments() {
  commentsList.innerHTML = '';
  markersContainer.innerHTML = '';

  db.collection('comments')
    .where('tour', '==', tourId)
    .where('scene', '==', sceneId)
    .orderBy('timestamp', 'asc')
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const comment = doc.data();
        addCommentToList(doc.id, comment);
        addMarker(doc.id, comment,);
      });
    })
    .catch(console.error);
}

function addCommentToList(id, comment) {
  const li = document.createElement('li');
  const time = new Date(comment.timestamp?.toMillis ? comment.timestamp.toMillis() : comment.timestamp).toLocaleString();
  li.textContent = `[${time}] ${comment.text}`;
  commentsList.appendChild(li);
}

function addMarker(id, comment) {
  const { yaw, pitch } = comment;
  if (yaw === undefined || pitch === undefined) {
    console.warn('Skipping comment without yaw/pitch:', comment);
    return;
  }

  console.log('Adding marker for:', id, comment);

  const pos = yawPitchToScreenPos(yaw, pitch);
  console.log('Marker position:', pos);

  const marker = document.createElement('div');
  marker.className = 'marker';
  marker.title = comment.text;
  marker.textContent = '💬';

  marker.style.left = `${pos.x}px`;
  marker.style.top = `${pos.y}px`;

  marker.addEventListener('click', () => {
    alert(comment.text);
  });

  markersContainer.appendChild(marker);
}

// Listen for clicks on viewport to set comment position
window.addEventListener('click', (e) => {
  if (!commentsVisible) return;
  if (e.target.closest('#commentsPanel') || e.target === commentsToggle) return;

  const yaw = ((e.clientX / window.innerWidth) * 360) - 180;
  const pitch = 90 - ((e.clientY / window.innerHeight) * 180);

  commentTextarea.focus();
  commentTextarea.value = '';
  commentTextarea.dataset.yaw = yaw;
  commentTextarea.dataset.pitch = pitch;
  alert(`New comment position set:\nYaw: ${yaw.toFixed(1)}°, Pitch: ${pitch.toFixed(1)}°\nType your comment and click Save.`);
});

commentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = commentTextarea.value.trim();
  if (!text) {
    alert('Please enter a comment.');
    return;
  }
  const yaw = parseFloat(commentTextarea.dataset.yaw);
  const pitch = parseFloat(commentTextarea.dataset.pitch);
  if (isNaN(yaw) || isNaN(pitch)) {
    alert('Please click on the view to set comment location first.');
    return;
  }

  db.collection('comments').add({
    tour: tourId,
    scene: sceneId,
    yaw,
    pitch,
    text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    commentTextarea.value = '';
    commentTextarea.dataset.yaw = '';
    commentTextarea.dataset.pitch = '';
    loadComments();
  }).catch(err => {
    console.error(err);
    alert('Error saving comment.');
  });
});

loadComments();
setInterval(loadComments, 30000);