import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import "./Settings.css";

const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { introtitle, intromessage } = location.state || { introtitle: "", intromessage: "" };
  console.log("SettingsPage loaded with state:", location.state);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State to control popup visibility
  const [popupContent, setPopupContent] = useState(""); // State for popup content
  const [currentCategory, setCurrentCategory] = useState(""); // State for popup category



  const openPopup = (content, category) => {
    setPopupContent(content); // Set content for the popup
    setCurrentCategory(category); // Set category for the popup header
    setIsPopupOpen(true); // Open the popup
  };
  
  const handleBackNavigation = () => {
    navigate(-1); // Go back to the previous page
  };

  const closePopup = () => {
        setIsPopupOpen(false); // Hide the popup
      };

  const formatPrompt = (prompt) => {
    return prompt
      .replace(/(^|\n)([^\n:]+):/g, "\n<strong>$2:</strong>\n") // Format headings
      .replace(/- /g, "<br> • ") // Convert dashes to bullet points
      .replace(/(\.)(\s+)(?=[A-Z])/g, "$1\n") // Add line breaks after periods
      .replace(/([^.]{80,}\.)\s*/g, "$1\n"); // Optional: Split long sentences
  };

  


  return (
    <div className="Settings-body">
    <section className="Settings-page">
      <div className="Settings-page-header">
        <div className="Settings-page-header-inside">
          <div className="Settings-page-header-left">
            <div className="Settings-page-back-button" onClick={handleBackNavigation}>
              <img src="back.png" alt="Back" />
            </div>
            <div className="settings-header-text" data-settings="value">
                  Settings
              </div>
          </div>
        </div>
      </div>

      <div className="Settings-page-content-background">
        <div className="Settings-page-text-display-content">
          <div className="Settings-page-title-content">
            <div className="Settings-page-title-text">
              Title
            </div>
            <div className="Settings-page-title-box">
              <div className="Settings-page-title-box-rules">
                {introtitle || "No Title Available"}
              </div>
            </div>
          </div>
        </div>

        <div className="Settings-page-intro-display-content">
          <div className="Settings-page-intro-content">
            <div className="Settings-page-intro-text">
              Introduction
            </div>
            <div className="Settings-page-intro-box">
              <div className="Settings-page-intro-box-rules">
                {intromessage || "No Message Available"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="Settings-page-rules-content">
        <div className="Settings-page-rules-1-2-content">
          <div className="Settings-page-rules-1-content">
            <button
              className="Settings-page-circular-button"
              onClick={() => openPopup(location.state?.interactionrules || "No rules available", "interaction")}
            >
              <div style={{ fontFamily: 'Aspekta-400' }}>i</div>
            </button>
             <div className="Settings-page-jd-rules-content">
              <div className="Settings-page-jd-rules-text">Interaction/Engagement Rules</div>
              <div className="Settings-page-rules-upload-box"></div>
            </div>
            <div className="Settings-page-rules-description">
              Maximum combined file size 50 MB • Only zip, pdf, doc, ppt, xls, png, jpg, mp3, mp4 allowed
            </div>
          </div>
          
          <div className="Settings-page-rules-2-content">
              <button
                  className="Settings-page-circular-button"
                  onClick={() => openPopup(location.state?.resultsprompt || "No rules available", "creation")}
                >
                  <div style={{ fontFamily: 'Aspekta-400' }}>i</div>
                </button>

            <div className="Settings-page-jd-rules-content">
              <div className="Settings-page-jd-rules-text">J.D. Creation Rules</div>
              <div className="Settings-page-rules-upload-box"></div>
            </div>
            <div className="Settings-page-rules-description">
            Maximum combined file size 50 MB • Only zip, pdf, doc, ppt, xls, png, jpg, mp3, mp4 allowed
          </div>
          </div>
        </div>
        
        <div className="Settings-page-rules-3">
            <button
              className="Settings-page-circular-button"
              onClick={() => openPopup(location.state?.miscellaneousprompt || "No rules available", "miscellaneous")}
            >
              <div style={{ fontFamily: 'Aspekta-400' }}>i</div>
            </button>


          <div className="Settings-page-jd-rules-content">
            <div className="Settings-page-jd-rules-text">Miscellaneous</div>
            <div className="Settings-page-rules-upload-box"></div>
          </div>
          <div className="Settings-page-rules-description">
            Maximum combined file size 50 MB • Only zip, pdf, doc, ppt, xls, png, jpg, mp3, mp4 allowed
          </div>
        </div>
      </div>

      {isPopupOpen && (
          <div className="modal-overlay">
            <div className="Settings-page-rules-popup">
              {/* Dynamic Header */}
              <h2>
                  {currentCategory === "miscellaneous"
                    ? "Miscellaneous"
                    : currentCategory === "interaction"
                    ? "Interaction/Engagement Rules"
                    : currentCategory === "creation"
                    ? "J.D. Creation Rules"
                    : "Popup Information"}
                </h2>
              {/* Content */}
              <div  className="Settings-page-rules-popup-pc">
                {popupContent ? (
                  <div dangerouslySetInnerHTML={{ __html: formatPrompt(popupContent) }} />
                ) : (
                  <p>No rules available</p> /* Fallback when no content exists */
                )}
              </div>

              {/* Close Button */}
              <button className="close-modal-button" onClick={closePopup}>
                x
              </button>
            </div>
          </div>
        )}




    
    </section>

    </div>
  );
};

export default SettingsPage;