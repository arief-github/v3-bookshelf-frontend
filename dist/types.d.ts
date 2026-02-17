export interface Book {
    id: number;
    title: string;
    author: string;
    year: number;
    isComplete: boolean;
}
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
export type BookFilterCondition = {
    isComplete: boolean;
};
