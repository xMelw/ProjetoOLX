import React from "react";

const Rating = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const stars = [];
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <i
        key={`full-${i}`}
        className="bi bi-star-fill text-warning"
        style={{ fontSize: `${size}px`, lineHeight: 1 }}
      />
    );
  }
  if (hasHalfStar) {
    stars.push(
      <i
        key="half"
        className="bi bi-star-half text-warning"
        style={{ fontSize: `${size}px`, lineHeight: 1 }}
      />
    );
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <i
        key={`empty-${i}`}
        className="bi bi-star text-warning"
        style={{ fontSize: `${size}px`, lineHeight: 1 }}
      />
    );
  }

  return <div className="userRating d-flex gap-1">{stars}</div>;
};

export default Rating;