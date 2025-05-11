const educationService = {
    getStockMarketBasics() {
        return {
            title: "Stock Market Basics",
            sections: [
                {
                    title: "What is the Stock Market?",
                    content: "The stock market is a marketplace where shares of publicly traded companies are bought and sold. It provides companies with access to capital and investors with ownership in companies."
                },
                {
                    title: "Key Concepts",
                    content: "Stocks represent ownership in a company. When you buy a stock, you're buying a small piece of that company. The price of a stock reflects the company's value and market sentiment."
                },
                {
                    title: "Getting Started",
                    content: "To start investing, you'll need a brokerage account. Research companies, understand their business models, and consider your investment goals and risk tolerance."
                }
            ]
        };
    },

    getTechnicalAnalysis() {
        return {
            title: "Technical Analysis",
            indicators: [
                {
                    name: "Moving Averages",
                    description: "Moving averages smooth out price data to identify trends.",
                    formula: "SMA = (Sum of prices over n periods) / n",
                    usage: "Used to identify trend direction and potential support/resistance levels."
                },
                {
                    name: "RSI (Relative Strength Index)",
                    description: "Measures the speed and change of price movements.",
                    formula: "RSI = 100 - (100 / (1 + RS))",
                    usage: "Identifies overbought (>70) and oversold (<30) conditions."
                },
                {
                    name: "MACD (Moving Average Convergence Divergence)",
                    description: "Shows the relationship between two moving averages.",
                    formula: "MACD = 12-day EMA - 26-day EMA",
                    usage: "Used to identify momentum, trends, and potential buy/sell signals."
                }
            ]
        };
    },

    getInvestmentStrategies() {
        return {
            title: "Investment Strategies",
            strategies: [
                {
                    name: "Value Investing",
                    description: "Investing in stocks that appear to be trading for less than their intrinsic value.",
                    keyPoints: [
                        "Look for undervalued companies",
                        "Focus on long-term growth",
                        "Consider company fundamentals"
                    ]
                },
                {
                    name: "Growth Investing",
                    description: "Investing in companies that are expected to grow at an above-average rate.",
                    keyPoints: [
                        "Focus on future potential",
                        "Higher risk, higher reward",
                        "Look for innovative companies"
                    ]
                },
                {
                    name: "Dividend Investing",
                    description: "Investing in companies that regularly pay dividends to shareholders.",
                    keyPoints: [
                        "Regular income stream",
                        "Lower risk profile",
                        "Focus on stable companies"
                    ]
                }
            ]
        };
    },

    getFinancialTerms() {
        return {
            terms: [
                {
                    term: "Bull Market",
                    definition: "A market characterized by rising prices and optimistic investor sentiment."
                },
                {
                    term: "Bear Market",
                    definition: "A market characterized by falling prices and pessimistic investor sentiment."
                },
                {
                    term: "Dividend",
                    definition: "A portion of a company's earnings distributed to shareholders."
                },
                {
                    term: "Market Cap",
                    definition: "Total market value of a company's outstanding shares."
                },
                {
                    term: "P/E Ratio",
                    definition: "Price-to-Earnings ratio, used to value a company's stock."
                }
            ]
        };
    },

    getInteractiveQuiz(topic) {
        const quizzes = {
            'stock market basics': {
                questions: [
                    {
                        question: "What is a stock?",
                        options: [
                            "A share of ownership in a company",
                            "A type of bond",
                            "A government security",
                            "A mutual fund"
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: "What is a bull market?",
                        options: [
                            "A market with falling prices",
                            "A market with rising prices",
                            "A market with stable prices",
                            "A market with volatile prices"
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: "What is a dividend?",
                        options: [
                            "A type of stock",
                            "A company's profit share paid to shareholders",
                            "A trading fee",
                            "A market index"
                        ],
                        correctAnswer: 1
                    }
                ]
            },
            'technical analysis': {
                questions: [
                    {
                        question: "What does RSI stand for?",
                        options: [
                            "Relative Strength Index",
                            "Real Stock Indicator",
                            "Rate of Stock Investment",
                            "Return on Stock Investment"
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: "What is a moving average?",
                        options: [
                            "A type of bond",
                            "A price trend indicator",
                            "A trading strategy",
                            "A market index"
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: "What does MACD measure?",
                        options: [
                            "Market volume",
                            "Price momentum",
                            "Company earnings",
                            "Dividend yield"
                        ],
                        correctAnswer: 1
                    }
                ]
            }
        };

        return quizzes[topic] || quizzes['stock market basics'];
    }
};

export default educationService; 