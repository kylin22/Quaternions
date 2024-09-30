export interface Part {
    title: string;
    foreword: string;
    chapters: Record<string, Chapter>;
}

export interface Chapter {
    title: string;
    text: string;
    subChapters?: Record<string, SubChapter>; // Optional because not all chapters have subChapters
}
  
export interface SubChapter {
    title: string;
    text: string;
}