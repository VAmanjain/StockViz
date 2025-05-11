import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, Row, Col, Table, Badge } from 'react-bootstrap';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { apiService } from '../../services/apiService';
import './StockChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin,
    Filler
);

const StockChart = ({ selectedCompany }) => {
    const [chartData, setChartData] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [timeRange, setTimeRange] = useState('1D');
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            if (selectedCompany) {
                setIsLoading(true);
                try {
                    const stockData = await apiService.getStockData(selectedCompany, timeRange);
                const predictionData = await apiService.getPrediction(selectedCompany);
                
                if (stockData.length > 0) {
                        const labels = stockData.map(item => {
                            const date = new Date(item.date);
                            return timeRange === '1D' 
                                ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                        });
                    const prices = stockData.map(item => item.close);
                        const volumes = stockData.map(item => item.volume);

                    setChartData({
                        labels,
                        datasets: [
                            {
                                label: 'Stock Price',
                                data: prices,
                                    borderColor: '#2563eb',
                                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                                    borderWidth: 2.5,
                                    tension: 0.4,
                                    fill: true,
                                    pointRadius: 0,
                                    pointHoverRadius: 6,
                                    pointHoverBackgroundColor: '#2563eb',
                                    pointHoverBorderColor: '#ffffff',
                                    pointHoverBorderWidth: 2,
                                    yAxisID: 'y',
                            },
                                {
                                    label: 'Volume',
                                    data: volumes,
                                    type: 'bar',
                                    backgroundColor: 'rgba(37, 99, 235, 0.15)',
                                    borderColor: 'rgba(37, 99, 235, 0.3)',
                                    borderWidth: 1,
                                    borderRadius: 4,
                                    yAxisID: 'y1',
                                    hidden: timeRange !== '1D',
                                }
                        ],
                    });

                    setPrediction(predictionData);
                    }
                } catch (error) {
                    console.error('Error fetching stock data:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchData();
    }, [selectedCompany, timeRange]);

    useEffect(() => {
        if (chartData && chartData.datasets && chartData.datasets.length > 0) {
            const prices = chartData.datasets[0].data;
            const volumes = []; // Assuming volumes are not provided in the chart data
            
            // Calculate moving averages
            const sma20 = calculateSMA(prices, 20);
            const sma50 = calculateSMA(prices, 50);
            
            // Calculate RSI
            const rsi = calculateRSI(prices, 14);
            
            // Calculate MACD
            const macd = calculateMACD(prices);
            
            // Calculate volume analysis
            const volumeAnalysis = analyzeVolume(volumes, prices);
            
            // Generate analysis insights
            const insights = generateInsights({
                prices,
                sma20,
                sma50,
                rsi,
                macd,
                volumeAnalysis
            });
            
            setAnalysis(insights);
        }
    }, [chartData]);

    const calculateSMA = (prices, period) => {
        const sma = [];
        for (let i = period - 1; i < prices.length; i++) {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / period);
        }
        return sma;
    };

    const calculateRSI = (prices, period) => {
        const changes = prices.slice(1).map((price, i) => price - prices[i]);
        const gains = changes.map(change => change > 0 ? change : 0);
        const losses = changes.map(change => change < 0 ? -change : 0);
        
        const avgGain = calculateSMA(gains, period);
        const avgLoss = calculateSMA(losses, period);
        
        return avgGain.map((gain, i) => {
            const loss = avgLoss[i];
            if (loss === 0) return 100;
            const rs = gain / loss;
            return 100 - (100 / (1 + rs));
        });
    };

    const calculateMACD = (prices) => {
        const ema12 = calculateEMA(prices, 12);
        const ema26 = calculateEMA(prices, 26);
        const macdLine = ema12.map((value, i) => value - ema26[i]);
        const signalLine = calculateEMA(macdLine, 9);
        return { macdLine, signalLine };
    };

    const calculateEMA = (prices, period) => {
        const k = 2 / (period + 1);
        const ema = [prices[0]];
        for (let i = 1; i < prices.length; i++) {
            ema.push(prices[i] * k + ema[i - 1] * (1 - k));
        }
        return ema;
    };

    const analyzeVolume = (volumes, prices) => {
        if (!volumes.length) return null;
        
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        const recentVolume = volumes.slice(-5);
        const volumeTrend = recentVolume.every(v => v > avgVolume) ? 'increasing' :
                          recentVolume.every(v => v < avgVolume) ? 'decreasing' : 'mixed';
        
        return {
            average: avgVolume,
            trend: volumeTrend,
            recent: recentVolume
        };
    };

    const generateInsights = (data) => {
        const { prices, sma20, sma50, rsi, macd, volumeAnalysis } = data;
        const currentPrice = prices[prices.length - 1];
        const prevPrice = prices[prices.length - 2];
        const priceChange = ((currentPrice - prevPrice) / prevPrice) * 100;
        
        // Trend Analysis
        const shortTermTrend = currentPrice > sma20[sma20.length - 1] ? 'bullish' : 'bearish';
        const longTermTrend = currentPrice > sma50[sma50.length - 1] ? 'bullish' : 'bearish';
        
        // RSI Analysis
        const currentRSI = rsi[rsi.length - 1];
        const rsiSignal = currentRSI > 70 ? 'overbought' :
                         currentRSI < 30 ? 'oversold' : 'neutral';
        
        // MACD Analysis
        const currentMACD = macd.macdLine[macd.macdLine.length - 1];
        const currentSignal = macd.signalLine[macd.signalLine.length - 1];
        const macdSignal = currentMACD > currentSignal ? 'bullish' : 'bearish';
        
        // Volume Analysis
        const volumeSignal = volumeAnalysis?.trend === 'increasing' ? 'positive' :
                           volumeAnalysis?.trend === 'decreasing' ? 'negative' : 'neutral';
        
        // Generate overall sentiment
        const signals = [
            { signal: shortTermTrend, weight: 1 },
            { signal: longTermTrend, weight: 1.5 },
            { signal: rsiSignal === 'overbought' ? 'bearish' : rsiSignal === 'oversold' ? 'bullish' : 'neutral', weight: 1 },
            { signal: macdSignal, weight: 1.5 },
            { signal: volumeSignal === 'positive' ? 'bullish' : volumeSignal === 'negative' ? 'bearish' : 'neutral', weight: 1 }
        ];
        
        const sentiment = calculateSentiment(signals);
        
        return {
            priceChange,
            shortTermTrend,
            longTermTrend,
            rsi: {
                value: currentRSI,
                signal: rsiSignal
            },
            macd: {
                value: currentMACD,
                signal: macdSignal
            },
            volume: volumeAnalysis,
            sentiment,
            recommendations: generateRecommendations(sentiment, currentRSI, macdSignal)
        };
    };

    const calculateSentiment = (signals) => {
        const weights = {
            bullish: 0,
            bearish: 0,
            neutral: 0
        };
        
        signals.forEach(({ signal, weight }) => {
            weights[signal] += weight;
        });
        
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        const bullishRatio = weights.bullish / total;
        const bearishRatio = weights.bearish / total;
        
        if (bullishRatio > 0.6) return 'strong_bullish';
        if (bullishRatio > 0.4) return 'bullish';
        if (bearishRatio > 0.6) return 'strong_bearish';
        if (bearishRatio > 0.4) return 'bearish';
        return 'neutral';
    };

    const generateRecommendations = (sentiment, rsi, macdSignal) => {
        const recommendations = [];
        
        // Add sentiment-based recommendation
        switch (sentiment) {
            case 'strong_bullish':
                recommendations.push('Strong buying opportunity based on multiple technical indicators');
                break;
            case 'bullish':
                recommendations.push('Consider buying with proper risk management');
                break;
            case 'strong_bearish':
                recommendations.push('Consider reducing position or waiting for better entry');
                break;
            case 'bearish':
                recommendations.push('Exercise caution and monitor for reversal signals');
                break;
            default:
                recommendations.push('Neutral market conditions, maintain current position');
        }
        
        // Add RSI-based recommendation
        if (rsi > 70) {
            recommendations.push('RSI indicates overbought conditions, consider taking profits');
        } else if (rsi < 30) {
            recommendations.push('RSI indicates oversold conditions, potential buying opportunity');
        }
        
        // Add MACD-based recommendation
        if (macdSignal === 'bullish') {
            recommendations.push('MACD shows upward momentum');
        } else if (macdSignal === 'bearish') {
            recommendations.push('MACD indicates downward pressure');
        }
        
        return recommendations;
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'start',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    color: '#1a202c',
                    font: {
                        size: 13,
                        weight: '600',
                        family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    },
                    boxWidth: 8,
                    boxHeight: 8
                }
            },
            title: {
                display: true,
                text: selectedCompany ? `${selectedCompany} Stock Price` : 'Select a Company',
                color: '#111827',
                font: {
                    size: 18,
                    weight: '700',
                    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                },
                padding: {
                    top: 16,
                    bottom: 24
                },
                align: 'start'
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#111827',
                titleFont: {
                    size: 13,
                    weight: '600',
                    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                },
                bodyColor: '#4b5563',
                bodyFont: {
                    size: 12,
                    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                },
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        if (context.dataset.type === 'bar') {
                            return `${label}: ${value.toLocaleString()}`;
                        }
                        return `${label}: $${value.toFixed(2)}`;
                    },
                    title: function(context) {
                        const date = new Date(context[0].label);
                        return date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                }
            },
            zoom: {
                limits: {
                    x: {min: 'original', max: 'original'},
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: 'x',
                },
                pan: {
                    enabled: true,
                    mode: 'x',
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: true,
                    color: '#e2e8f0',
                    drawBorder: false,
                },
                ticks: {
                    color: '#4a5568',
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: timeRange === '1D' ? 12 : 8,
                    font: {
                        size: 11
                    }
                },
                border: {
                    display: false
                }
            },
            y: {
                type: 'linear',
                    display: true,
                position: 'left',
                grid: {
                    color: '#e2e8f0',
                    drawBorder: false,
                },
                ticks: {
                    color: '#4a5568',
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        return '$' + value.toFixed(2);
                    }
                },
                border: {
                    display: false
                }
            },
            y1: {
                type: 'linear',
                display: timeRange === '1D',
                position: 'right',
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#4a5568',
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                        if (value >= 1000) {
                            return (value / 1000).toFixed(1) + 'K';
                        }
                        return value;
                    }
                },
                border: {
                    display: false
                }
            },
        },
    };

    // Cleanup chart on unmount
    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, []);

    return (
        <div className="stock-chart-container">
            <Card className="chart-card">
                <Card.Body>
                    <div className="chart-header mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="chart-title">
                                <h3 className="mb-1">{selectedCompany || 'Select a Company'}</h3>
                                <p className="text-muted mb-0">Stock Price Analysis</p>
                            </div>
                            <div className="chart-controls">
                                {['1D', '1W', '1M', '3M', '1Y'].map(range => (
                                    <button
                                        key={range}
                                        className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
                                        onClick={() => setTimeRange(range)}
                                        disabled={isLoading}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="chart-wrapper">
                        {isLoading ? (
                            <div className="chart-loading">Loading chart data...</div>
                        ) : chartData ? (
                            <Line 
                                ref={chartRef}
                                data={chartData} 
                                options={options}
                                key={`chart-${selectedCompany}-${timeRange}`}
                            />
                        ) : (
                            <div className="no-data">
                                <i className="fas fa-chart-line"></i>
                                <p>Select a company to view stock data</p>
                            </div>
                        )}
                    </div>
                    {prediction && (
                        <div className="prediction-info mt-3">
                            <h4>Next Day Prediction</h4>
                            <div className="prediction-values">
                                <div className="prediction-item">
                                    <span className="label">Predicted Price</span>
                                    <span className="value">${prediction.prediction.toFixed(2)}</span>
                                </div>
                                <div className="prediction-item">
                                    <span className="label">Last Price</span>
                                    <span className="value">${prediction.last_price.toFixed(2)}</span>
                                </div>
                                <div className="prediction-item">
                                    <span className="label">Expected Change</span>
                                    <span className={`value ${prediction.prediction > prediction.last_price ? 'text-success' : 'text-danger'}`}>
                                        {((prediction.prediction - prediction.last_price) / prediction.last_price * 100).toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {analysis && (
                <Card className="analysis-card mt-4">
                    <Card.Body>
                        <h4>Technical Analysis</h4>
                        <Row>
                            <Col md={6}>
                                <Table className="analysis-table">
                                    <tbody>
                                        <tr>
                                            <td>Price Change</td>
                                            <td>
                                                <Badge bg={analysis.priceChange >= 0 ? 'success' : 'danger'}>
                                                    {analysis.priceChange >= 0 ? '+' : ''}{analysis.priceChange.toFixed(2)}%
                                                </Badge>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Short-term Trend</td>
                                            <td>
                                                <Badge bg={analysis.shortTermTrend === 'bullish' ? 'success' : 'danger'}>
                                                    {analysis.shortTermTrend}
                                                </Badge>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Long-term Trend</td>
                                            <td>
                                                <Badge bg={analysis.longTermTrend === 'bullish' ? 'success' : 'danger'}>
                                                    {analysis.longTermTrend}
                                                </Badge>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>RSI (14)</td>
                                            <td>
                                                <Badge bg={
                                                    analysis.rsi.value > 70 ? 'danger' :
                                                    analysis.rsi.value < 30 ? 'success' : 'warning'
                                                }>
                                                    {analysis.rsi.value.toFixed(2)} ({analysis.rsi.signal})
                                                </Badge>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Col>
                            <Col md={6}>
                                <div className="recommendations">
                                    <h5>Recommendations</h5>
                                    <ul>
                                        {analysis.recommendations.map((rec, index) => (
                                            <li key={index}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default StockChart; 