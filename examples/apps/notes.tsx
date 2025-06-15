import React, { useState, useEffect, useRef } from 'react';

interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
}

interface NotesAppState {
    notes: Note[];
    selectedNoteId: string | null;
    searchTerm: string;
    filterTag: string | null;
}

const NotesApp: React.FC = () => {
    const [state, setState] = useState<NotesAppState>({
        notes: [],
        selectedNoteId: null,
        searchTerm: '',
        filterTag: null
    });

    const [currentNote, setCurrentNote] = useState<Partial<Note>>({
        title: '',
        content: '',
        tags: []
    });

    const titleRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // Load notes from localStorage on component mount
    useEffect(() => {
        const savedNotes = localStorage.getItem('visionOS_notes');
        if (savedNotes) {
            const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
                ...note,
                createdAt: new Date(note.createdAt),
                updatedAt: new Date(note.updatedAt)
            }));
            setState(prev => ({ ...prev, notes: parsedNotes }));
        }
    }, []);

    // Save notes to localStorage whenever notes change
    useEffect(() => {
        localStorage.setItem('visionOS_notes', JSON.stringify(state.notes));
    }, [state.notes]);

    const createNewNote = (): void => {
        const newNote: Note = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: []
        };

        setState(prev => ({
            ...prev,
            notes: [newNote, ...prev.notes],
            selectedNoteId: newNote.id
        }));

        setCurrentNote({
            title: newNote.title,
            content: newNote.content,
            tags: newNote.tags
        });
    };

    const selectNote = (noteId: string): void => {
        const note = state.notes.find(n => n.id === noteId);
        if (note) {
            setState(prev => ({ ...prev, selectedNoteId: noteId }));
            setCurrentNote({
                title: note.title,
                content: note.content,
                tags: note.tags
            });
        }
    };

    const saveNote = (): void => {
        if (!state.selectedNoteId) return;

        const updatedNotes = state.notes.map(note => {
            if (note.id === state.selectedNoteId) {
                return {
                    ...note,
                    title: currentNote.title || 'Untitled Note',
                    content: currentNote.content || '',
                    tags: currentNote.tags || [],
                    updatedAt: new Date()
                };
            }
            return note;
        });

        setState(prev => ({ ...prev, notes: updatedNotes }));
    };

    const deleteNote = (noteId: string): void => {
        setState(prev => ({
            ...prev,
            notes: prev.notes.filter(note => note.id !== noteId),
            selectedNoteId: prev.selectedNoteId === noteId ? null : prev.selectedNoteId
        }));

        if (state.selectedNoteId === noteId) {
            setCurrentNote({ title: '', content: '', tags: [] });
        }
    };

    const addTag = (tag: string): void => {
        if (tag.trim() && !currentNote.tags?.includes(tag.trim())) {
            setCurrentNote(prev => ({
                ...prev,
                tags: [...(prev.tags || []), tag.trim()]
            }));
        }
    };

    const removeTag = (tagToRemove: string): void => {
        setCurrentNote(prev => ({
            ...prev,
            tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
        }));
    };

    const filteredNotes = state.notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                            note.content.toLowerCase().includes(state.searchTerm.toLowerCase());
        const matchesTag = !state.filterTag || note.tags.includes(state.filterTag);
        return matchesSearch && matchesTag;
    });

    const allTags = Array.from(new Set(state.notes.flatMap(note => note.tags)));

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="notes-app">
            <div className="notes-sidebar">
                <div className="notes-header">
                    <h2>Notes</h2>
                    <button className="new-note-btn" onClick={createNewNote}>
                        + New Note
                    </button>
                </div>

                <div className="notes-search">
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={state.searchTerm}
                        onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="search-input"
                    />
                </div>

                <div className="notes-list">
                    {filteredNotes.map(note => (
                        <div
                            key={note.id}
                            className={`note-item ${state.selectedNoteId === note.id ? 'selected' : ''}`}
                            onClick={() => selectNote(note.id)}
                        >
                            <div className="note-title">{note.title}</div>
                            <div className="note-preview">
                                {note.content.substring(0, 50)}
                                {note.content.length > 50 && '...'}
                            </div>
                            <div className="note-meta">
                                <span className="note-date">{formatDate(note.updatedAt)}</span>
                                {note.tags.length > 0 && (
                                    <div className="note-tags">
                                        {note.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                        {note.tags.length > 2 && (
                                            <span className="tag-more">+{note.tags.length - 2}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {allTags.length > 0 && (
                    <div className="tags-filter">
                        <h3>Tags</h3>
                        <div className="tags-list">
                            <button
                                className={`tag-filter ${state.filterTag === null ? 'active' : ''}`}
                                onClick={() => setState(prev => ({ ...prev, filterTag: null }))}
                            >
                                All
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    className={`tag-filter ${state.filterTag === tag ? 'active' : ''}`}
                                    onClick={() => setState(prev => ({ ...prev, filterTag: tag }))}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="notes-editor">
                {state.selectedNoteId ? (
                    <>
                        <div className="editor-header">
                            <input
                                ref={titleRef}
                                type="text"
                                placeholder="Note title..."
                                value={currentNote.title || ''}
                                onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
                                onBlur={saveNote}
                                className="note-title-input"
                            />
                            <button
                                className="delete-note-btn"
                                onClick={() => deleteNote(state.selectedNoteId!)}
                            >
                                Delete
                            </button>
                        </div>

                        <div className="tags-editor">
                            <div className="current-tags">
                                {currentNote.tags?.map(tag => (
                                    <span key={tag} className="tag">
                                        {tag}
                                        <button
                                            className="remove-tag"
                                            onClick={() => removeTag(tag)}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Add tag..."
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addTag(e.currentTarget.value);
                                        e.currentTarget.value = '';
                                    }
                                }}
                                className="add-tag-input"
                            />
                        </div>

                        <textarea
                            ref={contentRef}
                            placeholder="Start writing your note..."
                            value={currentNote.content || ''}
                            onChange={(e) => setCurrentNote(prev => ({ ...prev, content: e.target.value }))}
                            onBlur={saveNote}
                            className="note-content-textarea"
                        />
                    </>
                ) : (
                    <div className="no-note-selected">
                        <h3>Select a note or create a new one</h3>
                        <p>Your notes will be automatically saved</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesApp; 