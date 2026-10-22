import React from 'react';
import styled from 'styled-components';

const FilterButton = () => {
  return (
    <StyledWrapper>
      <button className="setting-btn shadow-sm">
        <span className="bar bar1" />
        <span className="bar bar2" />
        <span className="bar bar1" />
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .setting-btn {
    width: 37px;
    height: 35px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background-color: #F5F5F5;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
  .bar {
    width: 50%;
    height: 1px;
    background-color: #3A3A3A;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 2px;
  }
  .bar::before {
    content: "";
    width: 2px;
    height: 2px;
    position: absolute;
    border-radius: 50%;
    border: 2px solid #3A3A3A;
    transition: all 0.3s;
    box-shadow: 0px 0px 3.5px rgb(151, 151, 151);
  }
  .bar1::before {
    transform: translateX(-4px);
  }
  .bar2::before {
    transform: translateX(4px);
  }
  .setting-btn:hover .bar1::before {
    transform: translateX(4px);
  }
  .setting-btn:hover .bar2::before {
    transform: translateX(-4px);
  }`;

export default FilterButton;