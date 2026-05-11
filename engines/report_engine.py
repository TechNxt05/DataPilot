import os
from fpdf import FPDF
from core.ads_types import StrategicReport

class ReportEngine:
    def __init__(self, output_dir: str = "artifacts/reports"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_pdf(self, report: StrategicReport, session_id: str) -> str:
        pdf = FPDF()
        pdf.add_page()
        
        # Title
        pdf.set_font("Arial", "B", 24)
        pdf.set_text_color(2, 6, 23) # Deep Slate
        pdf.cell(0, 20, report.title, ln=True, align="C")
        
        pdf.ln(10)
        
        # Summary
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, "Executive Summary", ln=True)
        pdf.set_font("Arial", "", 12)
        pdf.multi_cell(0, 10, report.summary)
        
        pdf.ln(10)
        
        # Key Findings
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, "Strategic Findings", ln=True)
        pdf.set_font("Arial", "", 12)
        for finding in report.key_findings:
            pdf.multi_cell(0, 8, f"- {finding}")
            
        pdf.ln(10)
        
        # Recommendations
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, "Actionable Recommendations", ln=True)
        pdf.set_font("Arial", "I", 12)
        for rec in report.recommendations:
            pdf.multi_cell(0, 8, f"> {rec}")
            
        filename = f"report_{session_id}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        pdf.output(filepath)
        
        return filepath
