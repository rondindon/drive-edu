// src/components/ActivityStats.tsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { Card } from './ui/card';
import LoadingSpinner from './LoadingSpinner';
import { addDays, subDays, parseISO } from 'date-fns'; // Ensure date-fns is installed
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

// Define TypeScript interfaces for the data
interface TestStat {
  period: string; // 'YYYY-MM-DD' or 'YYYY-MM'
  count: number;
}

interface AnswerCategory {
  category: string;
  correct: number;
  total: number;
  accuracy: number;
}

interface AnswerStats {
  correctCount: number;
  wrongCount: number;
  performanceByCategory: AnswerCategory[];
}

interface BadgeStat {
  title: string;
  createdAt: string;
}

interface BadgeOverTime {
  month: string;
  count: number;
}

interface BadgeStats {
  badges: BadgeStat[];
  badgesOverTime: BadgeOverTime[];
}

interface WorstAccuracyQuestion {
  questionId: number;
  questionText: string;
  imageUrl?: string; // Now only allows string or undefined
  correctCount: number;
  wrongCount: number;
  accuracy: number; // Percentage (0 - 100)
  options: string[]; // Array of answer options
  correctAnswer: string; // The correct answer
}

const COLORS = ['#27AE60', '#E74C3C', '#F1C40F', '#2C3E50'];

const ActivityStats: React.FC = () => {
  // **State Declarations**
  const [testStatsDay, setTestStatsDay] = useState<TestStat[]>([]);
  const [testStatsMonth, setTestStatsMonth] = useState<TestStat[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [passRate, setPassRate] = useState<number | null>(null);
  const [answerStats, setAnswerStats] = useState<AnswerStats | null>(null);
  const [badgeStats, setBadgeStats] = useState<BadgeStats | null>(null);
  const [worstAccuracyQuestions, setWorstAccuracyQuestions] = useState<WorstAccuracyQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAggregation, setSelectedAggregation] = useState<'day' | 'month'>('month'); // Default to 'month'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0); // For carousel

  const token = localStorage.getItem('supabaseToken');

  // **Data Fetching**
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch Test Stats by Day and Month
        const [testsRes, answersRes, badgesRes, worstQuestionsRes] = await Promise.all([
          axios.get('http://localhost:4444/api/user/stats/tests', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:4444/api/user/stats/answers', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:4444/api/user/stats/badges', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:4444/api/user/stats/worst-accuracy', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Set Test Statistics
        setTestStatsDay(testsRes.data.testsOverTimeDay || []);
        setTestStatsMonth(testsRes.data.testsOverTimeMonth || []);
        setAverageScore(testsRes.data.averageScore || null);
        setPassRate(testsRes.data.passRate || null);

        // Set Answer Statistics
        setAnswerStats({
          correctCount: answersRes.data.correctCount || 0,
          wrongCount: answersRes.data.wrongCount || 0,
          performanceByCategory: answersRes.data.performanceByCategory || [],
        });

        // Set Badge Statistics
        setBadgeStats({
          badges: badgesRes.data.badges || [],
          badgesOverTime: badgesRes.data.badgesOverTime || [],
        });

        // Set Worst Accuracy Questions with imageUrl converted to undefined if null
        setWorstAccuracyQuestions(
          worstQuestionsRes.data.worstAccuracyQuestions.map((q: WorstAccuracyQuestion) => ({
            ...q,
            imageUrl: q.imageUrl ?? undefined, // Convert null to undefined
          })) || []
        );
      } catch (err) {
        console.error('Error fetching activity stats:', err);
        setError('Failed to load activity statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  // **Memoized Values:**
  // These hooks are called unconditionally at the top of the component

  // Determine Current Test Stats Based on Aggregation
  const currentTestStats = useMemo(() => {
    return selectedAggregation === 'month' ? testStatsMonth : testStatsDay;
  }, [selectedAggregation, testStatsDay, testStatsMonth]);

  // Calculate Maximum Test Count
  const maxTestCount = useMemo(() => {
    return currentTestStats.length > 0 ? Math.max(...currentTestStats.map(stat => stat.count)) : 0;
  }, [currentTestStats]);

  // Calculate Y-Axis Upper Bound
  const upperBound = useMemo(() => {
    if (maxTestCount === 0) return 10; // Default upper bound when no data
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxTestCount)));
    return Math.ceil(maxTestCount / magnitude) * magnitude;
  }, [maxTestCount]);

  // Function to Add Padding
  const addPadding = (data: TestStat[], paddingCount: number = 4, aggregation: 'day' | 'month'): TestStat[] => {
    if (data.length === 0) return data;

    const firstPeriod = data[0].period;
    const lastPeriod = data[data.length - 1].period;

    let firstDate: Date;
    let lastDate: Date;

    if (aggregation === 'day') {
      firstDate = parseISO(firstPeriod);
      lastDate = parseISO(lastPeriod);
    } else {
      // For months, parse the first day of the month
      firstDate = new Date(firstPeriod + '-01');
      lastDate = new Date(lastPeriod + '-01');
    }

    const paddedData = [...data];

    // Add padding periods before
    for (let i = 1; i <= paddingCount; i++) {
      let newDate: Date;
      if (aggregation === 'day') {
        newDate = subDays(firstDate, i);
      } else {
        newDate = subDays(firstDate, 30 * i); // Approximate one month as 30 days
      }
      let newPeriod: string;
      if (aggregation === 'day') {
        newPeriod = newDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        newPeriod = `${newDate.getFullYear()}-${(newDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`; // YYYY-MM
      }
      // Prevent duplicate periods
      if (!paddedData.some(stat => stat.period === newPeriod)) {
        paddedData.unshift({ period: newPeriod, count: 0 });
      }
    }

    // Add padding periods after
    for (let i = 1; i <= paddingCount; i++) {
      let newDate: Date;
      if (aggregation === 'day') {
        newDate = addDays(lastDate, i);
      } else {
        newDate = addDays(lastDate, 30 * i); // Approximate one month as 30 days
      }
      let newPeriod: string;
      if (aggregation === 'day') {
        newPeriod = newDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        newPeriod = `${newDate.getFullYear()}-${(newDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`; // YYYY-MM
      }
      // Prevent duplicate periods
      if (!paddedData.some(stat => stat.period === newPeriod)) {
        paddedData.push({ period: newPeriod, count: 0 });
      }
    }

    return paddedData;
  };

  const paddedTestStats = useMemo(() => addPadding(currentTestStats, 4, selectedAggregation), [currentTestStats, selectedAggregation]);

  // Function to Format X-Axis Labels
  const formatXAxis = (period: string): string => {
    if (selectedAggregation === 'day') {
      const date = parseISO(period);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      const [year, month] = period.split('-').map(Number);
      const date = new Date(year, month - 1);
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    }
  };

  // **Toggle Button Handler**
  const toggleAggregation = () => {
    setSelectedAggregation(prev => (prev === 'month' ? 'day' : 'month'));
  };

  // **Carousel Navigation Handlers**
  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex(prevIndex => (prevIndex === 0 ? worstAccuracyQuestions.length - 1 : prevIndex - 1));
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex(prevIndex => (prevIndex === worstAccuracyQuestions.length - 1 ? 0 : prevIndex + 1));
  };

  // **Keyboard Navigation for Carousel (Optional Enhancement)**
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousQuestion();
      } else if (e.key === 'ArrowRight') {
        goToNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [worstAccuracyQuestions]);

  // **Early Returns for Loading and Error States**
  // These are placed after all hooks to maintain the hook order

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 min-h-screen">
        <LoadingSpinner /> {/* Replace with your actual Spinner component */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 min-h-screen flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen px-4 py-6">
      {/* Test Performance Over Time */}
      <Card className="p-6 shadow-lg rounded-md animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-main-darkBlue">
            Test Performance Over Time ({selectedAggregation === 'month' ? 'Monthly' : 'Daily'})
          </h2>
          <button
            onClick={toggleAggregation}
            className="bg-main-green text-white px-4 py-2 rounded-md hover:bg-main-darkGreen transition-colors"
            aria-label={`Switch to ${selectedAggregation === 'month' ? 'Daily' : 'Monthly'} View`}
          >
            {selectedAggregation === 'month' ? 'Daily View' : 'Monthly View'}
          </button>
        </div>
        {paddedTestStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={paddedTestStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              aria-label={`Test Performance Over Time (${selectedAggregation === 'month' ? 'Monthly' : 'Daily'})`}
              role="img"
            >
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis
                dataKey="period"
                stroke="#2C3E50"
                tickFormatter={formatXAxis}
                interval={Math.floor(paddedTestStats.length / 10)} // Adjust to limit number of ticks
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#2C3E50" domain={[0, upperBound]} />
              <Tooltip
                formatter={(value: number) => [value, 'Tests']}
                labelFormatter={(label: string) => label}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#27AE60"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
                animationDuration={3000}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500">No test data available.</div>
        )}
      </Card>

      {/* Test Summary */}
      <Card className="p-6 shadow-lg rounded-md animate-fadeIn">
        <h2 className="text-xl font-semibold text-main-darkBlue mb-4">
          Test Summary
        </h2>
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          {/* Average Score */}
          <div className="flex-1">
            <span className="text-gray-500">Average Score</span>
            <div className="text-3xl font-bold text-main-green">
              {averageScore !== null ? averageScore.toFixed(2) : 'N/A'}
            </div>
          </div>
          {/* Pass Rate */}
          <div className="flex-1">
            <span className="text-gray-500">Pass Rate</span>
            <div className="text-3xl font-bold text-main-green">
              {passRate !== null ? passRate.toFixed(2) + '%' : 'N/A'}
            </div>
          </div>
        </div>
      </Card>

      {/* Answer Distribution */}
      <Card className="p-6 shadow-lg rounded-md animate-fadeIn">
        <h2 className="text-xl font-semibold text-main-darkBlue mb-4">
          Answer Distribution
        </h2>
        {answerStats ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Correct', value: answerStats.correctCount },
                  { name: 'Wrong', value: answerStats.wrongCount },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                animationDuration={4000}
              >
                {[
                  { name: 'Correct', value: answerStats.correctCount },
                  { name: 'Wrong', value: answerStats.wrongCount },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500">No answer data available.</div>
        )}
      </Card>

      {/* Performance by Category */}
      <Card className="p-6 shadow-lg rounded-md animate-fadeIn">
        <h2 className="text-xl font-semibold text-main-darkBlue mb-4">
          Performance by Category
        </h2>
        {answerStats && answerStats.performanceByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={answerStats.performanceByCategory}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="category" stroke="#2C3E50" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="accuracy" fill="#27AE60" name="Accuracy (%)" animationDuration={6000} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500">No performance data available.</div>
        )}
      </Card>

      {/* Badges Earned */}
      <Card className="p-6 shadow-lg rounded-md animate-fadeIn">
        <h2 className="text-xl font-semibold text-main-darkBlue mb-4">
          Badges Earned
        </h2>
        {badgeStats && badgeStats.badges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {badgeStats.badges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-secondary-greenBackground rounded-md shadow-sm animate-fadeIn"
              >
                {/* Replace with actual badge icons if available */}
                <div className="w-12 h-12 bg-main-green rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {badge.title.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold">{badge.title}</span>
                  <div className="text-sm text-gray-500">
                    Earned on {new Date(badge.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No badges earned yet.</div>
        )}
      </Card>

      {/* Badges Over Time */}
      {badgeStats && badgeStats.badgesOverTime.length > 0 && (
        <Card className="p-6 shadow-lg rounded-md animate-fadeIn">
          <h2 className="text-xl font-semibold text-main-darkBlue mb-4">
            Badges Earned Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={badgeStats.badgesOverTime}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              aria-label="Badges Earned Over Time"
              role="img"
            >
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis
                dataKey="month"
                stroke="#2C3E50"
                tickFormatter={(month) => {
                  const [year, monthNum] = month.split('-').map(Number);
                  const date = new Date(year, monthNum - 1);
                  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
                }}
                interval={Math.floor(badgeStats.badgesOverTime.length / 10)} // Adjust to limit number of ticks
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#2C3E50" />
              <Tooltip
                formatter={(value: number) => [value, 'Badges']}
                labelFormatter={(label: string) => label}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#F1C40F"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
                animationDuration={6000}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* **Worst Accuracy Questions** */}
      <Card className="p-6 shadow-lg rounded-md animate-fadeIn">
        <h2 className="text-xl font-semibold text-main-darkBlue mb-4">
          Questions with Worst Accuracy
        </h2>
        {worstAccuracyQuestions.length > 0 ? (
          <div className="flex flex-col items-center">
            {/* Question Display */}
            <div
              className="w-full md:w-3/4 lg:w-2/3 bg-white p-6 rounded-md shadow-md"
              style={{ height: '60vh' }} // Set dynamic height relative to viewport
            >
              {/* Make the container a flex column to manage content */}
              <div className="flex flex-col h-full">
                {/* Image (if available) */}
                {worstAccuracyQuestions[currentQuestionIndex].imageUrl && (
                  <img
                    src={worstAccuracyQuestions[currentQuestionIndex].imageUrl}
                    alt={`Question ${currentQuestionIndex + 1} Image`}
                    className="mb-4 w-full h-32 object-cover rounded-md flex-shrink-0"
                    loading="lazy"
                  />
                )}

                {/* Question Text */}
                <h3 className="text-lg font-semibold mb-4 flex-grow">
                  {worstAccuracyQuestions[currentQuestionIndex].questionText}
                </h3>

                {/* Simplified Answer Statistics */}
                <div className="mb-4 w-24 text-center py-1 bg-red-500 text-white rounded-md">
                  {`${worstAccuracyQuestions[currentQuestionIndex].correctCount}/${worstAccuracyQuestions[currentQuestionIndex].wrongCount}`}
                </div>

                {/* Display Answers */}
                <div className="space-y-2 flex-grow overflow-auto">
                  {worstAccuracyQuestions[currentQuestionIndex].options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md ${
                        option === worstAccuracyQuestions[currentQuestionIndex].correctAnswer
                          ? 'bg-green-200 border-2 border-green-400'
                          : 'bg-gray-100'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                {worstAccuracyQuestions.length > 1 && (
                  <div className="flex justify-between mt-6 items-center">
                    <button
                      onClick={goToPreviousQuestion}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
                      aria-label="Previous Question"
                    >
                      <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
                    </button>
                    <span className="text-gray-600">
                      {currentQuestionIndex + 1} of {worstAccuracyQuestions.length}
                    </span>
                    <button
                      onClick={goToNextQuestion}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
                      aria-label="Next Question"
                    >
                      <ChevronRightIcon className="h-6 w-6 text-gray-700" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No data available for worst accuracy questions.</div>
        )}
      </Card>
    </div>
  );
};

export default ActivityStats;