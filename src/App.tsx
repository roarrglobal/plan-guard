import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "./pages/Landing";
import Analyze from "./pages/Analyze";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AnalysisDetail from "./pages/AnalysisDetail";
import AnalysisHistoryPage from "./pages/AnalysisHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import ProfileSettings from "./pages/ProfileSettings";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";
import JournalPage from "./pages/JournalPage";
import JournalNewPage from "./pages/JournalNewPage";
import DecisionsPage from "./pages/DecisionsPage";
import DecisionNewPage from "./pages/DecisionNewPage";
import DecisionDetailPage from "./pages/DecisionDetailPage";
import PostMortemPage from "./pages/PostMortemPage";
import PostMortemNewPage from "./pages/PostMortemNewPage";
import PostMortemDetailPage from "./pages/PostMortemDetailPage";
import QuickRetroPage from "./pages/QuickRetroPage";
import HabitsPage from "./pages/HabitsPage";
import FrameworksPage from "./pages/FrameworksPage";
import SwotAnalysisPage from "./pages/SwotAnalysisPage";
import PorterAnalysisPage from "./pages/PorterAnalysisPage";
import PremortemAnalysisPage from "./pages/PremortemAnalysisPage";
import JournalDetailPage from "./pages/JournalDetailPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              
              {/* App routes with layout */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analyze" element={<Analyze />} />
                <Route path="/analyses" element={<AnalysisHistoryPage />} />
                <Route path="/analysis/:id" element={<AnalysisDetail />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/journal/new" element={<JournalNewPage />} />
                <Route path="/journal/:id" element={<JournalDetailPage />} />
                <Route path="/decisions" element={<DecisionsPage />} />
                <Route path="/decisions/new" element={<DecisionNewPage />} />
                <Route path="/decisions/:id" element={<DecisionDetailPage />} />
                <Route path="/post-mortem" element={<PostMortemPage />} />
                <Route path="/post-mortem/new" element={<PostMortemNewPage />} />
                <Route path="/post-mortem/:id" element={<PostMortemDetailPage />} />
                <Route path="/quick-retro" element={<QuickRetroPage />} />
                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/frameworks" element={<FrameworksPage />} />
                <Route path="/frameworks/swot/:id" element={<SwotAnalysisPage />} />
                <Route path="/frameworks/porter/:id" element={<PorterAnalysisPage />} />
                <Route path="/frameworks/premortem/:id" element={<PremortemAnalysisPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfileSettings />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
