document.addEventListener('DOMContentLoaded', function() {
  // Select DOM elements for interacting with the note application
  const noteForm = document.querySelector('.note-form');
  const noteTitle = document.querySelector('.note-title');
  const noteText = document.querySelector('.note-textarea');
  const saveNoteBtn = document.querySelector('.save-note');
  const newNoteBtn = document.querySelector('.new-note');
  const noteList = document.querySelector('.list-group');

  // Initialize an object to keep track of the currently active note
  let activeNote = {};

  // Function to show an element
  const show = (elem) => {
    if (elem) {
      elem.style.display = 'inline';
    }
  };

  // Function to hide an element
  const hide = (elem) => {
    if (elem) {
      elem.style.display = 'none';
    }
  };

  // Fetch all notes from the server
  const getNotes = () =>
    fetch('/api/notes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

  // Save a new note to the server
  const saveNote = (note) =>
    fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(note)
    }).then(response => response.json());

  // Delete a note from the server
  const deleteNote = (id) =>
    fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

  // Render the currently active note in the note form
  const renderActiveNote = () => {
    // If there is an active note, display its title and text
    if (activeNote.id) {
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
      noteTitle.setAttribute('readonly', true);
      noteText.setAttribute('readonly', true);
      hide(saveNoteBtn);
    } else {
      // If there is no active note, clear the input fields
      noteTitle.value = '';
      noteText.value = '';
      noteTitle.removeAttribute('readonly');
      noteText.removeAttribute('readonly');
      show(saveNoteBtn);
    }
  };

  // Handle the save button click to save a note
  const handleNoteSave = () => {
    // Create a new note object from the input fields
    const newNote = {
      title: noteTitle.value,
      text: noteText.value
    };
    // Save the note to the server and update the UI
    saveNote(newNote).then((savedNote) => {
      activeNote = savedNote;  // Set the newly saved note as the active note
      getAndRenderNotes();     // Refresh the list of notes
      renderActiveNote();      // Display the active note
    });
  };

  // Handle the delete button click to delete a note
  const handleNoteDelete = (e) => {
    e.stopPropagation();  // Prevent triggering other click events
    const noteId = JSON.parse(e.target.closest('li').getAttribute('data-note')).id;
    deleteNote(noteId).then(() => {
      getAndRenderNotes();  // Refresh the list of notes
      activeNote = {};      // Clear the active note
      renderActiveNote();   // Clear the note form
    });
  };

  // Handle clicking on a note title to view the note
  const handleNoteView = (e) => {
    e.preventDefault();
    // Get the note object from the clicked element's data attribute
    const note = JSON.parse(e.target.closest('li').getAttribute('data-note'));
    activeNote = note;  // Set the clicked note as the active note
    renderActiveNote();  // Display the active note
  };

  // Render the list of notes in the sidebar
  const renderNoteList = async (notes) => {
    let jsonNotes = await notes.json();
    noteList.innerHTML = '';  // Clear existing list
    // Create a list item for each note
    let noteListItems = jsonNotes.map(note => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.dataset.note = JSON.stringify(note);

      const span = document.createElement('span');
      span.classList.add('list-item-title');
      span.innerText = note.title;
      span.addEventListener('click', handleNoteView);

      li.appendChild(span);

      if (note.id) {
        const delBtn = document.createElement('i');
        delBtn.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
        delBtn.addEventListener('click', handleNoteDelete);
        li.appendChild(delBtn);
      }

      return li;
    });
    noteListItems.forEach(li => noteList.appendChild(li));
  };

  // Fetch notes from the server and render them
  const getAndRenderNotes = () => getNotes().then(renderNoteList);

  // Add event listeners to buttons
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', handleNoteSave);
  }
  if (newNoteBtn) {
    newNoteBtn.addEventListener('click', () => {
      activeNote = {};  // Clear the active note
      renderActiveNote();  // Clear the note form
    });
  }

  // Initial call to fetch and render notes
  getAndRenderNotes();
});
