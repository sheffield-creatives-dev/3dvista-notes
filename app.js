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
const storage = firebase.storage();

const saveButton = document.getElementById('save-button');
const commentText = document.getElementById('comment-text');
const statusMessage = document.getElementById('status-message');

// Get tour and scene IDs from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tourId = urlParams.get('tourId') || 'default-tour';
const sceneId = urlParams.get('sceneId') || 'default-scene';

let markerCoordinates = null;

// Listen for a click on the parent window (the 3DVista tour) to get coordinates
window.parent.addEventListener('click', (event) => {
    // This is a simplified approach. The exact coordinate system depends on 3DVista's API.
    // You may need a more advanced method to get 3D coordinates.
    markerCoordinates = {
        x: event.clientX,
        y: event.clientY
    };
    statusMessage.textContent = `Marker position set at (${markerCoordinates.x}, ${markerCoordinates.y}).`;
});

saveButton.addEventListener('click', async () => {
    const noteText = commentText.value;
    if (!noteText) {
        statusMessage.textContent = 'Please enter a comment.';
        return;
    }

    statusMessage.textContent = 'Saving...';
    saveButton.disabled = true;

    try {
        // Step 1: Capture screenshot
        const screenshotElement = window.parent.document.querySelector('body'); // Adjust this selector to target the 3DVista viewer
        const canvas = await html2canvas(screenshotElement, {
            useCORS: true // This is crucial if the 3DVista tour is from a different origin
        });

        // Step 2: Upload screenshot to Firebase Storage
        const screenshotBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        const screenshotName = `screenshots/${tourId}/${sceneId}/${Date.now()}.jpg`;
        const storageRef = storage.ref(screenshotName);
        await storageRef.put(screenshotBlob);

        const screenshotUrl = await storageRef.getDownloadURL();

        // Step 3: Save data to Firestore
        await db.collection('tour_notes').add({
            note_text: noteText,
            marker_coordinates: markerCoordinates,
            tour_id: tourId,
            scene_id: sceneId,
            screenshot_url: screenshotUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        statusMessage.textContent = 'Note & screenshot saved successfully!';
        commentText.value = '';
        markerCoordinates = null;

    } catch (error) {
        console.error("Error saving note: ", error);
        statusMessage.textContent = `Error: ${error.message}`;
    } finally {
        saveButton.disabled = false;
    }
});
