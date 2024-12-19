import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ConversationScreen.css';
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
const ConversationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userEmail, conversationNumber } = location.state || {};

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleOtherDetails = async (userEmail, conversation) => {
    console.log("handleOtherDetails called with:", { userEmail, conversation });
    try {
      const path = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversation}`;
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const filteredData = { ...data };
        delete filteredData.JDCreated;
        delete filteredData.LinkCreated;

        console.log("handleOtherDetails called with:", { userEmail, conversation });
        console.log("OtherDetailsPage loaded with:", { userEmail, conversationNumber });
        
        navigate("/otherdetails", { state: { data: filteredData, userEmail, conversationNumber : conversation } });

      } else {
        console.error("No data found for Other Details:", path);
      }
    } catch (error) {
      console.error("Error fetching Other Details:", error);
    }
  };

  const handleViewJD = async (userEmail, conversation) => {
    console.log("handleViewJD called with:", { userEmail, conversation });
    try {
      const path = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversation}`;
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const filteredData = { ...data };
        delete filteredData.AdditionalFeedback;
        delete filteredData.SessionFeedback;
        delete filteredData.SharedBy;
        delete filteredData.ViewedBy;
        delete filteredData.Timestamp;
        console.log("handlviewJD called with:", { userEmail, conversation });
        console.log("OtherviewJD loaded with:", { userEmail, conversationNumber : conversation });

        navigate("/viewjd", { state: { data: filteredData, userEmail ,conversationNumber : conversation } });
      } else {
        console.error("No data found for View JD:", path);
      }
    } catch (error) {
      console.error("Error fetching View JD:", error);
    }
  };

  const handleViewTranscript = async (userEmail, conversation) => {
    console.log("handleViewTranscript called with:", { userEmail, conversation });
    try {
      const path = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversation}/Transcript/ChatHistory`;
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const chatHistory = docSnap.data().Chat || [];
        console.log("Retrieved Chat History:", chatHistory);
        navigate("/viewtranscript", {
          state: {
            userEmail,
            conversationNumber : conversation,
            chatHistory,
          },
        });
      } else {
        console.error("No data found for Transcript:", path);
      }
    } catch (error) {
      console.error("Error fetching Transcript:", error);
    }
  };

  const generateConversationFrames = (conversationNumber, userEmail) => {
    return Array.from({ length: conversationNumber }, (_, index) => (
      <div className="userlist-frame" key={index}>
        <div className="userlist-frame-left">
          <div className="userlist-name">Conversation {index + 1}</div>
        </div>
        <div className="userlist-frame-right">
          <div
            className="userlist-otherdetails-button"
            onClick={() => {
              console.log("Other Details clicked for conversation:", index + 1, "with userEmail:", userEmail);
              handleOtherDetails(userEmail, index + 1);
            }}
          >
            Other Details
          </div>
          <div className="userlist-buttons">
            <div
              className="userlist-viewtranscript-button"
              
              onClick={() => {
                console.log("View Transcript clicked for conversation:", index + 1, "with userEmail:", userEmail);
                handleViewTranscript(userEmail, index + 1);
              }}
            >
              <div className="userlist-viewtranscript-button-text">
                View Transcript
              </div>
            </div>
            <div
              className="userlist-viewjd-button"
              onClick={() => {
                console.log("View JD clicked for conversation:", index + 1, "with userEmail:", userEmail);
                handleViewJD(userEmail, index + 1);
              }}
            >
              <div className="userlist-viewjd-button-text">View Final J.D.</div>
            </div>
          </div>
        </div>
      </div>
    ));
  };


 


  return (
    <div className="conversation-screen-page-container">
      <div className="conversation-screen-page">
        <div className="conversation-screen-header">
          <div className="conversation-screen-header-inside">
            <div className="conversation-screen-header-left">
              <div className="conversation-screen-header-left-text">
                Conversations History
              </div>
            </div>
          </div>
        </div>

        <div className="conversation-screen-userlist-container">
          <div className="conversation-screen-userlist-container-inside">
          {generateConversationFrames(conversationNumber, userEmail)}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationScreen