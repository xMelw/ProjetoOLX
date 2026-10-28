import React from 'react';

const FilterIcon = () => {
  return (
    <>
    <button className="btn color">
      Explorar mais <i className="bi bi-arrow-right"></i>
    </button>

    <style>
        {`
          .color {
            background-color: #FF6B1A;
            color: white;
          }
          .color:hover {
            transform: scale(1.1);
            background-color: #FF6B1A;
            color: white;
          }
        `}
      </style>

    {/* <StyledWrapper>
      <span className="filter-icon shadow-sm" aria-hidden="true">
        <span className="bar bar1" />
        <span className="bar bar2" />
         <span className="bar bar1" />
       </span>
     </StyledWrapper> */}
    </>
  );
}

// const StyledWrapper = styled.div`
//   .filter-icon {
//     width: 37px;
//     height: 35px;
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     justify-content: center;
//     gap: 6px;
//     background-color: #F5F5F5;
//     border-radius: 50%;
//     cursor: pointer;
//     border: none;
//   }
//   .bar {
//     width: 50%;
//     height: 1px;
//     background-color: #3A3A3A;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     position: relative;
//     border-radius: 2px;
//   }
//   .bar::before {
//     content: "";
//     width: 2px;
//     height: 2px;
//     position: absolute;
//     border-radius: 50%;
//     border: 2px solid #3A3A3A;
//     transition: all 0.3s;
//     box-shadow: 0px 0px 3.5px rgb(151, 151, 151);
//   }
//   .bar1::before {
//     transform: translateX(-4px);
//   }
//   .bar2::before {
//     transform: translateX(4px);
//   }
//   .filter-icon:hover .bar1::before {
//     transform: translateX(4px);
//   }
//   .filter-icon:hover .bar2::before {
//     transform: translateX(-4px);
//   }`;

export default FilterIcon;