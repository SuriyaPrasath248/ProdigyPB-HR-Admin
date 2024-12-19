import React, { useState } from "react";
import "./Login.css";
import { db, doc, getDoc } from "../firebase/firebase";

const LoginPage = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState(""); // Store user input
    const [errorMessage, setErrorMessage] = useState(""); // Handle error messages

    const fetchPassword = async () => {
        try {
            console.log("Fetching admin password from Firestore...");
            const docRef = doc(db, "Project Brains", "Admin"); // Reference to the Admin document
            const docSnap = await getDoc(docRef); // Fetch the document

            if (docSnap.exists()) {
                const adminData = docSnap.data(); // Get the document data
                const storedPassword = adminData.Password; // Extract the password

                if (password === storedPassword) {
                    console.log("Login successful");
                    onLoginSuccess(); // Trigger callback to switch to InteractiveScreen
                } else {
                    console.log("Incorrect password");
                    setErrorMessage("Incorrect password. Please try again.");
                }
            } else {
                console.error("Admin document does not exist in Firestore.");
                setErrorMessage("Admin data not found.");
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
            setErrorMessage("An error occurred. Please try again.");
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission
        fetchPassword(); // Call the fetch function
    };

    return (
      <div className="login-body">
        <form className="login-container" onSubmit={handleSubmit}>
          <div className="logobox">
            <div className="logo-image-box">
              <div className="logo-img">
                <img src="/pb-login-logo-rs.png" alt="Logo" />
              </div>
            </div>
            <div className="logo-title">Prodigy PB</div>
          </div>
          <div className="password-box">
            <div className="password-subbox">
              <div className="password-label">Password</div>
      
              <input
                type="password"
                placeholder="Enter your password"
                className="input-box-holder"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Handle input changes
              />
            </div>
          </div>
          {/* Display error message */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
        </div>
      );
      
    };
export default LoginPage;
/*<div className="logo">
                    <img src="https://via.placeholder.com/100" alt="Logo" />
                </div>
                <h2>Prodigy PB</h2>
                <form onSubmit={handleSubmit}>
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="input-box"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Handle input changes
                    />
                    <button type="submit" className="login-button">
                        Login
                    </button>
                </form>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
*/