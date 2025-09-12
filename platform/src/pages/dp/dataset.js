import React from "react";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import DatasetsContent from "../../components/dp/DatasetsContent";
import DpLeftMenu from "../../components/DpLeftMenu";

export default function DpDataset() {
    const [activeMenu, setActiveMenu] = React.useState('datasets');
    return (
        <ProtectedRoute>
            {() => (
                <>
                    <Head>
                        <title>DP Dataset - Differential Privacy Platform</title>
                        <meta name="description" content="Differential Privacy Dataset Dashboard" />
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
                                                    <i className="bi bi-database me-2"></i>
                                                    Datasets Management
                                                </h5>
                                                <p className="text-muted mb-0 small">Configure datasets for differential privacy analysis</p>
                                            </div>
                                        </div>
                                        <div className="content-area">
                                            <DatasetsContent />
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
