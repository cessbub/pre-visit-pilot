import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

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
  const { toast } = useToast();
  
  const extractPatientInfo = () => {
    const patientMessages = messages.filter(m => m.role === "patient");
    const conversationText = patientMessages.map(m => m.content.toLowerCase()).join(" ");
    
    // Extract chief complaint from first few patient messages
    const chiefComplaint = patientMessages.slice(0, 3).map(m => m.content).join(". ");
    
    // Extract symptom duration
    let duration = "Not yet recorded";
    const durationPatterns = [
      /(\d+)\s*(week|month|day|year)s?/i,
      /(yesterday|today|last week|last month)/i,
      /(recently|lately)/i
    ];
    for (const pattern of durationPatterns) {
      const match = conversationText.match(pattern);
      if (match) {
        duration = match[0];
        break;
      }
    }
    
    // Extract triggers and characteristics
    const triggers: string[] = [];
    const characteristics: string[] = [];
    
    if (conversationText.includes("stair") || conversationText.includes("walk") || conversationText.includes("exercise")) {
      triggers.push("Physical activity");
    }
    if (conversationText.includes("rest")) {
      characteristics.push("Relieved by rest");
    }
    if (conversationText.includes("worse") || conversationText.includes("better")) {
      const worseMatch = conversationText.match(/worse (when|with|after) ([^.]+)/i);
      if (worseMatch) triggers.push(worseMatch[2]);
    }
    
    // Extract associated symptoms
    const symptoms: string[] = [];
    const symptomKeywords = {
      "breath": "Shortness of breath",
      "dizzy": "Dizziness",
      "nausea": "Nausea",
      "sweat": "Sweating",
      "pain": "Pain",
      "tight": "Tightness",
      "pressure": "Pressure"
    };
    
    for (const [keyword, symptom] of Object.entries(symptomKeywords)) {
      if (conversationText.includes(keyword)) {
        symptoms.push(symptom);
      }
    }
    
    return {
      chiefComplaint: chiefComplaint || "Not yet identified",
      hasChiefComplaint: chiefComplaint.length > 0,
      duration,
      hasTimeline: duration !== "Not yet recorded",
      triggers: triggers.length > 0 ? triggers.join(", ") : "Not specified",
      characteristics: characteristics.join(", ") || "Being assessed",
      symptoms: symptoms.length > 0 ? symptoms.join(", ") : "Being gathered"
    };
  };

  const patientInfo = extractPatientInfo();

  const generateReportData = () => {
    const patientMessages = messages.filter(m => m.role === "patient");
    const agentMessages = messages.filter(m => m.role === "agent");
    
    return {
      timestamp: new Date().toISOString(),
      chiefComplaint: patientInfo.chiefComplaint,
      symptoms: {
        duration: patientInfo.duration,
        trigger: patientInfo.triggers,
        relief: patientInfo.characteristics,
        associated: patientInfo.symptoms
      },
      conversation: {
        patientResponses: patientMessages.map(m => ({
          content: m.content,
          timestamp: m.timestamp.toISOString()
        })),
        agentQuestions: agentMessages.map(m => ({
          content: m.content,
          timestamp: m.timestamp.toISOString(),
          type: m.agentType
        }))
      },
      redFlags: patientInfo.symptoms.toLowerCase().includes("chest") || 
                patientInfo.chiefComplaint.toLowerCase().includes("chest")
        ? ["Chest symptoms require immediate evaluation"]
        : [],
      recommendations: patientInfo.hasTimeline
        ? [
            "Complete physical examination",
            "Review relevant lab work and diagnostics",
            "Assess risk factors based on presenting symptoms",
            "Consider specialist referral if needed"
          ]
        : ["Continue gathering patient history"]
    };
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const reportData = generateReportData();
      let yPos = 20;
      
      // Title
      doc.setFontSize(18);
      doc.text("Patient Pre-Visit Report", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
      yPos += 15;
      
      // Chief Complaint
      doc.setFontSize(14);
      doc.text("Chief Complaint", 20, yPos);
      yPos += 7;
      doc.setFontSize(11);
      doc.text(reportData.chiefComplaint, 20, yPos);
      yPos += 15;
      
      // Symptom Timeline
      doc.setFontSize(14);
      doc.text("Symptom Timeline", 20, yPos);
      yPos += 7;
      doc.setFontSize(11);
      doc.text(`Duration: ${reportData.symptoms.duration}`, 20, yPos);
      yPos += 6;
      doc.text(`Trigger: ${reportData.symptoms.trigger}`, 20, yPos);
      yPos += 6;
      doc.text(`Relief: ${reportData.symptoms.relief}`, 20, yPos);
      yPos += 6;
      doc.text(`Associated: ${reportData.symptoms.associated}`, 20, yPos);
      yPos += 15;
      
      // Red Flags
      doc.setFontSize(14);
      doc.text("Red Flags & Urgent Concerns", 20, yPos);
      yPos += 7;
      doc.setFontSize(11);
      reportData.redFlags.forEach(flag => {
        doc.text(`• ${flag}`, 20, yPos);
        yPos += 6;
      });
      yPos += 10;
      
      // Recommendations
      doc.setFontSize(14);
      doc.text("Suggested Focus Areas", 20, yPos);
      yPos += 7;
      doc.setFontSize(11);
      reportData.recommendations.forEach(rec => {
        doc.text(`• ${rec}`, 20, yPos);
        yPos += 6;
      });
      
      doc.save(`patient-report-${Date.now()}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Patient report has been saved as PDF",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "Unable to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const handleExportEHR = () => {
    try {
      const reportData = generateReportData();
      
      // FHIR-inspired EHR format
      const ehrData = {
        resourceType: "Observation",
        status: "preliminary",
        category: [{
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "Vital Signs"
          }]
        }],
        effectiveDateTime: reportData.timestamp,
        issued: reportData.timestamp,
        subject: {
          display: "Patient"
        },
        encounter: {
          display: "Pre-Visit Interview"
        },
        component: [
          {
            code: {
              text: "Chief Complaint"
            },
            valueString: reportData.chiefComplaint
          },
          {
            code: {
              text: "Symptom Duration"
            },
            valueString: reportData.symptoms.duration
          },
          {
            code: {
              text: "Symptom Trigger"
            },
            valueString: reportData.symptoms.trigger
          },
          {
            code: {
              text: "Red Flags"
            },
            valueString: reportData.redFlags.join("; ")
          }
        ],
        note: [
          {
            text: `Recommendations: ${reportData.recommendations.join("; ")}`
          }
        ],
        conversation: reportData.conversation
      };
      
      const ehrJson = JSON.stringify(ehrData, null, 2);
      const blob = new Blob([ehrJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patient-ehr-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "EHR Exported",
        description: "Patient data exported in FHIR-compatible JSON format",
      });
    } catch (error) {
      console.error("EHR export error:", error);
      toast({
        title: "Export Failed",
        description: "Unable to generate EHR export",
        variant: "destructive",
      });
    }
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
            onClick={handleExportPDF}
            disabled={messages.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportEHR}
            disabled={messages.length === 0}
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
              complete={patientInfo.hasChiefComplaint}
            >
              {patientInfo.hasChiefComplaint ? (
                <p className="text-sm leading-relaxed">
                  {patientInfo.chiefComplaint}
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
              complete={patientInfo.hasTimeline}
            >
              {patientInfo.hasTimeline ? (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Duration:</span> {patientInfo.duration}
                  </p>
                  <p>
                    <span className="font-medium">Trigger:</span> {patientInfo.triggers}
                  </p>
                  <p>
                    <span className="font-medium">Characteristics:</span> {patientInfo.characteristics}
                  </p>
                  <p>
                    <span className="font-medium">Associated Symptoms:</span> {patientInfo.symptoms}
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
              badge={patientInfo.hasTimeline && generateReportData().redFlags.length > 0 ? <Badge variant="destructive">High Priority</Badge> : undefined}
              complete={patientInfo.hasTimeline}
            >
              {patientInfo.hasTimeline && generateReportData().redFlags.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive mb-1">
                        Urgent Medical Attention Required
                      </p>
                      <p className="text-foreground/80">
                        {generateReportData().redFlags.join(". ")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">Recommendation:</span> Immediate medical evaluation and appropriate diagnostic workup
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
              complete={patientInfo.hasTimeline}
            >
              {patientInfo.hasTimeline ? (
                <ul className="space-y-2 text-sm">
                  {generateReportData().recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success-green))] mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
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
