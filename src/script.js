import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

document.addEventListener('DOMContentLoaded', () => {
    const noteInput = document.getElementById('note-input');
    const addBtn = document.getElementById('add-btn');
    const notesList = document.getElementById('notes-list');

    // Determine environment
    const isElectron = typeof window.require === 'function';
    let fs, path, electronDataPath;

    if (isElectron) {
        try {
            fs = window.require('fs');
            path = window.require('path');
            // Resolve path same as before
            const userDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
            const dataDir = path.join(userDataPath, 'premium-notes-app');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            electronDataPath = path.join(dataDir, 'saved-notes.json');
        } catch (e) {
            console.error("Electron require failed", e);
        }
    }

    // Load notes from file
    loadNotes();

    async function loadNotes() {
        try {
            let notes = [];
            if (isElectron && fs) {
                if (fs.existsSync(electronDataPath)) {
                    const data = fs.readFileSync(electronDataPath, 'utf-8');
                    notes = JSON.parse(data);
                }
            } else {
                // Capacitor Mobile
                try {
                    const ret = await Filesystem.readFile({
                        path: 'saved-notes.json',
                        directory: Directory.Data,
                        encoding: Encoding.UTF8,
                    });
                    notes = JSON.parse(ret.data);
                } catch (e) {
                    // File might not exist yet
                    console.log("No saved notes found on mobile", e);
                }
            }

            notesList.innerHTML = '';
            notes.forEach(noteText => createNoteElement(noteText));
        } catch (e) {
            console.error("Failed to load notes:", e);
        }
    }

    async function saveNotes() {
        const notes = [];
        document.querySelectorAll('.note-text').forEach(span => {
            notes.push(span.textContent);
        });

        const dataToSave = JSON.stringify(notes.reverse());

        if (isElectron && fs) {
            fs.writeFileSync(electronDataPath, dataToSave);
        } else {
            // Capacitor Mobile
            try {
                await Filesystem.writeFile({
                    path: 'saved-notes.json',
                    data: dataToSave,
                    directory: Directory.Data,
                    encoding: Encoding.UTF8,
                });
            } catch (e) {
                console.error("Failed to save notes on mobile:", e);
            }
        }
    }

    function createNoteElement(text) {
        const li = document.createElement('li');
        li.className = 'note-item';

        li.innerHTML = `
            <span class="note-text">${escapeHtml(text)}</span>
            <button class="delete-btn" aria-label="Delete note">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg>
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
