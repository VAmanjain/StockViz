import React, { useState, useEffect } from 'react';
import { ListGroup, Form } from 'react-bootstrap';
import { apiService } from '../../services/apiService';
import './CompanyList.css';

const CompanyList = ({ onSelectCompany }) => {
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await apiService.getCompanies();
                setCompanies(data);
            } catch (error) {
                console.error('Error fetching companies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleCompanyClick = (company) => {
        onSelectCompany(company);
    };

    const filteredCompanies = companies.filter(company =>
        company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Loading companies...</div>;
    }

    return (
        <div className="company-list">
            <Form.Control
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            <ListGroup className="list-group">
                {filteredCompanies.map((company, index) => (
                    <ListGroup.Item
                        key={index}
                        action
                        onClick={() => handleCompanyClick(company)}
                        className="list-group-item"
                    >
                        {company}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

export default CompanyList; 