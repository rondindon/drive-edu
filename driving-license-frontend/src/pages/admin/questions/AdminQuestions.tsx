import React, { useState, useEffect } from "react";
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
import AdminLayout from "src/pages/admin/AdminLayout";
import AddEditQuestionDialog from "./AddEditQuestionDialog";
import { MoreVertical } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "src/components/ui/select";

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

const Spinner: React.FC = () => <div>Loading...</div>;

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

const AdminQuestions: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  if (role !== "ADMIN") {
    navigate("/login");
  }

  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // Pagination states
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 100;

  const token = localStorage.getItem("supabaseToken");

  const fetchQuestions = async (offsetVal = 0, cat = categoryFilter, diff = difficultyFilter, srch = search) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("limit", limit.toString());
    params.set("offset", offsetVal.toString());
    if (cat && cat !== "All") params.set("category", cat);
    if (diff && diff !== "All") params.set("difficulty", diff);
    if (srch && srch.trim().length > 0) {
      // If you want server-side search, you'd also handle it in backend
      // For now, if you rely on client-side search only, skip sending 'search' param
      // If you do want server-side search, add a 'search' param and handle it in backend
      params.set("search", srch.trim());
    }
  
    try {
      const response = await fetch(`http://localhost:4444/api/admin/questions?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      const data: Question[] = await response.json();
  
      // If offsetVal == 0, replace questions, else append
      if (offsetVal === 0) {
        setQuestions(data);
      } else {
        setQuestions(prev => [...prev, ...data]);
      }
  
      if (data.length < limit) {
        setHasMore(false);
      }
  
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError("Could not fetch questions. Please try again later.");
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const newOffset = 0;
    setOffset(newOffset);
    setHasMore(true);
    fetchQuestions(newOffset, categoryFilter, difficultyFilter, search);
  }, [categoryFilter, difficultyFilter, search]);
  

  useEffect(() => {
    const savedQuestions = localStorage.getItem("adminQuestions");
    const savedOffset = localStorage.getItem("adminQuestionsOffset");
    if (savedQuestions && savedOffset) {
      const parsedQuestions = JSON.parse(savedQuestions) as Question[];
      const parsedOffset = parseInt(savedOffset, 10);
      if (parsedQuestions.length > 0 && !isNaN(parsedOffset)) {
        setQuestions(parsedQuestions);
        setOffset(parsedOffset);
        // Determine if there's potentially more data:
        setHasMore(parsedQuestions.length % 100 === 0);
        setLoading(false);
        return; 
      }
    }
    // No saved state, fetch initial batch
    fetchQuestions(0);
  }, []);
  
  useEffect(() => {
    // Save updated questions & offset when they change
    if (questions.length > 0) {
      localStorage.setItem("adminQuestions", JSON.stringify(questions));
      localStorage.setItem("adminQuestionsOffset", offset.toString());
    }
  }, [questions, offset]);
  

  useEffect(() => {
    // Sort questions numerically by ID before filtering
    const sortedQuestions = [...questions].sort((a, b) => {
      const aId = a.id ?? 0;
      const bId = b.id ?? 0;
      return aId - bId;
    });

    let filtered = sortedQuestions.filter((q) =>
      q.text.toLowerCase().includes(search.toLowerCase())
    );

    if (categoryFilter !== "All") {
      filtered = filtered.filter((q) => q.category === categoryFilter);
    }

    if (difficultyFilter !== "All") {
      filtered = filtered.filter((q) => q.difficulty === difficultyFilter);
    }

    setFilteredQuestions(filtered);
  }, [questions, search, categoryFilter, difficultyFilter]);

  const loadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchQuestions(newOffset);
  };

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
        `http://localhost:4444/api/admin/questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete question");
      }
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      setError("Failed to delete the question");
    }
  };

  const handleSave = async (question: Question) => {
    try {
      if (question.id) {
        // Edit existing question
        const response = await fetch(
          `http://localhost:4444/api/admin/questions/${question.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
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
        // Add new question
        const response = await fetch("http://localhost:4444/api/admin/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(question),
        });
        if (!response.ok) {
          throw new Error("Failed to add question");
        }
        const newQuestion: Question = await response.json();
        setQuestions((prev) => [...prev, newQuestion]);
      }
      setOpenDialog(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading && questions.length === 0) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-500">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Questions</h1>
          <Button
            onClick={handleAddNew}
            className="bg-main-green text-main-darkBlue hover:bg-main-green/90 text-white"
          >
            Add Question
          </Button>
        </div>

        <div className="flex items-center space-x-4">
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
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center space-x-2">
            <span>Difficulty:</span>
            <Select
              value={difficultyFilter}
              onValueChange={(val) => setDifficultyFilter(val as 'easy'|'medium'|'hard'|'All')}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {difficultyOptions.map((diff) => (
                  <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="p-4">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-main-green text-gray-800">
                <th className="py-2 ">ID</th>
                <th className="py-2">Text</th>
                <th className="py-2">Category</th>
                <th className="py-2">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-2">{q.id}</td>
                  <td className="py-2">
                    <div className="flex items-center">
                      {q.imageUrl && (
                        <img
                          src={q.imageUrl}
                          alt="Question"
                          className="w-16 h-auto mr-2 rounded pl-4"
                        />
                      )}
                      <span className="pl-4">{q.text}</span>
                    </div>
                  </td>
                  <td className="py-2 w-1/5">{q.category}</td>
                  <td className="py-2">{q.difficulty}</td>
                  <td className="py-2 text-right">
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
              {filteredQuestions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No questions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Load More Button */}
          {hasMore && filteredQuestions.length > 0 && (
            <div className="mt-4 text-center">
              <Button onClick={loadMore} className="bg-main-green text-main-darkBlue  hover:bg-main-green/90 text-white">
                Load More
              </Button>
            </div>
          )}
        </Card>
      </div>

      {openDialog && (
        <AddEditQuestionDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          initialQuestion={editQuestion}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
};

export default AdminQuestions;