import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { InformesStandalonePage, isInformesPath } from "./domain/reliability/InformesStandalonePage";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    {isInformesPath() ? <InformesStandalonePage /> : <App />}
  </StrictMode>,
);
