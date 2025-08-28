import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Button } from "@mui/material";

// Array of Image and Text that rotates within the Login page.
const slides = [
  {
    src: "/17.png",
    subtitle:
      "“At MIND-U, every student’s voice is heard and every step toward wellness is valued.”",
  },
  {
    src: "/18.png",
    subtitle:
      "“With MIND-U, staff are equipped to support, guide, and uplift every student’s mental well-being.”",
  },
  {
    src: "/19.png",
    subtitle:
      "“At MIND-U, every student’s voice is heard and every step toward wellness is valued.”",
  },
];


/**
 * ===========================================
 * Screen: Login Page
 * Author: Ronald M. Villarde
 * Created: 2025-04-08
 * Last Updated: 2025-04-28
 * 
 * Description:
 * - The screen is to authenticate and ensure that there is users in subsequent processes
 * - Uses a backend API to fetch and compare if user exist
 * 
 * Purpose:
 * - The goal is to ensure that there is user in the subsquent process and to authenticate
 * - Validations of everything that is requred.
 * 
 * Props:
 * - None
 * 
 * State Variables:
 * - current (number): Tracks the index of the current slide.
 * - email (string): Stores the email input from the user.
 * - password (string): Stores the password input from the user.
 * - emailError (bool): Tracks whether email field have correct string patterns
 * 
 * Functions:
 * - handleSubmit: Prevents default form behavior and sends the credentials to backend API
 * - 
 * 
 * API Calls:
 * - Backend API - To compare and gives the users informations to front end.
 * 
 * Error Handling:
 * - Logs the login error
 * - Prevents user login with incorrect format
 * 
 * Notes:
 * - [Any important notes for future developers or groupmates]
 * ===========================================
 */
export default function LoginScreen() {
  const [current, setCurrent] = useState(0);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [forgotEmailError, setForgotEmailError] = useState(false);
  const [password, setPassword] = useState('');
  const [forgotComponent, setForgotComponent] = useState(false);
  const [codeSended, setCodeSended] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [codeConfirmed, setCodeConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const navigate = useNavigate();
  /**
   * handleSubmit
   * 
   * Handles login form submission:
   * - Prevents default form behavior.
   * - Sends email and password to API (`/staffs/login`).
   * - If successful:
   *    - Stores authentication token and staff data in localStorage.
   *    - Redirects user to the Home page.
   * - If error:
   *    - Alerts the user with an error message.
   * 
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API}/staffs/login`, {
        email,
        password,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      const data = response.data;

      // Store auth data
      localStorage.setItem("authToken", data.token); // or just a flag for now
      localStorage.setItem("staff", JSON.stringify(data.staff));

      // Redirect or reload
      navigate("/landing-page", { replace: true });

    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed.");
    }
  };

  /**
   * useEffect hook to implement a time-based interval for slide transitions.
   * 
   * This effect:
   * - Sets up an interval to update the current slide (`current`) every 3 seconds (3000ms).
   * - Each time the interval triggers, it updates the `current` state to the next slide index, 
   *   using the modulo operation to loop back to the first slide after reaching the last.
   * - Cleans up by clearing the interval when the component is unmounted to prevent memory leaks.
   * 
   * @effect Runs once when the component mounts because of the empty dependency array `[]`.
   * @returns {void} No return value
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length); // Updates the slide index every 3 seconds
    }, 3000);

    // Cleanup: clear the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []); // Empty dependency array means the effect runs only once on mount

  /**
   * handleDotClick
   * 
   * This function is trigger when a dot is click in the carousel
   * - Updates the current slides index to the corresponding index of clicked dot
   * - Uses the index to set the new current slide
   * 
   * @param {number} index - The index of the clicked dot, used to set the current slide.
   */
  const handleDotClick = (index) => {
    setCurrent(index);
  };

  /**
   * handleEmailChange
   * 
   * Handles changes in the email input field.
   * - Updates the `email` state with the input field's value.
   * - Validates the email format and sets an error state if invalid.
   * 
   * @param {Event} e - The event triggered when the user types in the email field.
   */
  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail)) {
      setEmailError(true);   // Invalid email format
    } else {
      setEmailError(false);  // Valid email format
    }
  };

  const handleForgotEmailChange = (e) => {
    const inputEmail = e.target.value;
    setForgotEmail(inputEmail);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail)) {
      setForgotEmailError(true);   // Invalid email format
    } else {
      setForgotEmailError(false);  // Valid email format
    }
  };

  const handleForgotCodeChange = (e) => {
    setForgotCode(e.target.value);
  }

  /**
   * handlePasswordChange
   * 
   * Triggered when the user types in the password input field:
   * - Updates the `password` state to reflect the current value in the input field.
   * 
   * @param {Event} e - The keyboard event triggered when the user types in the password field.
   */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log("Auth Code:", response.code);  // now you'll get code
        const tokenResponse = await axios.post(`${API}/staffs/exchange-code`, { code: response.code });

        const { id_token } = tokenResponse.data; // Get the ID token from the backend response

        if (!id_token) {
          throw new Error('ID Token is missing');
        }

        // Step 2: Decode the ID token to get the user's email
        const decoded = jwtDecode(id_token);
        const email = decoded.email;  // Extract email from the
        // Step 3: Send the email to the backend to check if the user exists in the database
        const userCheckResponse = await axios.post(`${API}/staffs/check-user`, { email });

        if (userCheckResponse.data.exists) {
          // User exists, store their ID and position in localStorage as part of the staff object
          const { id, position, name, section, email, picture } = userCheckResponse.data;
          const staffData = { id, position, name, section, email, picture };
          localStorage.setItem("staff", JSON.stringify(staffData));

          // Step 4: Save the staff data object in localStorage
          localStorage.setItem("authToken", id_token); // or just a flag for now
          localStorage.setItem("staff", JSON.stringify(staffData));

          navigate("/landing-page", { replace: true });  // Redirect to the Home page
          const message = `${staffData.position}: ${staffData.name} logged in to Mind-U Guidance Management`
          await axios.post(`${API}/activity-logs/insert`, { message });
        } else {
          console.log('User does not exist');
        }
      } catch (err) {
        console.error('Login error:', err);  // Handle token-related or user check errors
      }
    },
    onError: (err) => {
      console.error('Login Failed', err);  // Handle failed login attempt
    },
    flow: 'auth-code', // Use popup window instead of opening a new window
  });

  const handleSendCode = async () => {
    try {
      const response = await axios.post(`${API}/staffs/forgot-password`, {
        email: forgotEmail,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        setCodeSended(true);
        alert("Code sent to your email");
      } else {
        alert("Failed to send code");
      }
    }
    catch (err) {
      console.error("Error sending code:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to send code.");
    }
  }

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post(`${API}/staffs/verify-code`, {
        email: forgotEmail,
        code: forgotCode,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        setCodeConfirm(true);
        setCodeSended(false);
        alert("Code verified successfully");
      } else {
        alert("Failed to verify code");
      }
    }
    catch (err) {
      console.error("Error verifying code:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to verify code.");
    }
  }

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post(`${API}/staffs/reset-password`, {
        email: forgotEmail,
        code: forgotCode,
        newPassword: newPassword,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        alert("Password reset successfully");
        setForgotComponent(false);
        setCodeConfirm(false);
        setForgotEmail('');
        setForgotCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        alert("Failed to reset password");
      }
    }
    catch (err) {
      console.error("Error resetting password:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to reset password.");
    }
  }

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  }

  const handleConfirmNewPasswordChange = (e) => {
    setConfirmNewPassword(e.target.value);
  }

  const handleCancel = () => {
    setForgotComponent(false);
    setCodeConfirm(false);
    setForgotEmail('');
    setForgotCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  }

  return (
    <div className="w-screen h-screen">
      <img
        src="/Login.png"
        alt="Login"
        className="w-screen h-screen object-fill"
      />
      
      
      {!forgotComponent ? (
        /* Centered Box divided in to two parts */
        <div className="w-5/6 h-5/6 bg-white absolute flex flex-row top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] rounded-lg shadow-2xl">
          {/* Left Side with Carousel */}
          <div className="bg-[#94a3b8] w-1/2 h-full rounded-l-lg p-10 flex flex-col items-center justify-center space-y-6">
            <p className="font-dancing text-4xl text-center text-black">
              Fostering a Healthier Future
            </p>

            {/* Carousel Image */}
            <img
              src={slides[current].src}
              alt="Slide"
              className="w-full h-96 object-contain transition-all duration-500"
            />

            {/* Subtitle */}
            <p className="text-center text-black font-bold text-lg px-2">
              {slides[current].subtitle}
            </p>

            {/* Clickable Dots */}
            <div className="flex justify-center space-x-2 mt-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === current ? "bg-[#1e3a8a]" : "bg-[#b7cde3]"
                  } transition-all duration-300 focus:outline-none`}
                ></button>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="bg-white w-1/2 h-full rounded-r-lg p-32">
              <p className="font-dancing text-7xl text-center text-[#334155]">Welcome to</p>
              <p className="font-extrabold text-7xl text-center text-[#1e3a8a] mb-10">MIND-U</p>
              <div className="w-full flex items-center justify-center">
                <div className="w-3/4 max-w-md">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full py-2 px-4 border-2 ${emailError ? "border-red-700" : "border-black"} rounded mt-2`}
                    placeholder="Enter your email"
                    required
                  />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit(e);
                      }
                    }}
                    className="w-full py-2 px-4  border-2 border-black rounded mt-4"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              <p className="text-sm text-end px-16" onClick={() => setForgotComponent(true)}>Forgot Password?</p>
              <p className="test-lg text-center mt-8 bg-[#60a5fa] w-fit py-2 px-20 rounded-full font-roboto font-bold text-white mx-auto" onClick={handleSubmit}>LOG IN</p>
              <div className="flex justify-center items-center flex-row mt-4">
                <hr className="border-t border-gray-500 w-1/3" />
                <p className="mx-2 text-gray-800">OR</p>
                <hr className="border-t border-gray-500 w-1/3" />
              </div>
              <div className="flex justify-center items-center flex-row mt-4" onClick={login}>
                <img src="/Google Logo.png" alt="Google" className="w-8 h-8 object-contain" />
                <p className="text-center ml-2">Sign in with Google</p>
              </div>
          </div>
        </div>
      ) : (
        <div className="w-5/6 h-5/6 bg-white absolute flex flex-row top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] rounded-lg shadow-2xl items-center justify-center">
          <div className="bg-[#e2e8f0] w-5/12 h-2/3 rounded-lg px-10 py-5 flex flex-col items-center relative">
            <div className="mb-[5%]">
            <p className="text-6xl text-center text-[#1e3a8a] font-extrabold">{!codeConfirmed ? "Forgot" : "Reset"}</p>
            <p className="text-6xl text-center text-[#1e3a8a] font-extrabold">Password</p>
            </div>
            {!codeConfirmed ? (
              <div className="w-3/4">
              <input
                type="email"
                id="forgotEmail"
                value={forgotEmail}
                onChange={handleForgotEmailChange}
                className={`w-full py-2 px-4 border-2 ${forgotEmailError ? "border-red-700" : "border-black"} rounded mt-2`}
                placeholder="Enter your email"
                required
              />
              {codeSended && (
                <>
                  <input
                    type="text"
                    id="forgotCode"
                    value={forgotCode}
                    onChange={handleForgotCodeChange}
                    className={`w-full py-2 px-4 border-2 border-black rounded mt-6`}
                    placeholder="Enter code from email"
                    required
                  />
                  <p className="text-center">An email with a verification code was just send to {forgotEmail}</p>
                </>
              )}
            </div>
              ) : (
                <div className="w-3/4">
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  className={`w-full py-2 px-4 border-2 border-black rounded mt-2`}
                  placeholder="Enter new password"
                  required
                />
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={handleConfirmNewPasswordChange}
                  className={`w-full py-2 px-4 border-2 border-black rounded mt-6`}
                  placeholder="Confirm new password"
                  required 
                />
                </div> 
              )}
            <div className="absolute bottom-10 right-0 px-[15%]">
              <Button onClick={handleCancel}>
                <p className="text-base font-roboto font-bold text-[#64748b] p-2">Back</p>
              </Button>
              {codeConfirmed ? (
                <Button 
                onClick={handleResetPassword} 
                disabled={!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                >
                  <p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa]">Reset Password</p>
                </Button>
              ) : !codeSended ? (
                <Button 
                onClick={handleSendCode} 
                disabled={!forgotEmail || forgotEmailError}
                >
                  <p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa]">Send Code</p>
                </Button>
              ) : (
                <Button 
                onClick={handleVerifyCode} 
                disabled={!forgotEmail || forgotEmailError || !forgotCode}
                >
                  <p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa]">Verify Code</p>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
