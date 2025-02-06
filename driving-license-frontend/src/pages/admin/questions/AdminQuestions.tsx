import React, { useState, useEffect, useCallback, useContext } from "react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Card } from "src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "src/components/ui/dropdown-menu";
import { useAuth } from "src/context/AuthContext";
import { useNavigate } from "react-router-dom";
import AddEditQuestionDialog from "./AddEditQuestionDialog";
import { MoreVertical } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "src/components/ui/select";
import { Skeleton } from "src/components/ui/skeleton";
import { ThemeContext } from "src/context/ThemeContext";

export interface Question {
  id?: number;
  groups: string[];
  category: string;
  points: number;
  text: string;
  options: string[];
  correctAnswer: 'A' | 'B' | 'C';
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

const categories = [
  "All",
  "Pravidlá cestnej premávky",
  "Uplatňovanie pravidiel prednosti v jazde a rýchlostné obmedzenia",
  "Dopravné značky a dopravné zariadenia",
  "Dopravné situácie na križovatkách",
  "Všeobecné pravidlá správania sa v prípade dopravnej nehody",
  "Teória vedenia vozidla",
  "Predpisy týkajúce sa dokladov požadovaných v prípade používania vozidla a organizácia času v doprave",
  "Podmienky prevádzky vozidiel v premávke na pozemných komunikáciách",
  "Zásady bezpečnej jazdy",
  "Konštrukcia vozidiel a ich údržba",
];

const difficultyOptions = ["All", "easy", "medium", "hard"];

interface QuestionCache {
  questions: Question[];
  timestamp: number;
}

interface QuestionStats {
  questionId: number;
  totalAnswers: number;
  accuracy: number; // in percentage
}

// --- Skeleton Rows for loading state ---
const SkeletonRow: React.FC = () => (
  <tr className="border-b border-gray-200">
    <td className="py-2 px-4">
      <Skeleton className="w-6 h-4" />
    </td>
    <td className="py-2 px-4">
      <div className="flex items-center">
        <Skeleton className="w-16 h-10 mr-2 rounded" />
        <Skeleton className="flex-1 h-4" />
      </div>
    </td>
    <td className="py-2 px-4">
      <Skeleton className="w-24 h-4" />
    </td>
    <td className="py-2 px-4">
      <Skeleton className="w-16 h-4" />
    </td>
    <td className="py-2 px-4">
      <Skeleton className="w-8 h-4" />
    </td>
    <td className="py-2 px-4">
      <Skeleton className="w-24 h-4" />
    </td>
    <td className="py-2 px-4">
      <Skeleton className="w-24 h-6" />
    </td>
  </tr>
);

const renderSkeletonRows = (count: number = 10) =>
  Array.from({ length: count }).map((_, index) => <SkeletonRow key={index} />);

const AdminQuestions: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  // Ensure only Admin can access
  useEffect(() => {
    if (role !== "ADMIN") {
      navigate("/login");
    }
  }, [role, navigate]);

  // State management
  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");

  const token = localStorage.getItem("supabaseToken");
  const { theme } = useContext(ThemeContext);

  // Local cache key
  const cacheKey = "adminQuestionsCache";

  // State for question stats (aggregated from UserAnswer)
  const [questionStats, setQuestionStats] = useState<Record<number, QuestionStats>>({});

  // Fetch Questions Function with Caching
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const cachedData = localStorage.getItem(cacheKey);
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = Date.now();

    if (cachedData) {
      try {
        const parsedCache: QuestionCache = JSON.parse(cachedData);
        if (now - parsedCache.timestamp < cacheExpiry) {
          setQuestions(parsedCache.questions);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem(cacheKey);
        }
      } catch (e) {
        console.error("Failed to parse cache:", e);
        localStorage.removeItem(cacheKey);
      }
    }

    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (difficultyFilter !== "All") params.set("difficulty", difficultyFilter);
      if (search.trim() !== "") params.set("search", search.trim());
      params.set("limit", "10000");

      const response = await fetch(
        `https://drive-edu.onrender.com/api/admin/questions?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data: Question[] = await response.json();
      setQuestions(data);

      const cacheData: QuestionCache = {
        questions: data,
        timestamp: now,
      };

      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (e) {
        if ((e as DOMException).name === "QuotaExceededError") {
          console.warn("LocalStorage quota exceeded. Cannot cache questions.");
        } else {
          console.error("Failed to set cache:", e);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Could not fetch questions. Please try again later.");
      setLoading(false);
    }
  }, [categoryFilter, difficultyFilter, search, token]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Fetch Question Stats from backend
  const fetchQuestionStats = useCallback(async () => {
    try {
      const response = await fetch(
        `https://drive-edu.onrender.com/api/admin/question-stats`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch question stats");
      }
      const data = await response.json();
      // data should be of shape { stats: QuestionStats[] }
      const statsArray = data.stats as QuestionStats[];
      const statsMap: Record<number, QuestionStats> = {};
      statsArray.forEach((stat) => {
        statsMap[stat.questionId] = stat;
      });
      setQuestionStats(statsMap);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    fetchQuestionStats();
  }, [fetchQuestionStats]);

  // Filtering logic for questions
  const getFilteredQuestions = () => {
    return questions.filter((q) => {
      const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || q.category === categoryFilter;
      const matchesDifficulty =
        difficultyFilter === "All" || q.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  };

  const filteredQuestions = getFilteredQuestions();

  // Handlers for Add/Edit/Delete etc.
  const handleAddNew = () => {
    setEditQuestion(null);
    setOpenDialog(true);
  };

  const handleEdit = (question: Question) => {
    setEditQuestion(question);
    setOpenDialog(true);
  };

  const handleDelete = async (questionId: number) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://drive-edu.onrender.com/api/admin/questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      localStorage.removeItem(cacheKey);
    } catch (err) {
      console.error(err);
      setError("Failed to delete the question");
    }
  };

  const handleSave = async (question: Question) => {
    try {
      if (question.id) {
        const response = await fetch(
          `https://drive-edu.onrender.com/api/admin/questions/${question.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(question),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update question");
        }
        const updatedQuestion: Question = await response.json();
        setQuestions((prev) =>
          prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
        );
      } else {
        const response = await fetch(
          "https://drive-edu.onrender.com/api/admin/questions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(question),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to add question");
        }
        const newQuestion: Question = await response.json();
        setQuestions((prev) => [...prev, newQuestion]);
      }
      setOpenDialog(false);
      localStorage.removeItem(cacheKey);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  // Refresh button
  const handleRefresh = () => {
    localStorage.removeItem(cacheKey);
    fetchQuestions();
  };

  return (
    <>
      {/* Header and Add/Refresh Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Questions</h1>
        <div className="flex space-x-2">
          <Button
            onClick={handleRefresh}
            className="bg-main-green text-white hover:bg-main-green/90"
          >
            Refresh
          </Button>
          <Button
            onClick={handleAddNew}
            className="bg-main-green text-main-darkBlue hover:bg-main-green/90 text-white"
          >
            Add Question
          </Button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex items-center space-x-4 mb-4 justify-between">
        <div className="flex text-[hsl(var(--foreground))] space-x-4">
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3"
          />
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <span>Category:</span>
            <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val)}>
              <SelectTrigger className="w-100">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Difficulty Filter */}
          <div className="flex items-center space-x-2">
            <span>Difficulty:</span>
            <Select
              value={difficultyFilter}
              onValueChange={(val) =>
                setDifficultyFilter(val as 'easy' | 'medium' | 'hard' | 'All')
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {difficultyOptions.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <Card className="p-4">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-main-green text-gray-800">
              <th className="py-2 px-4 text-[hsl(var(--foreground))]">ID</th>
              <th className="py-2 px-4 text-[hsl(var(--foreground))]">Text</th>
              <th className="py-2 px-4 text-[hsl(var(--foreground))]">Category</th>
              <th className="py-2 px-4 text-[hsl(var(--foreground))]">Difficulty</th>
              <th className="py-2 px-4 text-[hsl(var(--foreground))]">Stats</th>
              <th className="py-2 px-4 text-[hsl(var(--foreground))]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && questions.length === 0 ? (
              renderSkeletonRows()
            ) : (
              <>
                {filteredQuestions.map((q) => (
                  <tr
                    key={q.id}
                    className={`border-b border-gray-200 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-green-300/50"} min-h-[3rem]`}
                  >
                    <td className="py-2 px-4">{q.id}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        {q.imageUrl && (
                          <img
                            src={q.imageUrl}
                            alt="Question"
                            className="w-16 h-auto mr-2 rounded"
                          />
                        )}
                        <span>{q.text}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 w-1/5">{q.category}</td>
                    <td className="py-2 px-4 capitalize">{q.difficulty}</td>
                    <td className="py-2 px-4">
                      {q.id !== undefined && questionStats[q.id] ? (
                        <>
                          <span>{questionStats[q.id].totalAnswers} answers</span>
                          <span> | </span>
                          <span>{questionStats[q.id].accuracy}% accuracy</span>
                        </>
                      ) : (
                        "No data"
                      )}
                    </td>
                    <td className="py-2 px-4 flex justify-center items-center space-x-2 h-full">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => q.id && handleEdit(q)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => q.id && handleDelete(q.id)}
                            className="text-red-500"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredQuestions.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      No questions found.
                    </td>
                  </tr>
                )}
                {loading && questions.length > 0 && renderSkeletonRows()}
              </>
            )}
          </tbody>
        </table>
      </Card>

      {/* Add/Edit Question Dialog */}
      {openDialog && (
        <AddEditQuestionDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          initialQuestion={editQuestion}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default AdminQuestions;