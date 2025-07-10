-- Create UI/UX Exams table
CREATE TABLE public.ui_ux_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_limit_minutes INTEGER NOT NULL DEFAULT 90,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create UI/UX Exam Attempts table
CREATE TABLE public.ui_ux_exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.ui_ux_exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken_minutes INTEGER
);

-- Enable Row Level Security
ALTER TABLE public.ui_ux_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_ux_exam_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for ui_ux_exams
CREATE POLICY "Everyone can view active exams" 
ON public.ui_ux_exams 
FOR SELECT 
USING (is_active = true OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can manage exams" 
ON public.ui_ux_exams 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

-- Create policies for ui_ux_exam_attempts
CREATE POLICY "Users can view their own attempts" 
ON public.ui_ux_exam_attempts 
FOR SELECT 
USING (user_id IN (
  SELECT profiles.id FROM profiles 
  WHERE profiles.user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Users can insert their own attempts" 
ON public.ui_ux_exam_attempts 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT profiles.id FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update their own attempts" 
ON public.ui_ux_exam_attempts 
FOR UPDATE 
USING (user_id IN (
  SELECT profiles.id FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_ui_ux_exams_active ON public.ui_ux_exams(is_active);
CREATE INDEX idx_ui_ux_exam_attempts_user_id ON public.ui_ux_exam_attempts(user_id);
CREATE INDEX idx_ui_ux_exam_attempts_exam_id ON public.ui_ux_exam_attempts(exam_id);

-- Create trigger for updated_at
CREATE TRIGGER update_ui_ux_exams_updated_at
  BEFORE UPDATE ON public.ui_ux_exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the UI/UX exam with 50 questions
INSERT INTO public.ui_ux_exams (title, description, questions, time_limit_minutes, is_active) VALUES (
  'UI/UX Module Test (50 Multiple Choice Questions)',
  'Comprehensive UI/UX assessment covering fundamentals, principles, tools, and practical applications.',
  '[
    {
      "id": 1,
      "question": "What does UX stand for?",
      "options": ["User Xperience", "User Experience", "Ultimate Xperience", "Useful Experience"],
      "correct_answer": "1"
    },
    {
      "id": 2,
      "question": "What does UI stand for?",
      "options": ["User Intelligence", "Uniform Interface", "User Interface", "Universal Interface"],
      "correct_answer": "2"
    },
    {
      "id": 3,
      "question": "The main goal of UX is to:",
      "options": ["Make apps look colorful", "Improve backend performance", "Enhance user satisfaction", "Increase app size"],
      "correct_answer": "2"
    },
    {
      "id": 4,
      "question": "Which of these is a UI element?",
      "options": ["Server", "Button", "API", "Database"],
      "correct_answer": "1"
    },
    {
      "id": 5,
      "question": "What is wireframing in UI/UX?",
      "options": ["Designing with wires", "Creating low-fidelity layouts", "Final UI design", "Animation of UI"],
      "correct_answer": "1"
    },
    {
      "id": 6,
      "question": "What is a prototype?",
      "options": ["Final code version", "Backend logic", "Interactive design preview", "Database schema"],
      "correct_answer": "2"
    },
    {
      "id": 7,
      "question": "A persona is:",
      "options": ["A real user''s photo", "A sample database", "Fictional user representation", "Font style"],
      "correct_answer": "2"
    },
    {
      "id": 8,
      "question": "Which tool is mainly used for UI design?",
      "options": ["Firebase", "Figma", "MySQL", "Node.js"],
      "correct_answer": "1"
    },
    {
      "id": 9,
      "question": "UX design primarily focuses on:",
      "options": ["User journey and interactions", "Bright colors", "Code logic", "File storage"],
      "correct_answer": "0"
    },
    {
      "id": 10,
      "question": "UI design focuses on:",
      "options": ["Navigation speed", "Interface visuals", "API endpoints", "Business logic"],
      "correct_answer": "1"
    },
    {
      "id": 11,
      "question": "Good UX should be:",
      "options": ["Developer-friendly", "User-centered", "Business-focused only", "Code-heavy"],
      "correct_answer": "1"
    },
    {
      "id": 12,
      "question": "Which of these improves UX?",
      "options": ["Clear instructions", "Multiple clicks for every action", "Hidden features", "Fancy animations only"],
      "correct_answer": "0"
    },
    {
      "id": 13,
      "question": "Which of the following is a low-fidelity design format?",
      "options": ["Final HTML", "Wireframe", "Prototyped animation", "CSS"],
      "correct_answer": "1"
    },
    {
      "id": 14,
      "question": "Navigation in UX should be:",
      "options": ["Complicated", "Simple and intuitive", "Script-based", "Long scroll"],
      "correct_answer": "1"
    },
    {
      "id": 15,
      "question": "The ideal number of font families in a UI should be:",
      "options": ["4", "1 or 2", "6", "10"],
      "correct_answer": "1"
    },
    {
      "id": 16,
      "question": "Hick''s Law in UX means:",
      "options": ["More options = faster decisions", "More options = slower decisions", "More fonts = better UI", "Less feedback = good UX"],
      "correct_answer": "1"
    },
    {
      "id": 17,
      "question": "Fitts''s Law refers to:",
      "options": ["Button shape", "Size and distance affect click speed", "Feedback tone", "Color brightness"],
      "correct_answer": "1"
    },
    {
      "id": 18,
      "question": "Jakob''s Law states that:",
      "options": ["Users like new UIs", "Users prefer familiar design patterns", "Users hate menus", "More animations are good"],
      "correct_answer": "1"
    },
    {
      "id": 19,
      "question": "Which is a UX heuristic?",
      "options": ["Use of dark theme", "Visibility of system status", "CSS variables", "Using React"],
      "correct_answer": "1"
    },
    {
      "id": 20,
      "question": "Aesthetic-Usability Effect means:",
      "options": ["Ugly UI works better", "Beautiful interfaces are perceived as more usable", "Beautiful UIs are harder", "Simple UI means poor UX"],
      "correct_answer": "1"
    },
    {
      "id": 21,
      "question": "Which UX law relates to mental load?",
      "options": ["Law of Proximity", "Miller''s Law", "Newton''s Law", "Affordance"],
      "correct_answer": "1"
    },
    {
      "id": 22,
      "question": "Which one improves accessibility?",
      "options": ["Red on black", "Color contrast ratios", "Brightness", "Multiple animations"],
      "correct_answer": "1"
    },
    {
      "id": 23,
      "question": "Consistency principle means:",
      "options": ["Using random layouts", "Repeating UI elements in different ways", "Making similar things look and behave the same", "Designing without research"],
      "correct_answer": "2"
    },
    {
      "id": 24,
      "question": "Which principle helps avoid errors?",
      "options": ["Visibility", "Constraints", "Personalization", "Animation"],
      "correct_answer": "1"
    },
    {
      "id": 25,
      "question": "Feedback in UX means:",
      "options": ["Animation speed", "System responds to user action", "Input validation", "System restart"],
      "correct_answer": "1"
    },
    {
      "id": 26,
      "question": "Law of Proximity states that:",
      "options": ["Nearby elements are perceived as related", "Fast pages are better", "Buttons must be red", "Bold font is best"],
      "correct_answer": "0"
    },
    {
      "id": 27,
      "question": "Which UX law affects choices?",
      "options": ["Law of Closure", "Law of Similarity", "Hick''s Law", "Law of Color"],
      "correct_answer": "2"
    },
    {
      "id": 28,
      "question": "Affordance in UI means:",
      "options": ["Expensive UI", "Visual clue about how an element behaves", "Motion design", "Data flow"],
      "correct_answer": "1"
    },
    {
      "id": 29,
      "question": "Which principle encourages immediate visual updates?",
      "options": ["Visibility", "Animation", "UX writing", "Typography"],
      "correct_answer": "0"
    },
    {
      "id": 30,
      "question": "UX rule: Reduce ____ to increase usability.",
      "options": ["White space", "Load time", "Button size", "Font"],
      "correct_answer": "1"
    },
    {
      "id": 31,
      "question": "Which of these is a prototyping tool?",
      "options": ["MySQL", "InVision", "MongoDB", "Redis"],
      "correct_answer": "1"
    },
    {
      "id": 32,
      "question": "Which is not a design tool?",
      "options": ["Figma", "Adobe XD", "Canva", "Firebase"],
      "correct_answer": "3"
    },
    {
      "id": 33,
      "question": "What does A/B Testing mean?",
      "options": ["Testing colors", "Testing layouts on different users", "Performance testing", "Source code testing"],
      "correct_answer": "1"
    },
    {
      "id": 34,
      "question": "What is the purpose of a mood board?",
      "options": ["Store database info", "Collect visual inspiration", "Backend design", "Code testing"],
      "correct_answer": "1"
    },
    {
      "id": 35,
      "question": "User interviews are used for:",
      "options": ["Hiring", "Backend analysis", "UX research", "Code review"],
      "correct_answer": "2"
    },
    {
      "id": 36,
      "question": "Journey maps show:",
      "options": ["Roadmaps", "Navigation design", "User steps during interaction", "Payment flows"],
      "correct_answer": "2"
    },
    {
      "id": 37,
      "question": "A sitemap is a:",
      "options": ["Data map", "Map of pages and structure", "Login design", "Cookie file"],
      "correct_answer": "1"
    },
    {
      "id": 38,
      "question": "Usability testing checks:",
      "options": ["Server response", "User interactions with UI", "Load time only", "Coding errors"],
      "correct_answer": "1"
    },
    {
      "id": 39,
      "question": "Heatmaps help track:",
      "options": ["Database errors", "User click behavior", "CPU temperature", "API logs"],
      "correct_answer": "1"
    },
    {
      "id": 40,
      "question": "Card sorting helps with:",
      "options": ["Frontend animation", "Navigation structure", "Server logic", "Database sorting"],
      "correct_answer": "1"
    },
    {
      "id": 41,
      "question": "What is microcopy in UX?",
      "options": ["Paragraphs in blogs", "Short helpful text in UI", "Font size", "Coding script"],
      "correct_answer": "1"
    },
    {
      "id": 42,
      "question": "What are microinteractions?",
      "options": ["Large animations", "Small feedback events (like toggles)", "Database actions", "API errors"],
      "correct_answer": "1"
    },
    {
      "id": 43,
      "question": "Responsive design adapts to:",
      "options": ["Server speed", "Screen sizes", "Keyboard", "Fonts"],
      "correct_answer": "1"
    },
    {
      "id": 44,
      "question": "Dark mode improves:",
      "options": ["Server speed", "Eye comfort", "UX performance", "Button color"],
      "correct_answer": "1"
    },
    {
      "id": 45,
      "question": "Progress bars improve UX by:",
      "options": ["Slowing down interaction", "Showing status of actions", "Filling screen", "Using animations"],
      "correct_answer": "1"
    },
    {
      "id": 46,
      "question": "Skeleton screens are:",
      "options": ["Debug tools", "Placeholder for content loading", "Wireframes", "Final design"],
      "correct_answer": "1"
    },
    {
      "id": 47,
      "question": "Hamburger menu is:",
      "options": ["A type of layout icon", "A user avatar", "A font", "A plugin"],
      "correct_answer": "0"
    },
    {
      "id": 48,
      "question": "Which is NOT part of UI/UX testing?",
      "options": ["Click tracking", "Load testing", "Heatmaps", "User feedback"],
      "correct_answer": "1"
    },
    {
      "id": 49,
      "question": "Inclusive design means:",
      "options": ["Only mobile users", "All user types, including those with disabilities", "Specific gender", "Only for iOS"],
      "correct_answer": "1"
    },
    {
      "id": 50,
      "question": "Why are onboarding screens important?",
      "options": ["For payment", "To introduce app features to new users", "To style font", "To test backend"],
      "correct_answer": "1"
    }
  ]'::jsonb,
  90,
  true
);