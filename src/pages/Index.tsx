import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import PatientReport from "@/components/PatientReport";

interface Message {
  id: string;
  role: "agent" | "patient";
  content: string;
  timestamp: Date;
  agentType?: "medical" | "empathy" | "report";
}

const Index = () => {
  const [reportMessages, setReportMessages] = useState<Message[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">hey ally</h1>
                <p className="text-sm text-gray-500">AI Health Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Demo Area */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Chat Interface */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
              <h3 className="text-lg font-semibold text-gray-900">Live Conversation</h3>
            </div>
            <ChatInterface onUpdateReport={setReportMessages} />
          </div>

          {/* Patient Report */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
              <h3 className="text-lg font-semibold text-gray-900">Medical Report</h3>
            </div>
            <PatientReport messages={reportMessages} />
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-12 max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Multi-Agent Intelligence</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Medical Relevance</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Identifies clinically significant symptoms and red flags requiring immediate attention
                    </p>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Patient Empathy</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Ensures conversations remain warm, supportive, and adapted to emotional needs
                    </p>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--medical-teal))]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-[hsl(var(--medical-teal))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Report Generation</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Structures information into clear, actionable reports for healthcare providers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
