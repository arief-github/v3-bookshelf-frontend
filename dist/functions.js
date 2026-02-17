import { createBookElement, showEmptyMessage } from "./helper.js";
const STORAGE_KEY = "BOOKSHELF_APPS";
const RENDER_EVENT = "render-books";
let books = [];
function getFormElements(form) {
    return form.elements;
}
export function initializeApp() {
    document.addEventListener("DOMContentLoaded", () => {
        setupEventListeners();
        loadBooksFromStorage();
    });
}
function loadBooksFromStorage() {
    const storedBooks = localStorage.getItem(STORAGE_KEY);
    books = storedBooks ? JSON.parse(storedBooks) : [];
    document.dispatchEvent(new Event(RENDER_EVENT));
}
function saveBooks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    document.dispatchEvent(new Event(RENDER_EVENT));
}
function setupEventListeners() {
    const bookForm = document.getElementById("bookForm");
    bookForm.addEventListener("submit", handleAddBook);
    const isCompleteCheckbox = document.getElementById("bookFormIsComplete");
    isCompleteCheckbox.addEventListener("change", handleIsCompleteCheckboxChange);
    document.addEventListener(RENDER_EVENT, renderBooks);
    document.addEventListener("click", handleDocumentClickDelegation);
    const closeModalButton = document.querySelector(".close-modal");
    closeModalButton.addEventListener("click", handleCloseModal);
    const searchForm = document.getElementById("searchBook");
    searchForm.addEventListener("submit", handleSearch);
    const editForm = document.getElementById("editBookForm");
    editForm.addEventListener("submit", handleEditBook);
    window.addEventListener("storage", handleStorageChange);
}
function handleStorageChange(event) {
    if (event.key === STORAGE_KEY) {
        loadBooksFromStorage();
    }
}
function handleAddBook(event) {
    event.preventDefault();
    const form = event.target;
    const { title, author, year, isComplete } = getFormElements(form);
    const newBook = {
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
function handleIsCompleteCheckboxChange(event) {
    const checkbox = event.target;
    const buttonSpan = document.querySelector('#bookFormSubmit span');
    if (buttonSpan) {
        buttonSpan.textContent = checkbox.checked
            ? "Selesai dibaca"
            : "Belum selesai dibaca";
    }
}
function renderBooks() {
    const incompleteBookList = document.getElementById("incompleteBookList");
    const completeBookList = document.getElementById("completeBookList");
    incompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";
    renderBookList(incompleteBookList, { isComplete: false });
    renderBookList(completeBookList, { isComplete: true });
    showEmptyMessage(incompleteBookList, "No books on the unfinished shelf yet");
    showEmptyMessage(completeBookList, "No books on the finished shelf yet");
}
function renderBookList(container, filter) {
    const filteredBooks = books.filter((book) => book.isComplete === filter.isComplete);
    for (const book of filteredBooks) {
        const bookItem = createBookElement(book);
        container.append(bookItem);
    }
}
function handleDocumentClickDelegation(event) {
    const target = event.target;
    const bookItem = target.closest("[data-bookid]");
    if (!bookItem)
        return;
    const bookId = Number(bookItem.dataset.bookid);
    if (target.closest('[data-testid="bookItemIsCompleteButton"]')) {
        toggleBookCompletion(bookId);
    }
    else if (target.closest('[data-testid="bookItemEditButton"]')) {
        openEditModal(bookId);
    }
    else if (target.closest('[data-testid="bookItemDeleteButton"]')) {
        deleteBook(bookId);
    }
}
function toggleBookCompletion(bookId) {
    const book = books.find((b) => b.id === bookId);
    if (book) {
        book.isComplete = !book.isComplete;
        saveBooks();
    }
}
function deleteBook(bookId) {
    const bookIndex = books.findIndex((b) => b.id === bookId);
    if (bookIndex > -1) {
        if (window.confirm("Are you sure you want to delete this book?")) {
            books.splice(bookIndex, 1);
            saveBooks();
        }
    }
}
function openEditModal(bookId) {
    const book = books.find((b) => b.id === bookId);
    if (!book)
        return;
    const modal = document.getElementById("editModal");
    const form = document.getElementById("editBookForm");
    const { title, author, year, isComplete } = getFormElements(form);
    form.dataset.bookid = String(bookId);
    title.value = book.title;
    author.value = book.author;
    year.value = String(book.year);
    isComplete.checked = book.isComplete;
    modal.classList.add("active");
}
function handleCloseModal() {
    const modal = document.getElementById("editModal");
    modal.classList.remove("active");
}
function handleEditBook(event) {
    event.preventDefault();
    const form = event.target;
    const bookId = Number(form.dataset.bookid);
    const { title, author, year, isComplete } = getFormElements(form);
    const book = books.find((b) => b.id === bookId);
    if (book) {
        book.title = title.value;
        book.author = author.value;
        book.year = Number(year.value);
        book.isComplete = isComplete.checked;
        saveBooks();
    }
    handleCloseModal();
}
function handleSearch(event) {
    event.preventDefault();
    const form = event.target;
    const { searchTitle } = getFormElements(form);
    const query = searchTitle.value.toLowerCase();
    const allBooks = document.querySelectorAll("[data-bookid]");
    allBooks.forEach((bookElement) => {
        const title = bookElement
            .querySelector("h3")
            ?.textContent?.toLowerCase();
        const bookItem = bookElement;
        if (title.includes(query)) {
            bookItem.style.display = "";
        }
        else {
            bookItem.style.display = "none";
        }
    });
}
//# sourceMappingURL=functions.js.map