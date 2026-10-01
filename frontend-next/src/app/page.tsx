import { redirect } from "next/navigation";

// "/" has no screen of its own; send users to the book list.
export default function Home() {
  redirect("/books/list");
}
