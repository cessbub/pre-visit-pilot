import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";
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
    const fullConversation = messages.map(m => m.content.toLowerCase()).join(" ");
    
    // Extract patient demographics
    let patientName = "";
    let patientAge = "";
    let patientLocation = "";
    
    // Look for comma-separated format: "Name, Age, Location"
    const firstPatientMsg = patientMessages[0]?.content || "";
    const commaSeparated = firstPatientMsg.match(/^([A-Za-z\s]+),\s*(\d{1,3}),\s*([A-Za-z\s]+)/);
    
    if (commaSeparated) {
      patientName = commaSeparated[1].trim();
      patientAge = commaSeparated[2].trim();
      patientLocation = commaSeparated[3].trim();
    } else {
      // Extract name (look for common patterns)
      const namePatterns = [
        /(?:name is|i'm|i am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[,.]?\s+\d+/i, // "John Smith, 45"
      ];
      
      for (const pattern of namePatterns) {
        const match = firstPatientMsg.match(pattern);
        if (match && match[1]) {
          patientName = match[1];
          break;
        }
      }
      
      // Extract age
      const ageMatch = conversationText.match(/\b(\d{1,3})\s*(?:years?\s*old|yo|y\/o)\b/i) || 
                       conversationText.match(/(?:age|i'm|i am)\s*(\d{1,3})/i) ||
                       conversationText.match(/,\s*(\d{1,3})\s*,/); // Middle number in comma format
      if (ageMatch) {
        patientAge = ageMatch[1];
      }
      
      // Extract location
      const locationPatterns = [
        /(?:from|in|live in|located in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /,\s*([A-Z]{2,})\s*$/i, // Comma followed by caps at end (like ", QC")
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*,\s*[A-Z]{2}/i, // "Boston, MA"
      ];
      
      for (const pattern of locationPatterns) {
        const match = firstPatientMsg.match(pattern);
        if (match && match[1]) {
          patientLocation = match[1];
          break;
        }
      }
    }
    
    // Extract chief complaint from first few patient messages (skip demographics message)
    const complaintMessages = patientMessages.slice(patientName ? 1 : 0, 4);
    const chiefComplaint = complaintMessages.map(m => m.content).join(". ");
    
    // Format with proper capitalization
    const formattedChiefComplaint = chiefComplaint
      // Capitalize first letter
      .replace(/^./, str => str.toUpperCase())
      // Capitalize after periods
      .replace(/\.\s+./g, str => str.toUpperCase())
      // Capitalize standalone "i"
      .replace(/\bi\b/g, 'I')
      // Capitalize "i'm" to "I'm"
      .replace(/\bi'm\b/g, "I'm");
    
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
    
    // Look for trigger patterns
    const triggerPatterns = [
      /(?:triggered? by|cause|caused by|when i|after|due to|from)\s+([^.,!?]+)/gi,
      /(?:worse|bad|start|begin)(?:s|ed)?\s+(?:when|after|with)\s+([^.,!?]+)/gi,
      /(?:happens?|occurs?)\s+(?:when|after|with)\s+([^.,!?]+)/gi,
    ];
    
    for (const pattern of triggerPatterns) {
      const matches = conversationText.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          // Clean up common filler words
          let trigger = match[1].trim()
            .replace(/^(is|was|are|were|the|a|an|my|i)\s+/i, '')
            .replace(/\s+(is|was|are|were|the|a|an)$/i, '')
            .replace(/^(drink|eat|do)ing\s+/i, ''); // Remove -ing verb prefix
          
          if (trigger.length > 2 && !triggers.some(t => t.toLowerCase() === trigger.toLowerCase())) {
            triggers.push(trigger);
          }
        }
      }
    }
    
    // Common activity triggers
    if (conversationText.includes("stair") || conversationText.includes("climb")) {
      triggers.push("climbing stairs");
    }
    if (conversationText.includes("walk") && conversationText.includes("long")) {
      triggers.push("prolonged walking");
    }
    if (conversationText.includes("exercise") || conversationText.includes("physical activity")) {
      triggers.push("physical activity");
    }
    
    // Look for characteristics and descriptions
    const characteristicPatterns = [
      /(?:feel|feeling|feels)\s+(?:like\s+)?([^.,!?]+)/gi,
      /(?:sharp|dull|throbbing|stabbing|burning|aching|pressure|tight|squeezing|radiating|constant|intermittent)/gi,
      /(?:on|in|at)\s+(?:the|my)\s+(right|left)\s+(side|temple|head|chest|arm|leg)/gi,
      /(?:worse|better)\s+(?:when|with|after)\s+([^.,!?]+)/gi,
    ];
    
    for (const pattern of characteristicPatterns) {
      const matches = conversationText.matchAll(pattern);
      for (const match of matches) {
        const text = match[0].trim();
        if (text.length > 2 && !characteristics.includes(text)) {
          characteristics.push(text);
        }
      }
    }
    
    // Common relief patterns
    if (conversationText.includes("rest") && conversationText.includes("better")) {
      characteristics.push("relieved by rest");
    }
    if (conversationText.includes("medication") && conversationText.includes("help")) {
      characteristics.push("responsive to medication");
    }
    
    // Extract associated symptoms
    const symptoms: string[] = [];
    const symptomKeywords = {
      "chest": "Chest pain",
      "breath": "Shortness of breath",
      "dizzy": "Dizziness",
      "nausea": "Nausea",
      "sweat": "Sweating",
      "pain": "Pain",
      "tight": "Tightness",
      "pressure": "Pressure",
      "sharp": "Sharp pain",
      "radiating": "Radiating pain"
    };
    
    for (const [keyword, symptom] of Object.entries(symptomKeywords)) {
      if (conversationText.includes(keyword)) {
        symptoms.push(symptom);
      }
    }
    
    // Detect red flags
    const hasChestSymptoms = conversationText.includes("chest") || 
                            conversationText.includes("heart") ||
                            chiefComplaint.toLowerCase().includes("chest");
    const hasBreathingIssues = conversationText.includes("breath") || 
                               conversationText.includes("breathing") ||
                               conversationText.includes("air");
    const hasSharpPain = conversationText.includes("sharp");
    const hasPressure = conversationText.includes("pressure") || conversationText.includes("tight");
    
    const redFlags: string[] = [];
    if (hasChestSymptoms) {
      if (hasBreathingIssues || hasSharpPain || hasPressure) {
        redFlags.push("Chest pain with breathing difficulty or sharp/pressure sensation requires immediate cardiac evaluation");
      } else {
        redFlags.push("Chest symptoms require prompt medical evaluation");
      }
    }
    
    // Extract medical history
    const medicalHistory: string[] = [];
    const familyHistory: string[] = [];
    const medications: string[] = [];
    const allergies: string[] = [];
    
    // Look for medical conditions
    const conditions = ["diabetes", "hypertension", "high blood pressure", "heart disease", "asthma", "copd", "cancer"];
    for (const condition of conditions) {
      if (conversationText.includes(condition)) {
        medicalHistory.push(condition.charAt(0).toUpperCase() + condition.slice(1));
      }
    }
    
    // Look for family history mentions
    if (conversationText.includes("family history") || conversationText.includes("my father") || 
        conversationText.includes("my mother") || conversationText.includes("runs in")) {
      const familyMatch = conversationText.match(/family.*?(diabetes|heart|cancer|stroke|hypertension)[^.]*/i);
      if (familyMatch) {
        familyHistory.push(familyMatch[0]);
      }
    }
    
    // Look for medication mentions - be more thorough
    const medicationPatterns = [
      /(?:taking|on|prescribed|use|using)\s+([a-z][a-z\s-]+?)(?:\s+for|\s+to|\s+daily|,|\.|$)/gi,
      /medication[s]?\s*[:]\s*([^.,!?]+)/gi,
      /(?:pill|tablet|capsule|injection|inhaler)[s]?\s+(?:of|for)?\s*([a-z][a-z\s-]+)/gi,
    ];
    
    const medicationKeywords = [
      'aspirin', 'ibuprofen', 'tylenol', 'acetaminophen', 'advil', 'aleve',
      'metformin', 'lisinopril', 'atorvastatin', 'levothyroxine', 'amlodipine',
      'omeprazole', 'simvastatin', 'losartan', 'gabapentin', 'hydrochlorothiazide',
      'prednisone', 'insulin', 'warfarin', 'supplement', 'vitamin'
    ];
    
    if (conversationText.includes("medication") || conversationText.includes("taking") || 
        conversationText.includes("prescription") || conversationText.includes("drug")) {
      
      // Try pattern matching first
      for (const pattern of medicationPatterns) {
        const matches = conversationText.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].trim().length > 2) {
            const med = match[1].trim()
              .replace(/^(the|a|an|my|for|to)\s+/i, '')
              .replace(/\s+(the|a|an|daily|twice|once)$/i, '');
            if (med.length > 2 && !medications.includes(med)) {
              medications.push(med);
            }
          }
        }
      }
      
      // Check for common medication keywords
      for (const keyword of medicationKeywords) {
        if (conversationText.includes(keyword) && !medications.includes(keyword)) {
          medications.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
        }
      }
      
      // Check for "no medication" responses
      if ((conversationText.includes("no medication") || 
           conversationText.includes("not taking") || 
           conversationText.includes("don't take")) && medications.length === 0) {
        medications.push("None reported");
      }
    }
    
    // Look for allergy mentions
    if (conversationText.includes("allerg")) {
      const allergyMatch = conversationText.match(/allerg[a-z]*\s+to\s+([^,.]+)/i);
      if (allergyMatch) {
        allergies.push(allergyMatch[1]);
      } else if (conversationText.includes("no allerg")) {
        allergies.push("None reported");
      }
    }
    
    return {
      patientName: patientName || "Not provided",
      patientAge: patientAge || "Not provided",
      patientLocation: patientLocation || "Not provided",
      hasDemographics: patientName.length > 0 || patientAge.length > 0 || patientLocation.length > 0,
      chiefComplaint: formattedChiefComplaint || "Not yet identified",
      hasChiefComplaint: chiefComplaint.length > 0,
      duration,
      hasTimeline: duration !== "Not yet recorded",
      triggers: triggers.length > 0 ? triggers.slice(0, 3).join(", ") : "Not specified",
      characteristics: characteristics.length > 0 ? characteristics.slice(0, 5).join("; ") : "Being assessed",
      symptoms: symptoms.length > 0 ? symptoms.join(", ") : "Being gathered",
      medicalHistory: medicalHistory.length > 0 ? medicalHistory : [],
      familyHistory: familyHistory.length > 0 ? familyHistory : [],
      medications: medications.length > 0 ? medications : [],
      allergies: allergies.length > 0 ? allergies : [],
      hasMedicalHistory: medicalHistory.length > 0 || familyHistory.length > 0 || 
                         medications.length > 0 || allergies.length > 0 ||
                         conversationText.includes("no medical") || conversationText.includes("no condition"),
      redFlags,
      hasRedFlags: redFlags.length > 0
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
      redFlags: patientInfo.redFlags,
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
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const leftMargin = 20;
      const rightMargin = 20;
      const maxWidth = pageWidth - leftMargin - rightMargin;
      let yPos = 20;
      
      // Helper function to add text with wrapping
      const addText = (text: string, fontSize: number, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        if (isBold) doc.setFont("helvetica", "bold");
        else doc.setFont("helvetica", "normal");
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        // Check if we need a new page
        if (yPos + (lines.length * fontSize * 0.5) > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(lines, leftMargin, yPos);
        yPos += lines.length * fontSize * 0.5;
      };
      
      // Title
      addText("Patient Pre-Visit Report", 18, true);
      yPos += 5;
      
      addText(`Generated: ${new Date().toLocaleString()}`, 10);
      yPos += 10;
      
      // Patient Demographics
      if (patientInfo.hasDemographics) {
        addText("Patient Information", 14, true);
        yPos += 2;
        addText(`Name: ${patientInfo.patientName}`, 11);
        yPos += 5;
        addText(`Age: ${patientInfo.patientAge}`, 11);
        yPos += 5;
        addText(`Location: ${patientInfo.patientLocation}`, 11);
        yPos += 10;
      }
      
      // Chief Complaint
      addText("Chief Complaint", 14, true);
      yPos += 2;
      addText(reportData.chiefComplaint, 11);
      yPos += 10;
      
      // Symptom Timeline
      addText("Symptom Timeline & Characteristics", 14, true);
      yPos += 2;
      addText(`Duration: ${reportData.symptoms.duration}`, 11);
      yPos += 5;
      addText(`Trigger: ${reportData.symptoms.trigger}`, 11);
      yPos += 5;
      addText(`Characteristics: ${reportData.symptoms.relief}`, 11);
      yPos += 5;
      addText(`Associated Symptoms: ${reportData.symptoms.associated}`, 11);
      yPos += 10;
      
      // Red Flags
      if (reportData.redFlags.length > 0) {
        addText("Red Flags & Urgent Concerns", 14, true);
        yPos += 2;
        reportData.redFlags.forEach(flag => {
          addText(`• ${flag}`, 11);
          yPos += 3;
        });
        yPos += 10;
      }
      
      // Medical History
      addText("Relevant Medical History", 14, true);
      yPos += 2;
      if (patientInfo.medicalHistory.length > 0) {
        addText("Past Medical History:", 11, true);
        yPos += 3;
        patientInfo.medicalHistory.forEach(condition => {
          addText(`• ${condition}`, 11);
          yPos += 3;
        });
        yPos += 5;
      }
      if (patientInfo.familyHistory.length > 0) {
        addText("Family History:", 11, true);
        yPos += 3;
        patientInfo.familyHistory.forEach(history => {
          addText(`• ${history}`, 11);
          yPos += 3;
        });
        yPos += 5;
      }
      if (patientInfo.medications.length > 0) {
        addText("Current Medications:", 11, true);
        yPos += 3;
        patientInfo.medications.forEach(med => {
          addText(`• ${med}`, 11);
          yPos += 3;
        });
        yPos += 5;
      }
      if (patientInfo.allergies.length > 0) {
        addText("Allergies:", 11, true);
        yPos += 3;
        patientInfo.allergies.forEach(allergy => {
          addText(`• ${allergy}`, 11);
          yPos += 3;
        });
        yPos += 10;
      }
      
      // Recommendations
      addText("Suggested Focus Areas for Physician", 14, true);
      yPos += 2;
      reportData.recommendations.forEach(rec => {
        addText(`• ${rec}`, 11);
        yPos += 3;
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

  return (
    <Card className="h-[600px] flex flex-col rounded-3xl border-0 shadow-xl bg-white/90 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[hsl(var(--medical-teal))]/10 flex items-center justify-center shadow-sm">
            <FileText className="w-6 h-6 text-[hsl(var(--medical-teal))]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Patient Report</h3>
            <p className="text-sm text-gray-500">Auto-generated summary</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={messages.length === 0}
            className="rounded-xl border-gray-200 hover:bg-gray-50 h-10 px-4"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-500 text-[15px]">
              Your medical report will appear here as the conversation progresses
            </p>
          </div>
        ) : (
          <>
            {/* Patient Demographics Section */}
            <ReportSection
              title="Patient Information"
              icon={User}
              color="text-primary"
              complete={patientInfo.hasDemographics}
            >
              {patientInfo.hasDemographics ? (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {patientInfo.patientName}
                  </p>
                  <p>
                    <span className="font-medium">Age:</span> {patientInfo.patientAge}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {patientInfo.patientLocation}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Collecting patient information...
                </p>
              )}
            </ReportSection>

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
              badge={patientInfo.hasRedFlags ? <Badge variant="destructive">High Priority</Badge> : undefined}
              complete={patientInfo.hasRedFlags}
            >
              {patientInfo.hasRedFlags ? (
                <div className="space-y-2">
                  {patientInfo.redFlags.map((flag, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-destructive mb-1">
                          Urgent Medical Attention Required
                        </p>
                        <p className="text-foreground/80">
                          {flag}
                        </p>
                      </div>
                    </div>
                  ))}
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
              complete={patientInfo.hasMedicalHistory}
            >
              {patientInfo.hasMedicalHistory ? (
                <div className="space-y-3 text-sm">
                  {patientInfo.medicalHistory.length > 0 && (
                    <div>
                      <span className="font-medium">Past Medical History:</span>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {patientInfo.medicalHistory.map((condition, idx) => (
                          <li key={idx}>{condition}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {patientInfo.familyHistory.length > 0 && (
                    <div>
                      <span className="font-medium">Family History:</span>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {patientInfo.familyHistory.map((history, idx) => (
                          <li key={idx}>{history}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {patientInfo.medications.length > 0 && (
                    <div>
                      <span className="font-medium">Current Medications:</span>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {patientInfo.medications.map((med, idx) => (
                          <li key={idx}>{med}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {patientInfo.allergies.length > 0 && (
                    <div>
                      <span className="font-medium">Allergies:</span>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {patientInfo.allergies.map((allergy, idx) => (
                          <li key={idx}>{allergy}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {patientInfo.medicalHistory.length === 0 && 
                   patientInfo.familyHistory.length === 0 &&
                   patientInfo.medications.length === 0 &&
                   patientInfo.allergies.length === 0 && (
                    <p>No significant medical history reported</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Gathering family and personal medical history...
                </p>
              )}
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
    <div className="space-y-3 p-5 rounded-2xl bg-gray-50/50 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon className={`w-5 h-5 ${color}`} />
          <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
          {complete && (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          )}
        </div>
        {badge}
      </div>
      <div className="pl-7 text-gray-700">{children}</div>
    </div>
  );
};

export default PatientReport;
