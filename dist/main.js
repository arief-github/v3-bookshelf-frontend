import { createBookElement, showEmptyMessage } from "./helper.js";

const STORAGE_KEY = "BOOKSHELF_APPS";
const RENDER_EVENT = "render-books";

let books = [];

// Memuat data buku dari localStorage ketika DOM telah dimuat sepenuhnya
// Jika tidak ada data, inisialisasi dengan array kosong
document.addEventListener("DOMContentLoaded", () => {
  const storedBooks = localStorage.getItem(STORAGE_KEY);
  books = storedBooks ? JSON.parse(storedBooks) : [];
  document.dispatchEvent(new Event(RENDER_EVENT));
});

/**
 * =============== FITUR TAMBAH DATA BUKU =======================
 *
 */

const bookForm = document.getElementById("bookForm");
if (!bookForm) {
  throw new Error('Form dengan ID "bookForm" tidak ditemukan');
}

bookForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const titleInput = document.getElementById("bookFormTitle");
  const authorInput = document.getElementById("bookFormAuthor");
  const yearInput = document.getElementById("bookFormYear");
  const isCompleteInput = document.getElementById("bookFormIsComplete");

  if (!titleInput || !authorInput || !yearInput || !isCompleteInput) {
    throw new Error("Satu atau lebih input form tidak ditemukan");
  }

  const title = titleInput.value;
  const author = authorInput.value;
  const year = parseInt(yearInput.value, 10);
  const isComplete = isCompleteInput.checked;

  const book = {
    id: Date.now(),
    title,
    author,
    year,
    isComplete,
  };

  books.push(book);

  // Update localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));

  // Reset formulir
  bookForm.reset();

  // Trigger render event
  document.dispatchEvent(new Event(RENDER_EVENT));
});

/**
 * =============== FITUR PERPINDAHAN STATUS DAN RENDER ELEMEN BUKU =======================
 *
 */

const isCompleteCheckbox = document.getElementById("bookFormIsComplete");
const submitSpan = document.querySelector("#bookFormSubmit span");

if (!isCompleteCheckbox || !submitSpan) {
  throw new Error("Checkbox atau span submit tidak ditemukan");
}

isCompleteCheckbox.addEventListener("change", (e) => {
  const target = e.target;
  submitSpan.textContent = target.checked
    ? "Selesai dibaca"
    : "Belum selesai dibaca";
});

function renderBooks(containerId, filterCondition) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container dengan ID "${containerId}" tidak ditemukan`);
    return;
  }

  container.innerHTML = "";

  const filteredBooks = books.filter(filterCondition);

  for (const book of filteredBooks) {
    const bookItem = createBookElement(book);
    container.append(bookItem);
  }
}

document.addEventListener(RENDER_EVENT, () => {
  // Render incomplete books
  renderBooks("incompleteBookList", (book) => !book.isComplete);

  // Render complete books
  renderBooks("completeBookList", (book) => book.isComplete);
});

// Handle book completion toggle
document.addEventListener("click", (e) => {
  const target = e.target;
  const toggleButton = target.closest(
    '[data-testid="bookItemIsCompleteButton"]',
  );
  if (!toggleButton) return;

  const bookItem = toggleButton.closest("[data-bookid]");
  if (!bookItem || !bookItem.dataset.bookid) return;

  const bookId = Number(bookItem.dataset.bookid);
  const book = books.find((b) => b.id === bookId);

  if (book) {
    // Toggle completion status
    book.isComplete = !book.isComplete;

    // Save to storage and re-render
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
});

/**
 * =============== FITUR EDIT =======================
 *
 */

// Handle edit button clicks
document.addEventListener("click", (e) => {
  const target = e.target;
  const editButton = target.closest('[data-testid="bookItemEditButton"]');
  if (!editButton) return;

  const bookItem = editButton.closest("[data-bookid]");
  if (!bookItem || !bookItem.dataset.bookid) return;

  const bookId = Number(bookItem.dataset.bookid);
  const book = books.find((b) => b.id === bookId);

  if (book) {
    const editTitleInput = document.getElementById("editBookTitle");
    const editAuthorInput = document.getElementById("editBookAuthor");
    const editYearInput = document.getElementById("editBookYear");
    const editIsCompleteInput = document.getElementById("editBookIsComplete");
    const editBookForm = document.getElementById("editBookForm");

    if (
      !editTitleInput ||
      !editAuthorInput ||
      !editYearInput ||
      !editIsCompleteInput ||
      !editBookForm
    ) {
      console.error("Satu atau lebih input form edit tidak ditemukan");
      return;
    }

    // Populate edit form dengan book data
    editTitleInput.value = book.title;
    editAuthorInput.value = book.author;
    editYearInput.value = book.year.toString();
    editIsCompleteInput.checked = book.isComplete;

    // Store book ID for saving changes
    editBookForm.dataset.bookid = bookId.toString();

    // tampilkan modal
    const modal = document.getElementById("editModal");
    if (modal) {
      modal.classList.add("active");
    }
  }
});

// Handle modal close button
const closeModal = document.querySelector(".close-modal");
if (closeModal) {
  closeModal.addEventListener("click", () => {
    const modal = document.getElementById("editModal");
    if (modal) {
      modal.classList.remove("active");
    }
  });
}

// Handle edit form submission
const editBookForm = document.getElementById("editBookForm");
if (editBookForm) {
  editBookForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const target = e.target;
    if (!target.dataset.bookid) return;

    const bookId = Number(target.dataset.bookid);
    const book = books.find((b) => b.id === bookId);

    if (book) {
      const editTitleInput = document.getElementById("editBookTitle");
      const editAuthorInput = document.getElementById("editBookAuthor");
      const editYearInput = document.getElementById("editBookYear");
      const editIsCompleteInput = document.getElementById("editBookIsComplete");

      if (
        !editTitleInput ||
        !editAuthorInput ||
        !editYearInput ||
        !editIsCompleteInput
      ) {
        console.error("Satu atau lebih input form edit tidak ditemukan");
        return;
      }

      // Update book data
      book.title = editTitleInput.value;
      book.author = editAuthorInput.value;
      book.year = Number(editYearInput.value);
      book.isComplete = editIsCompleteInput.checked;

      // Simpan and re-render
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      document.dispatchEvent(new Event(RENDER_EVENT));

      // Close modal
      const modal = document.getElementById("editModal");
      if (modal) {
        modal.classList.remove("active");
      }
    }
  });
}

/**
 * =============== FITUR HAPUS =======================
 *
 */

// Handle delete button click
document.addEventListener("click", (e) => {
  const target = e.target;
  const deleteButton = target.closest('[data-testid="bookItemDeleteButton"]');
  if (!deleteButton) return;

  const bookItem = deleteButton.closest("[data-bookid]");
  if (!bookItem || !bookItem.dataset.bookid) return;

  const bookId = Number(bookItem.dataset.bookid);

  // Dialog Konfirmasi penghapusan
  if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
    // Hapus buku dari array
    const bookIndex = books.findIndex((b) => b.id === bookId);
    if (bookIndex !== -1) {
      books.splice(bookIndex, 1);

      // Update localStorage dan re-render
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  }
});

/**
 * =============== FITUR PENCARIAN =======================
 *
 */

function handleSearchInput() {
  const searchInput = document.getElementById("searchBookTitle");
  if (!searchInput) {
    console.error("Input pencarian tidak ditemukan");
    return;
  }

  const searchTerm = searchInput.value.toLowerCase();

  // Filter buku berdasarkan judul jika ada kata kunci pencarian
  const booksToRender = searchTerm
    ? books.filter((book) => book.title.toLowerCase().includes(searchTerm))
    : books;

  // Render hasil pencarian
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  if (!incompleteBookList || !completeBookList) {
    console.error("Container buku tidak ditemukan");
    return;
  }

  // Bersihkan rak buku
  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  if (books.length === 0) {
    // Jika tidak ada buku sama sekali
    showEmptyMessage(incompleteBookList, "Tidak Ada Buku Tersedia");
    showEmptyMessage(completeBookList, "Tidak Ada Buku Tersedia");
    return;
  }

  if (searchTerm && booksToRender.length === 0) {
    // Jika pencarian tidak menemukan hasil
    showEmptyMessage(incompleteBookList, "Buku Tidak Ditemukan");
    showEmptyMessage(completeBookList, "Buku Tidak Ditemukan");
    return;
  }

  // Render buku yang difilter
  const incompletedBooks = booksToRender.filter((book) => !book.isComplete);
  const completedBooks = booksToRender.filter((book) => book.isComplete);

  if (incompletedBooks.length === 0) {
    showEmptyMessage(
      incompleteBookList,
      searchTerm ? "Buku Tidak Ditemukan" : "Tidak Ada Buku Tersedia",
    );
  } else {
    incompletedBooks.forEach((book) => {
      incompleteBookList.append(createBookElement(book));
    });
  }

  if (completedBooks.length === 0) {
    showEmptyMessage(
      completeBookList,
      searchTerm ? "Buku Tidak Ditemukan" : "Tidak Ada Buku Tersedia",
    );
  } else {
    completedBooks.forEach((book) => {
      completeBookList.append(createBookElement(book));
    });
  }
}

// Handle search input
const searchBookTitle = document.getElementById("searchBookTitle");
if (searchBookTitle) {
  searchBookTitle.addEventListener("input", handleSearchInput);
}
