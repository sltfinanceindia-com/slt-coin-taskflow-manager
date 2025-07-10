import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuizzes, QuizQuestion } from '@/hooks/useQuizzes';
import { Plus, Trash2, Edit, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function QuizCreator() {
  const [open, setOpen] = useState(false);
  const { createQuizTemplate, isCreating } = useQuizzes();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timePerQuestion: 30,
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestion>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  const addQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.options?.every(opt => opt.trim())) {
      toast({
        title: "Incomplete Question",
        description: "Please fill in the question and all options.",
        variant: "destructive",
      });
      return;
    }

    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: currentQuestion.question,
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer || 0,
      timeLimit: formData.timePerQuestion,
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionOption = (optionIndex: number, value: string) => {
    const newOptions = [...(currentQuestion.options || ['', '', '', ''])];
    newOptions[optionIndex] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (questions.length < 10) {
      toast({
        title: "Not Enough Questions",
        description: "Please add at least 10 questions for the quiz.",
        variant: "destructive",
      });
      return;
    }

    if (questions.length > 50) {
      toast({
        title: "Too Many Questions",
        description: "Maximum 50 questions allowed per quiz.",
        variant: "destructive",
      });
      return;
    }

    createQuizTemplate({
      title: formData.title,
      description: formData.description,
      questions,
      time_per_question_seconds: formData.timePerQuestion,
      total_questions: questions.length,
    });

    // Reset form
    setFormData({ title: '', description: '', timePerQuestion: 30 });
    setQuestions([]);
    setCurrentQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create UI/UX Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create UI/UX Quiz Template</DialogTitle>
          <DialogDescription>
            Create a timed multiple-choice quiz for UI/UX assessment. Each question will have 30 seconds time limit.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="UI/UX Fundamentals Quiz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timePerQuestion">Time per Question (seconds)</Label>
              <Input
                id="timePerQuestion"
                type="number"
                min="10"
                max="60"
                value={formData.timePerQuestion}
                onChange={(e) => setFormData({ ...formData, timePerQuestion: parseInt(e.target.value) || 30 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Test knowledge of UI/UX principles, design patterns, and best practices"
              rows={2}
            />
          </div>

          {/* Current Question Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Add Question #{questions.length + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  placeholder="What is the primary goal of user experience design?"
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Label>Answer Options</Label>
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={currentQuestion.correctAnswer === index}
                      onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                      className="mt-1"
                    />
                    <Input
                      value={option}
                      onChange={(e) => updateQuestionOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>

              <Button type="button" onClick={addQuestion} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          {/* Questions List */}
          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Questions Added ({questions.length}/50)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {questions.map((question, index) => (
                    <div key={question.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">Q{index + 1}: {question.question}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Correct: {question.options[question.correctAnswer]}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || questions.length < 10}>
              <Save className="h-4 w-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create Quiz Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}