import { useState } from "react";
import Hero from "@/components/Hero";
import ChatInterface from "@/components/ChatInterface";
import PatientReport from "@/components/PatientReport";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  role: "agent" | "patient";
  content: string;
  timestamp: Date;
  agentType?: "medical" | "empathy" | "report";
}

const Index = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [reportMessages, setReportMessages] = useState<Message[]>([]);

  const handleStartDemo = () => {
    setShowDemo(true);
    setReportMessages([]);
  };

  const handleBackToHome = () => {
    setShowDemo(false);
  };

  if (!showDemo) {
    return <Hero onStartDemo={handleStartDemo} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h2 className="font-semibold">Demo Conversation</h2>
              <p className="text-sm text-muted-foreground">
                Watch the AI agents collaborate in real-time
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Demo Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chat Interface */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--success-green))] animate-pulse" />
              <h3 className="text-lg font-semibold">Live Conversation</h3>
            </div>
            <ChatInterface onUpdateReport={setReportMessages} />
          </div>

          {/* Patient Report */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h3 className="text-lg font-semibold">Generated Report</h3>
            </div>
            <PatientReport messages={reportMessages} />
          </div>
        </div>

        {/* Agent Info Panel */}
        <div className="mt-8 p-6 bg-muted/30 rounded-xl border border-border">
          <h3 className="font-semibold mb-4">Multi-Agent System</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Medical Relevance Agent</h4>
                <p className="text-sm text-muted-foreground">
                  Identifies clinically significant information and red flags requiring deeper
                  exploration
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Patient Empathy Agent</h4>
                <p className="text-sm text-muted-foreground">
                  Ensures conversations remain warm and supportive, adapting to patient's
                  emotional state
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--medical-teal))]/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-[hsl(var(--medical-teal))]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Report Clarity Agent</h4>
                <p className="text-sm text-muted-foreground">
                  Structures gathered information into clear, scannable format for physician
                  review
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
