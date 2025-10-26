import React from "react";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import QueriesContent from "../../components/dp/QueriesContent";
import DpLeftMenu from "../../components/DpLeftMenu";

export default function DpQueries() {
    const [activeMenu, setActiveMenu] = React.useState('queries');
    return (
        <ProtectedRoute>
            {() => (
                <>
                    <Head>
                        <title>DP Queries - Differential Privacy Platform</title>
                        <meta name="description" content="Differential Privacy Queries Dashboard" />
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
                                                    <i className="bi bi-braces-asterisk me-2"></i>
                                                    Queries Management
                                                </h5>
                                                <p className="text-muted mb-0 small">Configure queries for differential privacy analysis</p>
                                            </div>
                                        </div>
                                        <div className="content-area">
                                            <QueriesContent />
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
