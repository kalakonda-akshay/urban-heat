"""
pdf_generator.py - PDF report generation using only stdlib (no fpdf required).
Generates a simple plain-text/CSV report as bytes when a PDF library is unavailable.
"""
from datetime import datetime
from typing import List, Dict, Any
import io
import csv


def generate_pdf_report(
    zone_name: str,
    metrics: List[Dict[str, Any]],
    recommendations: List[str]
) -> bytes:
    """
    Generate a simple CSV-based report (lightweight replacement for FPDF).
    Returns bytes that can be streamed as a download.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([f"UrbanHeatAI - Ward Report: {zone_name}"])
    writer.writerow([f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} IST"])
    writer.writerow([])

    # Metrics
    writer.writerow(["=== HEAT RISK METRICS ==="])
    writer.writerow(["Metric", "Value", "Unit", "Risk Level"])
    for m in metrics:
        writer.writerow([
            m.get("metric", ""),
            m.get("value", ""),
            m.get("unit", ""),
            m.get("risk_level", "")
        ])
    writer.writerow([])

    # Recommendations
    writer.writerow(["=== MITIGATION RECOMMENDATIONS ==="])
    for i, rec in enumerate(recommendations, 1):
        writer.writerow([f"{i}.", rec])

    writer.writerow([])
    writer.writerow(["--- UrbanHeatAI | ISRO SAC Collaboration ---"])

    return output.getvalue().encode("utf-8")
