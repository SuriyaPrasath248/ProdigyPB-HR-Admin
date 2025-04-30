import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ConversationScreen.css';
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const ConversationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userEmail, conversationNumber } = location.state || {};

  const [conversationIndex, setConversationIndex] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversationIndex = async () => {
      try {
        // Fetch from User/userdetails document 
        const userDetailsRef = doc(db, "ProjectBrainsReact", "User", userEmail, "userdetails");
        const userDetailsSnap = await getDoc(userDetailsRef);
        
        if (userDetailsSnap.exists() && userDetailsSnap.data().conversationIndex) {
          const conversationIndexArray = userDetailsSnap.data().conversationIndex;
          
          // Sort conversations by conversation number
          const sortedConversations = [...conversationIndexArray].sort(
            (a, b) => a.conversationNumber - b.conversationNumber
          );
          
          setConversationIndex(sortedConversations);
        } else {
          // Fall back to default view
          const defaultConversations = Array.from(
            { length: conversationNumber },
            (_, i) => ({
              conversationNumber: i + 1,
              jobRole: `Conversation ${i + 1}`,
              //timestamp: "No timestamp available"
            })
          );
          setConversationIndex(defaultConversations);
        }
      } catch (error) {
        console.error("Error fetching conversation index:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
  
    if (userEmail && conversationNumber) {
      fetchConversationIndex();
    } else {
      setLoading(false);
    }
  }, [userEmail, conversationNumber]);

  const handleOtherDetails = async (userEmail, conversation) => {
    try {
      const path = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversation}`;
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const filteredData = { ...data };
        delete filteredData.JDCreated;
        delete filteredData.LinkCreated;
        
        navigate("/otherdetails", { state: { data: filteredData, userEmail, conversationNumber: conversation } });
      } else {
        console.error("No data found for Other Details:", path);
      }
    } catch (error) {
      console.error("Error fetching Other Details:", error);
    }
  };

  const handleViewJD = async (userEmail, conversation) => {
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

        navigate("/viewjd", { state: { data: filteredData, userEmail, conversationNumber: conversation } });
      } else {
        console.error("No data found for View JD:", path);
      }
    } catch (error) {
      console.error("Error fetching View JD:", error);
    }
  };

  const handleViewTranscript = async (userEmail, conversation) => {
    try {
      const path = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversation}/Transcript/ChatHistory`;
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const chatHistory = docSnap.data().Chat || [];
        navigate("/viewtranscript", {
          state: {
            userEmail,
            conversationNumber: conversation,
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

  const generateConversationRows = () => {
    return conversationIndex.map((conversation) => (
      <div className="userlist-frame" key={conversation.conversationNumber}>
        <div className="userlist-frame-left">
          <div className="userlist-name">{conversation.jobRole}</div>
         
          {/*<div className="userlist-timestamp">  {conversation.timestamp}</div>*/}
        </div>
        <div className="userlist-frame-right">
          <div 
            className="userlist-otherdetails-button"
            onClick={() => handleOtherDetails(userEmail, conversation.conversationNumber)}
          >
            Other Details
          </div>
          <div className="userlist-buttons">
            <div
              className="userlist-viewtranscript-button"
              onClick={() => handleViewTranscript(userEmail, conversation.conversationNumber)}
            >
              View Transcript
            </div>
            <div
              className="userlist-viewjd-button"
              onClick={() => handleViewJD(userEmail, conversation.conversationNumber)}
            >
              View Final J.D.
            </div>
          </div>
        </div>
      </div>
    ));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="conversation-screen-page-container">
      <div className="conversation-screen-page">
        <div className="conversation-screen-header">
          <div className="conversation-screen-header-inside">
            <div className="conversation-screen-header-left">
              <div className="conversation-screen-back-button" onClick={() => navigate("/")}>
                <img src="/back.png" alt="Back" className="conversation-screen-back-button-img" />
              </div> 
              <div className="conversation-screen-header-left-text">
                Conversation History
              </div>
            </div>
          </div>
        </div>

        <div className="conversation-screen-userlist-container">
          <div className="conversation-screen-userlist-container-inside">
            {generateConversationRows()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationScreen;