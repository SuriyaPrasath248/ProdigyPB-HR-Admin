import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./ViewJDPage.css";

const ViewJDPage = () => {
  const location = useLocation();
  const { data, userEmail, conversationNumber } = location.state || {};
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [marketplaceUrl, setMarketplaceUrl] = useState(null);

  const handleBackNavigation = () => {
    navigate("/"); // Go back to the previous page
  };

  const handleOtherDetails = async (userEmail, conversationNumber) => {
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

  const handleViewTranscript = async (email, conversationNumber) => {
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

  const handleCopyLink = () => {
    if (data && data.LinkCreated) {
      navigator.clipboard.writeText(data.LinkCreated).then(() => {
        alert('JD link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

  const handleCopyJobDescription = () => {
    if (data && data.JDCreated) {
      navigator.clipboard.writeText(data.JDCreated).then(() => {
        alert('Job description copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

  // New function to publish to Sharetribe using fetch instead of axios
  const handlePublishToSharetribe = async () => {
    if (!data || !data.JDCreated) {
      alert('No job description available to publish.');
      return;
    }

    setPublishing(true);

    try {
      // Fetch job role from Firebase
      const path = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversationNumber}`;
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error("Could not find job data in Firebase");
      }
      
      const userData = docSnap.data();
      const jobRole = userData.JobRole || "Business Consultant Position";
      
      console.log("Job role for publish:", jobRole);
      
      // Step 1: Authenticate with Sharetribe
      const authResponse = await fetch('https://sharetribe-login-376436174826.europe-west2.run.app/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: "narayanan@xplorro.com",
          password: "Xplorro1"
        })
      });
      
      const authData = await authResponse.json();
      
      if (!authData.success) {
        throw new Error("Authentication failed");
      }
      
      const token = authData.data.access_token;
      console.log("Authentication successful, token obtained");
      
      // Step 2: Create listing
      const mockListing = {
        // Core listing information
        title: jobRole,
        description: data.JDCreated,
        authorId: "6810e841-eab7-483c-a9a2-aa8d774073c9",
        state: "published",
        
        // Geolocation information
        geolocation: {
          lat: 51.5073,
          lng: -0.127647
        },
        
        // Price information
        price: {
          amount: 9900, // In the smallest currency unit (pence)
          currency: "GBP"
        },
        
        // Availability plan
        availabilityPlan: {
          type: "availability-plan/time",
          timezone: "Etc/UTC",
          entries: []
        },
        
        //userEmail: "narayanan@xplorro.com",
        
        // PublicData object with all the required fields
        publicData: {
          categoryLevel1: "BN", // Using code instead of descriptive name
          currentStatus: "open",
          listingType: "FP", // Using code instead of descriptive name
          needFrequency: "monthly",
          needSector: "other",
          needStart: "asap",
          service: ["hybrid"],
          location: {
            address: "London, Greater London, England, United Kingdom",
            building: ""
          },
          transactionProcessAlias: "default-inquiry/release-1",
          unitType: "inquiry",
          
          // Pricing information
          pricingType: "fixed",
          fixedUnit: "milestone", // Changed from "Deliverable" to match the PDF
          timeUnit: null,
          percentageType: null,
          percentageValue: null
        }
      };
      
      const createListingResponse = await fetch('https://sharetribe-login-376436174826.europe-west2.run.app/api/create-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'userEmail': "info@projectbrains.io"
        },
        body: JSON.stringify(mockListing)
      });
      
      const createListingData = await createListingResponse.json();
      console.log("Listing creation response:", createListingData);
      
      if (createListingData.success) {
        // Display alert instead of inline notification
        alert("Job successfully published to Sharetribe marketplace!");
        setMarketplaceUrl(createListingData.marketplaceUrl);
      } else {
        throw new Error(createListingData.error || "Failed to create listing");
      }
      
    } catch (error) {
      console.error("Error publishing to Sharetribe:", error);
      alert(`Failed to publish job: ${error.message || "Unknown error"}`);
    } finally {
      setPublishing(false);
    }
  };

  const formatJobDescription = (jd) => {
    console.log("Formatting JD content for display");
    if (!jd) return ''; // Handle undefined jd to avoid errors
    console.log("Formatting changes");
    return jd
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert **text** to <strong>text</strong>
      .replace(/^- /gm, '<br>• ') // Ensure bullets start correctly on new lines
      .replace(/\n{2,}/g, '<br><br>') // Convert double newlines into paragraph breaks
      .replace(/\n/g, '<br>'); // Convert single newlines into <br> to maintain spacing
  };
 
  return (
    <div className="view-jd-page-container">
      <section className="view-jd-page">
        <div className="view-jd-header">
          <div className="view-jd-header-inside">
            <div className="view-jd-header-left">
              <div 
                className="view-jd-back-button" 
                onClick={handleBackNavigation}
              >
                <img src="/back.png" alt="Back" />
              </div>
              {userEmail && <div className="view-jd-user-email">{userEmail}</div>}
            </div>
            <div className="view-jd-header-right">
              <div 
                className="view-jd-OtherDetails-button" 
                onClick={() => handleOtherDetails(userEmail, conversationNumber)}>
                Other Details
              </div>
              <div 
                className="view-jd-ViewTranscript-button" 
                onClick={() => handleViewTranscript(userEmail, conversationNumber)}>
                <div className="view-jd-ViewTranscript-button-text">View Transcript</div> 
              </div>
              <div 
                className="view-jd-publish-button" 
                onClick={handlePublishToSharetribe}
                disabled={publishing}>
                <div className="view-jd-publish-button-text">
                  {publishing ? 'Publishing...' : 'Publish to Marketplace'}
                </div> 
              </div>
            </div>
          </div>
        </div>
        
        
        
        {data && data.LinkCreated ? (
          <div className="view-jd-jd-link-container">
            <div className="view-jd-jd-link">
              <div className="view-jd-jd-link-header">JD link:</div>
              <div className="view-jd-jd-hyperlink">
                {data.LinkCreated}
              </div>
            </div>
            <div className="view-jd-copy-icon"  onClick={handleCopyLink}>
              <div className="view-jd-copy-border">
                <img src="/copy-icon.png" alt="Copy" className="view-jd-copy-img" />
              </div>
            </div>
          </div>
        ) : (
          <div className="view-jd-jd-link-container">
            <div className="view-jd-jd-link">No JD link available</div>
          </div>
        )}
        
        <div className="view-jd-chatbox">
          <div className="view-jd-chatbox-header">
            <div className="view-jd-chatbox-header-text">Job Description</div>
            <div
              className="view-jd-content-copy-icon"
              onClick={handleCopyJobDescription}
            >
              <div className="view-jd-content-copy-border">
                <img
                  src="/copy-icon.png"
                  alt="Copy"
                  className="view-jd-content-copy-img"
                />
              </div>
            </div>
          </div>
          <div className="view-jd-content">
            {data && data.JDCreated ? (
              <div
                dangerouslySetInnerHTML={{ __html: formatJobDescription(data.JDCreated) }}
              />
            ) : (
              <p>No job description available</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViewJDPage;