import React from "react";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import SimulationContent from "../../components/dp/SimulationContent";
import DpLeftMenu from "../../components/DpLeftMenu";

export default function DpSimulation() {
    const [activeMenu, setActiveMenu] = React.useState('simulation');
    return (
        <ProtectedRoute>
            {() => (
                <>
                    <Head>
                        <title>DP Simulation - Differential Privacy Platform</title>
                        <meta name="description" content="Differential Privacy Simulation Dashboard" />
                    </Head>

                    <Header />

                    <div className="container-fluid mt-5" style={{ paddingTop: '76px' }}>
                        <div className="row">
                            <div className="col-12">
                                <div className="d-flex">
                                    <DpLeftMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                                    <div className="flex-grow-1 ms-4">
                                        <div className="d-flex align-items-center justify-content-between mb-4">
                                            <div>
                                                <h5 className="mb-1">
                                                    <i className="bi bi-bar-chart me-2"></i>
                                                    Privacy Simulation
                                                </h5>
                                                <p className="text-muted mb-0 small">Test and simulate differential privacy mechanisms</p>
                                            </div>
                                        </div>
                                        <div className="content-area">
                                            <SimulationContent />
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
