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
  title: HTMLInputElement;
  author: HTMLInputElement;
  year: HTMLInputElement;
  isComplete: HTMLInputElement;
};

export type EditFormElements = {
  title: HTMLInputElement;
  author: HTMLInputElement;
  year: HTMLInputElement;
};

// Book filter condition
export type BookFilterCondition = {
  isComplete: boolean;
};
