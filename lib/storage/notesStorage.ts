/**
 * Notes Storage Utility
 *
 * Saves and loads notes as txt files on the user's device.
 * Uses expo-file-system for persistent local storage.
 */

import * as FileSystem from 'expo-file-system/legacy';

// Get notes directory path (needs to be a function since documentDirectory may not be available at module load)
function getNotesDir(): string {
  return `${FileSystem.documentDirectory}notes/`;
}

function getMetadataFile(): string {
  return `${getNotesDir()}metadata.json`;
}

export interface StoredNote {
  id: string;
  title: string;
  filename: string;
  category: 'email' | 'daily_routine' | 'job_interview' | 'travel' | 'social' | 'other';
  label: string;
  createdAt: string;
  updatedAt: string;
  score?: number;
  practiceCount: number;
  hasFeedback: boolean;
  timeSpentMinutes: number;
}

interface NotesMetadata {
  notes: StoredNote[];
  version: number;
}

/**
 * Ensure the notes directory exists
 */
async function ensureNotesDir(): Promise<void> {
  const notesDir = getNotesDir();
  const dirInfo = await FileSystem.getInfoAsync(notesDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(notesDir, { intermediates: true });
  }
}

/**
 * Generate a safe filename from note title
 */
function generateFilename(title: string, id: string): string {
  const safeName = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  return `${safeName}-${id.substring(0, 8)}.txt`;
}

/**
 * Load notes metadata
 */
async function loadMetadata(): Promise<NotesMetadata> {
  try {
    await ensureNotesDir();
    const metadataFile = getMetadataFile();
    const fileInfo = await FileSystem.getInfoAsync(metadataFile);

    if (!fileInfo.exists) {
      return { notes: [], version: 1 };
    }

    const content = await FileSystem.readAsStringAsync(metadataFile);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading notes metadata:', error);
    return { notes: [], version: 1 };
  }
}

/**
 * Save notes metadata
 */
async function saveMetadata(metadata: NotesMetadata): Promise<void> {
  try {
    await ensureNotesDir();
    await FileSystem.writeAsStringAsync(
      getMetadataFile(),
      JSON.stringify(metadata, null, 2)
    );
  } catch (error) {
    console.error('Error saving notes metadata:', error);
    throw error;
  }
}

/**
 * Get all saved notes with their content
 */
export async function getAllNotes(): Promise<Array<StoredNote & { fullText: string; preview: string }>> {
  const metadata = await loadMetadata();
  const notesWithContent: Array<StoredNote & { fullText: string; preview: string }> = [];

  for (const note of metadata.notes) {
    try {
      const content = await FileSystem.readAsStringAsync(`${getNotesDir()}${note.filename}`);
      notesWithContent.push({
        ...note,
        fullText: content,
        preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      });
    } catch (error) {
      console.error(`Error reading note ${note.id}:`, error);
    }
  }

  // Sort by updatedAt descending
  return notesWithContent.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Get a single note by ID
 */
export async function getNoteById(id: string): Promise<(StoredNote & { fullText: string }) | null> {
  const metadata = await loadMetadata();
  const note = metadata.notes.find(n => n.id === id);

  if (!note) return null;

  try {
    const content = await FileSystem.readAsStringAsync(`${getNotesDir()}${note.filename}`);
    return { ...note, fullText: content };
  } catch (error) {
    console.error(`Error reading note ${id}:`, error);
    return null;
  }
}

/**
 * Create a new note
 */
export async function createNote(params: {
  title: string;
  content: string;
  category?: StoredNote['category'];
  label?: string;
}): Promise<StoredNote> {
  const id = `note-${Date.now()}`;
  const filename = generateFilename(params.title, id);
  const now = new Date().toISOString();

  const note: StoredNote = {
    id,
    title: params.title,
    filename,
    category: params.category || 'other',
    label: params.label || 'Personal',
    createdAt: now,
    updatedAt: now,
    practiceCount: 0,
    hasFeedback: false,
    timeSpentMinutes: 0,
  };

  await ensureNotesDir();

  // Save content as txt file
  await FileSystem.writeAsStringAsync(`${getNotesDir()}${filename}`, params.content);

  // Update metadata
  const metadata = await loadMetadata();
  metadata.notes.push(note);
  await saveMetadata(metadata);

  return note;
}

/**
 * Update an existing note
 */
export async function updateNote(
  id: string,
  params: {
    title?: string;
    content?: string;
    category?: StoredNote['category'];
    label?: string;
    score?: number;
    hasFeedback?: boolean;
    timeSpentMinutes?: number;
  }
): Promise<StoredNote | null> {
  const metadata = await loadMetadata();
  const noteIndex = metadata.notes.findIndex(n => n.id === id);

  if (noteIndex === -1) return null;

  const note = metadata.notes[noteIndex];
  const now = new Date().toISOString();

  // Update content file if provided
  if (params.content !== undefined) {
    await FileSystem.writeAsStringAsync(`${getNotesDir()}${note.filename}`, params.content);
  }

  // Update title and filename if title changed
  if (params.title && params.title !== note.title) {
    const newFilename = generateFilename(params.title, id);

    // Rename file
    const oldPath = `${getNotesDir()}${note.filename}`;
    const newPath = `${getNotesDir()}${newFilename}`;

    try {
      const content = await FileSystem.readAsStringAsync(oldPath);
      await FileSystem.writeAsStringAsync(newPath, params.content ?? content);
      await FileSystem.deleteAsync(oldPath);
      note.filename = newFilename;
    } catch (error) {
      console.error('Error renaming note file:', error);
    }

    note.title = params.title;
  }

  // Update other fields
  if (params.category) note.category = params.category;
  if (params.label) note.label = params.label;
  if (params.score !== undefined) note.score = params.score;
  if (params.hasFeedback !== undefined) note.hasFeedback = params.hasFeedback;
  if (params.timeSpentMinutes !== undefined) {
    note.timeSpentMinutes += params.timeSpentMinutes;
  }

  note.updatedAt = now;
  metadata.notes[noteIndex] = note;
  await saveMetadata(metadata);

  return note;
}

/**
 * Increment practice count for a note
 */
export async function incrementPracticeCount(id: string): Promise<void> {
  const metadata = await loadMetadata();
  const note = metadata.notes.find(n => n.id === id);

  if (note) {
    note.practiceCount += 1;
    note.updatedAt = new Date().toISOString();
    await saveMetadata(metadata);
  }
}

/**
 * Delete a note
 */
export async function deleteNote(id: string): Promise<boolean> {
  const metadata = await loadMetadata();
  const noteIndex = metadata.notes.findIndex(n => n.id === id);

  if (noteIndex === -1) return false;

  const note = metadata.notes[noteIndex];

  try {
    // Delete the txt file
    await FileSystem.deleteAsync(`${getNotesDir()}${note.filename}`);

    // Remove from metadata
    metadata.notes.splice(noteIndex, 1);
    await saveMetadata(metadata);

    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
}

/**
 * Export a note as a shareable txt file (returns the file URI)
 */
export async function exportNote(id: string): Promise<string | null> {
  const note = await getNoteById(id);
  if (!note) return null;

  return `${getNotesDir()}${note.filename}`;
}

/**
 * Get notes directory info (for debugging)
 */
export async function getNotesDirectoryInfo(): Promise<{
  path: string;
  totalNotes: number;
  totalSize: number;
}> {
  const metadata = await loadMetadata();
  let totalSize = 0;

  for (const note of metadata.notes) {
    try {
      const info = await FileSystem.getInfoAsync(`${getNotesDir()}${note.filename}`);
      if (info.exists && 'size' in info) {
        totalSize += info.size;
      }
    } catch {
      // Skip
    }
  }

  return {
    path: getNotesDir(),
    totalNotes: metadata.notes.length,
    totalSize,
  };
}
