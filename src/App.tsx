
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotePage from "./pages/NotePage";
import NotFound from "./pages/NotFound";
import { Chatbot } from "./components/Chat/Chatbot";
import FocusMode from "./pages/FocusMode";
import DocumentsPage from "./pages/DocumentsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/category/:category" element={<Index />} />
          <Route path="/note/:id" element={<NotePage />} />
          <Route path="/focus" element={<FocusMode />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Chatbot />
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
