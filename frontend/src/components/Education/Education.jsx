import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Button, Modal, Alert } from 'react-bootstrap';
import educationService from '../../services/educationService';
import './Education.css';

const Education = () => {
    const [activeTab, setActiveTab] = useState('basics');
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [apiStatus, setApiStatus] = useState(null);
    const [cache, setCache] = useState({});
    const lastApiCallTime = useRef({});
    const API_COOLDOWN = 60000; // 1 minute cooldown between API calls for same content

    const tabs = [
        { id: 'basics', label: 'Stock Market Basics' },
        { id: 'technical', label: 'Technical Analysis' },
        { id: 'strategies', label: 'Investment Strategies' },
        { id: 'glossary', label: 'Financial Glossary' }
    ];

    useEffect(() => {
        setLoading(true);
        try {
            let data;
            switch (activeTab) {
                case 'basics':
                    data = educationService.getStockMarketBasics();
                    break;
                case 'technical':
                    data = educationService.getTechnicalAnalysis();
                    break;
                case 'strategies':
                    data = educationService.getInvestmentStrategies();
                    break;
                case 'glossary':
                    data = educationService.getFinancialTerms();
                    break;
                default:
                    data = null;
            }
            setContent(data);
        } catch (err) {
            setError('Failed to load content. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    const handleTabChange = (tabId) => {
        if (tabId === activeTab) return;
        setActiveTab(tabId);
        setContent(null);
    };

    const handleQuizClick = () => {
        try {
            const quizTopic = activeTab === 'basics' ? 'stock market basics' : 
                            activeTab === 'technical' ? 'technical analysis' : 
                            activeTab === 'strategies' ? 'investment strategies' : 
                            'financial terms';
            
            const data = educationService.getInteractiveQuiz(quizTopic);
            setQuizData(data);
            setShowQuiz(true);
            setSelectedAnswers({});
            setQuizSubmitted(false);
            setScore(0);
        } catch (err) {
            setError('Failed to load quiz. Please try again later.');
        }
    };

    const handleAnswerSelect = (questionIndex, answerIndex) => {
        if (quizSubmitted) return;
        
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: answerIndex
        }));
    };

    const handleQuizSubmit = () => {
        if (quizSubmitted || !quizData || !quizData.questions) return;
        
        let correctAnswers = 0;
        quizData.questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });
        
        setScore(correctAnswers);
        setQuizSubmitted(true);
    };

    const renderApiStatus = () => {
        if (!apiStatus || apiStatus.enabled) return null;
        
        return (
            <Alert variant="warning" className="api-status-alert">
                <Alert.Heading>Using Offline Content</Alert.Heading>
                <p>
                    {apiStatus.message}
                    {apiStatus.availableIn > 0 && ` Online content will be available in approximately ${apiStatus.availableIn} ${apiStatus.availableIn === 1 ? 'minute' : 'minutes'}.`}
                </p>
            </Alert>
        );
    };

    const renderContent = () => {
        if (loading) {
            return <div className="loading">Loading content...</div>;
        }

        if (error) {
            return <div className="error">{error}</div>;
        }

        if (!content) {
            return <div className="error">No content available</div>;
        }

        switch (activeTab) {
            case 'basics':
                return (
                    <div className="content-section">
                        {content.sections.map((section, index) => (
                            <div key={index} className="section-card">
                                <h3>{section.title}</h3>
                                <p>{section.content}</p>
                            </div>
                        ))}
                        <Button className="quiz-button" onClick={handleQuizClick} disabled={loading}>
                            Take Quiz on Stock Market Basics
                        </Button>
                    </div>
                );

            case 'technical':
                return (
                    <div className="content-section">
                        {content.indicators.map((indicator, index) => (
                            <div key={index} className="indicator-card">
                                <h3>{indicator.name}</h3>
                                <p>{indicator.description}</p>
                                <div className="indicator-details">
                                    <p><strong>Formula:</strong> {indicator.formula}</p>
                                    <p><strong>Usage:</strong> {indicator.usage}</p>
                                </div>
                            </div>
                        ))}
                        <Button className="quiz-button" onClick={handleQuizClick} disabled={loading}>
                            Take Quiz on Technical Analysis
                        </Button>
                    </div>
                );

            case 'strategies':
                return (
                    <div className="content-section">
                        {content.strategies.map((strategy, index) => (
                            <div key={index} className="strategy-card">
                                <h3>{strategy.name}</h3>
                                <p>{strategy.description}</p>
                                <ul>
                                    {strategy.keyPoints.map((point, pointIndex) => (
                                        <li key={pointIndex}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <Button className="quiz-button" onClick={handleQuizClick} disabled={loading}>
                            Take Quiz on Investment Strategies
                        </Button>
                    </div>
                );

            case 'glossary':
                return (
                    <div className="content-section">
                        <div className="glossary-grid">
                            {content.terms.map((term, index) => (
                                <div key={index} className="term-card">
                                    <h3>{term.term}</h3>
                                    <p>{term.definition}</p>
                                </div>
                            ))}
                        </div>
                        <Button className="quiz-button" onClick={handleQuizClick} disabled={loading}>
                            Take Quiz on Financial Terms
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Container className="education-container">
            <div className="education-header">
                <h1>Stock Market Education</h1>
                <p>Learn about stock market basics, technical analysis, investment strategies, and more.</p>
            </div>

            {renderApiStatus()}

            <div className="education-tabs">
                {tabs.map(tab => (
                    <Button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                        disabled={loading}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            <div className="education-content">
                {renderContent()}
            </div>

            <Modal
                show={showQuiz}
                onHide={() => setShowQuiz(false)}
                size="lg"
                centered
                className="quiz-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Interactive Quiz</Modal.Title>
                </Modal.Header>
                <Modal.Body className="quiz-content">
                    {loading ? (
                        <div className="loading">Generating quiz...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : quizData && quizData.questions ? (
                        <>
                            {quizData.questions.map((question, questionIndex) => (
                                <div key={questionIndex} className="question-card">
                                    <h4>Question {questionIndex + 1}</h4>
                                    <p>{question.question}</p>
                                    <div className="options">
                                        {question.options.map((option, optionIndex) => (
                                            <button
                                                key={optionIndex}
                                                className={`option-button ${
                                                    selectedAnswers[questionIndex] === optionIndex ? 'selected' : ''
                                                } ${
                                                    quizSubmitted && optionIndex === question.correctAnswer ? 'correct' : ''
                                                } ${
                                                    quizSubmitted && selectedAnswers[questionIndex] === optionIndex && 
                                                    selectedAnswers[questionIndex] !== question.correctAnswer ? 'incorrect' : ''
                                                }`}
                                                onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                                                disabled={quizSubmitted}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="quiz-footer">
                                <p>Your score: {score} / {quizData.questions.length}</p>
                            </div>
                        </>
                    ) : (
                        <div className="error">No quiz data available</div>
                    )}
                </Modal.Body>
            </Modal>
        </Container>    
    );
};

export default Education;
