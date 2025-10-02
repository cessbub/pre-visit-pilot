import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface Message {
  id: string;
  role: "agent" | "patient";
  content: string;
  timestamp: Date;
  agentType?: "medical" | "empathy" | "report";
}

interface PatientReportProps {
  messages: Message[];
}

const PatientReport = ({ messages }: PatientReportProps) => {
  const hasChiefComplaint = messages.some((m) =>
    m.content.toLowerCase().includes("chest") || 
    m.content.toLowerCase().includes("tightness")
  );

  const hasTimeline = messages.some((m) =>
    m.content.toLowerCase().includes("week") ||
    m.content.toLowerCase().includes("month")
  );

  const handleExport = (format: "pdf" | "ehr") => {
    // Simulate export
    console.log(`Exporting as ${format}`);
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[hsl(var(--medical-teal))]/5 to-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--medical-teal))]/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-[hsl(var(--medical-teal))]" />
          </div>
          <div>
            <h3 className="font-semibold">Patient Report</h3>
            <p className="text-sm text-muted-foreground">Auto-Generated Summary</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("ehr")}
          >
            <Download className="w-4 h-4 mr-2" />
            EHR
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">
              The patient report will appear here as the conversation progresses.
            </p>
          </div>
        ) : (
          <>
            {/* Chief Complaint Section */}
            <ReportSection
              title="Chief Complaint"
              icon={AlertTriangle}
              color="text-destructive"
              complete={hasChiefComplaint}
            >
              {hasChiefComplaint ? (
                <p className="text-sm leading-relaxed">
                  Chest tightness with exertion
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Gathering initial complaint...
                </p>
              )}
            </ReportSection>

            {/* Symptom Timeline Section */}
            <ReportSection
              title="Symptom Timeline and Characteristics"
              icon={Clock}
              color="text-primary"
              complete={hasTimeline}
            >
              {hasTimeline ? (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Duration:</span> Approximately 2 weeks
                  </p>
                  <p>
                    <span className="font-medium">Trigger:</span> Physical activity (stairs, exertion)
                  </p>
                  <p>
                    <span className="font-medium">Relief:</span> Resolves with 1-2 minutes of rest
                  </p>
                  <p>
                    <span className="font-medium">Associated Symptoms:</span> Mild shortness of breath
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Collecting symptom timeline...
                </p>
              )}
            </ReportSection>

            {/* Red Flags Section */}
            <ReportSection
              title="Red Flags & Urgent Concerns"
              icon={AlertTriangle}
              color="text-destructive"
              badge={<Badge variant="destructive">High Priority</Badge>}
              complete={hasTimeline}
            >
              {hasTimeline ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive mb-1">
                        Exertional Chest Symptoms
                      </p>
                      <p className="text-foreground/80">
                        Chest tightness triggered by physical activity with associated dyspnea
                        requires immediate cardiac evaluation.
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">Recommendation:</span> Cardiac workup, stress
                    test consideration, risk factor assessment
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Analyzing for urgent concerns...
                </p>
              )}
            </ReportSection>

            {/* Medical History Section */}
            <ReportSection
              title="Relevant Medical History"
              icon={FileText}
              color="text-[hsl(var(--medical-teal))]"
              complete={false}
            >
              <p className="text-sm text-muted-foreground italic">
                Gathering family and personal medical history...
              </p>
            </ReportSection>

            {/* Suggested Focus Section */}
            <ReportSection
              title="Suggested Focus Areas for Physician"
              icon={CheckCircle2}
              color="text-[hsl(var(--success-green))]"
              complete={hasTimeline}
            >
              {hasTimeline ? (
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success-green))] mt-0.5 flex-shrink-0" />
                    <span>Perform cardiovascular examination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success-green))] mt-0.5 flex-shrink-0" />
                    <span>Order EKG and cardiac biomarkers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success-green))] mt-0.5 flex-shrink-0" />
                    <span>Assess cardiovascular risk factors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success-green))] mt-0.5 flex-shrink-0" />
                    <span>Consider stress test or cardiology referral</span>
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Building recommendations based on conversation...
                </p>
              )}
            </ReportSection>
          </>
        )}
      </div>
    </Card>
  );
};

interface ReportSectionProps {
  title: string;
  icon: React.ElementType;
  color: string;
  complete?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

const ReportSection = ({
  title,
  icon: Icon,
  color,
  complete = false,
  badge,
  children,
}: ReportSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h4 className="font-semibold text-sm">{title}</h4>
          {complete && (
            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success-green))]" />
          )}
        </div>
        {badge}
      </div>
      <div className="pl-7">{children}</div>
    </div>
  );
};

export default PatientReport;
