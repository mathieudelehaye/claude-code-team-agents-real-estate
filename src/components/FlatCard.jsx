import React, { useState } from 'react';

function FlatCard({ flat }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flat-card">
      <div className="flat-card-image-wrapper">
        {imgError ? (
          <div className="flat-card-image-fallback" role="img" aria-label={`No image available for ${flat.title}`}>
            <span>Image unavailable</span>
          </div>
        ) : (
          <img
            src={flat.image}
            alt={flat.title}
            className="flat-card-image"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="flat-card-body">
        <h2 className="flat-card-title">{flat.title}</h2>
        <p className="flat-card-price">£{flat.price.toLocaleString('en-GB')}/month</p>
        <p className="flat-card-location">{flat.location}</p>
      </div>
    </div>
  );
}

export default FlatCard;
