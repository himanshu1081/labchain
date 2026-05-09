import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ReturnEquipment from "./ReturnEquipment.jsx";
import "./index.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route
            path="/return"
            element={<ReturnEquipment />}
          />
        </Routes>
      </BrowserRouter>
    </ConvexProvider>
  </React.StrictMode>
);
