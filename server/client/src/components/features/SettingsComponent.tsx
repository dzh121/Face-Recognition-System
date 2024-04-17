import React, { useState, useEffect } from "react";
import { Input, Checkbox, Switch, Button } from "@nextui-org/react";
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../utils/firebase";
import { getAuth } from "firebase/auth";
import { EyeFilledIcon } from "./EyeFilledIcon";
import { EyeSlashFilledIcon } from "./EyeSlashFilledIcon";

type Camera = {
  id: string;
  location: string;
};

const SettingsComponent: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [recognizeFaces, setRecognizeFaces] = useState<boolean>(true);
  const [theme, setTheme] = useState<string>("light");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isVisibleNew, setIsVisibleNew] = useState<boolean>(false);
  const [isVisibleOld, setIsVisibleOld] = useState<boolean>(false);

  const toggleVisibilityNew = () => setIsVisibleNew(!isVisibleNew);
  const toggleVisibilityOld = () => setIsVisibleOld(!isVisibleNew);

  const user = auth.currentUser;
  const userRef = user ? doc(db, "users", user.uid) : null;

  useEffect(() => {
    if (user) {
      if (userRef) {
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Set the states with fetched data or default values
            setEmail(userData.email || "");
            setName(userData.name || "");
            setNotifications(
              userData.notifications !== undefined
                ? userData.notifications
                : false
            );
            console.log(userData.theme);
            console.log(userData.theme || "light");
            setTheme(userData.theme || "light");
            setRecognizeFaces(
              userData.recognizeFaces !== undefined
                ? userData.recognizeFaces
                : false
            );
          }
        });
      }
    }
    const fetchCameras = async () => {
      // Replace this with your API call or Firebase call to fetch cameras
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();

        const response = await fetch(
          `http://localhost:8080/devices?token=${token}`
        );

        const camerasData = await response.json();
        setCameras(camerasData);
      } else {
        console.log("User not logged in");
      }
    };

    fetchCameras();
  }, []);

  const handleRemoveCamera = async (cameraId: string) => {
    try {
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        await fetch(`http://localhost:8080/remove-device?token=${token}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: cameraId }),
        });
        setCameras(cameras.filter((camera) => camera.id !== cameraId));
        setSuccess("Camera removed successfully!");
      } else {
        setError("User not logged in");
      }
    } catch (error) {
      setError("Error removing camera");
    }
  };
  const handleChange =
    (setState: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setState(event.target.value);
      setSuccess("");
    };

  const handleEmailChange = handleChange(setEmail);
  const handlePasswordChange = handleChange(setPassword);
  const handleCurrentPasswordChange = handleChange(setCurrentPassword);
  const handleNameChange = handleChange(setName);

  const handleNotifications = (notifications: boolean) => {
    setNotifications(notifications);
    setSuccess("");
  };

  const handleRecognizeFaces = (recg: boolean) => {
    setRecognizeFaces(recg);
    setSuccess("");
  };
  const handleThemeChange = (newTheme: boolean) => {
    setTheme(newTheme ? "dark" : "light");
    if (newTheme) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    if (userRef === null) {
      setError("User not found");
      return;
    }

    // Password length validation
    if (password && password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      if (currentPassword && user.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
      }

      if (password && password !== currentPassword) {
        await updatePassword(user, password);
      }
      // Update email in Firebase Auth
      await updateEmail(user, email);

      // Update Firestore data (excluding the password)
      await updateDoc(userRef, {
        email,
        name,
        notifications,
        recognizeFaces,
        theme,
      });

      if (theme === "dark") {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
      setSuccess("Settings updated successfully!");
      setError("");
      setPassword("");
      setCurrentPassword("");
    } catch (error: any) {
      console.error("Error updating settings:", error);
      setError(error.message || "An error occurred");
      setSuccess("");
    }
  };

  // Ensure user is not null before rendering the form
  if (!user) {
    return <p>Loading user data...</p>;
  }
  const centeredStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "20px",
    boxSizing: "border-box",
  };

  const inputStyle = {
    fontSize: "1.2em",
  };

  return (
    <div style={centeredStyle}>
      <h1 style={{ marginBottom: "20px" }}>Settings</h1>
      {/* Error and success messages */}
      {error && <p color="danger">{error}</p>}
      {success && <p color="success">{success}</p>}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
      >
        {/* Name Input */}
        <Input
          isRequired
          variant="bordered"
          type="string"
          label="Name"
          value={name}
          labelPlacement="outside"
          placeholder="Enter your name"
          className="max-w-xs"
          onChange={handleNameChange}
          style={inputStyle}
        />

        {/* Email Input */}
        <Input
          isClearable
          isRequired
          variant="bordered"
          type="email"
          label="Email"
          value={email}
          labelPlacement="outside"
          placeholder="Enter your email"
          className="max-w-xs"
          onChange={handleEmailChange}
          style={inputStyle}
        />

        <Input
          isClearable
          label="Current Password"
          variant="bordered"
          labelPlacement="outside"
          value={currentPassword}
          autoComplete="off"
          onChange={handleCurrentPasswordChange}
          placeholder="Enter your Current Password"
          style={inputStyle}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibilityOld}
            >
              {isVisibleOld ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          type={isVisibleOld ? "text" : "password"}
          className="max-w-xs"
        />
        <Input
          isClearable
          label="New Password"
          variant="bordered"
          labelPlacement="outside"
          value={password}
          autoComplete="off"
          onChange={handlePasswordChange}
          placeholder="Enter your New Password"
          style={inputStyle}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibilityNew}
            >
              {isVisibleNew ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          type={isVisibleNew ? "text" : "password"}
          className="max-w-xs"
        />

        {/* Theme Switch */}
        <Switch
          checked={theme === "dark"}
          isSelected={theme === "dark"}
          style={inputStyle}
          onChange={(e) => handleThemeChange(e.target.checked)}
        >
          Dark Mode
        </Switch>

        <Switch
          checked={recognizeFaces}
          isSelected={recognizeFaces}
          style={inputStyle}
          onChange={(e) => handleRecognizeFaces(e.target.checked)}
        >
          Recognize Faces
        </Switch>
        <Switch
          checked={notifications}
          isSelected={notifications}
          style={inputStyle}
          onChange={(e) => handleNotifications(e.target.checked)}
        >
          Notifications
        </Switch>
        {/* Camera List and Remove Button */}
        <h3 className="mt-4 mb-3">Connected Cameras</h3>
        {cameras.length > 0 ? (
          cameras.map((camera) => (
            <div key={camera.id}>
              <p>
                {camera.id} - {camera.location}
                <Button
                  style={inputStyle}
                  color="danger"
                  type="button" // Important to specify the type
                  onClick={() => handleRemoveCamera(camera.id)}
                >
                  Remove
                </Button>
              </p>
            </div>
          ))
        ) : (
          <p>No cameras connected</p>
        )}

        {/* Submit Button */}
        <Button type="submit" className="mt-3" style={inputStyle}>
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default SettingsComponent;