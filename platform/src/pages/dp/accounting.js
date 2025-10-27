import React from "react";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import AccountingContent from "../../components/dp/AccountingContent";
import DpLeftMenu from "../../components/DpLeftMenu";

export default function DpAccounting() {
    const [activeMenu, setActiveMenu] = React.useState('accounting');
    return (
        <ProtectedRoute>
            {() => (
                <>
                    <Head>
                        <title>DP Accounting - Differential Privacy Platform</title>
                        <meta name="description" content="Differential Privacy Budget Accounting Dashboard" />
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
                                                    <i className="bi bi-calculator me-2"></i>
                                                    Privacy Budget Accounting
                                                </h5>
                                                <p className="text-muted mb-0 small">Monitor and manage privacy budget consumption</p>
                                            </div>
                                        </div>
                                        <div className="content-area">
                                            <AccountingContent />
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