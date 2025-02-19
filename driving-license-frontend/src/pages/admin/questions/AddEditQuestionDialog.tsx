import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "src/components/ui/dialog";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { Label } from "src/components/ui/label";
import { Textarea } from "src/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "src/components/ui/select";
import { Question } from "./AdminQuestions";

const allGroups = ['A', 'B', 'BE', 'C', 'CE', 'D', 'DE', 'T']; 
const categories = [
  { name: 'Pravidlá cestnej premávky', points: 3 },
  { name: 'Uplatňovanie pravidiel prednosti v jazde a rýchlostné obmedzenia', points: 3 },
  { name: 'Dopravné značky a dopravné zariadenia', points: 2 },
  { name: 'Dopravné situácie na križovatkách', points: 4 },
  { name: 'Všeobecné pravidlá správania sa v prípade dopravnej nehody', points: 2 },
  { name: 'Teória vedenia vozidla', points: 2 },
  { name: 'Predpisy týkajúce sa dokladov požadovaných v prípade používania vozidla a organizácia času v doprave', points: 1 },
  { name: 'Podmienky prevádzky vozidiel v premávke na pozemných komunikáciách', points: 1 },
  { name: 'Zásady bezpečnej jazdy', points: 3 },
  { name: 'Konštrukcia vozidiel a ich údržba', points: 1 },
];

interface AddEditQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  initialQuestion: Question | null;
  onSave: (question: Question) => void;
}

const AddEditQuestionDialog: React.FC<AddEditQuestionDialogProps> = ({
  open,
  onClose,
  initialQuestion,
  onSave,
}) => {
  const [groups, setGroups] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');
  const [points, setPoints] = useState<number>(0);
  const [text, setText] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<'A'|'B'|'C'>('A');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('medium');
  const [explanation, setExplanation] = useState<string>('');

  useEffect(() => {
    if (initialQuestion) {
      setGroups(initialQuestion.groups || []);
      setCategory(initialQuestion.category || '');
      setPoints(initialQuestion.points || 0);
      setText(initialQuestion.text || '');
      setOptions(initialQuestion.options || ['', '', '']);
      setCorrectAnswer(initialQuestion.correctAnswer || 'A');
      setImageUrl(initialQuestion.imageUrl || '');
      setDifficulty(initialQuestion.difficulty || 'medium');
      setExplanation(initialQuestion.explanation || '');
    } else {
      setGroups([]);
      setCategory('');
      setPoints(0);
      setText('');
      setOptions(['', '', '']);
      setCorrectAnswer('A');
      setImageUrl('');
      setDifficulty('medium');
      setExplanation('');
    }
  }, [initialQuestion]);

  useEffect(() => {
    const selectedCategory = categories.find((cat) => cat.name === category);
    setPoints(selectedCategory ? selectedCategory.points : 0);
  }, [category]);

  const toggleGroupSelection = (group: string) => {
    setGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const selectAllGroups = () => {
    setGroups(allGroups);
  };

  const deselectAllGroups = () => {
    setGroups([]);
  };

  const handleSaveClick = () => {
    if (!text.trim() || !category || options.some(o => !o.trim())) {
      return;
    }

    const question: Question = {
      id: initialQuestion?.id,
      groups,
      category,
      points,
      text,
      options,
      correctAnswer,
      imageUrl: imageUrl || undefined,
      difficulty,
      explanation,
    };

    onSave(question);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">

          <div>
            <Label>Groups</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allGroups.map((group) => (
                <Button
                  type="button"
                  key={group}
                  variant="outline"
                  className={groups.includes(group) ? "bg-main-green text-main-darkBlue" : ""}
                  onClick={() => toggleGroupSelection(group)}
                >
                  {group}
                </Button>
              ))}
            </div>
            <div className="mt-2 flex space-x-2">
              <Button type="button" variant="outline" onClick={selectAllGroups}>
                Select All
              </Button>
              <Button type="button" variant="outline" onClick={deselectAllGroups}>
                Deselect All
              </Button>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Category</Label>
              <Select value={category} onValueChange={val => setCategory(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Points</Label>
              <Input type="number" value={points} readOnly />
            </div>
          </div>

          <div>
            <Label>Question Text</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the question"
            />
          </div>

          <div>
            <Label>Options (A, B, C)</Label>
            {['A', 'B', 'C'].map((opt, idx) => (
              <div key={opt} className="mt-2">
                <Input
                  value={options[idx]}
                  onChange={(e) => {
                    const updated = [...options];
                    updated[idx] = e.target.value;
                    setOptions(updated);
                  }}
                  placeholder={`Option ${opt}`}
                />
              </div>
            ))}
          </div>

          <div>
            <Label>Correct Answer</Label>
            <Select value={correctAnswer} onValueChange={(val: 'A'|'B'|'C') => setCorrectAnswer(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image URL */}
          <div>
            <Label>Image URL (optional)</Label>
            <Input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>

          <div>
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(val: 'easy'|'medium'|'hard') => setDifficulty(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Explanation</Label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Enter explanation for the correct answer"
            />
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveClick}>{initialQuestion ? "Save Changes" : "Add Question"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditQuestionDialog;