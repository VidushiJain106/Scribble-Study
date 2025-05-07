
// These types complement the automatically generated types from Supabase
// and provide additional typing for our application

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteAnalysisDB {
  id: string;
  note_id: string;
  main_topic: string;
  concepts: string[];
  ready_for_explanation: boolean;
  created_at: string;
}

export interface ExplanationDB {
  id: string;
  note_id: string;
  topic: string;
  title: string;
  content: {
    title: string;
    sections: { title: string; content: string }[];
    summary: string;
    furtherResources?: string[];
  };
  created_at: string;
}

export interface QuizDB {
  id: string;
  note_id: string;
  topic: string;
  introduction: string;
  questions: {
    id: string;
    question: string;
    difficulty: "easy" | "moderate" | "hard";
    hint?: string;
    explanation?: string;
  }[];
  created_at: string;
}

export interface QuizAnswerDB {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  feedback: string | null;
  created_at: string;
}

export interface Tables {
  profiles: {
    Row: Profile;
    Insert: Omit<Profile, "created_at" | "updated_at">;
    Update: Partial<Omit<Profile, "created_at" | "id">>;
  };
  note_analyses: {
    Row: NoteAnalysisDB;
    Insert: Omit<NoteAnalysisDB, "id" | "created_at">;
    Update: Partial<Omit<NoteAnalysisDB, "id" | "created_at">>;
  };
  explanations: {
    Row: ExplanationDB;
    Insert: Omit<ExplanationDB, "id" | "created_at">;
    Update: Partial<Omit<ExplanationDB, "id" | "created_at">>;
  };
  quizzes: {
    Row: QuizDB;
    Insert: Omit<QuizDB, "id" | "created_at">;
    Update: Partial<Omit<QuizDB, "id" | "created_at">>;
  };
  quiz_answers: {
    Row: QuizAnswerDB;
    Insert: Omit<QuizAnswerDB, "id" | "created_at">;
    Update: Partial<Omit<QuizAnswerDB, "id" | "created_at">>;
  };
}

// Type for custom PostgreSQL functions
export interface Functions {
  get_current_user_id: {
    Args: Record<string, never>;
    Returns: string | null;
  };
  handle_new_user: {
    Args: Record<string, never>;
    Returns: undefined;
  };
}

// Helper type for creating properly typed Supabase queries
export type TablesInsert<T extends keyof Tables> = Tables[T]["Insert"];
export type TablesUpdate<T extends keyof Tables> = Tables[T]["Update"];
export type TablesRow<T extends keyof Tables> = Tables[T]["Row"];
