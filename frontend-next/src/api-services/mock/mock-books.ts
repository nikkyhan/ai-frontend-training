import type { Book } from "@/types/book";

// Fake data for Homework 1 (same records the Go seed creates).
const base = Date.UTC(2026, 8, 30, 0, 0, 0);
const at = (i: number) => new Date(base + i * 3600_000).toISOString();

export const MOCK_BOOKS: Book[] = [
  { id: 1, title: "The Go Programming Language", author: "Alan Donovan", isbn: "9780134190440", genre: "technology", price: 42000, stock: 12, publishedDate: "2015-10-26", description: "A complete guide to Go.", createdAt: at(0), updatedAt: at(0) },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", genre: "technology", price: 38500, stock: 0, publishedDate: "2008-08-01", description: "", createdAt: at(1), updatedAt: at(1) },
  { id: 3, title: "Sapiens", author: "Yuval Noah Harari", isbn: "9780062316097", genre: "history", price: 22000, stock: 30, publishedDate: "2015-02-10", description: "", createdAt: at(2), updatedAt: at(2) },
  { id: 4, title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", genre: "science", price: 18000, stock: 7, publishedDate: "1998-09-01", description: "", createdAt: at(3), updatedAt: at(3) },
  { id: 5, title: "The Little Prince", author: "Antoine de Saint-Exupery", isbn: "9780156012195", genre: "children", price: 9900, stock: 54, publishedDate: "2000-05-15", description: "", createdAt: at(4), updatedAt: at(4) },
  { id: 6, title: "1984", author: "George Orwell", isbn: "9780451524935", genre: "fiction", price: 11500, stock: 21, publishedDate: "1961-01-01", description: "", createdAt: at(5), updatedAt: at(5) },
  { id: 7, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", isbn: "9780374533557", genre: "non-fiction", price: 19800, stock: 9, publishedDate: "2013-04-02", description: "", createdAt: at(6), updatedAt: at(6) },
  { id: 8, title: "The Pragmatic Programmer", author: "David Thomas", isbn: "9780135957059", genre: "technology", price: 45000, stock: 5, publishedDate: "2019-09-13", description: "", createdAt: at(7), updatedAt: at(7) },
  { id: 9, title: "Cosmos", author: "Carl Sagan", isbn: "9780345539434", genre: "science", price: 17000, stock: 14, publishedDate: "2013-12-10", description: "", createdAt: at(8), updatedAt: at(8) },
  { id: 10, title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", genre: "fiction", price: 13200, stock: 18, publishedDate: "2006-05-23", description: "", createdAt: at(9), updatedAt: at(9) },
  { id: 11, title: "Guns, Germs, and Steel", author: "Jared Diamond", isbn: "9780393354324", genre: "history", price: 21000, stock: 3, publishedDate: "2017-03-07", description: "", createdAt: at(10), updatedAt: at(10) },
  { id: 12, title: "Where the Wild Things Are", author: "Maurice Sendak", isbn: "9780060254926", genre: "children", price: 12500, stock: 25, publishedDate: "1988-11-09", description: "", createdAt: at(11), updatedAt: at(11) },
];
