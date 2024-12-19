import React from "react";
import "./style.css";

const ViewJD = () => {
  return (
    <section className="final-jd">
      <div className="header">
        <div className="header-inside">
          <div className="header-left">
            <div className="back-button">
              <img src="back.jpg" alt="Back" />
            </div>
          </div>
          <div className="header-right">
            <div className="OtherDetails-button">Other Details</div>
            <div className="ViewTranscript-button">View Transcript</div>
          </div>
        </div>
      </div>
      <div className="jd-link-container">
        <div className="jd-link">
          <div className="jd-link-header">JD link:</div>
          <div className="jd-hyperlink">
            https://prodigypb-test-edit.web.app/id=zF23p7Q2jWt29D7T6r0P7Fre7gTHhYXjhRtZNeM8BmUMn_nwc+3cKgjCraoLkPYuVPK4BsYNE...
          </div>
        </div>
        <div className="copy-icon"></div>
      </div>
      <div className="chatbox">
        <div className="chatbox-header">
          <div className="chatbox-header-text">Job Description</div>
        </div>
        <br />
        <div className="jd-content"></div>
      </div>
    </section>
  );
};

export default ViewJD;
