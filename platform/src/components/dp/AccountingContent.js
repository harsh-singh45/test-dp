import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';
import { dpApiService } from '../../services/dpApiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AccountingContent = () => {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  // State for forms
  const [epsilonToAdd, setEpsilonToAdd] = useState(0.0);
  const [deltaToAdd, setDeltaToAdd] = useState(0.0);
  const [datasetToAllocate, setDatasetToAllocate] = useState('');
  const [datasetToReset, setDatasetToReset] = useState('');

  // State for Alerts Modal
  const [alerts, setAlerts] = useState([]);
  const [datasetForAlerts, setDatasetForAlerts] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [alertEmail, setAlertEmail] = useState('');


  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const data = await dpApiService.getPrivacyBudget();
      setBudgetData(data);
      if (data && data.datasets.length > 0) {
        // Default the selection in the modals to the first dataset
        setDatasetToAllocate(data.datasets[0].name);
        setDatasetToReset(data.datasets[0].name);
        setDatasetForAlerts(data.datasets[0].name);
      }
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const getBudgetStatusClass = (percentage) => {
    if (percentage >= 80) return 'bg-danger';
    if (percentage >= 60) return 'bg-warning';
    if (percentage >= 40) return 'bg-info';
    return 'bg-success';
  };

  const getBudgetStatusColor = (percentage) => {
    if (percentage >= 80) return '#dc3545'; // Danger
    if (percentage >= 60) return '#ffc107'; // Warning
    if (percentage >= 40) return '#0dcaf0'; // Info
    return '#198754'; // Success
  };


  const getBudgetStatusText = (percentage) => {
    if (percentage >= 80) return 'Critical';
    if (percentage >= 60) return 'High Usage';
    if (percentage >= 40) return 'Moderate';
    return 'Healthy';
  };

  useEffect(() => {
    if (showAlertModal && datasetForAlerts) {
      const fetchAlerts = async () => {
        const dataset = budgetData.datasets.find(d => d.name === datasetForAlerts);
        if (dataset) {
          try {
            const fetchedAlerts = await dpApiService.getAlerts(dataset.id);
            setAlerts(fetchedAlerts);
          } catch (e) {
            console.error("Failed to fetch alerts:", e);
            setAlerts([]);
          }
        }
      };
      fetchAlerts();
    }
  }, [showAlertModal, datasetForAlerts, budgetData]);

  // Handlers for modal popups
  const handleViewDetails = (dataset) => {
    setSelectedDataset(dataset);
    setShowDetailsModal(true);
  };

  const handleOpenResetModal = (dataset) => {
    setSelectedDataset(dataset || null);
    setShowResetModal(true);
  };

  const handleOpenAllocateModal = () => {
    setEpsilonToAdd(0);
    setDeltaToAdd(0);
    setShowAllocateModal(true);
  };

  const handleOpenAlertModal = async () => {
    setShowAlertModal(true);
  };

  // Handlers for API actions
  const handleResetBudget = async (datasetToActOn) => {
    if (!datasetToActOn) return;
    try {
      await dpApiService.resetBudget(datasetToActOn.id);
      setShowResetModal(false);
      setSelectedDataset(null);
      fetchBudgetData();
    } catch (err) {
      console.error("Failed to reset budget:", err);
      setError("Error resetting budget. Please try again.");
    }
  };

  const handleAllocateBudget = async () => {
    if (!datasetToAllocate) return;

    try {
      const dataset = budgetData.datasets.find(d => d.name === datasetToAllocate);
      if (dataset) {
        const budgetToUpdate = { total_epsilon: parseFloat(epsilonToAdd), total_delta: parseFloat(deltaToAdd) };
        await dpApiService.updateBudget(dataset.id, budgetToUpdate);
        setShowAllocateModal(false);
        fetchBudgetData();
      }
    } catch (err) {
      console.error("Failed to allocate budget:", err);
      setError("Error allocating budget. Please try again.");
    }
  };

  // *** FIX START ***
  const handleCreateAlert = async () => {
    const dataset = budgetData.datasets.find(d => d.name === datasetForAlerts);
    if (!dataset || !alertEmail) {
        setError("Please select a dataset and provide an email address.");
        return;
    };

    try {
      // --- FIX: Ensure the keys here match the AlertCreate schema on the backend ---
      const alertData = {
          dataset_id: dataset.id,
          threshold: parseFloat(alertThreshold), // Use 'threshold'
          email: alertEmail
      };
      // --------------------------------------------------------------------------
      
      await dpApiService.createAlert(alertData);

      const fetchedAlerts = await dpApiService.getAlerts(dataset.id);
      setAlerts(fetchedAlerts);

      setAlertEmail('');
      setError('');
    } catch (err) {
      setError("Error creating alert.");
    }
  };
  // *** FIX END ***

  const handleDeleteAlert = async (alertId) => {
    try {
      await dpApiService.deleteAlert(alertId);
      const dataset = budgetData.datasets.find(d => d.name === datasetForAlerts);
      if (dataset) {
        const fetchedAlerts = await dpApiService.getAlerts(dataset.id);
        setAlerts(fetchedAlerts);
      }
    } catch (err) {
      setError("Error deleting alert.");
    }
  };

  const handleExportReport = async () => {
      setLoading(true);
      setError('');
      let currentBudgetData = budgetData;

      if (!currentBudgetData) {
          try {
              currentBudgetData = await dpApiService.getPrivacyBudget();
              setBudgetData(currentBudgetData);
          } catch (err) {
              setError('Failed to fetch latest budget data for report.');
              setLoading(false);
              return;
          }
      }

      if (!currentBudgetData) {
          setError('No budget data available to generate report.');
          setLoading(false);
          return;
      }

      try {
          const doc = new jsPDF({
              orientation: 'p',
              unit: 'mm',
              format: 'a4'
          });

          // *** THIS IS THE FIX: The incorrect line has been removed. ***

          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const margin = 15;
          const contentWidth = pageWidth - margin * 2;
          let currentY = margin;

          // -- Styles --
          const titleColor = '#000000';
          const textColor = '#495057';
          const mutedColor = '#6c757d';
          const accentColors = {
              success: '#28a745',
              info: '#17a2b8',
              warning: '#ffc107',
              danger: '#dc3545'
          };
          const cardBg = '#f8f9fa';
          const cardBorder = '#dee2e6';

          // -- Header --
          doc.setFontSize(10);
          doc.setTextColor(mutedColor);
          doc.text('Intelation', margin, currentY + 5);

          doc.setFontSize(18);
          doc.setTextColor(titleColor);
          doc.setFont(undefined, 'bold');
          doc.text("Privacy Budget Overview", pageWidth / 2, currentY + 5, { align: 'center' });
          currentY += 10;

          doc.setFontSize(9);
          doc.setTextColor(mutedColor);
          doc.setFont(undefined, 'normal');
          const generationDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          doc.text(`Generated on: ${generationDate}`, pageWidth - margin, currentY, { align: 'right' });
          currentY += 10;

          // -- Summary Cards --
          const cardWidth = (contentWidth - 10) / 2;
          const cardHeight = 65;
          const cardRadius = 2;

          // Card 1: Privacy Budget Overview
          doc.setFillColor(cardBg);
          doc.setDrawColor(cardBorder);
          doc.roundedRect(margin, currentY, cardWidth, cardHeight, cardRadius, cardRadius, 'FD');
          
          let cardY = currentY + 7;
          doc.setFontSize(11);
          doc.setTextColor(titleColor);
          doc.setFont(undefined, 'bold');
          doc.text("Epsilon (ε)", margin + 5, cardY);
          
          doc.setFontSize(9);
          doc.setTextColor(textColor);
          doc.setFont(undefined, 'normal');
          cardY += 5;
          doc.text(`Total: ${currentBudgetData.total_budget.toFixed(2)}`, margin + 5, cardY);
          cardY += 5;
          doc.text(`Used: ${currentBudgetData.used_budget.toFixed(2)}`, margin + 5, cardY);
          cardY += 5;
          doc.text(`Remaining: ${currentBudgetData.remaining_budget.toFixed(2)}`, margin + 5, cardY);
          doc.setFont(undefined, 'bold');
          doc.text(`${currentBudgetData.percentage_used.toFixed(1)}% Used`, margin + cardWidth - 5, currentY + 7, {align: 'right'});

          cardY += 5;
          doc.setDrawColor(cardBorder);
          doc.line(margin + 3, cardY, margin + cardWidth - 3, cardY);
          cardY += 7;

          doc.setFontSize(11);
          doc.setTextColor(titleColor);
          doc.setFont(undefined, 'bold');
          doc.text("Delta (δ)", margin + 5, cardY);

          doc.setFontSize(9);
          doc.setTextColor(textColor);
          doc.setFont(undefined, 'normal');
          cardY += 5;
          doc.text(`Total: ${currentBudgetData.total_delta.toExponential(1)}`, margin + 5, cardY);
          cardY += 5;
          doc.text(`Used: ${currentBudgetData.used_delta.toExponential(1)}`, margin + 5, cardY);
          cardY += 5;
          doc.text(`Remaining: ${currentBudgetData.remaining_delta.toExponential(1)}`, margin + 5, cardY);
          doc.setFont(undefined, 'bold');
          doc.text(`${currentBudgetData.percentage_used_delta.toFixed(1)}% Used`, margin + cardWidth - 5, currentY + 38, {align: 'right'});


          // Card 2: Budget Health
          const card2X = margin + cardWidth + 10;
          doc.roundedRect(card2X, currentY, cardWidth, cardHeight, cardRadius, cardRadius, 'FD');
          
          cardY = currentY + 7;
          doc.setFontSize(11);
          doc.setTextColor(titleColor);
          doc.setFont(undefined, 'bold');
          doc.text("Budget Health", card2X + 5, cardY);
          cardY += 8;

          doc.setFontSize(9);
          doc.setTextColor(textColor);
          doc.setFont(undefined, 'normal');

          doc.text(`Epsilon (ε) Usage: ${currentBudgetData.percentage_used.toFixed(1)}%`, card2X + 5, cardY);
          cardY += 4;
          const barWidth = cardWidth - 10;
          const barHeight = 5;
          doc.setFillColor('#e9ecef');
          doc.rect(card2X + 5, cardY, barWidth, barHeight, 'F');
          const epsilonBarFill = barWidth * (currentBudgetData.percentage_used / 100);
          doc.setFillColor(getBudgetStatusColor(currentBudgetData.percentage_used));
          doc.rect(card2X + 5, cardY, epsilonBarFill, barHeight, 'F');
          cardY += barHeight + 8;

          doc.text(`Delta (δ) Usage: ${currentBudgetData.percentage_used_delta.toFixed(1)}%`, card2X + 5, cardY);
          cardY += 4;
          doc.setFillColor('#e9ecef');
          doc.rect(card2X + 5, cardY, barWidth, barHeight, 'F');
          const deltaBarFill = barWidth * (currentBudgetData.percentage_used_delta / 100);
          doc.setFillColor(getBudgetStatusColor(currentBudgetData.percentage_used_delta));
          doc.rect(card2X + 5, cardY, deltaBarFill, barHeight, 'F');
          cardY += barHeight + 8;

          doc.setFontSize(8);
          doc.setTextColor(mutedColor);
          const legendY = cardY;
          doc.setFillColor(accentColors.success); doc.rect(card2X + 5, legendY, 3, 3, 'F'); doc.text("0-40%: Healthy", card2X + 10, legendY+2.5);
          doc.setFillColor(accentColors.info); doc.rect(card2X + 5, legendY + 5, 3, 3, 'F'); doc.text("40-60%: Moderate", card2X + 10, legendY + 7.5);
          doc.setFillColor(accentColors.warning); doc.rect(card2X + 5, legendY + 10, 3, 3, 'F'); doc.text("60-80%: High Usage", card2X + 10, legendY + 12.5);
          doc.setFillColor(accentColors.danger); doc.rect(card2X + 5, legendY + 15, 3, 3, 'F'); doc.text("80%+: Critical", card2X + 10, legendY + 17.5);

          currentY += cardHeight + 10;

          doc.setFontSize(14);
          doc.setTextColor(titleColor);
          doc.setFont(undefined, 'bold');
          doc.text("Budget Usage by Dataset", margin, currentY);
          currentY += 8;

          const tableColumns = ["Dataset Name", "Budget Used (ε | δ)", "% ε Used", "% δ Used", "Status"];
          const tableData = currentBudgetData.datasets.map(dataset => {
              const percEpsilon = dataset.total_epsilon > 0 ? (dataset.budget_used / dataset.total_epsilon) * 100 : 0;
              const percDelta = dataset.total_delta > 0 ? (dataset.delta_used / dataset.total_delta) * 100 : 0;
              const overallPerc = Math.max(percEpsilon, percDelta);
              return [
                  dataset.name,
                  `${dataset.budget_used.toFixed(2)} | ${dataset.delta_used.toExponential(1)}`,
                  `${percEpsilon.toFixed(1)}%`,
                  `${percDelta.toFixed(1)}%`,
                  getBudgetStatusText(overallPerc)
              ];
          });
          
          // *** THIS IS THE FIX ***
          // The autoTable method is called correctly on the `doc` instance.
          autoTable(doc, {
              head: [tableColumns],
              body: tableData,
              startY: currentY,
              theme: 'grid',
              headStyles: {
                  fillColor: [102, 16, 242],
                  textColor: [255, 255, 255],
                  fontStyle: 'bold',
                  halign: 'center'
              },
              styles: {
                  fontSize: 9,
                  cellPadding: 2,
              },
              columnStyles: {
                  0: { cellWidth: 'auto' },
                  1: { cellWidth: 40, halign: 'right' },
                  2: { cellWidth: 25, halign: 'right' },
                  3: { cellWidth: 25, halign: 'right' },
                  4: { cellWidth: 30, halign: 'center' }
              },
              didParseCell: function (data) {
                  if (data.column.index === 4 && data.cell.section === 'body') {
                      const statusText = data.cell.raw;
                      if (statusText === 'Critical') data.cell.styles.textColor = accentColors.danger;
                      else if (statusText === 'High Usage') data.cell.styles.textColor = accentColors.warning;
                      else if (statusText === 'Moderate') data.cell.styles.textColor = accentColors.info;
                      else if (statusText === 'Healthy') data.cell.styles.textColor = accentColors.success;
                      data.cell.styles.fontStyle = 'bold';
                  }
              }
          });

          // Correct way to get the final Y position after the table
          currentY = doc.lastAutoTable.finalY + 10;

          doc.setFontSize(8);
          doc.setTextColor(mutedColor);
          doc.text("Confidential | Generated automatically by Privacy Budget System",
                   pageWidth / 2, pageHeight - margin / 2, { align: 'center' });

          doc.save(`Privacy_Budget_Overview_${generationDate.replace(/ /g, '_')}.pdf`);

      } catch (err) {
          console.error("Error generating PDF:", err);
          setError('Failed to generate PDF report.');
      } finally {
          setLoading(false);
      }
  };

  if (loading) {
    return <Spinner text="Loading privacy budget data..." />;
  }

  if (error) {
    return <MessageBox message={error} type="error" onClose={() => setError('')} />;
  }

  if (!budgetData) {
    return <MessageBox message="No privacy budget information could be loaded." type="info" />;
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex gap-2 ms-auto">
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchBudgetData}>
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleExportReport} 
            disabled={loading}
          >
            <i className="bi bi-download me-1"></i>Export Report
          </button>
        </div>
      </div>

      {/* Show errors related to actions like PDF generation */}
      {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}

      {/* Budget Overview */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center">
                <i className="bi bi-calculator me-2"></i>
                Privacy Budget Overview
              </h5>

              <div className="row">
                {/* Epsilon Details */}
                <div className="col-md-6 border-end">
                  <h6 className="text-muted text-center mb-3">Epsilon (ε)</h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Total Budget</span>
                    <strong className="fs-5">{budgetData.total_budget.toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Used Budget</span>
                    <strong className="fs-5 text-primary">{budgetData.used_budget.toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Remaining</span>
                    <strong className="fs-5 text-success">{budgetData.remaining_budget.toFixed(2)}</strong>
                  </div>
                  <div className="text-center">
                    <div className="progress mx-auto" style={{ width: '120px', height: '120px', borderRadius: '50%', position: 'relative' }}>
                      <svg width="120" height="120" className="position-absolute">
                        <circle cx="60" cy="60" r="50" stroke="#e9ecef" strokeWidth="12" fill="transparent" />
                        <circle
                          cx="60" cy="60" r="50" stroke={getBudgetStatusColor(budgetData.percentage_used)} strokeWidth="12" fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={`${2 * Math.PI * 50 * (1 - budgetData.percentage_used / 100)}`}
                          transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                        />
                      </svg>
                      <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                        <strong className="fs-4">{budgetData.percentage_used.toFixed(1)}%</strong>
                        <small className="text-muted">Used</small>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Delta Details */}
                <div className="col-md-6">
                  <h6 className="text-muted text-center mb-3">Delta (δ)</h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Total Budget</span>
                    <strong className="fs-5">{budgetData.total_delta.toExponential(1)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Used Budget</span>
                    <strong className="fs-5 text-primary">{budgetData.used_delta.toExponential(1)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Remaining</span>
                    <strong className="fs-5 text-success">{budgetData.remaining_delta.toExponential(1)}</strong>
                  </div>
                  <div className="text-center">
                    <div className="progress mx-auto" style={{ width: '120px', height: '120px', borderRadius: '50%', position: 'relative' }}>
                      <svg width="120" height="120" className="position-absolute">
                        <circle cx="60" cy="60" r="50" stroke="#e9ecef" strokeWidth="12" fill="transparent" />
                        <circle
                          cx="60" cy="60" r="50" stroke={getBudgetStatusColor(budgetData.percentage_used_delta)} strokeWidth="12" fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={`${2 * Math.PI * 50 * (1 - budgetData.percentage_used_delta / 100)}`}
                          transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                        />
                      </svg>
                      <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                        <strong className="fs-4">{budgetData.percentage_used_delta.toFixed(1)}%</strong>
                        <small className="text-muted">Used</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-shield-check me-2"></i>
                Budget Health
              </h6>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Epsilon (ε) Usage</small>
                  <small>{budgetData.percentage_used.toFixed(1)}%</small>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className={`progress-bar ${getBudgetStatusClass(budgetData.percentage_used)}`}
                    style={{ width: `${budgetData.percentage_used}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Delta (δ) Usage</small>
                  <small>{budgetData.percentage_used_delta.toFixed(1)}%</small>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className={`progress-bar ${getBudgetStatusClass(budgetData.percentage_used_delta)}`}
                    style={{ width: `${budgetData.percentage_used_delta}%` }}
                  ></div>
                </div>
              </div>

              <div className="small">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-circle-fill text-success me-2" style={{ fontSize: '0.5rem' }}></i>
                  <span>0-40%: Healthy</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-circle-fill text-info me-2" style={{ fontSize: '0.5rem' }}></i>
                  <span>40-60%: Moderate</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-circle-fill text-warning me-2" style={{ fontSize: '0.5rem' }}></i>
                  <span>60-80%: High Usage</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-circle-fill text-danger me-2" style={{ fontSize: '0.5rem' }}></i>
                  <span>80%+: Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Budget Breakdown */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-pie-chart me-2"></i>
            Budget Usage by Dataset
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Dataset</th>
                  <th>Budget Used</th>
                  <th>% of Dataset ε Used</th>
                  <th>% of Dataset δ Used</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgetData.datasets.map((dataset, index) => {
                  const percentageOfDatasetEpsilon = dataset.total_epsilon > 0 ? (dataset.budget_used / dataset.total_epsilon) * 100 : 0;
                  const percentageOfDatasetDelta = dataset.total_delta > 0 ? (dataset.delta_used / dataset.total_delta) * 100 : 0;
                  const overallStatusPercentage = Math.max(percentageOfDatasetEpsilon, percentageOfDatasetDelta);

                  return (
                    <tr key={index}>
                      <td>
                        <strong>{dataset.name}</strong>
                      </td>
                      <td>
                        <strong>{dataset.budget_used.toFixed(2)} (ε) | {dataset.delta_used.toExponential(1)} (δ)</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: '80px', height: '6px' }}>
                            <div
                              className={`progress-bar ${getBudgetStatusClass(percentageOfDatasetEpsilon)}`}
                              style={{ width: `${percentageOfDatasetEpsilon}%` }}
                            ></div>
                          </div>
                          <small>{percentageOfDatasetEpsilon.toFixed(1)}%</small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: '80px', height: '6px' }}>
                            <div
                              className={`progress-bar ${getBudgetStatusClass(percentageOfDatasetDelta)}`}
                              style={{ width: `${percentageOfDatasetDelta}%` }}
                            ></div>
                          </div>
                          <small>{percentageOfDatasetDelta.toFixed(1)}%</small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getBudgetStatusClass(overallStatusPercentage)}`}>
                          {getBudgetStatusText(overallStatusPercentage)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary btn-sm" title="View Details" onClick={() => handleViewDetails(dataset)}>
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-secondary btn-sm" title="Reset Budget" onClick={() => handleOpenResetModal(dataset)}>
                            <i className="bi bi-arrow-clockwise"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Budget Management Actions */}
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-gear me-2"></i>
                Budget Management
              </h6>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm" onClick={handleOpenAllocateModal} disabled={!budgetData || budgetData.datasets.length === 0}>
                  <i className="bi bi-plus-lg me-1"></i>
                  Allocate Additional Budget
                </button>
                <button className="btn btn-outline-warning btn-sm" onClick={() => handleOpenResetModal(null)} disabled={!budgetData || budgetData.datasets.length === 0}>
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Reset A Dataset Budget
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={handleOpenAlertModal} disabled={!budgetData.datasets.length}>
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Set Budget Alerts
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-info-circle me-2"></i>
                Privacy Budget Guide
              </h6>
              <ul className="small list-unstyled">
                <li className="mb-2">
                  <i className="bi bi-check2 text-success me-2"></i>
                  Lower epsilon values provide stronger privacy
                </li>
                <li className="mb-2">
                  <i className="bi bi-check2 text-success me-2"></i>
                  Budget is consumed with each query execution
                </li>
                <li className="mb-2">
                  <i className="bi bi-check2 text-success me-2"></i>
                  Monitor usage to maintain privacy guarantees
                </li>
                <li>
                  <i className="bi bi-check2 text-success me-2"></i>
                  Reset budgets periodically for ongoing analysis
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Budget Details Modal */}
      {showDetailsModal && selectedDataset && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-file-bar-graph me-2"></i>
                  Budget Details: {selectedDataset.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Epsilon (ε)</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td className="text-muted">Total</td>
                          <td>{selectedDataset.total_epsilon.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Consumed</td>
                          <td>{selectedDataset.budget_used.toFixed(4)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Remaining</td>
                          <td>{(selectedDataset.total_epsilon - selectedDataset.budget_used).toFixed(4)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="progress" style={{ height: '20px' }}>
                      <div
                        className={`progress-bar ${getBudgetStatusClass((selectedDataset.budget_used / selectedDataset.total_epsilon) * 100)}`}
                        style={{ width: `${(selectedDataset.budget_used / selectedDataset.total_epsilon) * 100}%` }}
                      >
                        {((selectedDataset.budget_used / selectedDataset.total_epsilon) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6>Delta (δ)</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td className="text-muted">Total</td>
                          <td>{selectedDataset.total_delta.toExponential(2)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Consumed</td>
                          <td>{selectedDataset.delta_used.toExponential(2)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Remaining</td>
                          <td>{(selectedDataset.total_delta - selectedDataset.delta_used).toExponential(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="progress" style={{ height: '20px' }}>
                      <div
                        className={`progress-bar ${getBudgetStatusClass((selectedDataset.delta_used / selectedDataset.total_delta) * 100)}`}
                        style={{ width: `${(selectedDataset.delta_used / selectedDataset.total_delta) * 100}%` }}
                      >
                        {((selectedDataset.delta_used / selectedDataset.total_delta) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Reset</h5>
                <button type="button" className="btn-close" onClick={() => setShowResetModal(false)}></button>
              </div>
              <div className="modal-body">
                {selectedDataset ? (
                  <>
                    <p>Are you sure you want to reset the consumed budget for the dataset: <strong>{selectedDataset.name}</strong>?</p>
                    <p className="small text-danger">This action cannot be undone and will set the consumed epsilon and delta back to zero.</p>
                  </>
                ) : (
                  <div className="mb-3">
                    <label className="form-label">Select Dataset to Reset</label>
                    <select className="form-select" value={datasetToReset} onChange={e => setDatasetToReset(e.target.value)}>
                      {budgetData.datasets.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResetModal(false)}>Cancel</button>
                <button type="button" className="btn btn-warning" onClick={() => {
                  const datasetToActOn = selectedDataset || budgetData.datasets.find(d => d.name === datasetToReset);
                  handleResetBudget(datasetToActOn);
                }}>Reset Budget</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Allocate Budget Modal */}
      {showAllocateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Allocate Additional Budget</h5>
                <button type="button" className="btn-close" onClick={() => setShowAllocateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select Dataset</label>
                  <select className="form-select" value={datasetToAllocate} onChange={e => setDatasetToAllocate(e.target.value)}>
                    {budgetData.datasets.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Epsilon (ε) to Add</label>
                  <input type="number" className="form-control" value={epsilonToAdd} onChange={e => setEpsilonToAdd(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Delta (δ) to Add</label>
                  <input type="number" className="form-control" value={deltaToAdd} onChange={e => setDeltaToAdd(e.target.value)} step="0.00001" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAllocateModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleAllocateBudget}>Add Budget</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Alert Modal */}
      {/* *** FIX: Removed dependency on selectedDataset to allow the modal to open independently *** */}
      {showAlertModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Set Budget Alerts</h5>
                <button type="button" className="btn-close" onClick={() => setShowAlertModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select Dataset</label>
                  <select className="form-select" value={datasetForAlerts} onChange={e => setDatasetForAlerts(e.target.value)}>
                    {budgetData.datasets.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <h6>Existing Alerts for <strong>{datasetForAlerts}</strong></h6>
                {alerts.length > 0 ? (
                  <ul className="list-group mb-3">
                    {alerts.map(alert => (
                      <li key={alert.id} className="list-group-item d-flex justify-content-between align-items-center">
                        Notify {alert.email} when ε usage exceeds {alert.threshold}%
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteAlert(alert.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted small">No alerts configured for this dataset.</p>
                )}

                <h6 className="mt-4">Create New Alert</h6>
                <div className="row">
                  <div className="col-md-8">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" placeholder="user@example.com" value={alertEmail} onChange={e => setAlertEmail(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Threshold (%)</label>
                    <input type="number" className="form-control" value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAlertModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleCreateAlert}>Create Alert</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingContent;