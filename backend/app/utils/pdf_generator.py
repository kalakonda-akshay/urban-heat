from fpdf import FPDF
from datetime import datetime
import io
from typing import List, Dict, Any

class PDFReport(FPDF):
    def header(self):
        # Select Arial bold 15
        self.set_font('Helvetica', 'B', 15)
        # Text color: Dark Navy
        self.set_text_color(15, 23, 42)
        # Title
        self.cell(0, 10, 'UrbanHeatAI - Heat Mitigation & Risk Assessment Report', 0, 1, 'C')
        # Subtitle
        self.set_font('Helvetica', 'I', 10)
        self.set_text_color(100, 116, 139)
        self.cell(0, 5, 'ISRO BAH 2026 Challenge Platform Output', 0, 1, 'C')
        # Line break
        self.ln(10)

    def footer(self):
        # Go to 1.5 cm from bottom
        self.set_y(-15)
        # Select Arial italic 8
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(148, 163, 184)
        # Print current page and total pages
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}} | Report generated on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', 0, 0, 'C')

def generate_pdf_report(metrics_list: List[Dict[str, Any]]) -> bytes:
    """
    Generates a structured PDF report summarizing ward metrics and recommendations.
    """
    pdf = PDFReport()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # 1. Executive Summary
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 10, '1. Executive Summary', 0, 1, 'L')
    pdf.ln(2)
    
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(71, 85, 105)
    intro_text = (
        "This report provides a spatial assessment of Urban Heat Island (UHI) profiles, "
        "biophysical indices, and machine learning-driven risk classifications for the monitored urban zones. "
        "The calculations are performed utilizing multispectral band equations (NDVI, NDBI, NDWI, LST) "
        "and predictions are optimized via Random Forest and XGBoost algorithms. "
        "Mitigation recommendations are generated spatially based on heat exposure indexes and regional vulnerability."
    )
    pdf.multi_cell(0, 5, intro_text)
    pdf.ln(8)
    
    # 2. Ward Statistics
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 10, '2. Ward Analysis & Biophysical Indicators', 0, 1, 'L')
    pdf.ln(2)
    
    # Table Header
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(15, 23, 42) # Slate-900 background
    
    col_widths = [35, 20, 20, 20, 20, 30, 45]
    headers = ['Ward Name', 'Avg LST (C)', 'Avg NDVI', 'Avg NDBI', 'Avg NDWI', 'Risk Score', 'Heat Category']
    
    for header, width in zip(headers, col_widths):
        pdf.cell(width, 8, header, 1, 0, 'C', True)
    pdf.ln()
    
    # Table Content
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(51, 65, 85)
    
    for row in metrics_list:
        pdf.cell(col_widths[0], 8, str(row.get('zone_name', 'N/A')), 1, 0, 'L')
        pdf.cell(col_widths[1], 8, f"{row.get('avg_lst', 0.0):.1f}", 1, 0, 'C')
        pdf.cell(col_widths[2], 8, f"{row.get('avg_ndvi', 0.0):.2f}", 1, 0, 'C')
        pdf.cell(col_widths[3], 8, f"{row.get('avg_ndbi', 0.0):.2f}", 1, 0, 'C')
        pdf.cell(col_widths[4], 8, f"{row.get('avg_ndwi', 0.0):.2f}", 1, 0, 'C')
        pdf.cell(col_widths[5], 8, f"{row.get('avg_heat_risk', 0.0):.2f}", 1, 0, 'C')
        pdf.cell(col_widths[6], 8, str(row.get('dominant_category', 'Low')), 1, 1, 'C')
    
    pdf.ln(8)
    
    # 3. Spatial Recommendations Summary
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 10, '3. Actionable Mitigation Recommendations', 0, 1, 'L')
    pdf.ln(2)
    
    for row in metrics_list:
        actions = row.get('recommended_actions', [])
        if actions:
            pdf.set_font('Helvetica', 'B', 10)
            pdf.set_text_color(15, 23, 42)
            pdf.cell(0, 6, f"Zone: {row.get('zone_name')}", 0, 1, 'L')
            
            pdf.set_font('Helvetica', '', 9)
            pdf.set_text_color(71, 85, 105)
            for action in actions:
                pdf.cell(5, 5, '-', 0, 0, 'C')
                pdf.multi_cell(0, 5, action)
            pdf.ln(3)

    return bytes(pdf.output())
