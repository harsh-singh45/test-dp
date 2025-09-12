import React from "react";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import SettingsContent from "../../components/dp/SettingsContent";
import DpLeftMenu from "../../components/DpLeftMenu";

export default function DpSettings() {
    const [activeMenu, setActiveMenu] = React.useState('settings');
    return (
        <ProtectedRoute>
            {() => (
                <>
                    <Head>
                        <title>DP Settings - Differential Privacy Platform</title>
                        <meta name="description" content="Differential Privacy Settings Dashboard" />
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
                                                    <i className="bi bi-gear me-2"></i>
                                                    Settings
                                                </h5>
                                                <p className="text-muted mb-0 small">Configure differential privacy platform settings</p>
                                            </div>
                                        </div>
                                        <div className="content-area">
                                            <SettingsContent />
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
