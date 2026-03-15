import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LandingPage from "./pages/landing";
import Onboarding from "./pages/onboarding";
import PostJob from "./pages/post-jobs";
import JobListing from "./pages/job-listing";
import MyJobs from "./pages/my-jobs";
import SavedJobs from "./pages/saved-jobs";
import JobPage from "./pages/job";

import "./App.css";

import AppLayout from "./layouts/app-layout";
import { ThemeProvider } from "@/components/theme-provider";

const router = createBrowserRouter([
  {
    path: "/",   // ✅ important to define root path
    element: <AppLayout />,
    children: [
      {
        index: true,   // ✅ landing page for "/"
        element: <LandingPage />,
      },
      {
        path: "onboarding",
        element: <Onboarding />,
      },
      {
        path: "jobs",
        element: <JobListing />,
      },
      {
        path: "job/:id",
        element: <JobPage />,
      },
      {
        path: "post-job",
        element: <PostJob />,
      },
      {
        path: "saved-jobs",   // ✅ fixed typo (was saved-job)
        element: <SavedJobs />,
      },
      {
        path: "my-jobs",
        element: <MyJobs />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;