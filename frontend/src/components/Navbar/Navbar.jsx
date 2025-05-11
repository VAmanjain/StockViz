import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const NavigationBar = () => {
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <Navbar className={`app-navbar ${isDarkMode ? 'dark' : ''}`} expand="lg" fixed="top">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="navbar-brand">
                    <i className="fas fa-chart-line"></i>
                    <span>StockViz</span>
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="navbar-nav" />
                
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link 
                            as={Link} 
                            to="/" 
                            className={isActive('/') ? 'active' : ''}
                        >
                            Dashboard
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/education" 
                            className={isActive('/education') ? 'active' : ''}
                        >
                            Education
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/chat" 
                            className={isActive('/chat') ? 'active' : ''}
                        >
                            AI Assistant
                        </Nav.Link>
                    </Nav>
                    
                    <div className="navbar-actions">
                        <Button 
                            variant="outline-primary" 
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                        </Button>
                        
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar; 