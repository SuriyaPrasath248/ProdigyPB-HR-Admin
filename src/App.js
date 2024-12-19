/*APP.JS*/
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import InteractiveScreen from "./pages/InteractiveScreen";
import ConversationScreen from "./pages/ConversationScreen";
import OtherDetailsPage from "./pages/OtherDetailsPage";
import ViewJDPage from "./pages/ViewJDPage";
import ViewTranscriptPage from "./pages/ViewTranscriptPage";
import SettingsPage from "./pages/Settings";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLoginSuccess = () => {
        console.log("Login successful! Displaying Interactive Screen.");
        setIsLoggedIn(true); // Update login state to true
    };

    return (
        <Router>
            
                {!isLoggedIn ? (
                    <LoginPage onLoginSuccess={handleLoginSuccess} />
                ) : (
                    <Routes>
                        {/* Default to InteractiveScreen */}
                        <Route path="/" element={<InteractiveScreen />} />
                        <Route path ="/conversationpage" element ={<ConversationScreen/>}/>
                        <Route path ="/Settings" element ={<SettingsPage/>}/>
                        <Route path="/otherdetails" element={<OtherDetailsPage />} />
                        <Route path="/viewjd" element={<ViewJDPage />} />
                        <Route path="/viewtranscript" element={<ViewTranscriptPage />} />
                    </Routes>
                )}
            
        </Router>
    );
}

export default App;
