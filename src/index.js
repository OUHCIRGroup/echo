import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/auth-context";
import { TaskContextProvider } from "./context/task-context";
import { FlowContextProvider } from "./context/flow-context";
import { StudyFlowProvider } from "./context/study-flow-context";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthContextProvider>
    <TaskContextProvider>
      <FlowContextProvider>
        <StudyFlowProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </StudyFlowProvider>
      </FlowContextProvider>
    </TaskContextProvider>
  </AuthContextProvider>,
);
window.scrollTo(0, document.body.scrollHeight);

reportWebVitals();
