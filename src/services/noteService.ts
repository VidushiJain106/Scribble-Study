
import { supabase } from "@/integrations/supabase/client";
import { Note, DrawPath, Attachment, NoteCategory, NoteColor } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Get all notes for the current user
export async function getNotes() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getNotes:", error);
    return { data: null, error };
  }
}

// Create a new note
export async function createNote(category: NoteCategory = "uncategorized", color: NoteColor = "purple") {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.user.id,
        title: "Untitled Note",
        content: "",
        category,
        color,
        has_attachments: false,
        has_drawings: false
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating note:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in createNote:", error);
    return { data: null, error };
  }
}

// Update an existing note
export async function updateNote(noteId: string, updates: Partial<Omit<Note, "id">>) {
  try {
    const { data, error } = await supabase
      .from("notes")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", noteId)
      .select()
      .single();

    if (error) {
      console.error("Error updating note:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in updateNote:", error);
    return { data: null, error };
  }
}

// Delete a note
export async function deleteNote(noteId: string) {
  try {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      console.error("Error deleting note:", error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error("Error in deleteNote:", error);
    return { error };
  }
}

// Add a drawing to a note
export async function addDrawingToNote(noteId: string, paths: DrawPath[]) {
  try {
    // First, create the drawing
    const { data: drawingData, error: drawingError } = await supabase
      .from("drawings")
      .insert({
        note_id: noteId,
        paths
      })
      .select()
      .single();

    if (drawingError) {
      console.error("Error adding drawing:", drawingError);
      return { data: null, error: drawingError };
    }

    // Then, update the note to indicate it has drawings
    const { error: noteError } = await supabase
      .from("notes")
      .update({
        has_drawings: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", noteId);

    if (noteError) {
      console.error("Error updating note with drawing info:", noteError);
      return { data: null, error: noteError };
    }

    return { data: drawingData, error: null };
  } catch (error) {
    console.error("Error in addDrawingToNote:", error);
    return { data: null, error };
  }
}

// Add an attachment to a note
export async function addAttachmentToNote(noteId: string, attachment: Omit<Attachment, "id" | "createdAt">) {
  try {
    // First, create the attachment
    const { data: attachmentData, error: attachmentError } = await supabase
      .from("attachments")
      .insert({
        note_id: noteId,
        name: attachment.name,
        type: attachment.type,
        url: attachment.url,
        size: attachment.size || 0
      })
      .select()
      .single();

    if (attachmentError) {
      console.error("Error adding attachment:", attachmentError);
      return { data: null, error: attachmentError };
    }

    // Then, update the note to indicate it has attachments
    const { error: noteError } = await supabase
      .from("notes")
      .update({
        has_attachments: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", noteId);

    if (noteError) {
      console.error("Error updating note with attachment info:", noteError);
      return { data: null, error: noteError };
    }

    return { data: attachmentData, error: null };
  } catch (error) {
    console.error("Error in addAttachmentToNote:", error);
    return { data: null, error };
  }
}

// Remove an attachment from a note
export async function removeAttachmentFromNote(noteId: string, attachmentId: string) {
  try {
    // Delete the attachment
    const { error: attachmentError } = await supabase
      .from("attachments")
      .delete()
      .eq("id", attachmentId);

    if (attachmentError) {
      console.error("Error removing attachment:", attachmentError);
      return { error: attachmentError };
    }

    // Check if the note still has any attachments
    const { data: remainingAttachments, error: countError } = await supabase
      .from("attachments")
      .select("id")
      .eq("note_id", noteId);

    if (countError) {
      console.error("Error checking remaining attachments:", countError);
      return { error: countError };
    }

    // Update the note's has_attachments flag if needed
    if (!remainingAttachments || remainingAttachments.length === 0) {
      const { error: noteError } = await supabase
        .from("notes")
        .update({
          has_attachments: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", noteId);

      if (noteError) {
        console.error("Error updating note after attachment removal:", noteError);
        return { error: noteError };
      }
    }

    return { error: null };
  } catch (error) {
    console.error("Error in removeAttachmentFromNote:", error);
    return { error };
  }
}

// Get all attachments for a note
export async function getNoteAttachments(noteId: string) {
  try {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("note_id", noteId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching attachments:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getNoteAttachments:", error);
    return { data: null, error };
  }
}

// Get all drawings for a note
export async function getNoteDrawings(noteId: string) {
  try {
    const { data, error } = await supabase
      .from("drawings")
      .select("*")
      .eq("note_id", noteId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching drawings:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getNoteDrawings:", error);
    return { data: null, error };
  }
}
