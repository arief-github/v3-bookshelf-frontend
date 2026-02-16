import { createBookElement, showEmptyMessage } from '../src/helper';
import { Book } from '../src/types';

document.body.innerHTML = `
  <div id="incompleteBookList"></div>
  <div id="completeBookList"></div>
  <div id="searchBookTitle"></div>
  <div id="searchSubmit"></div>
`;

const incompleteBookList = document.getElementById('incompleteBookList') as HTMLDivElement;
const completeBookList = document.getElementById('completeBookList') as HTMLDivElement;
const searchBookTitle = document.getElementById('searchBookTitle') as HTMLInputElement;
const searchSubmit = document.getElementById('searchSubmit') as HTMLButtonElement;

describe('Bookshelf App', () => {
  let books: Book[] = [];

  beforeEach(() => {
    books = [
      { id: 1, title: 'Buku A', author: 'Penulis A', year: 2021, isComplete: false },
      { id: 2, title: 'Buku B', author: 'Penulis B', year: 2022, isComplete: true },
      { id: 3, title: 'Buku C', author: 'Penulis C', year: 2023, isComplete: false },
    ];
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    renderBooks(books);
  });

  const renderBooks = (booksToRender: Book[]) => {
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    booksToRender.forEach(book => {
      const bookElement = createBookElement(book);
      if (book.isComplete) {
        completeBookList.appendChild(bookElement);
      } else {
        incompleteBookList.appendChild(bookElement);
      }
    });
  };

  test('should load and display books', () => {
    expect(incompleteBookList.children.length).toBe(2);
    expect(completeBookList.children.length).toBe(1);
  });

  test('should filter books based on search title', () => {
    searchBookTitle.value = 'Buku A';
    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchBookTitle.value.toLowerCase()));
    renderBooks(filteredBooks);
    expect(incompleteBookList.children.length).toBe(1);
    expect(completeBookList.children.length).toBe(0);
  });

  test('should create a new book', () => {
    const newBook: Book = { id: 4, title: 'Buku D', author: 'Penulis D', year: 2024, isComplete: false };
    books.push(newBook);
    renderBooks(books);
    expect(incompleteBookList.children.length).toBe(3);
  });

  test('should edit a book', () => {
    const bookToEdit = books.find(book => book.id === 1);
    if (bookToEdit) {
      bookToEdit.title = 'Buku A Updated';
    }
    renderBooks(books);
    const editedBookElement = incompleteBookList.querySelector('[data-bookid="1"]');
    expect(editedBookElement?.querySelector('h3')?.textContent).toBe('Buku A Updated');
  });

  test('should delete a book', () => {
    books = books.filter(book => book.id !== 1);
    renderBooks(books);
    expect(incompleteBookList.children.length).toBe(1);
  });

  test('should move a book to the completed list', () => {
    const bookToMove = books.find(book => book.id === 1);
    if (bookToMove) {
      bookToMove.isComplete = true;
    }
    renderBooks(books);
    expect(incompleteBookList.children.length).toBe(1);
    expect(completeBookList.children.length).toBe(2);
  });

  test('should move a book back to the incomplete list', () => {
    const bookToMove = books.find(book => book.id === 2);
    if (bookToMove) {
      bookToMove.isComplete = false;
    }
    renderBooks(books);
    expect(incompleteBookList.children.length).toBe(3);
    expect(completeBookList.children.length).toBe(0);
  });

  test('should show a message when a list is empty', () => {
    books = [];
    renderBooks(books);
    showEmptyMessage(incompleteBookList, 'No books to show');
    expect(incompleteBookList.children.length).toBe(1);
    expect(incompleteBookList.firstElementChild?.textContent).toContain('No books to show');
  });
});