import React, { useState, useRef, useEffect } from 'react';
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
  const [isLLMDropdownOpen, setIsLLMDropdownOpen] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState(null);
  const llmDropdownRef = useRef(null);

  const llmOptions = [
    'Open AI',
    'Gemini',
    'Anthropic'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (llmDropdownRef.current && !llmDropdownRef.current.contains(event.target)) {
        setIsLLMDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleLLMDropdown = (e) => {
    e.stopPropagation();
    console.log("Toggling dropdown. Current state:", isLLMDropdownOpen);
    setIsLLMDropdownOpen(!isLLMDropdownOpen);
    setTimeout(() => {
      console.log("Dropdown state after toggle:", isLLMDropdownOpen);
    }, 100);
  };

  const handleLLMOptionClick = (option) => {
    setSelectedLLM(option);
    setIsLLMDropdownOpen(false);
    console.log("Selected LLM:", option);
    // Add any additional logic needed when LLM is changed
  };


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
      .replace(/(^|\n)([^\n:]+):/g, "<strong>$2:</strong>") // Format headings as bold
      .replace(/• /g, "<br> • ") // Add line breaks before bullet points
      .replace(/(\.)(\s+)(?=[A-Z])/g, "$1<br>") // Add line breaks after periods for new sentences
      .replace(/([^.]{80,}\.)\s*/g, "$1<br>"); // Optional: Split long sentences
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

      <div className="Settings-page-content-dropdown-background">
        <div className="Settings-page-text-display-content">
          <div className="Settings-page-title-content">
            <div className="Settings-page-title-text">
              Select LLM
            </div>
            {/* LLM Dropdown */}
            <div className="llm-dropdown-container" ref={llmDropdownRef}>
            <div className="llm-dropdown-header" onClick={(e) => toggleLLMDropdown(e)}>
                <div className="llm-dropdown-selected-value">
                  {selectedLLM ? selectedLLM : "Select LLM..."}
                </div>
                <div className="llm-dropdown-arrow">
                  <span className={`llm-arrow ${isLLMDropdownOpen ? 'up' : 'down'}`}></span>
                </div>
              </div>
              
              {isLLMDropdownOpen && (
                <div className="llm-dropdown-options">
                  {llmOptions.map((option, index) => (
                    <div
                      key={index}
                      className={`llm-dropdown-option ${selectedLLM === option ? 'selected' : ''}`}
                      onClick={() => handleLLMOptionClick(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
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
              <div className ="Settings-page-rules-upload-box">
              <a
                href="https://rag-document-376436174826.europe-west2.run.app"
                target="_blank"
                rel="noopener noreferrer"
                className="Settings-page-rules-upload-box"
              >
                <div className="Settings-page-rules-upload-box">
                  <div className="Settings-page-rules-upload-box-text">Upload</div>
                </div>
              </a>

              </div>
            </div>
            <div className="Settings-page-rules-description">
              Maximum combined file size 50 MB • Only zip, pdf, doc, ppt, xls, png, jpg, mp3, mp4 allowed
            </div>
          </div>
          
          <div className="Settings-page-rules-1-content">
              <button
                  className="Settings-page-circular-button"
                  onClick={() => openPopup(location.state?.resultsprompt || "No rules available", "creation")}
                >
                  <div style={{ fontFamily: 'Aspekta-400' }}>i</div>
                </button>

            <div className="Settings-page-jd-rules-content">
              <div className="Settings-page-jd-rules-text">J.D. Creation Rules</div>
              <div className ="Settings-page-rules-upload-box">
              <a
                href="https://jdpromptrag-document-376436174826.europe-west2.run.app"
                target="_blank"
                rel="noopener noreferrer"
                className="Settings-page-rules-upload-box"
              >
                <div className="Settings-page-rules-upload-box">
                  <div className="Settings-page-rules-upload-box-text">Upload</div>
                </div>
              </a>

              </div>
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
            <div className ="Settings-page-rules-upload-box">
            <a
                href="https://miscrag-document-376436174826.europe-west2.run.app"
                target="_blank"
                rel="noopener noreferrer"
                className="Settings-page-rules-upload-box"
              >
                <div className="Settings-page-rules-upload-box">
                  <div className="Settings-page-rules-upload-box-text">Upload</div>
                </div>
              </a>

            </div>
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