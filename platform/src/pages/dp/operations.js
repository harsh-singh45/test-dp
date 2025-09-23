import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import DpLeftMenu from "../../components/DpLeftMenu";
import DatasetsContent from "../../components/dp/DatasetsContent";
import MechanismsContent from "../../components/dp/MechanismsContent";
import QueriesContent from "../../components/dp/QueriesContent";
import AccountingContent from "../../components/dp/AccountingContent";
import SimulationContent from "../../components/dp/SimulationContent";
import ReportsContent from "../../components/dp/ReportsContent";
import AuditContent from "../../components/dp/AuditContent";
import SettingsContent from "../../components/dp/SettingsContent";
import { useState } from "react";

export default function DpOperations() {
    const [activeMenu, setActiveMenu] = useState('datasets');

    return (
        <ProtectedRoute>
            {() => (
                <>
                    <Head>
                        <title>DP Operations - Differential Privacy Platform</title>
                        <meta name="description" content="Differential Privacy Operations Dashboard" />
                    </Head>

                    <Header />

                    <div className="container-fluid mt-5" style={{ paddingTop: '76px' }}>
                        <div className="row">
                            <div className="col-12">
                                <div className="d-flex">
                                    {/* Left Menu */}
                                    <DpLeftMenu 
                                        activeMenu={activeMenu} 
                                        setActiveMenu={setActiveMenu}
                                    />

                                    {/* Main Content Area */}
                                    <div className="flex-grow-1 ms-4">
                                        {/* Page Header */}
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <div>
                                                <h2 className="mb-0">
                                                    <i className="bi bi-shield-lock me-2 text-primary"></i>
                                                    Differential Privacy Operations
                                                </h2>
                                                <p className="text-muted mt-1 mb-0">
                                                    Unified interface for all differential privacy operations
                                                </p>
                                            </div>
                                        </div>

                                        {/* Dynamic Content Based on Active Menu */}
                                        <div className="content-area">
                                            {activeMenu === 'datasets' && <DatasetsContent />}
                                            {activeMenu === 'mechanisms' && <MechanismsContent />}
                                            {activeMenu === 'queries' && <QueriesContent />}
                                            {activeMenu === 'accounting' && <AccountingContent />}
                                            {activeMenu === 'simulation' && <SimulationContent />}
                                            {activeMenu === 'reports' && <ReportsContent />}
                                            {activeMenu === 'audit' && <AuditContent />}
                                            {activeMenu === 'settings' && <SettingsContent />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Footer />
                </>
            )}
        </ProtectedRoute>
    );
}
