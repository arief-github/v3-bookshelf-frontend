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
    setupEventListeners();
    loadBooksFromStorage();
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

  const searchForm = document.getElementById("searchBook") as HTMLFormElement;
  searchForm.addEventListener("submit", handleSearch);

  const editForm = document.getElementById("editBookForm") as HTMLFormElement;
  editForm.addEventListener("submit", handleEditBook);
  
  window.addEventListener("storage", handleStorageChange);
}

// Handle changes to localStorage from other tabs
function handleStorageChange(event: StorageEvent): void {
  if (event.key === STORAGE_KEY) {
    loadBooksFromStorage();
  }
}

// Handle the book form submission
function handleAddBook(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const { title, author, year, isComplete } =
    getFormElements<BookFormElements>(form);

  const newBook: Book = {
    id: +new Date(),
    title: title.value,
    author: author.value,
    year: Number(year.value),
    isComplete: isComplete.checked,
  };

  books.push(newBook);
  saveBooks();
  form.reset();
}

// Update the label for the isComplete checkbox
function handleIsCompleteCheckboxChange(event: Event): void {
  const checkbox = event.target as HTMLInputElement;
  const label = document.querySelector(
    'label[for="bookFormIsComplete"] span',
  ) as HTMLElement;
  label.textContent = checkbox.checked
    ? "Finished reading"
    : "Not finished yet";
}

// Render books to the DOM
function renderBooks(): void {
  const incompleteBookList = document.getElementById(
    "incompleteBookList",
  ) as HTMLElement;
  const completeBookList = document.getElementById(
    "completeBookList",
  ) as HTMLElement;

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  renderBookList(incompleteBookList, { isComplete: false });
  renderBookList(completeBookList, { isComplete: true });

  showEmptyMessage(
    incompleteBookList,
    "No books on the unfinished shelf yet",
  );
  showEmptyMessage(completeBookList, "No books on the finished shelf yet");
}

function renderBookList(
  container: HTMLElement,
  filter: BookFilterCondition,
): void {
  const filteredBooks = books.filter(
    (book) => book.isComplete === filter.isComplete,
  );
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

function deleteBook(bookId: number): void {
  const bookIndex = books.findIndex((b) => b.id === bookId);
  if (bookIndex > -1) {
    if (window.confirm("Are you sure you want to delete this book?")) {
      books.splice(bookIndex, 1);
      saveBooks();
    }
  }
}

function openEditModal(bookId: number): void {
  const book = books.find((b) => b.id === bookId);
  if (!book) return;

  const modal = document.getElementById("editModal") as HTMLElement;
  const form = document.getElementById("editBookForm") as HTMLFormElement;
  const { title, author, year } = getFormElements<EditFormElements>(form);

  form.dataset.bookid = String(bookId);
  title.value = book.title;
  author.value = book.author;
  year.value = String(book.year);

  modal.classList.add("active");
}

function handleCloseModal(): void {
  const modal = document.getElementById("editModal") as HTMLElement;
  modal.classList.remove("active");
}

function handleEditBook(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const bookId = Number(form.dataset.bookid);
  const { title, author, year } = getFormElements<EditFormElements>(form);

  const book = books.find((b) => b.id === bookId);
  if (book) {
    book.title = title.value;
    book.author = author.value;
    book.year = Number(year.value);
    saveBooks();
  }

  handleCloseModal();
}

function handleSearch(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const { searchTitle } = getFormElements<{ searchTitle: HTMLInputElement }>(
    form,
  );
  const query = searchTitle.value.toLowerCase();

  const allBooks = document.querySelectorAll("[data-bookid]");
  allBooks.forEach((bookElement) => {
    const title = bookElement
      .querySelector("h3")
      ?.textContent?.toLowerCase() as string;
    const bookItem = bookElement as HTMLElement;

    if (title.includes(query)) {
      bookItem.style.display = "";
    } else {
      bookItem.style.display = "none";
    }
  });
}
