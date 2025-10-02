import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart, FileText } from "lucide-react";
import heroImage from "@/assets/hero-doctor.jpg";

const Hero = ({ onStartDemo }: { onStartDemo: () => void }) => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
      
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-secondary-foreground">
                AI-Powered Patient Engagement
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Pre-Visit Intelligence for{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--medical-teal))] bg-clip-text text-transparent">
                Better Care
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Our AI voice agent conducts warm, empathetic pre-visit conversations with patients, 
              gathering comprehensive medical information that transforms into actionable insights 
              for physicians.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="lg"
                onClick={onStartDemo}
                className="group"
              >
                Try Demo Conversation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
            
            {/* Feature highlights */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Empathetic AI</h3>
                  <p className="text-sm text-muted-foreground">
                    Patients feel heard and understood
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--medical-teal))]/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-[hsl(var(--medical-teal))]" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Adaptive Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Intelligent follow-ups based on responses
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Structured Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    EHR-ready patient summaries
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right image */}
          <div className="relative animate-in fade-in slide-in-from-right duration-700 delay-200">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Healthcare professional reviewing patient information"
                className="w-full h-auto"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating stat cards */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-lg p-4 border border-border animate-in fade-in slide-in-from-bottom duration-700 delay-500">
              <div className="text-3xl font-bold text-primary">87%</div>
              <div className="text-sm text-muted-foreground">Patient Satisfaction</div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-card rounded-xl shadow-lg p-4 border border-border animate-in fade-in slide-in-from-top duration-700 delay-700">
              <div className="text-3xl font-bold text-[hsl(var(--medical-teal))]">15min</div>
              <div className="text-sm text-muted-foreground">Time Saved/Visit</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
