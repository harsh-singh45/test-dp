import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/Spinner';
import { MessageBox } from '../common/MessageBox';
import { dpApiService } from '../../services/dpApiService';

const MechanismsContent = () => {
  const [mechanisms, setMechanisms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMechanism, setSelectedMechanism] = useState(null);

  const fetchMechanisms = async () => {
    setLoading(true);
    try {
      const data = await dpApiService.getMechanisms();
      setMechanisms(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanisms();
  }, []);

  const getMechanismIcon = (type) => {
    switch (type) {
      case 'additive_noise': return 'bi-plus-circle';
      case 'output_perturbation': return 'bi-shuffle';
      default: return 'bi-gear';
    }
  };

  const getMechanismColor = (rating) => {
    if (rating >= 4.5) return 'text-success';
    if (rating >= 4.0) return 'text-primary';
    if (rating >= 3.5) return 'text-warning';
    return 'text-secondary';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-muted"></i>);
    }
    return stars;
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex gap-2 ms-auto">
          <button className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-info-circle me-1"></i>Mechanism Guide
          </button>
          <button className="btn btn-outline-primary btn-sm">
            <i className="bi bi-calculator me-1"></i>Parameter Calculator
          </button>
        </div>
      </div>

      {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}

      {/* Mechanisms Grid */}
      {loading ? (
        <Spinner text="Loading mechanisms..." />
      ) : (
        <div className="row">
          {mechanisms.map((mechanism, index) => (
            <div key={mechanism.id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex align-items-center mb-3">
                    <div className={`me-3 ${getMechanismColor(mechanism.performance_rating)}`}>
                      <i className={`bi ${getMechanismIcon(mechanism.type)} fs-4`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{mechanism.name}</h6>
                      <small className="text-muted">{mechanism.type.replace(/_/g, ' ')}</small>
                    </div>
                  </div>
                  
                  <p className="text-muted small mb-3">{mechanism.description}</p>
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-muted">Performance Rating</span>
                      <div className="d-flex align-items-center">
                        {renderStars(mechanism.performance_rating)}
                        <span className="ms-2 small text-muted">({mechanism.performance_rating})</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="small text-muted mb-2">Parameters:</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {mechanism.parameters.map(param => (
                        <span key={param} className="badge bg-light text-dark small">
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="small text-muted mb-2">Use Cases:</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {mechanism.use_cases.map(useCase => (
                        <span key={useCase} className="badge bg-primary text-white small">
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="small text-muted mb-1">Privacy Guarantee:</h6>
                    <span className="badge bg-success">{mechanism.privacy_guarantee}</span>
                  </div>

                  <div className="mt-auto">
                    <button 
                      className="btn btn-outline-primary btn-sm w-100"
                      onClick={() => setSelectedMechanism(mechanism)}
                    >
                      <i className="bi bi-info-circle me-1"></i>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      <div className="card shadow-sm mt-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-table me-2"></i>
            Mechanism Comparison
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Mechanism</th>
                  <th>Type</th>
                  <th>Performance</th>
                  <th>Privacy Guarantee</th>
                  <th>Best For</th>
                  <th>Parameters</th>
                </tr>
              </thead>
              <tbody>
                {mechanisms.map(mechanism => (
                  <tr key={mechanism.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className={`bi ${getMechanismIcon(mechanism.type)} me-2 ${getMechanismColor(mechanism.performance_rating)}`}></i>
                        <strong>{mechanism.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {mechanism.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {renderStars(mechanism.performance_rating).slice(0, 5)}
                        <span className="ms-2 small">({mechanism.performance_rating})</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success">{mechanism.privacy_guarantee}</span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {mechanism.use_cases.slice(0, 2).join(', ')}
                        {mechanism.use_cases.length > 2 && '...'}
                      </small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {mechanism.parameters.join(', ')}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mechanism Detail Modal */}
      {selectedMechanism && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`bi ${getMechanismIcon(selectedMechanism.type)} me-2`}></i>
                  {selectedMechanism.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedMechanism(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Description</h6>
                    <p className="text-muted">{selectedMechanism.description}</p>
                    
                    <h6>Privacy Guarantee</h6>
                    <p>
                      <span className="badge bg-success fs-6">{selectedMechanism.privacy_guarantee}</span>
                    </p>

                    <h6>Performance Rating</h6>
                    <div className="d-flex align-items-center">
                      {renderStars(selectedMechanism.performance_rating)}
                      <span className="ms-2">({selectedMechanism.performance_rating}/5)</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6>Required Parameters</h6>
                    <ul className="list-unstyled">
                      {selectedMechanism.parameters.map(param => (
                        <li key={param} className="mb-1">
                          <span className="badge bg-light text-dark me-2">{param}</span>
                          <small className="text-muted">
                            {param === 'epsilon' && 'Privacy parameter'}
                            {param === 'delta' && 'Failure probability'}
                            {param === 'sensitivity' && 'Function sensitivity'}
                            {param === 'quality_function' && 'Output quality measure'}
                          </small>
                        </li>
                      ))}
                    </ul>

                    <h6>Recommended Use Cases</h6>
                    <ul className="list-unstyled">
                      {selectedMechanism.use_cases.map(useCase => (
                        <li key={useCase} className="mb-1">
                          <i className="bi bi-check2 text-success me-2"></i>
                          <span className="badge bg-primary me-2">{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <hr />
                
                <div className="alert alert-info">
                  <h6><i className="bi bi-lightbulb me-2"></i>Usage Tips</h6>
                  <ul className="mb-0">
                    <li>Consider the trade-off between privacy and utility when setting parameters</li>
                    <li>Test mechanisms with different epsilon values to find optimal settings</li>
                    <li>Validate mechanism compatibility with your query types</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedMechanism(null)}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  <i className="bi bi-plus-lg me-1"></i>
                  Use This Mechanism
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanismsContent;
