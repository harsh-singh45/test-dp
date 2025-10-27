# new-backend/routers/audit_log_router.py

import os
import re
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import pandas as pd
from fpdf import FPDF
from io import BytesIO
from fastapi.responses import StreamingResponse
import matplotlib
matplotlib.use('Agg') # Use non-interactive backend for server environments
import matplotlib.pyplot as plt
import numpy as np

from core.database import get_db
from models import data_models
from schemas import data_schemas

router = APIRouter()

# --- Professional PDF Generation Class ---
class PDF(FPDF):
    def header(self):
        logo_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'logo.png')
        if os.path.exists(logo_path):
            self.image(logo_path, 10, 8, 25)
        self.set_font('Helvetica', 'B', 18)
        self.set_text_color(4, 30, 66) # Dark Navy Blue
        self.cell(0, 10, 'Audit Logs Report', 0, 1, 'C')
        self.set_font('Helvetica', '', 10)
        self.set_text_color(100)
        self.cell(0, 5, 'Differential Privacy Activity & Access Records', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, 'This report is confidential and intended for internal use only.', 0, 0, 'C')
        self.set_y(-10)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def section_title(self, title):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(0)
        self.set_fill_color(230, 235, 245) # Light Steel Blue
        self.cell(0, 10, title, 0, 1, 'L', fill=True)
        self.ln(5)

    def summary_card(self, x, y, title, value, icon_path):
        self.set_xy(x, y)
        self.set_fill_color(255, 255, 255)
        self.set_draw_color(221, 221, 221)
        self.cell(45, 25, '', 1, 0, 'C', fill=True)

        if os.path.exists(icon_path):
             self.image(icon_path, x + 3, y + 8, 10, 10)

        self.set_font('Helvetica', '', 9)
        self.set_text_color(100)
        self.set_xy(x + 15, y + 5)
        self.cell(25, 6, title)

        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(4, 30, 66)
        self.set_xy(x + 15, y + 13)
        self.cell(25, 8, str(value))

# --- Chart Generation Helpers ---
COLOR_PALETTE = ['#4A55A2', '#7895CB', '#A0BFE0', '#C5DFF8', '#A76F6F']
PRIMARY_COLOR = '#4A55A2'
GRID_COLOR = '#EAEAEA'

def create_donut_chart(data, title):
    if data.empty: return None
    fig, ax = plt.subplots(figsize=(5, 4), subplot_kw=dict(aspect="equal"))
    wedges, texts, autotexts = ax.pie(
        data.values, autopct='%1.1f%%',
        startangle=90, colors=COLOR_PALETTE, pctdistance=0.85
    )
    plt.setp(autotexts, size=8, weight="bold", color="white")
    ax.legend(wedges, data.index, title="Categories", loc="center left", bbox_to_anchor=(1, 0, 0.5, 1))
    plt.title(title, fontsize=12, weight='bold')
    ax.axis('equal')
    
    # Draw a white circle in the center
    centre_circle = plt.Circle((0,0),0.70,fc='white')
    fig.gca().add_artist(centre_circle)
    
    buf = BytesIO()
    plt.savefig(buf, format='png', transparent=True, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return buf

def create_line_chart(data, title):
    if data.empty: return None
    fig, ax = plt.subplots(figsize=(10, 4))
    data.plot(kind='line', ax=ax, color=PRIMARY_COLOR, marker='o', markersize=4)
    ax.fill_between(data.index, data.values, color=PRIMARY_COLOR, alpha=0.1)
    ax.set_title(title, fontsize=12, weight='bold')
    ax.set_xlabel(""), ax.set_ylabel("Number of Events", fontsize=9)
    ax.tick_params(axis='x', rotation=0, labelsize=8)
    ax.grid(True, which='both', linestyle='--', linewidth=0.5, color=GRID_COLOR)
    ax.spines['top'].set_visible(False), ax.spines['right'].set_visible(False)
    plt.tight_layout()
    buf = BytesIO()
    plt.savefig(buf, format='png', transparent=True)
    plt.close(fig)
    buf.seek(0)
    return buf

def create_bar_chart(data, title):
    if data.empty: return None
    fig, ax = plt.subplots(figsize=(5, 4))
    data.sort_values().plot(kind='barh', ax=ax, color=COLOR_PALETTE[1])
    ax.set_title(title, fontsize=12, weight='bold')
    ax.set_xlabel("Access Count", fontsize=9)
    ax.tick_params(labelsize=8)
    ax.grid(axis='x', linestyle='--', linewidth=0.5, color=GRID_COLOR)
    ax.spines['top'].set_visible(False), ax.spines['right'].set_visible(False)
    plt.tight_layout()
    buf = BytesIO()
    plt.savefig(buf, format='png', transparent=True)
    plt.close(fig)
    buf.seek(0)
    return buf

# --- Endpoints ---
@router.get("/audit-logs", response_model=List[data_schemas.AuditLog])
def get_audit_logs(db: Session = Depends(get_db), start_date: Optional[date] = None, end_date: Optional[date] = None, user: Optional[str] = None, action: Optional[str] = None, status: Optional[str] = None):
    query = db.query(data_models.AuditLog)
    if start_date: query = query.filter(data_models.AuditLog.timestamp >= start_date)
    if end_date: query = query.filter(data_models.AuditLog.timestamp < datetime.combine(end_date, datetime.max.time()))
    if user: query = query.filter(data_models.AuditLog.user.ilike(f"%{user}%"))
    if action: query = query.filter(data_models.AuditLog.action.ilike(f"%{action}%"))
    if status: query = query.filter(data_models.AuditLog.status.ilike(f"%{status}%"))
    return query.order_by(data_models.AuditLog.timestamp.desc()).all()

@router.get("/audit-logs/report", response_class=StreamingResponse)
def generate_audit_report(db: Session = Depends(get_db), start_date: Optional[date] = None, end_date: Optional[date] = None, user: Optional[str] = None, action: Optional[str] = None, status: Optional[str] = None):
    logs = get_audit_logs(db, start_date, end_date, user, action, status)
    if not logs:
        raise HTTPException(status_code=404, detail="No audit logs found for the selected criteria.")

    df = pd.DataFrame([log.__dict__ for log in logs])
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    total_logs, unique_users, success_count, failed_count = len(df), df['user'].nunique(), df[df['status'] == 'SUCCESS'].shape[0], df[df['status'] == 'FAILED'].shape[0]

    pdf = PDF()
    pdf.add_page()
    
    pdf.section_title("Audit Overview")
    icon_dir = os.path.join(os.path.dirname(__file__), '..', 'static')
    pdf.summary_card(10, 63.0, 'Total Events', total_logs, os.path.join(icon_dir, 'total_events.png'))
    pdf.summary_card(60, 63.0, 'Successful', success_count, os.path.join(icon_dir, 'successful_events.png'))
    pdf.summary_card(110, 63.0, 'Failed', failed_count, os.path.join(icon_dir, 'failed_events.png'))
    pdf.summary_card(160, 63.0, 'Unique Users', unique_users, os.path.join(icon_dir, 'unique_users.png'))
    pdf.ln(35)

    pdf.section_title("Log Details")
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_fill_color(220, 220, 220)
    col_widths = [8, 35, 20, 35, 42, 15, 25]
    headers = ["ID", "Timestamp", "User", "Action", "Details", "Status", "IP Address"]
    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], 8, header, 1, 0, 'C', 1)
    pdf.ln()

    pdf.set_font("Helvetica", "", 7)
    for log in logs[:total_logs]: # Limit rows to prevent page overflow
        pdf.cell(col_widths[0], 7, str(log.id), 1)
        pdf.cell(col_widths[1], 7, log.timestamp.strftime("%Y-%m-%d %H:%M"), 1)
        pdf.cell(col_widths[2], 7, log.user, 1)
        pdf.cell(col_widths[3], 7, log.action, 1)
        pdf.cell(col_widths[4], 7, log.details[:30] + '...' if len(log.details) > 30 else log.details, 1)
        pdf.cell(col_widths[5], 7, log.status, 1, 0, 'C')
        pdf.cell(col_widths[6], 7, log.ip_address, 1)
        pdf.ln()
    pdf.ln(10)
    
    pdf.add_page()
    pdf.section_title("Security Insights")

    # --- Data Aggregation for Charts ---
    action_counts = df['action'].value_counts().head(5)
    status_counts = df['status'].value_counts()
    def extract_dataset_name(detail):
        match = re.search(r"dataset '([^']*)'", detail)
        return match.group(1) if match else None
    df['dataset_name'] = df['details'].apply(extract_dataset_name)
    dataset_counts = df.dropna(subset=['dataset_name'])['dataset_name'].value_counts().head(5)
    df_time = df.set_index('timestamp')
    activity_over_time = df_time.resample('D').size()

    # --- Chart Rendering ---
    line_chart_buf = create_line_chart(activity_over_time, "Events Over Time")
    if line_chart_buf:
        pdf.image(line_chart_buf, x=10, y=pdf.get_y(), w=190)
        pdf.ln(85)
    
    y_pos = pdf.get_y()
    action_chart_buf = create_donut_chart(action_counts, "Action Distribution")
    if action_chart_buf:
        pdf.image(action_chart_buf, x=10, y=y_pos, w=95)
    
    bar_chart_buf = create_bar_chart(dataset_counts, "Top Accessed Datasets")
    if bar_chart_buf:
        pdf.image(bar_chart_buf, x=105, y=y_pos, w=95)

    buffer = BytesIO()
    pdf.output(buffer)
    buffer.seek(0)
    
    return StreamingResponse(buffer, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment;filename=audit_log_report_{datetime.now().strftime('%Y%m%d')}.pdf"
    })