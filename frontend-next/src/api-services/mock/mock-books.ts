import type { Book } from "@/types/book";

// Fake data for Homework 1 — same 12-book catalogue as the Figma design and the Go seed.
// Oldest first; the default "newest first" sort shows A Brief History of Time on top.
const base = Date.UTC(2026, 8, 30, 0, 0, 0);
const at = (i: number) => new Date(base + i * 3600_000).toISOString();

type Seed = Omit<Book, "id" | "createdAt" | "updatedAt" | "description">;

const SEED: Seed[] = [
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", isbn: "9780374533557", genre: "non-fiction", price: 19800, stock: 9, publishedDate: "2013-04-02" },
  { title: "Cosmos", author: "Carl Sagan", isbn: "9780345539434", genre: "science", price: 19000, stock: 14, publishedDate: "2013-12-10" },
  { title: "The Very Hungry Caterpillar", author: "Eric Carle", isbn: "9780399226908", genre: "children", price: 10500, stock: 20, publishedDate: "1994-03-23" },
  { title: "1984", author: "George Orwell", isbn: "9780451524935", genre: "fiction", price: 11000, stock: 30, publishedDate: "1950-07-01" },
  { title: "The Pragmatic Programmer", author: "David Thomas, Andrew Hunt", isbn: "9780135957059", genre: "technology", price: 35000, stock: 5, publishedDate: "2019-09-13" },
  { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", isbn: "9780062316097", genre: "non-fiction", price: 22000, stock: 0, publishedDate: "2015-02-10" },
  { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", genre: "technology", price: 32000, stock: 8, publishedDate: "2008-08-01" },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "9780743273565", genre: "fiction", price: 17000, stock: 16, publishedDate: "2013-12-10" },
  { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", genre: "fiction", price: 13200, stock: 12, publishedDate: "2006-05-23" },
  { title: "Guns, Germs, and Steel", author: "Jared Diamond", isbn: "9780393354324", genre: "history", price: 21000, stock: 3, publishedDate: "2017-03-07" },
  { title: "Where the Wild Things Are", author: "Maurice Sendak", isbn: "9780060254926", genre: "children", price: 12500, stock: 25, publishedDate: "1988-11-09" },
  { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", genre: "science", price: 18000, stock: 18, publishedDate: "1988-04-01" },
];

export const MOCK_BOOKS: Book[] = SEED.map((b, i) => ({
  ...b,
  id: i + 1,
  description: "",
  createdAt: at(i),
  updatedAt: at(i),
}));
