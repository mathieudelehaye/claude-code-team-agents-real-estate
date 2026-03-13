import React from 'react';
import FlatGallery from './components/FlatGallery.jsx';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>London Rentals</h1>
        <p>Find your next flat in London</p>
      </header>
      <main className="app-main">
        <FlatGallery />
      </main>
      <footer className="app-footer">
        <p>© 2026 Mathieu Delehaye</p>
      </footer>
    </div>
  );
}

export default App;
