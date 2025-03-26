
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import "./InteractiveScreen.css";
import { db } from "../firebase/firebase";
import { doc, getDoc , updateDoc} from "firebase/firestore";

const InteractiveScreen = () => {
  
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUserEmail, setEditingUserEmail] = useState(null);
    const [newCreditsValue, setNewCreditsValue] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userListRef = doc(db, "ProjectBrainsReact", "UserList");
                const userListSnap = await getDoc(userListRef);

                if (userListSnap.exists()) {
                    const emailArray = userListSnap.data().email;

                    const userDataPromises = emailArray.map(async (user) => {
                        const userDetailsRef = doc(
                            db,
                            "ProjectBrainsReact",
                            "User",
                            user.EmailId,
                            "userdetails"
                        );
                        const userDetailsSnap = await getDoc(userDetailsRef);

                        if (userDetailsSnap.exists()) {
                            const userData = userDetailsSnap.data();
                            return {
                                Name: userData.Name || user.displayName || "Unknown Name",
                                Useremail: user.EmailId,
                                Credits: userData.Credits ?? 0,
                                ConversationNumber: userData.ConversationNumber ?? 0,
                            };
                        }
                        return null;
                    });

                    const userData = await Promise.all(userDataPromises);
                    setUserList(userData.filter((user) => user !== null));
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleOtherDetails = async (userEmail, conversationNumber =1) => {
      console.log("handleOtherDetails triggered for:", userEmail); // Log email being passed
      const path = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversationNumber}`;
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Fetched Data for OtherDetailsPage:", data); // Log the fetched data
  
          const filteredData = { ...data };
          delete filteredData.JDCreated;
          delete filteredData.LinkCreated;
  
          console.log("Filtered Data to send:", filteredData); // Log filtered data being sent
          navigate("/otherdetails", { state: { data: filteredData, userEmail,conversationNumber } });
      } else {
          console.error("No data found at path:", path);
      }
  };
  
  const handleCreditsClick = (email, currentCredits) => {
    setEditingUserEmail(email);
    setNewCreditsValue(currentCredits.toString());
  };

  // Update local state as the user types in the Credits input
  const handleCreditsChange = (e) => {
    setNewCreditsValue(e.target.value);
  };

  /**
   * If user presses Enter in the input, we update Firestore 
   * and also update our local userList state with the new credits.
   */
  const handleCreditsKeyDown = async (e, email) => {
    if (e.key === "Enter") {
      await updateCreditsInFirestore(email, parseInt(newCreditsValue, 10) || 0);
    }
  };

  /**
   * Actually writes the new credits to Firestore for the given email.
   * Then updates our local state to reflect the new credits.
   */
  const updateCreditsInFirestore = async (email, newCredits) => {
    try {
      const userDetailsRef = doc(db, "ProjectBrainsReact", "User", email, "userdetails");
      await updateDoc(userDetailsRef, { Credits: newCredits });

      // Update local userList 
      setUserList((prevList) =>
        prevList.map((user) =>
          user.Useremail === email ? { ...user, Credits: newCredits } : user
        )
      );
    } catch (error) {
      console.error("Error updating credits:", error);
    } finally {
      // Exit edit mode
      setEditingUserEmail(null);
      setNewCreditsValue("");
    }
  };
    
    const handleViewJD = async (userEmail, conversationNumber =1) => {
        const path = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversationNumber}`;
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

            navigate("/viewjd", { state: { data: filteredData, userEmail,conversationNumber } });
        } else {
            console.error("No data found at path:", path);
        }
    };

    const handleViewTranscript = async (email, conversationNumber =1) => {
        console.log(`Navigating to transcript for: ${email}`);
       // navigate("/viewtranscript",{/* { state: { userEmail: email, chatHistory } }*/}); // Pass userEmail here
        if (!email) {
            console.error("No email provided for fetching the transcript.");
            return;
        }
    
        try {
            const path = `ProjectBrainsReact/User/${email}/userdetails/Conversations/Conversation${conversationNumber}/Transcript/ChatHistory`;
            const docRef = doc(db, path);
            const docSnap = await getDoc(docRef);
    
            if (docSnap.exists()) {
                const chatHistory = docSnap.data().Chat || [];
                console.log("Fetched chat history:", chatHistory);
                //navigate("/viewtranscript",{/* { state: { userEmail: email, chatHistory } }*/}); // Pass userEmail here
                navigate("/viewtranscript", { state: { userEmail: email, chatHistory,conversationNumber } }); // Pass userEmail here
            } else {
                console.error("No data found at path:", path);
            }
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };
    

    const handleViewAll = (userEmail, conversationNumber) => {
      console.log(`View All clicked for User: ${userEmail}, Conversations: ${conversationNumber}`);
      navigate("/conversationpage", { state: { userEmail, conversationNumber } });

    };
    
    const renderUserRow = (user) => {
        const { Name, Useremail, Credits, ConversationNumber } = user;

        if (ConversationNumber > 1) {
          return (
            <div className="interactive-screen-userlist-frame" key={Useremail}>
              {/* Left Section */}
              <div className="interactive-screen-userlist-frame-left">
                <div className="interactive-screen-userlist-name">{Name}</div>
                <div className="interactive-screen-userlist-name-partition"></div>
    
                <div className="interactive-screen-userlist-credits-container">
                  <div className="interactive-screen-userlist-credits-text">Credits Remaining -</div>
                  <div className="interactive-screen-userlist-credits-info-container">
                    <div className="interactive-screen-userlist-credits-info-bg">
                      {/* Show input if editingUserEmail matches this user's email */}
                      {editingUserEmail === Useremail ? (
                          <input
                            className="interactive-screen-userlist-credits-input"
                            type="number"
                            value={newCreditsValue}
                            onChange={handleCreditsChange}
                            onKeyDown={(e) => handleCreditsKeyDown(e, Useremail)}
                            onBlur={() => setEditingUserEmail(null)}
                            autoFocus
                          />
                        ) : (
                        <div
                          className="interactive-screen-userlist-credits-info"
                          onClick={() => handleCreditsClick(Useremail, Credits)}
                        >
                          {Credits}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
    
              {/* Right Section */}
              <div className="interactive-screen-userlist-frame-right">
                <div className="interactive-screen-userlist-buttons">
                  <div
                    className="interactive-screen-userlist-viewall-button"
                    onClick={() => handleViewAll(Useremail, ConversationNumber)}
                  >
                    <div className="interactive-screen-userlist-viewall-button-text">View All</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
    

        return (
            <div className="interactive-screen-userlist-frame" key={Useremail}>
            {/* Left Section */}
            <div className="interactive-screen-userlist-frame-left">
              <div className="interactive-screen-userlist-name">{Name}</div>
              <div className="interactive-screen-userlist-name-partition"></div>
              <div className="interactive-screen-userlist-credits-container">
                <div className="interactive-screen-userlist-credits-text">Credits Remaining -</div>
                <div className="interactive-screen-userlist-credits-info-container">
                <div className="interactive-screen-userlist-credits-info-bg">
                {/* Show input if editingUserEmail matches this user's email */}
                {editingUserEmail === Useremail ? (
                  <input
                    className="interactive-screen-userlist-credits-input"
                    type="number"
                    value={newCreditsValue}
                    onChange={handleCreditsChange}
                    onKeyDown={(e) => handleCreditsKeyDown(e, Useremail)}
                    onBlur={() => setEditingUserEmail(null)}
                    autoFocus
                    style={{ width: "60px" }}
                  />
                ) : (
                  <div
                    className="interactive-screen-userlist-credits-info"
                    onClick={() => handleCreditsClick(Useremail, Credits)}
                  >
                    {Credits}
                  </div>
                )}
              </div>
                </div>
              </div>
            </div>
      
            {/* Right Section */}
            <div className="interactive-screen-userlist-frame-right">
              <div
                className="interactive-screen-userlist-otherdetails-button"
                onClick={() => handleOtherDetails(Useremail)}
              >
                Other Details
              </div>
      
              <div className="interactive-screen-userlist-buttons">
                <div
                  className="interactive-screen-userlist-viewtranscript-button"
                  onClick={() => handleViewTranscript(Useremail)}
                >
                  <div className="interactive-screen-userlist-viewtranscript-button-text">View Transcript</div>
                </div>
                <div
                  className="interactive-screen-userlist-viewjd-button"
                  onClick={() => handleViewJD(Useremail)}
                >
                  <div className="interactive-screen-userlist-viewjd-button-text">View Final J.D.</div>
                </div>
              </div>
            </div>
          </div>
        );
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    

    
    
    

    return (
        <div className="interactive-screen-page-container">
        <div className="interactive-screen-page">
  
          {/* Header Section */}
          <div className="interactive-screen-header">
            <div className="interactive-screen-header-inside">
              <div className="interactive-screen-header-left">
                <div className="interactive-screen-header-left-text"> User History</div>
               
              </div>
              <div className="interactive-screen-header-right" >
                <div className="interactive-screen-settings-container">
                    <img src="/settings.png" alt="Settings" className="interactive-screen-settings-img" onClick={handleSettingsClick} />
                </div>
             </div>

            </div>
          </div>
  
          {/* User List Container */}
          <div className="interactive-screen-userlist-container">
            <div className="interactive-screen-userlist-container-inside">
              {/* Add dynamic user content or components here */}
              {userList.map((user) => renderUserRow(user))}
            </div>
          </div>
          
        </div>
      </div>
   
    );
};

export default InteractiveScreen;
