import React, { useState, useEffect } from 'react';
import FlatCard from './FlatCard.jsx';
import { getAllFlats } from '../services/api.js';

function FlatGallery() {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllFlats()
      .then(data => setFlats(data))
      .catch(() => setError('Unable to load flat listings. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="gallery-loading" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading flats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-error" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (flats.length === 0) {
    return (
      <div className="gallery-empty">
        <p>No flat listings available at this time.</p>
      </div>
    );
  }

  return (
    <div className="gallery-grid" role="list">
      {flats.map(flat => (
        <div key={flat.id} role="listitem">
          <FlatCard flat={flat} />
        </div>
      ))}
    </div>
  );
}

export default FlatGallery;
