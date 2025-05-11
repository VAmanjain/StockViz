import React from 'react';
import { Container } from 'react-bootstrap';
import NavigationBar from '../Navbar/Navbar';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="app-layout">
            <NavigationBar />
            <Container fluid className="main-container">
                {children}
            </Container>
        </div>
    );
};

export default Layout; 