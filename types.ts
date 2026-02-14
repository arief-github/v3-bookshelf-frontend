// Book interface definition
export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  isComplete: boolean;
}

// DOM Element type helpers
export type BookFormElements = {
  bookFormTitle: HTMLInputElement;
  bookFormAuthor: HTMLInputElement;
  bookFormYear: HTMLInputElement;
  bookFormIsComplete: HTMLInputElement;
};

export type EditFormElements = {
  editBookTitle: HTMLInputElement;
  editBookAuthor: HTMLInputElement;
  editBookYear: HTMLInputElement;
  editBookIsComplete: HTMLInputElement;
};

// Event handler type definitions
export type BookFilterCondition = (book: Book) => boolean;
