import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { InformesStandalonePage } from "./domain/reliability/InformesStandalonePage";
import { isInformesStandalonePath } from "./domain/reliability/nav/urlRouting";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    {isInformesStandalonePath() ? <InformesStandalonePage /> : <App />}
  </StrictMode>,
);
