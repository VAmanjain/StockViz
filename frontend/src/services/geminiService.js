import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the latest Gemini model identifier.
const GEMINI_MODEL = "gemini-1.5-pro-002";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

// Persistent cache with localStorage
const cacheService = {
  get(key) {
    try {
      const cacheData = localStorage.getItem(`gemini_cache_${key}`);
      if (cacheData) {
        const { data, expiry } = JSON.parse(cacheData);
        if (expiry > Date.now()) {
          return data;
        }
        // Cache expired, remove it
        localStorage.removeItem(`gemini_cache_${key}`);
      }
    } catch (error) {
      console.error("Cache read error:", error);
    }
    return null;
  },
  
  set(key, data, ttlMinutes = 1440) { // Default TTL: 24 hours
    try {
      const expiry = Date.now() + ttlMinutes * 60 * 1000;
      localStorage.setItem(
        `gemini_cache_${key}`,
        JSON.stringify({ data, expiry })
      );
    } catch (error) {
      console.error("Cache write error:", error);
    }
  },
  
  clear() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("gemini_cache_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

// Rate limiting with exponential backoff
const rateLimiter = {
  lastCall: 0,
  baseInterval: 1200, // 1.2 seconds minimum between calls
  currentInterval: 1200,
  maxInterval: 10000, // Max 10 seconds between calls
  retryCount: 0,
  maxRetries: 3,
  
  async wait() {
    const now = Date.now();
    const timeToWait = Math.max(0, this.lastCall + this.currentInterval - now);
    
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    
    this.lastCall = Date.now();
  },
  
  success() {
    // Reset backoff after successful call
    this.currentInterval = this.baseInterval;
    this.retryCount = 0;
  },
  
  failure() {
    // Implement exponential backoff
    this.retryCount++;
    this.currentInterval = Math.min(
      this.maxInterval,
      this.baseInterval * Math.pow(2, this.retryCount)
    );
  },
  
  canRetry() {
    return this.retryCount < this.maxRetries;
  }
};

// Fallback content when API is unavailable
const fallbackContent = {
  stockMarketBasics: {
    title: "Stock Market Basics",
    sections: [
      {
        title: "What is a Stock?",
        content: "A stock represents ownership in a company. When you buy a stock, you're purchasing a small piece of that company, making you a shareholder."
      },
      {
        title: "How the Market Works",
        content: "Stock markets are exchanges where buyers and sellers trade shares of publicly listed companies. The price of stocks is determined by supply and demand."
      },
      {
        title: "Key Market Indicators",
        content: "Market indices like the S&P 500, Dow Jones, and NASDAQ track the performance of groups of stocks to give an overall picture of market health."
      },
      {
        title: "Getting Started",
        content: "To begin investing, you'll need a brokerage account, research on potential investments, and a strategy that aligns with your financial goals."
      }
    ]
  },
  technicalAnalysis: {
    title: "Technical Analysis",
    indicators: [
      {
        name: "Moving Averages",
        description: "Moving averages smooth out price data to identify trends by calculating the average price over a specific time period.",
        formula: "SMA = Sum of closing prices / Number of periods",
        usage: "Identifying trend direction and potential support/resistance levels."
      },
      {
        name: "Relative Strength Index (RSI)",
        description: "A momentum oscillator that measures the speed and change of price movements on a scale from 0 to 100.",
        formula: "RSI = 100 - (100 / (1 + RS)), where RS = Average Gain / Average Loss",
        usage: "Identifying overbought (above 70) or oversold (below 30) conditions."
      },
      {
        name: "MACD (Moving Average Convergence Divergence)",
        description: "A trend-following momentum indicator showing the relationship between two moving averages.",
        formula: "MACD = 12-period EMA - 26-period EMA, Signal Line = 9-period EMA of MACD",
        usage: "Identifying potential buy/sell signals when the MACD crosses above/below the signal line."
      }
    ]
  },
  investmentStrategies: {
    title: "Investment Strategies",
    strategies: [
      {
        name: "Value Investing",
        description: "Focusing on stocks that appear undervalued relative to their intrinsic value.",
        keyPoints: [
          "Look for companies with low P/E ratios",
          "Focus on strong fundamentals and balance sheets",
          "Seek companies with competitive advantages",
          "Patience is key - value may take time to be recognized"
        ]
      },
      {
        name: "Growth Investing",
        description: "Investing in companies expected to grow at an above-average rate compared to the market.",
        keyPoints: [
          "Focus on revenue and earnings growth potential",
          "Look for companies in expanding industries",
          "Often accept higher valuations for growth potential",
          "May involve higher volatility"
        ]
      },
      {
        name: "Dividend Investing",
        description: "Focusing on stocks that pay regular dividends to generate income.",
        keyPoints: [
          "Look for companies with history of stable dividends",
          "Focus on dividend yield and payout ratio",
          "Consider dividend growth over time",
          "Popular strategy for income-oriented investors"
        ]
      }
    ]
  },
  financialTerms: {
    terms: [
      {
        term: "Bull Market",
        definition: "A market condition where prices are rising or expected to rise, typically characterized by optimism and investor confidence."
      },
      {
        term: "Bear Market",
        definition: "A market condition where prices are falling or expected to fall, typically characterized by pessimism and negative sentiment."
      },
      {
        term: "Dividend",
        definition: "A portion of a company's earnings paid to shareholders, usually on a quarterly basis."
      },
      {
        term: "Market Capitalization",
        definition: "The total market value of a company's outstanding shares, calculated by multiplying the share price by the number of shares outstanding."
      },
      {
        term: "P/E Ratio",
        definition: "Price-to-Earnings ratio, calculated by dividing a company's current share price by its earnings per share (EPS)."
      },
      {
        term: "Volatility",
        definition: "A measure of how much the price of a security fluctuates over time."
      }
    ]
  }
};

// Quiz generator fallback
const quizGenerator = {
  generateQuiz(topic) {
    // Simplified fallback quiz based on topic
    const quizTopic = topic.toLowerCase();
    
    if (quizTopic.includes("basics")) {
      return {
        questions: [
          {
            question: "What does owning a stock represent?",
            options: ["A loan to the company", "Ownership in the company", "A guaranteed return", "A bond certificate"],
            correctAnswer: 1
          },
          {
            question: "Which of the following is NOT a major stock market index?",
            options: ["Dow Jones Industrial Average", "S&P 500", "NASDAQ", "LIBOR"],
            correctAnswer: 3
          },
          {
            question: "What primarily determines stock prices in the market?",
            options: ["Company revenue", "Supply and demand", "CEO decisions", "Government regulations"],
            correctAnswer: 1
          }
        ]
      };
    } else if (quizTopic.includes("technical")) {
      return {
        questions: [
          {
            question: "What does RSI stand for?",
            options: ["Real Stock Index", "Relative Strength Index", "Ratio of Stock Increase", "Rising Stock Indicator"],
            correctAnswer: 1
          },
          {
            question: "What RSI value typically indicates an oversold condition?",
            options: ["Above 70", "Above 50", "Below 50", "Below 30"],
            correctAnswer: 3
          },
          {
            question: "What does a moving average help identify?",
            options: ["Exact reversal points", "Trading volume", "Trend direction", "Company value"],
            correctAnswer: 2
          }
        ]
      };
    } else if (quizTopic.includes("strateg")) {
      return {
        questions: [
          {
            question: "Which investment strategy focuses on stocks that appear undervalued?",
            options: ["Growth investing", "Value investing", "Momentum investing", "Index investing"],
            correctAnswer: 1
          },
          {
            question: "Which metric is most important to dividend investors?",
            options: ["P/E ratio", "Dividend yield", "Price-to-sales ratio", "Beta"],
            correctAnswer: 1
          },
          {
            question: "Growth investors typically focus on companies with:",
            options: ["High dividend yields", "Low P/E ratios", "Strong earnings growth", "Minimal debt"],
            correctAnswer: 2
          }
        ]
      };
    } else {
      return {
        questions: [
          {
            question: "What is a 'bull market'?",
            options: ["A market where prices are falling", "A market where prices are rising", "A market with high volatility", "A market with low trading volume"],
            correctAnswer: 1
          },
          {
            question: "What does 'market capitalization' represent?",
            options: ["A company's annual profit", "A company's total debt", "The total value of a company's outstanding shares", "A company's cash reserves"],
            correctAnswer: 2
          },
          {
            question: "What is a P/E ratio?",
            options: ["Price to Earnings ratio", "Profit to Expense ratio", "Performance to Efficiency ratio", "Potential to Earnings ratio"],
            correctAnswer: 0
          }
        ]
      };
    }
  }
};

// Structured prompts for API
const prompts = {
  stockMarketBasics: `Create stock market basics content. Return JSON:
  {
      "title": "Stock Market Basics",
      "sections": [
          {"title": "string", "content": "string"}
      ]
  }
  Topics: Stocks, Market Basics, Key Terms, Getting Started. Keep content brief.`,

  technicalAnalysis: `Create technical analysis content. Return JSON:
  {
      "title": "Technical Analysis",
      "indicators": [
          {"name": "string", "description": "string", "formula": "string", "usage": "string"}
      ]
  }
  Cover: Moving Averages, RSI, MACD. Keep explanations short.`,

  investmentStrategies: `Create investment strategies content. Return JSON:
  {
      "title": "Investment Strategies",
      "strategies": [
          {"name": "string", "description": "string", "keyPoints": ["string"]}
      ]
  }
  Cover: Value, Growth, Dividend investing. Keep tips concise.`,

  financialTerms: `Create financial terms glossary. Return JSON:
  {
      "terms": [
          {"term": "string", "definition": "string"}
      ]
  }
  Include: Bull/Bear markets, Dividend, Market Cap. Keep definitions brief.`,

  quiz: (topic) => `Create ${topic} quiz. Return JSON:
  {
      "questions": [
          {"question": "string", "options": ["string"], "correctAnswer": number}
      ]
  }
  Include 3 questions, 4 options each. Focus on key concepts.`
};

// Request queue to manage API calls
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.batchSize = 1; // Process one request at a time
    this.batchDelay = 2000; // 2 seconds between batches
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      const promises = batch.map(async ({ requestFn, resolve, reject }) => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      await Promise.all(promises);
      
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.batchDelay));
      }
    }
    
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

// Main service
const geminiService = {
  apiEnabled: true, // Flag to track API availability
  refreshTime: null, // Time when API will be available again
  
  // Track API request failures
  consecutiveFailures: 0,
  maxConsecutiveFailures: 3,
  
  async fetchContent(prompt, retryCount = 0) {
    // Check if API is disabled
    if (!this.apiEnabled) {
      const now = Date.now();
      if (this.refreshTime && now < this.refreshTime) {
        const waitMinutes = Math.ceil((this.refreshTime - now) / 60000);
        throw new Error(`API quota exceeded. Please try again in approximately ${waitMinutes} minutes.`);
      } else {
        // Reset API access if cool-down period has elapsed
        this.apiEnabled = true;
      }
    }
    
    try {
      await rateLimiter.wait();
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const cleanedText = text.replace(/```(json)?|```/g, '').trim();
      
      try {
        const data = JSON.parse(cleanedText);
        // Reset failure counters on success
        this.consecutiveFailures = 0;
        rateLimiter.success();
        return data;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error('Failed to parse API response. The response was not valid JSON.');
      }
    } catch (error) {
      // Handle quota errors (429)
      if (error.message && error.message.includes('429')) {
        // Try to extract retry delay
        let retryDelay = 15; // default 15 minutes
        try {
          const matches = error.message.match(/"retryDelay":"(\d+)s"/);
          if (matches && matches[1]) {
            retryDelay = parseInt(matches[1], 10) / 60; // Convert seconds to minutes
          }
        } catch {}
        
        // Disable API temporarily
        this.apiEnabled = false;
        this.refreshTime = Date.now() + (retryDelay * 60 * 1000);
        
        throw new Error(`API quota exceeded. Please try again in approximately ${Math.ceil(retryDelay)} minutes.`);
      }
      
      // For other errors, try exponential backoff
      rateLimiter.failure();
      this.consecutiveFailures++;
      
      // Check if we should disable API due to too many consecutive failures
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        this.apiEnabled = false;
        this.refreshTime = Date.now() + (30 * 60 * 1000); // Disable for 30 minutes
        throw new Error('Too many API errors. System is temporarily using offline content.');
      }
      
      // Try again with backoff if we have retries left
      if (retryCount < 2) {
        return this.fetchContent(prompt, retryCount + 1);
      }
      
      throw new Error('Failed to fetch content. Using offline content instead.');
    }
  },
  
  // Helper to get content with fallback
  async getContentWithFallback(key, prompt, fallback) {
    // First check persistent cache
    const cachedData = cacheService.get(key);
    if (cachedData) {
      return cachedData;
    }
    
    // If API is disabled, use fallback immediately
    if (!this.apiEnabled) {
      return fallback;
    }
    
    // Queue the request
    try {
      const data = await requestQueue.add(() => this.fetchContent(prompt));
      // Store in cache
      cacheService.set(key, data);
      return data;
    } catch (error) {
      console.error(`Error in ${key}:`, error);
      return fallback;
    }
  },
  
  // Main content methods
  async getStockMarketBasics() {
    return this.getContentWithFallback(
      'stockMarketBasics',
      prompts.stockMarketBasics,
      fallbackContent.stockMarketBasics
    );
  },
  
  async getTechnicalAnalysis() {
    return this.getContentWithFallback(
      'technicalAnalysis',
      prompts.technicalAnalysis,
      fallbackContent.technicalAnalysis
    );
  },
  
  async getInvestmentStrategies() {
    return this.getContentWithFallback(
      'investmentStrategies',
      prompts.investmentStrategies,
      fallbackContent.investmentStrategies
    );
  },
  
  async getFinancialTerms() {
    return this.getContentWithFallback(
      'financialTerms',
      prompts.financialTerms,
      fallbackContent.financialTerms
    );
  },
  
  async getInteractiveQuiz(topic) {
    const cacheKey = `quiz_${topic}`;
    const cachedData = cacheService.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // If API is disabled, use generated fallback
    if (!this.apiEnabled) {
      const fallbackQuiz = quizGenerator.generateQuiz(topic);
      return fallbackQuiz;
    }
    
    try {
      const data = await requestQueue.add(() => this.fetchContent(prompts.quiz(topic)));
      // Store in cache with shorter TTL for quizzes (4 hours)
      cacheService.set(cacheKey, data, 240);
      return data;
    } catch (error) {
      console.error(`Error in quiz ${topic}:`, error);
      return quizGenerator.generateQuiz(topic);
    }
  },
  
  // Clear cache completely
  clearCache() {
    cacheService.clear();
    console.log("Cache cleared");
  },
  
  // Reset API status
  resetApiStatus() {
    this.apiEnabled = true;
    this.refreshTime = null;
    this.consecutiveFailures = 0;
    console.log("API status reset");
  },
  
  // Check API status
  getApiStatus() {
    if (!this.apiEnabled && this.refreshTime) {
      const waitMinutes = Math.ceil((this.refreshTime - Date.now()) / 60000);
      return {
        enabled: false,
        availableIn: waitMinutes > 0 ? waitMinutes : 0,
        message: `API temporarily disabled. Available in approximately ${waitMinutes} minutes.`
      };
    }
    
    return {
      enabled: this.apiEnabled,
      availableIn: 0,
      message: this.apiEnabled ? "API available" : "API temporarily disabled"
    };
  }
};

export default geminiService;