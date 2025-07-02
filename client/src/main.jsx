import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "./components/sidebar/SidebarContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>



      <SidebarProvider>
    <App />
    </SidebarProvider>

  </GoogleOAuthProvider>
);




