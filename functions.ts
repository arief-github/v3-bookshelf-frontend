import { createBookElement, showEmptyMessage } from "./helper.js";
import {
  Book,
  BookFilterCondition,
  BookFormElements,
  EditFormElements,
} from "./types.js";

const STORAGE_KEY = "BOOKSHELF_APPS";
const RENDER_EVENT = "render-books";

let books: Book[] = [];

// Helper to get typed form elements
function getFormElements<T>(form: HTMLFormElement): T {
  return form.elements as unknown as T;
}

// Function to initialize the application
export function initializeApp(): void {
  document.addEventListener("DOMContentLoaded", () => {
    loadBooksFromStorage();
    setupEventListeners();
  });
}

// Load books from localStorage
function loadBooksFromStorage(): void {
  const storedBooks = localStorage.getItem(STORAGE_KEY);
  books = storedBooks ? JSON.parse(storedBooks) : [];
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// Save books to localStorage and dispatch render event
function saveBooks(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// Setup all event listeners
function setupEventListeners(): void {
  const bookForm = document.getElementById("bookForm") as HTMLFormElement;
  bookForm.addEventListener("submit", handleAddBook);

  const isCompleteCheckbox = document.getElementById(
    "bookFormIsComplete",
  ) as HTMLInputElement;
  isCompleteCheckbox.addEventListener("change", handleIsCompleteCheckboxChange);

  document.addEventListener(RENDER_EVENT, renderBooks);

  document.addEventListener("click", handleDocumentClickDelegation);

  const closeModalButton = document.querySelector(
    ".close-modal",
  ) as HTMLButtonElement;
  closeModalButton.addEventListener("click", handleCloseModal);

  const editBookForm = document.getElementById("editBookForm") as HTMLFormElement;
  editBookForm.addEventListener("submit", handleEditBookFormSubmit);

  const searchBookTitle = document.getElementById(
    "searchBookTitle",
  ) as HTMLInputElement;
  searchBookTitle.addEventListener("input", handleSearch);
}

// Handle new book submission
function handleAddBook(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const elements = getFormElements<BookFormElements>(form);

  const newBook: Book = {
    id: Date.now(),
    title: elements.bookFormTitle.value,
    author: elements.bookFormAuthor.value,
    year: parseInt(elements.bookFormYear.value, 10),
    isComplete: elements.bookFormIsComplete.checked,
  };

  books.push(newBook);
  saveBooks();
  form.reset();
}

// Handle "isComplete" checkbox change in the add book form
function handleIsCompleteCheckboxChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  const submitSpan = document.querySelector(
    "#bookFormSubmit span",
  ) as HTMLSpanElement;
  submitSpan.textContent = target.checked
    ? "Selesai dibaca"
    : "Belum selesai dibaca";
}

// Render books to the DOM
function renderBooks(): void {
  renderBookList("incompleteBookList", (book) => !book.isComplete);
  renderBookList("completeBookList", (book) => book.isComplete);
}

function renderBookList(
  containerId: string,
  filterCondition: BookFilterCondition,
): void {
  const container = document.getElementById(containerId) as HTMLElement;
  container.innerHTML = "";
  const filteredBooks = books.filter(filterCondition);

  if (filteredBooks.length === 0) {
    showEmptyMessage(container, "Tidak ada buku di rak ini.");
    return;
  }

  for (const book of filteredBooks) {
    const bookItem = createBookElement(book);
    container.append(bookItem);
  }
}

// Handle clicks on the document for toggling, editing, and deleting books
function handleDocumentClickDelegation(event: Event): void {
  const target = event.target as HTMLElement;
  const bookItem = target.closest("[data-bookid]") as HTMLElement;
  if (!bookItem) return;

  const bookId = Number(bookItem.dataset.bookid);

  if (target.closest('[data-testid="bookItemIsCompleteButton"]')) {
    toggleBookCompletion(bookId);
  } else if (target.closest('[data-testid="bookItemEditButton"]')) {
    openEditModal(bookId);
  } else if (target.closest('[data-testid="bookItemDeleteButton"]')) {
    deleteBook(bookId);
  }
}

function toggleBookCompletion(bookId: number): void {
  const book = books.find((b) => b.id === bookId);
  if (book) {
    book.isComplete = !book.isComplete;
    saveBooks();
  }
}

function openEditModal(bookId: number): void {
  const book = books.find((b) => b.id === bookId);
  if (book) {
    const editBookForm = document.getElementById(
      "editBookForm",
    ) as HTMLFormElement;
    const elements = getFormElements<EditFormElements>(editBookForm);

    elements.editBookTitle.value = book.title;
    elements.editBookAuthor.value = book.author;
    elements.editBookYear.value = book.year.toString();
    elements.editBookIsComplete.checked = book.isComplete;

    editBookForm.dataset.bookid = bookId.toString();

    const modal = document.getElementById("editModal") as HTMLElement;
    modal.classList.add("active");
  }
}

function handleCloseModal(): void {
  const modal = document.getElementById("editModal") as HTMLElement;
  modal.classList.remove("active");
}

function handleEditBookFormSubmit(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const bookId = Number(form.dataset.bookid);
  const book = books.find((b) => b.id === bookId);

  if (book) {
    const elements = getFormElements<EditFormElements>(form);

    book.title = elements.editBookTitle.value;
    book.author = elements.editBookAuthor.value;
    book.year = Number(elements.editBookYear.value);
    book.isComplete = elements.editBookIsComplete.checked;

    saveBooks();
    handleCloseModal();
  }
}

function deleteBook(bookId: number): void {
  if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
    const bookIndex = books.findIndex((b) => b.id === bookId);
    if (bookIndex !== -1) {
      books.splice(bookIndex, 1);
      saveBooks();
    }
  }
}

function handleSearch(): void {
  const searchInput = document.getElementById(
    "searchBookTitle",
  ) as HTMLInputElement;
  const searchTerm = searchInput.value.toLowerCase();

  const filteredBooks = searchTerm
    ? books.filter((book) => book.title.toLowerCase().includes(searchTerm))
    : books;

  searchRender(
    "incompleteBookList",
    filteredBooks,
    (book) => !book.isComplete,
    searchTerm,
  );
  searchRender(
    "completeBookList",
    filteredBooks,
    (book) => book.isComplete,
    searchTerm,
  );
}

function searchRender(
  containerId: string,
  allBooks: Book[],
  filterCondition: BookFilterCondition,
  searchTerm: string,
) {
  const container = document.getElementById(containerId) as HTMLElement;
  container.innerHTML = "";
  const booksToList = allBooks.filter(filterCondition);

  if (books.length === 0) {
    showEmptyMessage(container, "Tidak Ada Buku Tersedia");
    return;
  }

  if (searchTerm && booksToList.length === 0) {
    showEmptyMessage(container, "Buku Tidak Ditemukan");
    return;
  }

  if (booksToList.length === 0) {
    showEmptyMessage(container, "Tidak ada buku di rak ini.");
    return;
  }

  for (const book of booksToList) {
    const bookItem = createBookElement(book);
    container.append(bookItem);
  }
}
