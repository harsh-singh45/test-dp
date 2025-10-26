import React, { useState, useEffect } from 'react';
import { dpApiService } from '../../services/dpApiService';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';
import Modal from '../common/Modal';

const ReportsContent = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetIds, setSelectedDatasetIds] = useState([]);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('Query Performance');
  const [isGenerating, setIsGenerating] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // *** MODIFICATION START: State for Scheduling ***
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [newScheduleData, setNewScheduleData] = useState({
      name: '',
      report_type: 'Budget Analysis',
      dataset_ids: [],
      frequency: 'Daily'
  });
  // *** MODIFICATION END ***


  const fetchReportsAndSchedules = async () => {
    setLoading(true);
    try {
      const reportsData = await dpApiService.getReports();
      setReports(reportsData);
      // *** MODIFICATION START ***
      const schedulesData = await dpApiService.getSchedules();
      setSchedules(schedulesData);
      // *** MODIFICATION END ***
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatasets = async () => {
      try {
          const data = await dpApiService.getDatasets();
          setDatasets(data || []);
      } catch (err) {
          setError('Could not load datasets for report generation.');
      }
  };

  useEffect(() => {
    fetchReportsAndSchedules();
  }, []);

  const openGenerateModal = () => {
    fetchDatasets();
    setIsModalOpen(true);
  };
  
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handleDatasetSelection = (e) => {
    const { value, checked } = e.target;
    const datasetId = parseInt(value, 10);
    if (checked) {
      setSelectedDatasetIds(prev => [...prev, datasetId]);
    } else {
      setSelectedDatasetIds(prev => prev.filter(id => id !== datasetId));
    }
  };

  const handleGenerateReport = async () => {
    if (!reportName || selectedDatasetIds.length === 0) {
        alert('Please provide a report name and select at least one dataset.');
        return;
    }
    setIsGenerating(true);
    try {
        await dpApiService.generateReport({
            name: reportName,
            type: reportType,
            dataset_ids: selectedDatasetIds
        });
        setIsModalOpen(false);
        setReportName('');
        setSelectedDatasetIds([]);
        fetchReportsAndSchedules(); // Refresh both reports and schedules
    } catch (err) {
        alert(`Error generating report: ${err.message}`);
    } finally {
        setIsGenerating(false);
    }
  };

  // *** MODIFICATION START: Handlers for Scheduling ***
  const openScheduleModal = () => {
    fetchDatasets();
    setShowScheduleModal(true);
  };
  
  const handleScheduleFormChange = (e) => {
      const { name, value } = e.target;
      setNewScheduleData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleDatasetSelection = (e) => {
      const { value, checked } = e.target;
      const datasetId = parseInt(value, 10);
      let newIds = [...newScheduleData.dataset_ids];
      if (checked) {
          newIds.push(datasetId);
      } else {
          newIds = newIds.filter(id => id !== datasetId);
      }
      setNewScheduleData(prev => ({...prev, dataset_ids: newIds}));
  };

  const handleCreateSchedule = async () => {
      if (!newScheduleData.name || newScheduleData.dataset_ids.length === 0) {
          alert('Please provide a schedule name and select at least one dataset.');
          return;
      }
      try {
          await dpApiService.createSchedule(newScheduleData);
          setNewScheduleData({ name: '', report_type: 'Budget Analysis', dataset_ids: [], frequency: 'Daily' });
          fetchReportsAndSchedules();
      } catch (err) {
          setError(`Failed to create schedule: ${err.message}`);
      }
  };

  const handleDeleteSchedule = async (scheduleId) => {
      if (window.confirm('Are you sure you want to delete this schedule?')) {
          try {
              await dpApiService.deleteSchedule(scheduleId);
              fetchReportsAndSchedules();
          } catch (err) {
              setError(`Failed to delete schedule: ${err.message}`);
          }
      }
  };
  // *** MODIFICATION END ***

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex gap-2 ms-auto">
          {/* *** MODIFICATION START: Added onClick handler *** */}
          <button className="btn btn-outline-secondary btn-sm" onClick={openScheduleModal}>
            <i className="bi bi-gear me-1"></i>Schedule Reports
          </button>
          {/* *** MODIFICATION END *** */}
          <button className="btn btn-primary btn-sm" onClick={openGenerateModal}>
            <i className="bi bi-plus-lg me-1"></i>Generate Report
          </button>
        </div>
      </div>

      {error && <MessageBox type="error" message={error} onClose={() => setError('')} />}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? <Spinner /> : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Report Name</th>
                    <th>Type</th>
                    <th>Last Generated</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(report => (
                    <tr key={report.id}>
                      <td><strong>{report.name}</strong></td>
                      <td><span className="badge bg-light text-dark">{report.type}</span></td>
                      <td><small className="text-muted">{new Date(report.created_at).toLocaleString()}</small></td>
                      <td><small>{report.size_kb.toFixed(2)} KB</small></td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <a href={dpApiService.getReportDownloadUrl(report.id)} className="btn btn-outline-primary btn-sm" download>
                            <i className="bi bi-download"></i>
                          </a>
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => handleViewReport(report)}>
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Generate Report Modal (Unchanged) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate New Report">
          <div className="mb-3">
              <label className="form-label">Report Name</label>
              <input type="text" className="form-control" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="e.g., Q3 Query Performance Analysis" />
          </div>
          <div className="mb-3">
              <label className="form-label">Report Type</label>
              <select className="form-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option>Query Performance</option>
                  <option>Budget Analysis</option>
                  <option>Mechanism Usage Summary</option>
              </select>
          </div>
          <div className="mb-3">
              <label className="form-label">Select Datasets</label>
              <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {datasets.map(ds => (
                      <div key={ds.id} className="form-check">
                          <input className="form-check-input" type="checkbox" value={ds.id} id={`ds-${ds.id}`} onChange={handleDatasetSelection} />
                          <label className="form-check-label" htmlFor={`ds-${ds.id}`}>
                              {ds.name}
                          </label>
                      </div>
                  ))}
              </div>
          </div>
          <div className="d-flex justify-content-end">
              <button className="btn btn-primary" onClick={handleGenerateReport} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
          </div>
      </Modal>

      {/* View Report Modal (Unchanged) */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Report Details">
        {selectedReport && (
            <div>
                <p><strong>Report ID:</strong> {selectedReport.id}</p>
                <p><strong>Report Name:</strong> {selectedReport.name}</p>
                <p><strong>Report Type:</strong> {selectedReport.type}</p>
                <p><strong>Generated At:</strong> {new Date(selectedReport.created_at).toLocaleString()}</p>
                <p><strong>File Size:</strong> {selectedReport.size_kb.toFixed(2)} KB</p>
                <p><strong>File Path:</strong> <code className="user-select-all">{selectedReport.file_path}</code></p>
            </div>
        )}
      </Modal>

      {/* *** MODIFICATION START: New Modal for Scheduling *** */}
      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Manage Report Schedules">
        <h6 className="mb-3">Existing Schedules</h6>
        {schedules.length > 0 ? (
            <ul className="list-group mb-4">
                {schedules.map(s => (
                    <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{s.name}</strong> ({s.report_type}) - {s.frequency}
                        </div>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteSchedule(s.id)}>
                            <i className="bi bi-trash"></i>
                        </button>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-muted small">No reports are currently scheduled.</p>
        )}

        <hr/>
        <h6 className="mb-3 mt-4">Create New Schedule</h6>
        <div className="mb-3">
              <label className="form-label">Schedule Name</label>
              <input type="text" className="form-control" name="name" value={newScheduleData.name} onChange={handleScheduleFormChange} placeholder="e.g., Weekly Budget Summary"/>
        </div>
        <div className="row">
            <div className="col-md-6 mb-3">
                <label className="form-label">Report Type</label>
                <select className="form-select" name="report_type" value={newScheduleData.report_type} onChange={handleScheduleFormChange}>
                    <option>Budget Analysis</option>
                    <option>Query Performance</option>
                    <option>Mechanism Usage Summary</option>
                </select>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label">Frequency</label>
                <select className="form-select" name="frequency" value={newScheduleData.frequency} onChange={handleScheduleFormChange}>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                </select>
            </div>
        </div>
        <div className="mb-3">
            <label className="form-label">Select Datasets</label>
            <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {datasets.map(ds => (
                    <div key={ds.id} className="form-check">
                        <input className="form-check-input" type="checkbox" value={ds.id} id={`schedule-ds-${ds.id}`} onChange={handleScheduleDatasetSelection} />
                        <label className="form-check-label" htmlFor={`schedule-ds-${ds.id}`}>
                            {ds.name}
                        </label>
                    </div>
                ))}
            </div>
        </div>
        <div className="d-flex justify-content-end">
            <button className="btn btn-primary" onClick={handleCreateSchedule}>
                <i className="bi bi-plus-lg me-1"></i>Create Schedule
            </button>
        </div>
        <div className="alert alert-info small mt-4">
            <strong>Note:</strong> A background worker process on the server is required to automatically run these schedules. This UI only manages the schedule definitions.
        </div>
      </Modal>
      {/* *** MODIFICATION END *** */}

    </div>
  );
};

export default ReportsContent;