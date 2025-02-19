// src/components/ActivityStats.tsx
import React, { useEffect, useState, useMemo, useContext } from 'react';
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
import { Skeleton } from '../components/ui/skeleton';
import { addDays, subDays, parseISO } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { motion } from 'framer-motion';

interface TestStat {
  period: string; // 'YYYY-MM-DD'
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
  answeredQuestions: number;
  completedTests: number;
}

interface WorstAccuracyQuestion {
  questionId: number;
  questionText: string;
  imageUrl?: string;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  options: string[];
  correctAnswer: string;
}

const COLORS = ['#27AE60', '#E74C3C', '#F1C40F', '#2C3E50'];

const ActivityStats: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  const [testStatsDay, setTestStatsDay] = useState<TestStat[]>([]);
  const [testStatsMonth, setTestStatsMonth] = useState<TestStat[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [passRate, setPassRate] = useState<number | null>(null);
  const [answerStats, setAnswerStats] = useState<AnswerStats | null>(null);
  const [badgeStats, setBadgeStats] = useState<BadgeStats | null>(null);
  const [worstAccuracyQuestions, setWorstAccuracyQuestions] = useState<WorstAccuracyQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAggregation, setSelectedAggregation] = useState<'day' | 'month'>('month');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const token = localStorage.getItem('supabaseToken');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
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

        setTestStatsDay(testsRes.data.testsOverTimeDay || []);
        setTestStatsMonth(testsRes.data.testsOverTimeMonth || []);
        setAverageScore(testsRes.data.averageScore ?? null);
        setPassRate(testsRes.data.passRate ?? null);

        setAnswerStats({
          correctCount: answersRes.data.correctCount || 0,
          wrongCount: answersRes.data.wrongCount || 0,
          performanceByCategory: answersRes.data.performanceByCategory || [],
        });

        setBadgeStats({
          badges: badgesRes.data.badges || [],
          badgesOverTime: badgesRes.data.badgesOverTime || [],
          answeredQuestions: badgesRes.data.answeredQuestions || 0,
          completedTests: badgesRes.data.completedTests || 0
        });

        const worstData: WorstAccuracyQuestion[] = worstQuestionsRes.data.worstAccuracyQuestions || [];
        setWorstAccuracyQuestions(
          worstData.map((q: WorstAccuracyQuestion) => ({
            ...q,
            imageUrl: q.imageUrl ?? undefined,
          }))
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

  const currentTestStats = useMemo(() => {
    return selectedAggregation === 'month' ? testStatsMonth : testStatsDay;
  }, [selectedAggregation, testStatsDay, testStatsMonth]);

  const maxTestCount = useMemo(() => {
    return currentTestStats.length > 0 ? Math.max(...currentTestStats.map(stat => stat.count)) : 0;
  }, [currentTestStats]);

  const upperBound = useMemo(() => {
    if (maxTestCount === 0) return 10;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxTestCount)));
    return Math.ceil(maxTestCount / magnitude) * magnitude;
  }, [maxTestCount]);

  const getBadgeProgression = (badge: { title: string; createdAt: string }): string => {
    if (!badgeStats) return '';
    if (badge.title.includes('Scholar')) {
      if (badgeStats.answeredQuestions >= 500) {
        return `${badgeStats.answeredQuestions} questions answered!`;
      } else if (badgeStats.answeredQuestions >= 250) {
        return `${badgeStats.answeredQuestions} / 500 questions answered!`;
      } else if (badgeStats.answeredQuestions >= 100) {
        return `${badgeStats.answeredQuestions} / 250 questions answered!`;
      } else if (badgeStats.answeredQuestions >= 10) {
        return `${badgeStats.answeredQuestions} / 100 questions answered!`;
      } else {
        return `${badgeStats.answeredQuestions} / 10 questions answered!`;
      }
    }
    if (badge.title.includes('Tester')) {
      if (badgeStats.completedTests >= 50) {
        return `${badgeStats.completedTests} tests completed!`;
      } else if (badgeStats.completedTests >= 25) {
        return `${badgeStats.completedTests} / 50 tests completed!`;
      } else if (badgeStats.completedTests >= 10) {
        return `${badgeStats.completedTests} / 25 tests completed!`;
      } else if (badgeStats.completedTests >= 1) {
        return `${badgeStats.completedTests} / 10 tests completed!`;
      } else {
        return `${badgeStats.completedTests} / 1 tests completed!`;
      }
    }
    return '';
  };
  
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
      firstDate = new Date(firstPeriod + '-01');
      lastDate = new Date(lastPeriod + '-01');
    }

    const paddedData = [...data];

    for (let i = 1; i <= paddingCount; i++) {
      let newDate: Date;
      if (aggregation === 'day') {
        newDate = subDays(firstDate, i);
      } else {
        newDate = subDays(firstDate, 30 * i);
      }
      let newPeriod: string;
      if (aggregation === 'day') {
        newPeriod = newDate.toISOString().split('T')[0];
      } else {
        newPeriod = `${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}`;
      }
      if (!paddedData.some(stat => stat.period === newPeriod)) {
        paddedData.unshift({ period: newPeriod, count: 0 });
      }
    }

    for (let i = 1; i <= paddingCount; i++) {
      let newDate: Date;
      if (aggregation === 'day') {
        newDate = addDays(lastDate, i);
      } else {
        newDate = addDays(lastDate, 30 * i);
      }
      let newPeriod: string;
      if (aggregation === 'day') {
        newPeriod = newDate.toISOString().split('T')[0];
      } else {
        newPeriod = `${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}`;
      }
      if (!paddedData.some(stat => stat.period === newPeriod)) {
        paddedData.push({ period: newPeriod, count: 0 });
      }
    }

    return paddedData;
  };

  const paddedTestStats = useMemo(
    () => addPadding(currentTestStats, 4, selectedAggregation),
    [currentTestStats, selectedAggregation]
  );

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

  const toggleAggregation = () => {
    setSelectedAggregation(prev => (prev === 'month' ? 'day' : 'month'));
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex(prevIndex =>
      prevIndex === 0 ? worstAccuracyQuestions.length - 1 : prevIndex - 1
    );
  };
  const goToNextQuestion = () => {
    setCurrentQuestionIndex(prevIndex =>
      prevIndex === worstAccuracyQuestions.length - 1 ? 0 : prevIndex + 1
    );
  };

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  if (loading) {
    return (
      <div className="space-y-6 min-h-screen px-4 py-6">
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-40 w-full mb-4" />
      </div>
    );
  }

  const noStatsAvailable =
    !loading &&
    !error &&
    testStatsDay.length === 0 &&
    testStatsMonth.length === 0 &&
    (!answerStats ||
      (answerStats.correctCount === 0 &&
        answerStats.wrongCount === 0 &&
        answerStats.performanceByCategory.length === 0)) &&
    (!badgeStats ||
      (badgeStats.badges.length === 0 && badgeStats.badgesOverTime.length === 0)) &&
    worstAccuracyQuestions.length === 0;

  if (noStatsAvailable) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <p className="text-lg text-center text-[hsl(var(--muted-foreground))]">
          No statistics available at this time.
        </p>
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
    <motion.div
      className="space-y-6 min-h-screen px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={cardVariants}>
        <Card className="p-6 shadow-lg rounded-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[hsl(var(--primary))]">
              Test Performance Over Time ({selectedAggregation === 'month' ? 'Monthly' : 'Daily'})
            </h2>
            <button
              onClick={toggleAggregation}
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 rounded-md hover:bg-[hsl(var(--primary))]/90 transition-colors"
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
                <CartesianGrid stroke={theme === 'dark' ? '#555' : '#ccc'} strokeDasharray="5 5" />
                <XAxis
                  dataKey="period"
                  stroke={theme === 'dark' ? '#fff' : '#2C3E50'}
                  tickFormatter={formatXAxis}
                  interval={Math.floor(paddedTestStats.length / 10)}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  className="font-BAM"
                />
                <YAxis stroke={theme === 'dark' ? '#fff' : '#2C3E50'} domain={[0, upperBound]} />
                <Tooltip
                  formatter={(value: number) => [value, 'Tests']}
                  labelFormatter={(label: string) => label}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                  }}
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
            <div className="text-[hsl(var(--muted-foreground))]">No test data available.</div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="p-6 shadow-lg rounded-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
          <h2 className="text-xl font-semibold text-[hsl(var(--primary))] mb-4">Test Summary</h2>
          <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
            <div className="flex-1">
              <span className="text-[hsl(var(--muted-foreground))]">Average Score</span>
              <div className="text-3xl font-bold text-[hsl(var(--primary))]">
                {averageScore !== null ? averageScore.toFixed(2) : 'N/A'}
              </div>
            </div>
            <div className="flex-1">
              <span className="text-[hsl(var(--muted-foreground))]">Pass Rate</span>
              <div className="text-3xl font-bold text-[hsl(var(--primary))]">
                {passRate !== null ? passRate.toFixed(2) + '%' : 'N/A'}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="p-6 shadow-lg rounded-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
          <h2 className="text-xl font-semibold text-[hsl(var(--primary))] mb-4">Answer Distribution</h2>
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-[hsl(var(--muted-foreground))]">No answer data available.</div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="p-6 shadow-lg rounded-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
          <h2 className="text-xl font-semibold text-[hsl(var(--primary))] mb-4">Performance by Category</h2>
          {answerStats && answerStats.performanceByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={answerStats.performanceByCategory}>
                <CartesianGrid stroke={theme === 'dark' ? '#555' : '#ccc'} strokeDasharray="5 5" />
                <XAxis dataKey="category" stroke={theme === 'dark' ? '#fff' : '#2C3E50'} />
                <YAxis domain={[0, 100]} stroke={theme === 'dark' ? '#fff' : '#2C3E50'} />
                <Tooltip
                  formatter={(value: number) => [value + '%', 'Accuracy']}
                  labelFormatter={(label: string) => label}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="accuracy" fill="#27AE60" name="Accuracy (%)" animationDuration={6000} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-[hsl(var(--muted-foreground))]">No performance data available.</div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="p-6 shadow-lg rounded-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
          <h2 className="text-xl font-semibold text-[hsl(var(--primary))] mb-4">Badges Earned</h2>
          {badgeStats && badgeStats.badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {badgeStats.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2 p-4 bg-[hsl(var(--card))] rounded-md shadow-sm"
                >
                  <div className="w-12 h-12 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {badge.title.charAt(0)}
                  </div>
                  <div className="text-center">
                    <span className="font-semibold">{badge.title}</span>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      Earned on {new Date(badge.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      {getBadgeProgression(badge)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[hsl(var(--muted-foreground))]">No badges earned yet.</div>
          )}
        </Card>
      </motion.div>

      {badgeStats && badgeStats.badgesOverTime.length > 0 && (
        <motion.div variants={cardVariants}>
          <Card className="p-6 shadow-lg rounded-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
            <h2 className="text-xl font-semibold text-[hsl(var(--primary))] mb-4">Badges Earned Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={badgeStats.badgesOverTime}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                aria-label="Badges Earned Over Time"
                role="img"
              >
                <CartesianGrid stroke={theme === 'dark' ? '#555' : '#ccc'} strokeDasharray="5 5" />
                <XAxis
                  dataKey="month"
                  stroke={theme === 'dark' ? '#fff' : '#2C3E50'}
                  tickFormatter={(month) => {
                    const [year, monthNum] = month.split('-').map(Number);
                    const date = new Date(year, monthNum - 1);
                    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
                  }}
                  interval={Math.floor(badgeStats.badgesOverTime.length / 10)}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  className="font-BAM"
                />
                <YAxis stroke={theme === 'dark' ? '#fff' : '#2C3E50'} />
                <Tooltip
                  formatter={(value: number) => [value, 'Badges']}
                  labelFormatter={(label: string) => label}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                  }}
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
        </motion.div>
      )}

      {/* Worst Accuracy Questions */}
      <motion.div variants={cardVariants}>
        <Card className="p-6 shadow-lg rounded-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
          <h2 className="text-xl font-semibold text-[hsl(var(--primary))] mb-4">Questions with Worst Accuracy</h2>
          {worstAccuracyQuestions.length > 0 ? (
            <div className="flex flex-col items-center">
              <div
                className="w-full md:w-3/4 lg:w-2/3 p-6 rounded-md shadow-lg bg-[hsl(var(--card))]"
                style={{ height: '60vh' }}
              >
                <div className="flex flex-col h-full">
                  {worstAccuracyQuestions[currentQuestionIndex].imageUrl && (
                    <img
                      src={worstAccuracyQuestions[currentQuestionIndex].imageUrl}
                      alt={`Question ${currentQuestionIndex + 1} Image`}
                      className="self-center mb-4 w-36 h-36 object-cover rounded-md flex-shrink-0"
                      loading="lazy"
                    />
                  )}

                  <h3 className="text-lg font-semibold mb-4 font-BAM">
                    {worstAccuracyQuestions[currentQuestionIndex].questionText}
                  </h3>

                  <div className="mb-4 w-24 text-center py-1 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] rounded-md">
                    {`${worstAccuracyQuestions[currentQuestionIndex].correctCount}/${worstAccuracyQuestions[currentQuestionIndex].wrongCount}`}
                  </div>

                  <div className="space-y-2 flex-grow overflow-auto">
                    {worstAccuracyQuestions[currentQuestionIndex].options.map((option, idx) => {
                      const isCorrect = option === worstAccuracyQuestions[currentQuestionIndex].correctAnswer;
                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded-md ${
                            isCorrect
                              ? 'bg-[hsl(var(--primary))] border-2 border-[hsl(var(--primary-foreground))] text-white'
                              : 'bg-[hsl(var(--muted))]'
                          }`}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>

                  {worstAccuracyQuestions.length > 1 && (
                    <div className="flex justify-between mt-6 items-center">
                      <button
                        onClick={goToPreviousQuestion}
                        className="p-2 bg-[hsl(var(--muted))] rounded-full hover:bg-[hsl(var(--muted-foreground))] focus:outline-none"
                        aria-label="Previous Question"
                      >
                        <ChevronLeftIcon className="h-6 w-6 text-[hsl(var(--foreground))]" />
                      </button>
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {currentQuestionIndex + 1} of {worstAccuracyQuestions.length}
                      </span>
                      <button
                        onClick={goToNextQuestion}
                        className="p-2 bg-[hsl(var(--muted))] rounded-full hover:bg-[hsl(var(--muted-foreground))] focus:outline-none"
                        aria-label="Next Question"
                      >
                        <ChevronRightIcon className="h-6 w-6 text-[hsl(var(--foreground))]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[hsl(var(--muted-foreground))]">
              No data available for worst accuracy questions.
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ActivityStats;
