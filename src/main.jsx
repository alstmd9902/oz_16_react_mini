import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SupabaseProvider } from "./context/AuthContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <SupabaseProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SupabaseProvider>
);
