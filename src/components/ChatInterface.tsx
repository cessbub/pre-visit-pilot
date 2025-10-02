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
    color: "text-primary bg-primary/10",
    description: "Identifying clinical significance",
  },
  empathy: {
    name: "Patient Empathy Agent",
    icon: Heart,
    color: "text-accent bg-accent/10",
    description: "Ensuring warm, supportive tone",
  },
  report: {
    name: "Report Clarity Agent",
    icon: FileText,
    color: "text-[hsl(var(--medical-teal))] bg-[hsl(var(--medical-teal))]/10",
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const [isDemo, setIsDemo] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isDemo && demoIndex < demoConversation.length) {
      const delay = demoIndex === 0 ? 500 : 2000;
      
      const timer = setTimeout(() => {
        const demoMsg = demoConversation[demoIndex];
        const newMessage: Message = {
          id: Date.now().toString(),
          role: demoMsg.role,
          content: demoMsg.content,
          timestamp: new Date(),
          agentType: demoMsg.agentType,
        };
        
        setMessages((prev) => {
          const updated = [...prev, newMessage];
          onUpdateReport(updated);
          return updated;
        });
        setDemoIndex((prev) => prev + 1);
        
        if (demoMsg.role === "agent") {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 1500);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [demoIndex, isDemo, onUpdateReport]);

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
    setIsDemo(false);

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
      setAiEnabled(true);
    } catch (error) {
      console.error("Error calling AI:", error);
      toast({
        title: "AI Error",
        description: "Make sure Lovable Cloud is enabled and your OpenAI API key is configured.",
        variant: "destructive",
      });
      
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
    <Card className="flex flex-col h-[600px] shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-primary/5 to-[hsl(var(--medical-teal))]/5">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">AI Health Assistant</h3>
          <p className="text-sm text-muted-foreground">Multi-Agent System Active</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {aiEnabled ? "AI Active" : "Demo Mode"}
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "patient" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "patient"
                    ? "bg-secondary"
                    : message.agentType
                    ? agentInfo[message.agentType].color
                    : "bg-primary/10"
                }`}
              >
                {message.role === "patient" ? (
                  <User className="w-4 h-4" />
                ) : message.agentType ? (
                  (() => {
                    const Icon = agentInfo[message.agentType].icon;
                    return <Icon className="w-4 h-4" />;
                  })()
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message bubble */}
              <div
                className={`flex flex-col max-w-[80%] ${
                  message.role === "patient" ? "items-end" : "items-start"
                }`}
              >
                {message.role === "agent" && message.agentType && (
                  <span className="text-xs text-muted-foreground mb-1">
                    {agentInfo[message.agentType].name}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === "patient"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
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
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground ml-2">Analyzing response...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your response..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon" variant="hero">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
