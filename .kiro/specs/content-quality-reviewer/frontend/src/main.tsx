
  import { createRoot } from "react-dom/client";
  import { Amplify } from 'aws-amplify';
  import App from "./App.tsx";
  import "./index.css";
  import awsconfig from './aws-exports';

  // Configure Amplify
  Amplify.configure(awsconfig);

  createRoot(document.getElementById("root")!).render(<App />);
  