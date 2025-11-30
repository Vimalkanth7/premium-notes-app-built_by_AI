const fs = require('fs');
const path = require('path');

document.addEventListener('DOMContentLoaded', () => {
    const noteInput = document.getElementById('note-input');
    const addBtn = document.getElementById('add-btn');
    const notesList = document.getElementById('notes-list');

    const userDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
    const dataDir = path.join(userDataPath, 'premium-notes-app');

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const DATA_FILE = path.join(dataDir, 'saved-notes.json');

    // Load notes from file
    loadNotes();

    function loadNotes() {
        if (fs.existsSync(DATA_FILE)) {
            fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
                if (err) {
                    console.error("Failed to load notes:", err);
                    return;
                }
                try {
                    const notes = JSON.parse(data);
                    notes.forEach(noteText => createNoteElement(noteText));
                } catch (e) {
                    console.error("Failed to parse notes:", e);
                }
            });
        }
    }

    function saveNotes() {
        const notes = [];
        document.querySelectorAll('.note-text').forEach(span => {
            notes.push(span.textContent); // Use textContent to get unescaped text
        });

        // Reverse to save in chronological order (oldest first) if we are prepending in UI
        // But wait, the UI prepends (newest on top). 
        // If we save [newest, older, oldest], when we load, we should append them in that order?
        // Or if we iterate and prepend, the last one in the list (oldest) will be at the top?
        // Let's stick to the UI order. The UI list has newest at the top.
        // If we save [newest, older], and then load:
        // createNoteElement(newest) -> list: [newest]
        // createNoteElement(older) -> list: [older, newest] (because of prepend)
        // So we need to save in reverse order (oldest to newest) so that when we load and prepend, they end up in the correct order (newest to oldest).

        fs.writeFile(DATA_FILE, JSON.stringify(notes.reverse()), (err) => {
            if (err) console.error("Failed to save notes:", err);
        });
    }

    function createNoteElement(text) {
        const li = document.createElement('li');
        li.className = 'note-item';

        li.innerHTML = `
            <span class="note-text">${escapeHtml(text)}</span>
            <button class="delete-btn" aria-label="Delete note">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;

        // Add delete functionality
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            li.style.animation = 'slideOut 0.3s ease-out forwards';
            li.addEventListener('animationend', () => {
                li.remove();
                saveNotes();
            });
        });

        notesList.prepend(li);
    }

    function addNote() {
        const text = noteInput.value.trim();
        if (text === '') return;

        createNoteElement(text);
        saveNotes();

        noteInput.value = '';
        noteInput.focus();
    }

    addBtn.addEventListener('click', addNote);

    noteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNote();
        }
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
