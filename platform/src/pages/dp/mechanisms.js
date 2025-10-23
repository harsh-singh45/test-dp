import React from "react";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import MechanismsContent from "../../components/dp/MechanismsContent";
import DpLeftMenu from "../../components/DpLeftMenu";

export default function DpMechanisms() {
    const [activeMenu, setActiveMenu] = React.useState('mechanisms');
    return (
        <ProtectedRoute>
            {() => (
                <>
                    <Head>
                        <title>DP Mechanisms - Differential Privacy Platform</title>
                        <meta name="description" content="Differential Privacy Mechanisms Dashboard" />
                    </Head>

                    <Header />

                    {/* This layout is now IDENTICAL to your working accounting.js page */}
                    <div className="container-fluid mt-5" style={{ paddingTop: '76px' }}>
                        <div className="row">
                            <div className="col-12">
                                <div className="d-flex">
                                    <DpLeftMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                                    <div className="flex-grow-1 ms-4">
                                        <div className="d-flex align-items-center justify-content-between mb-4">
                                            <div>
                                                <h5 className="mb-1">
                                                    <i className="bi bi-diagram-3 me-2"></i>
                                                    Privacy Mechanisms
                                                </h5>
                                                <p className="text-muted mb-0 small">Configure privacy mechanisms for differential privacy analysis</p>
                                            </div>
                                        </div>
                                        {/* The content-area div is crucial */}
                                        <div className="content-area">
                                            <MechanismsContent />
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