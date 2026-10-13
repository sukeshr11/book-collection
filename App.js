
import React, { useState, useEffect } from "react";
import "./App.css";

import { auth, googleProvider, db } from "./firebase";

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);

  // Track Google sign-in status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Load books after login
  useEffect(() => {
    if (user) {
      loadBooks();
    } else {
      setBooks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch books belonging to the signed-in user
  const loadBooks = async () => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "books"));

      const myBooks = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data()
        }))
        .filter((book) => book.userId === auth.currentUser.uid);

      setBooks(myBooks);
    } catch (error) {
      console.error("Firestore read error:", error);
      alert("Could not load books: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  };

  // Add a book to Firestore
  const addBook = async (event) => {
    event.preventDefault();

    if (!title.trim() || !author.trim()) {
      alert("Please enter both book title and author.");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please sign in first.");
      return;
    }

    try {
      const bookData = {
        title: title.trim(),
        author: author.trim(),
        userId: currentUser.uid
      };

      const docRef = await addDoc(collection(db, "books"), bookData);

      // Display the saved book immediately
      setBooks((previousBooks) => [
        ...previousBooks,
        { id: docRef.id, ...bookData }
      ]);

      setTitle("");
      setAuthor("");

      alert("Book added successfully!");
    } catch (error) {
      console.error("Firestore add error:", error);
      alert("Could not add book: " + error.message);
    }
  };

  // Delete a book
  const removeBook = async (bookId) => {
    try {
      await deleteDoc(doc(db, "books", bookId));

      setBooks((previousBooks) =>
        previousBooks.filter((book) => book.id !== bookId)
      );

      alert("Book deleted successfully!");
    } catch (error) {
      console.error("Firestore delete error:", error);
      alert("Could not delete book: " + error.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "750px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1>📚 Book Collection</h1>
      <p>Manage your favorite books in one place.</p>

      {!user ? (
        <button onClick={handleLogin}>
          Sign in with Google
        </button>
      ) : (
        <>
          <p>
            Welcome, <strong>{user.displayName || user.email}</strong>!
          </p>

          <button onClick={handleLogout}>Sign Out</button>

          <hr />

          <h2>Add a Book</h2>

          <form onSubmit={addBook}>
            <input
              type="text"
              placeholder="Book title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              required
            />

            <button type="submit">Add Book</button>
          </form>

          <hr />

          <h2>My Book Collection</h2>

          {loading ? (
            <p>Loading books...</p>
          ) : books.length === 0 ? (
            <p>No books added yet.</p>
          ) : (
            <ul>
              {books.map((book) => (
                <li key={book.id} style={{ marginBottom: "12px" }}>
                  <strong>{book.title}</strong> — {book.author}
                  {" "}
                  <button onClick={() => removeBook(book.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button onClick={loadBooks}>Refresh Books</button>
        </>
      )}
    </div>
  );
}

export default App;
