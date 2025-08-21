// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFM_a1Das_MXmpZZ1uon-VXMw0jm5_ioQ",
  authDomain: "comment-tool-9b8df.firebaseapp.com",
  projectId: "comment-tool-9b8df",
  storageBucket: "comment-tool-9b8df.firebasestorage.app",
  messagingSenderId: "200596983749",
  appId: "1:200596983749:web:cf0da1032d994b000b85ac",
  measurementId: "G-F0PE34DWVN"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const notesContainer = document.getElementById('notes-container');

async function fetchNotes() {
    try {
        const notesSnapshot = await db.collection('tour_notes').orderBy('timestamp', 'desc').get();
        
        if (notesSnapshot.empty) {
            notesContainer.innerHTML = '<p>No notes found.</p>';
            return;
        }

        notesSnapshot.forEach(doc => {
            const data = doc.data();
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            
            let coords = data.marker_coordinates ? `(${data.marker_coordinates.x}, ${data.marker_coordinates.y})` : 'N/A';
            
            noteCard.innerHTML = `
                <h3>Note ID: ${doc.id}</h3>
                <p><strong>Note:</strong> ${data.note_text}</p>
                <p><strong>Tour:</strong> ${data.tour_id}</p>
                <p><strong>Scene:</strong> ${data.scene_id}</p>
                <p><strong>Marker Coordinates:</strong> ${coords}</p>
                <img src="${data.screenshot_url}" alt="Screenshot of the tour scene">
            `;
            notesContainer.appendChild(noteCard);
        });

    } catch (error) {
        console.error("Error fetching notes: ", error);
        notesContainer.innerHTML = `<p>Error fetching notes: ${error.message}</p>`;
    }
}

fetchNotes();
