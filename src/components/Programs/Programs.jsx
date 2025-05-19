import React from "react";
import { Link } from "react-router-dom";
import "./Programs.css";
import program_1 from "../../assets/program-1.jpg";
import program_2 from "../../assets/program-2.jpg";
import program_3 from "../../assets/program-3.jpg";
import program_icon_1 from "../../assets/program-icon-1.png";
import program_icon_2 from "../../assets/program-icon-2.png";
import program_icon_3 from "../../assets/program-icon-3.png";

const Programs = () => {
  const programsData = [
    {
      id: 1,
      image: program_1,
      icon: program_icon_1,
      text: "View Projects",
      link: "/view-project-status"
    },
    {
      id: 2,
      image: program_3,
      icon: program_icon_3,
      text: "Material Listings",
      link: "/material-listing"
    },
    {
      id: 3,
      image: program_2,
      icon: program_icon_2,
      text: "Estimate Cost",
      link: "/cost-estimator",
      className: "cost-estimator-card" // Added special class
    }
  ];

  const handleCardClick = (link) => {
    // Special handling for cost estimator if needed
    if (link === "/cost-estimator") {
      console.log("Navigating to cost estimator");
    }
  };

  return (
    <div className="programs">
      {programsData.map((program) => (
        <Link 
          to={program.link}
          key={program.id}
          className={`program-link ${program.className || ''}`}
          onClick={() => handleCardClick(program.link)}
        >
          <div className="program">
            <img src={program.image} alt={program.text} />
            <div className="caption">
              <img src={program.icon} alt={`${program.text} icon`} />
              <p>{program.text}</p>
              {/* Add arrow icon for better UX */}
              <span className="nav-arrow">→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Programs;