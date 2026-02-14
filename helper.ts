import { Book } from "./types.js";

export function createBookElement(book: Book): HTMLDivElement {
  const bookItem = document.createElement("div");
  bookItem.setAttribute("data-bookid", book.id.toString());
  bookItem.setAttribute("data-testid", "bookItem");

  bookItem.innerHTML = `
    <h3 data-testid="bookItemTitle">${book.title}</h3>
    <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
    <p data-testid="bookItemYear">Tahun: ${book.year}</p>
    <div>
      <button data-testid="bookItemIsCompleteButton">
        <i class="fas fa-check"></i> ${book.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"}
      </button>
      <button data-testid="bookItemDeleteButton">
        <i class="fas fa-trash"></i> Hapus Buku
      </button>
      <button data-testid="bookItemEditButton">
        <i class="fas fa-edit"></i> Edit Buku
      </button>
    </div>
  `;

  return bookItem;
}

export function showEmptyMessage(element: HTMLElement, message: string): void {
  const emptyMessage = document.createElement("div");
  emptyMessage.style.textAlign = "center";
  emptyMessage.style.padding = "2rem";
  emptyMessage.style.color = "#666";
  emptyMessage.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
  element.appendChild(emptyMessage);
}
