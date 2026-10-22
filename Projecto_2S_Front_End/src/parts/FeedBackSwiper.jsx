import React, { useState } from 'react';
import Rating from "./Rating";

const FeedbackSlider = ({ feedback }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? feedback.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === feedback.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="simple-slider d-flex justify-content-center align-items-center w-100 h-100">
        <button className='btn' onClick={prevSlide}><i className="bi bi-chevron-left"></i></button>
      <div className="slide-content d-flex flex-column shadow-sm p-3 m-4 rounded-3 w-100 h-100" style={{backgroundColor: "#F5F5F5"}}>
                <Rating size={12} rating={feedback[currentIndex].rating} />
                <p className="description d-flex mt-2 mb-0">"{feedback[currentIndex].description}"</p>
                <p className="author d-flex mb-0" style={{fontSize: "12px"}}>— {feedback[currentIndex].author}</p>
        </div>
        <button className='btn' onClick={nextSlide}><i className="bi bi-chevron-right"></i></button>
    </div>
  );
};

export default FeedbackSlider;
