import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Table, Badge } from 'react-bootstrap';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import './StockChat.css';

// Structured response types
const RESPONSE_TYPES = {
    DEFINITION: 'definition',
    EXPLANATION: 'explanation',
    ADVICE: 'advice',
    ERROR: 'error'
};

// Example questions
const EXAMPLE_QUESTIONS = [
    {
        category: "Basics",
        questions: [
            "What is a bull market and how does it differ from a bear market?",
            "Explain the concept of P/E ratio with examples",
            "What are the different types of stock orders?"
        ]
    },
    {
        category: "Analysis",
        questions: [
            "Compare technical analysis vs fundamental analysis",
            "What are the key indicators for technical analysis?",
            "How do I read a stock chart?"
        ]
    },
    {
        category: "Strategy",
        questions: [
            "What are the pros and cons of day trading?",
            "Explain dollar-cost averaging with examples",
            "How do I build a diversified portfolio?"
        ]
    }
];

// Helper function to extract table content
const extractTable = (text) => {
    const lines = text.split('\n');
    const tableLines = lines.filter(line => line.trim().startsWith('|') && line.trim().endsWith('|'));
    
    if (tableLines.length >= 2) {
        const tableContent = tableLines.map(line => line.trim());
        const hasHeader = tableContent[0].split('|').filter(cell => cell.trim()).length > 1;
        const hasSeparator = tableContent[1].split('|').every(cell => cell.trim().replace(/-/g, '').length === 0);
        
        if (hasHeader && hasSeparator) {
            return {
                tableContent: tableContent,
                tableComponent: (
                    <div className="table-responsive">
                        <Table striped bordered hover className="stock-table">
                            <tbody>
                                {tableContent.map((line, index) => {
                                    if (index === 1) return null; // Skip separator line
                                    const cells = line.split('|')
                                        .filter(cell => cell.trim())
                                        .map(cell => cell.trim());
                                    
                                    return (
                                        <tr key={index}>
                                            {cells.map((cell, cellIndex) => (
                                                index === 0 ? (
                                                    <th key={cellIndex}>{cell}</th>
                                                ) : (
                                                    <td key={cellIndex}>{cell}</td>
                                                )
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                )
            };
        }
    }
    return null;
};

// Enhanced response structuring
const structureResponse = (text) => {
    // Extract table if present
    const tableData = extractTable(text);
    
    // Split text into sections
    const sections = text.split('\n\n').filter(section => section.trim());
    
    // Process each section
    const formattedSections = sections.map(section => {
        // Check if this section is a table
        if (tableData && section.trim().startsWith('|') && section.trim().endsWith('|')) {
            return (
                <div key={section} className="table-response">
                    {tableData.tableComponent}
                </div>
            );
        }
        
        // Process non-table sections
        return (
            <div key={section} className="text-section">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {section}
                </ReactMarkdown>
            </div>
        );
    });

    // Determine response type
    let type = RESPONSE_TYPES.EXPLANATION;
    if (text.toLowerCase().includes('**') || text.toLowerCase().includes('*')) {
        type = RESPONSE_TYPES.DEFINITION;
    } else if (text.includes('- ') || text.includes('* ')) {
        type = 'list';
    } else if (text.toLowerCase().includes('should') || text.toLowerCase().includes('recommend')) {
        type = RESPONSE_TYPES.ADVICE;
    }

    return {
        type,
        content: text,
        formattedContent: (
            <div className="response-content">
                {formattedSections}
            </div>
        )
    };
};

const StockChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [displayedResponse, setDisplayedResponse] = useState('');
    const messagesEndRef = useRef(null);
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Function to handle example question click
    const handleExampleClick = (question) => {
        setInput(question);
        handleSubmit(new Event('submit'), question);
    };

    // Function to simulate typing effect
    const simulateTyping = (text, onComplete) => {
        let index = 0;
        setIsTyping(true);
        
        const typeNextChar = () => {
            if (index < text.length) {
                setDisplayedResponse(prev => prev + text[index]);
                index++;
                typingTimeoutRef.current = setTimeout(typeNextChar, 20); // Adjust speed as needed
            } else {
                setIsTyping(false);
                onComplete?.();
            }
        };
        
        typeNextChar();
    };

    // Cleanup typing effect
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleSubmit = async (e, exampleQuestion = null) => {
        e.preventDefault();
        const question = exampleQuestion || input.trim();
        if (!question || isLoading) return;

        // Reset states
        setInput('');
        setError(null);
        setDisplayedResponse('');
        setIsTyping(false);

        // Add user message
        const userMessage = {
            role: 'user',
            content: question,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const prompt = `You are a highly knowledgeable and helpful business assistant. Your goal is to provide clear, concise, and accurate information about a wide range of topics, including stocks, investing, ecommerce, economics, entrepreneurship, management, and general business concepts.

            Formatting Guidelines:
            - Use **bold** for key terms, concepts, and company names
            - Use *italic* for emphasis or to clarify definitions
            - Use bullet points (- or *) for lists, steps, or key takeaways
            - Use tables with proper markdown syntax for structured data:
              | Header 1 | Header 2 | Header 3 |
              |----------|----------|----------|
              | Data 1   | Data 2   | Data 3   |
            - Use headings (#, ##, etc.) to organize content clearly
            - Use \`code\` for formulas, tickers, or specific values
            - Include practical examples or scenarios when appropriate
            - Keep your tone professional, friendly, and educational

            Response Requirements:
            - Provide context and definitions for any technical terms
            - When relevant, include actionable insights or tips
            - Avoid jargon unless explained
            - Do not provide financial advice; offer information and education only
            - For comparisons or structured data, use tables
            - For step-by-step guides, use numbered lists
            - For key points or features, use bullet points

            Example Response Structure:
            # Topic Name

            ## Definition
            Brief explanation of the concept...

            ## Key Points
            - Point 1
            - Point 2
            - Point 3

            ## Comparison (if applicable)
            | Feature | Option A | Option B |
            |---------|----------|----------|
            | Point 1 | Value 1  | Value 2  |
            | Point 2 | Value 3  | Value 4  |

            ## Additional Insights
            Further explanation or tips...

            User Question: ${question}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Create the structured response
            const structuredResponse = structureResponse(text);
            
            // Add the initial assistant message
            const assistantMessage = {
                role: 'assistant',
                content: text,
                formattedContent: structuredResponse.formattedContent,
                type: structuredResponse.type,
                timestamp: new Date().toISOString()
            };

            // Add the message immediately
            setMessages(prev => [...prev, assistantMessage]);

            // Start typing animation
            setIsTyping(true);
            let currentText = '';
            const typeInterval = setInterval(() => {
                if (currentText.length < text.length) {
                    currentText += text[currentText.length];
                    setDisplayedResponse(currentText);
                } else {
                    clearInterval(typeInterval);
                    setIsTyping(false);
                }
            }, 20);

            return () => clearInterval(typeInterval);

        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                role: 'assistant',
                type: RESPONSE_TYPES.ERROR,
                content: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
            setError('Failed to get response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderExampleQuestions = () => (
        <div className="example-questions">
            {EXAMPLE_QUESTIONS.map((category, idx) => (
                <div key={idx} className="example-category">
                    <h5>{category.category}</h5>
                    <div className="example-buttons">
                        {category.questions.map((question, qIdx) => (
                            <Badge
                                key={qIdx}
                                bg="light"
                                text="dark"
                                className="example-question"
                                onClick={() => handleExampleClick(question)}
                            >
                                {question}
                            </Badge>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderMessage = (message, index) => {
        const messageClass = `message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`;
        const time = new Date(message.timestamp).toLocaleTimeString();
        const isLastMessage = index === messages.length - 1;

        return (
            <motion.div
                key={message.timestamp}
                className={messageClass}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="message-content">
                    {message.role === 'assistant' ? (
                        isTyping && isLastMessage ? (
                            <div className="typing-animation">
                                {displayedResponse}
                                <span className="typing-cursor">|</span>
                            </div>
                        ) : (
                            message.formattedContent || message.content
                        )
                    ) : (
                        message.content
                    )}
                </div>
                <div className="message-timestamp">{time}</div>
            </motion.div>
        );
    };

    return (
        <Container className="stock-chat-container">
            <Card className="chat-card">
                <Card.Header className="chat-header">
                    <h2>Stock Market AI Assistant</h2>
                    <p>Ask me anything about stocks, investing, or market concepts</p>
                    {renderExampleQuestions()}
                </Card.Header>

                {error && (
                    <Alert variant="danger" className="m-3" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                <Card.Body className="chat-messages">
                    <AnimatePresence>
                        {messages.map((message, index) => renderMessage(message, index))}
                    </AnimatePresence>
                    {isLoading && !isTyping && (
                        <motion.div
                            className="message assistant-message"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </Card.Body>

                <Card.Footer className="chat-input">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="d-flex">
                            <Form.Control
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about stocks, investing, or market concepts..."
                                disabled={isLoading || isTyping}
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || isTyping || !input.trim()}
                                className="ms-2"
                            >
                                Send
                            </Button>
                        </Form.Group>
                    </Form>
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default StockChat; 