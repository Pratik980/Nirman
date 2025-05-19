import React from "react";
import "./Hero.css";
import dark_arrow from "../../assets/dark-arrow.png";

const Hero = () => {
  return (
    <div className="hero container">
      <div className="hero-text">
        <h1>Building the Future, One Brick at a Time!</h1>
        <p>
          Welcome to Ghar Nirman, your all-in-one platform for seamless
          construction project management. Whether you're a homeowner,
          contractor, or supplier, we bring efficiency, transparency, and smart
          decision-making to every stage of your construction journey. Browse
          tenders, connect with skilled professionals, and manage projects
          effortlessly—all in one place. Let’s build smarter, faster, and better
          together!
        </p>
        <button className="btn">
          Explore More <img src={dark_arrow} alt="" />
        </button>
      </div>
    </div>
  );
};

export default Hero;
