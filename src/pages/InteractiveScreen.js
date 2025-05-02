import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import "./InteractiveScreen.css";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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
                        
                        // Calculate Average Rating
                        let avgRating = "N/A";
                        
                        // Check if Ratings exist
                        if (userData.Ratings && Object.keys(userData.Ratings).length > 0) {
                            let totalRatingSum = 0;
                            let totalRatingCount = 0;
                            
                            // Process the Ratings object where keys are identifiers and values are the ratings
                            Object.values(userData.Ratings).forEach(ratingValue => {
                                // Convert rating value to number
                                const rating = parseInt(ratingValue, 10);
                                
                                if (!isNaN(rating)) {
                                    // Add the rating value to the total
                                    totalRatingSum += rating;
                                    totalRatingCount += 1;
                                }
                            });
                            
                            // Calculate average if there are ratings
                            if (totalRatingCount > 0) {
                                avgRating = (totalRatingSum / totalRatingCount).toFixed(1);
                            }
                        }
                        
                        return {
                            Name: userData.Name || user.displayName || "Unknown Name",
                            Useremail: user.EmailId,
                            Credits: userData.Credits ?? 0,
                            CreditsUsed: userData.CreditsUsed ?? 0, // Use existing CreditsUsed value
                            ConversationNumber: userData.ConversationNumber ?? 0,
                            JobRole: userData.JobRole || null,
                            CompanyName: userData.CompanyName || null,
                            Rating: avgRating
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

    const handleOtherDetails = async (userEmail, conversationNumber = 1) => {
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
          navigate("/otherdetails", { state: { data: filteredData, userEmail, conversationNumber } });
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

  const handleCreditsChange11 = (e) => {
    //setNewCreditsValue(e.target.value);
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

      // Update local userList and recalculate CreditsUsed
      setUserList((prevList) =>
        prevList.map((user) => {
          if (user.Useremail === email) {
            const initialCredits = 5;
            const creditsUsed = initialCredits - newCredits;
            return { 
              ...user, 
              Credits: newCredits,
              CreditsUsed: creditsUsed
            };
          }
          return user;
        })
      );
    } catch (error) {
      console.error("Error updating credits:", error);
    } finally {
      // Exit edit mode
      setEditingUserEmail(null);
      setNewCreditsValue("");
    }
  };
    
    const handleViewJD = async (userEmail, conversationNumber = 1) => {
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

            navigate("/viewjd", { state: { data: filteredData, userEmail, conversationNumber } });
        } else {
            console.error("No data found at path:", path);
        }
    };

    const handleViewTranscript = async (email, conversationNumber = 1) => {
        console.log(`Navigating to transcript for: ${email}`);
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
                navigate("/viewtranscript", { state: { userEmail: email, chatHistory, conversationNumber } });
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

    const handleSettingsClick = async () => {
      console.log("handleSettingsClick triggered");
      try {
          const docRef = doc(db, "ProjectBrainsReact", "Admin"); // Reference to the Admin document
          console.log("Fetching Admin document...");
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
              console.log("Admin document fetched successfully:", docSnap.data());
              // Use correct property names (case-sensitive)
              const introtitle = docSnap.data().IntroTitle; 
              const intromessage = docSnap.data().IntroMessage;
              const interactionrules = docSnap.data().InteractionPrompt;
              const resultsprompt = docSnap.data().ResultsPrompt;
              const miscellaneousprompt = docSnap.data().MiscPrompt;
              console.log("Navigating to Settings page with data:", { introtitle, intromessage, interactionrules, resultsprompt, miscellaneousprompt });
              navigate("/Settings", { state: { introtitle, intromessage, interactionrules, resultsprompt, miscellaneousprompt } });
          } else {
              console.error("Admin document not found.");
          }
      } catch (error) {
          console.error("Error fetching admin data:", error);
      }
  };
    
  const renderUserRow = (user) => {
    const { Name, Useremail, Credits, CreditsUsed, ConversationNumber, Rating } = user;

    return (
      <div className="interactive-screen-userlist-table-row" key={Useremail}>
        <div className="interactive-screen-table-col interactive-screen-table-data-col-name" >
          {Name}
        </div>
        
        <div className="interactive-screen-table-col interactive-screen-table-data-col-credits-used">
          {CreditsUsed}
        </div>
        
        <div className="interactive-screen-table-col interactive-screen-table-data-col-credits-remaining">
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
              className="interactive-screen-credits-box"
              onClick={() => handleCreditsClick(Useremail, Credits)}
            >
              {Credits}
            </div>
          )}
        </div>
        
        <div className="interactive-screen-table-col interactive-screen-table-data-col-rating">
          {Rating}
        </div>
        
        <div className="interactive-screen-table-col interactive-screen-table-data-col-actions">
          {/* Rest of your actions remain the same */}
          <div className="interactive-screen-userlist-otherdetails-button" onClick={() => handleOtherDetails(Useremail)}>
            Other Details
          </div>
  
          {ConversationNumber <= 1 ? (
            <>
         <div className="interactive-screen-profile-container">
            <div className="interactive-screen-profile-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="interactive-screen-profile-card">
              <div className="interactive-screen-profile-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="interactive-screen-profile-info">
                <h3 className="interactive-screen-profile-name">{Name}</h3>
                <p className="interactive-screen-profile-job">{user.JobRole || "Not Found"}</p>
                <p className="interactive-screen-profile-company">{user.CompanyName || "Not Found"}</p>
                <a href={`mailto:${Useremail}`} className="interactive-screen-profile-email">{Useremail}</a>
              </div>
            </div>
          </div>
              
              <div className="interactive-screen-userlist-viewtranscript-button" onClick={() => handleViewTranscript(Useremail)}>
                View Transcript
              </div>
              
              <div className="interactive-screen-userlist-viewjd-button" onClick={() => handleViewJD(Useremail)}>
                View Final J.D.
              </div>
            </>
          ) : (
            <>
              <div className="interactive-screen-profile-container">
                <div className="interactive-screen-profile-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="interactive-screen-profile-card">
                  <div className="interactive-screen-profile-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="interactive-screen-profile-info">
                    <h3 className="interactive-screen-profile-name">{Name}</h3>
                    <p className="interactive-screen-profile-job">{user.JobRole || "Not Found"}</p>
                    <p className="interactive-screen-profile-company">{user.CompanyName || "Not Found"}</p>
                    <a href={`mailto:${Useremail}`} className="interactive-screen-profile-email">{Useremail}</a>
                  </div>
                </div>
              </div>
              
              <div className="interactive-screen-userlist-viewall-button" onClick={() => handleViewAll(Useremail, ConversationNumber)}>
                View All
                
              </div>
            </>
          )}
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
              <div className="interactive-screen-header-left-text">User History</div>
            </div>
            <div className="interactive-screen-header-right">
              <div className="interactive-screen-settings-container">
                <img
                  src="/settings.png"
                  alt="Settings"
                  className="interactive-screen-settings-img"
                  onClick={handleSettingsClick}
                />
              </div>
            </div>
          </div>
        </div>

        {/* User List Container */}
        <div className="interactive-screen-userlist-container">
          {/* Table Header */}
          <div className="interactive-screen-userlist-table-header">
              <div className="interactive-screen-table-col interactive-screen-table-header-col-name">
                Name
              </div>
              <div className="interactive-screen-table-col interactive-screen-table-header-col-credits-used">Credits Used</div>
              <div className="interactive-screen-table-col interactive-screen-table-header-col-credits-remaining">Credits Remaining</div>
              <div className="interactive-screen-table-col interactive-screen-table-header-col-rating">Avg Rating</div>
              <div className="interactive-screen-table-col interactive-screen-table-header-col-actions"></div>
          </div>
          
          {/* User List Table */}
          <div className="interactive-screen-userlist-table">
            {userList.map((user) => renderUserRow(user))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveScreen;