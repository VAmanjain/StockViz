import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import CompanyList from './components/CompanyList/CompanyList';
import StockChart from './components/StockChart/StockChart';
import Education from './components/Education/Education';
import StockChat from './components/StockChat/StockChat';
import './styles/theme.css';

// Dashboard component
const Dashboard = () => {
    const [selectedCompany, setSelectedCompany] = useState(null);

    return (
        <Container fluid>
            <Row className="g-3">
                <Col lg={3} md={4} className="company-list-col">
                    <div className="company-list-wrapper">
                        <CompanyList onSelectCompany={setSelectedCompany} />
                    </div>
                </Col>
                <Col lg={9} md={8} className="chart-col">
                    <div className="chart-wrapper">
                        <StockChart selectedCompany={selectedCompany} />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

const App = () => {
    return (
        <ThemeProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/education" element={<Education />} />
                        <Route path="/chat" element={<StockChat />} />
                    </Routes>
                </Layout>
            </Router>
        </ThemeProvider>
    );
};

export default App; 