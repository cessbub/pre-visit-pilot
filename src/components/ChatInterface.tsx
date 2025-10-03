import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Brain, Heart, FileText, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "agent" | "patient";
  content: string;
  timestamp: Date;
  agentType?: "medical" | "empathy" | "report";
}

const agentInfo = {
  medical: {
    name: "Medical Relevance Agent",
    icon: Brain,
    color: "bg-blue-50 text-blue-600",
    description: "Identifying clinical significance",
  },
  empathy: {
    name: "Patient Empathy Agent",
    icon: Heart,
    color: "bg-green-50 text-green-600",
    description: "Ensuring warm, supportive tone",
  },
  report: {
    name: "Report Clarity Agent",
    icon: FileText,
    color: "bg-purple-50 text-purple-600",
    description: "Structuring information",
  },
};

const demoConversation = [
  {
    role: "agent" as const,
    content: "Hello! I'm here to help gather some information before your upcoming appointment with Dr. Smith. This will help ensure you receive the best possible care. How are you feeling today?",
    agentType: "empathy" as const,
  },
  {
    role: "patient" as const,
    content: "Hi, I've been having chest tightness when I walk upstairs.",
  },
  {
    role: "agent" as const,
    content: "I understand that must be concerning. Can you tell me how long this has been happening?",
    agentType: "medical" as const,
  },
  {
    role: "patient" as const,
    content: "Maybe two weeks now.",
  },
  {
    role: "agent" as const,
    content: "Thank you. When you feel that tightness, does it get better if you stop and rest for a moment?",
    agentType: "medical" as const,
  },
  {
    role: "patient" as const,
    content: "Yeah, it goes away after a minute or two.",
  },
  {
    role: "agent" as const,
    content: "That's helpful to know. Have you noticed if it happens with other activities, or mainly with stairs and exertion?",
    agentType: "medical" as const,
  },
  {
    role: "patient" as const,
    content: "Mostly when I'm doing something physical. Sometimes when I'm rushing around.",
  },
  {
    role: "agent" as const,
    content: "I appreciate you sharing that. Have you experienced any other symptoms along with the tightness—like shortness of breath, dizziness, or pain radiating to your arm or jaw?",
    agentType: "medical" as const,
  },
  {
    role: "patient" as const,
    content: "A little shortness of breath, but no pain elsewhere.",
  },
  {
    role: "agent" as const,
    content: "Thank you for being so thorough. One more question—do you have any history of heart problems, high blood pressure, or diabetes in your family?",
    agentType: "empathy" as const,
  },
];


const ChatInterface = ({ onUpdateReport }: { onUpdateReport: (messages: Message[]) => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "agent",
      content: "Hi! I'm Ally, your AI health assistant. Before we begin, may I have your name, age, and which city you're located in? This will help us prepare better for your appointment.",
      timestamp: new Date(),
      agentType: "empathy",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "patient",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const updated = [...prev, newMessage];
      onUpdateReport(updated);
      return updated;
    });
    setInputValue("");

    // Call AI agent
    setIsTyping(true);
    try {
      const { data, error } = await supabase.functions.invoke('multi-agent-chat', {
        body: { messages: [...messages, newMessage] }
      });

      if (error) throw error;

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: data.content,
        timestamp: new Date(),
        agentType: data.agentType,
      };
      
      setMessages((prev) => {
        const updated = [...prev, agentMessage];
        onUpdateReport(updated);
        return updated;
      });
    } catch (error) {
      console.error("Error calling AI:", error);
      
      // Fallback response
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "Thank you for sharing that. Could you tell me more about when these symptoms first started?",
        timestamp: new Date(),
        agentType: "medical",
      };
      setMessages((prev) => {
        const updated = [...prev, agentMessage];
        onUpdateReport(updated);
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] rounded-3xl border-0 shadow-xl bg-white/90 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-100">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">AI Assistant</h3>
          <p className="text-sm text-gray-500">Real-time conversation</p>
        </div>
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-0 px-3 py-1 rounded-full text-xs font-medium">
          AI Active
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "patient" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  message.role === "patient"
                    ? "bg-gray-100"
                    : message.agentType
                    ? agentInfo[message.agentType].color
                    : "bg-primary/10"
                }`}
              >
                {message.role === "patient" ? (
                  <User className="w-5 h-5 text-gray-700" />
                ) : message.agentType ? (
                  (() => {
                    const Icon = agentInfo[message.agentType].icon;
                    return <Icon className="w-5 h-5" />;
                  })()
                ) : (
                  <Bot className="w-5 h-5 text-primary" />
                )}
              </div>

              {/* Message bubble */}
              <div
                className={`flex flex-col max-w-[75%] ${
                  message.role === "patient" ? "items-end" : "items-start"
                }`}
              >
                {message.role === "agent" && message.agentType && (
                  <span className="text-xs text-gray-500 mb-1.5 font-medium">
                    {agentInfo[message.agentType].name}
                  </span>
                )}
                <div
                  className={`rounded-3xl px-5 py-3.5 shadow-sm ${
                    message.role === "patient"
                      ? "bg-primary text-white"
                      : "bg-gray-50 text-gray-900"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed">{message.content}</p>
                </div>
                <span className="text-xs text-gray-400 mt-1.5">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-gray-50 rounded-3xl px-5 py-3.5 flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex gap-3">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 h-12 rounded-2xl border-gray-200 bg-gray-50 px-5 text-[15px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-sm"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
