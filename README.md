# StockViz - Intelligent Stock Market Visualization Platform

![StockViz Logo](https://github.com/user-attachments/assets/5993f313-1c2a-46e4-8911-ea1215e9f07c)


## Overview

StockViz is a modern, intelligent stock market visualization platform that combines real-time market data analysis with AI-powered insights. The platform features an intuitive dashboard, educational resources, and an AI assistant powered by Google's Gemini API for intelligent market analysis and guidance.

## 🌟 Key Features

### 📊 Interactive Dashboard
- Real-time stock data visualization
- Dynamic charting with multiple timeframes
- Company performance metrics
- Customizable watchlists
- Technical analysis indicators

### 🎓 Educational Hub
- Comprehensive stock market basics
- Technical analysis tutorials
- Investment strategies
- Interactive quizzes
- Financial glossary

### 🤖 AI-Powered Assistant
- Powered by Google's Gemini API
- Real-time market analysis
- Personalized investment insights
- Natural language interaction
- Educational guidance

### 🎨 Modern UI/UX
- Responsive design
- Dark/Light theme support
- Intuitive navigation
- Interactive components
- Smooth animations

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **UI Library**: React Bootstrap 2.10.9
- **Charting**: Chart.js 4.4.9 with react-chartjs-2
- **State Management**: React Context API
- **Routing**: React Router DOM 7.6.0
- **AI Integration**: Google Generative AI SDK 0.24.1
- **Styling**: CSS3 with custom theming

### Backend
- **Framework**: Python 3.11+
- **Web Framework**: FastAPI 0.109.0


### Key Dependencies
```json
{
  "react": "^19.1.0",
  "react-bootstrap": "^2.10.9",
  "chart.js": "^4.4.9",
  "react-chartjs-2": "^5.3.0",
  "@google/generative-ai": "^0.24.1",
  "react-router-dom": "^7.6.0"
}
```

### Key Backend Dependencies
```
flask==2.3.3
flask-cors==4.0.0
pandas==2.1.1
numpy==1.24.3
scikit-learn==1.3.0
python-dotenv==1.0.0 

```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.11 or higher
- npm or yarn
- Google Cloud API key for Gemini

### Installation

#### Frontend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stock-visualization.git
cd stock-visualization
```

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Set up environment variables:
Create a `.env` file in the frontend directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development server:
```bash
npm run dev
```

#### Backend Setup
1. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```


2. Start the backend server:
```bash
python ./app.py
```
## 🎨 Theme Customization

The application supports both light and dark themes with smooth transitions:

- **Light Theme**: Clean, professional interface with high contrast
- **Dark Theme**: Eye-friendly dark mode for extended viewing
- **Theme Persistence**: User preferences are saved in localStorage
- **Dynamic Switching**: Instant theme toggle with animated transitions

## 📱 Responsive Design

- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface
- Optimized performance
- Cross-browser compatibility

## 🔒 Security Features

- Secure API key management
- Environment variable protection
- HTTPS enforcement
- Input sanitization
- Rate limiting

## 📈 Future Enhancements

- [ ] Real-time market data integration
- [ ] Advanced technical analysis tools
- [ ] Portfolio tracking
- [ ] Social trading features
- [ ] Mobile application
- [ ] Additional AI capabilities

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Chart.js for powerful visualization
- React Bootstrap for UI components
- All contributors and supporters

---

<div align="center">
  <p>Built with ❤️ by Your Aman Jain</p>
  <p>© 2024 StockViz. All rights reserved.</p>
</div> 
