
-- Create assessments table
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  time_limit_minutes INTEGER NOT NULL DEFAULT 20,
  passing_score INTEGER NOT NULL DEFAULT 70,
  total_questions INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessment_questions table
CREATE TABLE public.assessment_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessment_attempts table
CREATE TABLE public.assessment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_remaining_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'expired')),
  score INTEGER,
  total_questions INTEGER,
  correct_answers INTEGER,
  is_passed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessment_answers table
CREATE TABLE public.assessment_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.assessment_questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer CHAR(1) CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

-- Enable RLS on all tables
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessments
CREATE POLICY "Everyone can view published assessments"
  ON public.assessments
  FOR SELECT
  USING (is_published = true OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can manage assessments"
  ON public.assessments
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for assessment_questions
CREATE POLICY "Users can view questions for published assessments"
  ON public.assessment_questions
  FOR SELECT
  USING (assessment_id IN (
    SELECT id FROM public.assessments 
    WHERE is_published = true
  ) OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can manage assessment questions"
  ON public.assessment_questions
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for assessment_attempts
CREATE POLICY "Users can view their own attempts"
  ON public.assessment_attempts
  FOR SELECT
  USING (user_id IN (
    SELECT id FROM public.profiles 
    WHERE profiles.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can create their own attempts"
  ON public.assessment_attempts
  FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM public.profiles 
    WHERE profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own attempts"
  ON public.assessment_attempts
  FOR UPDATE
  USING (user_id IN (
    SELECT id FROM public.profiles 
    WHERE profiles.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all attempts"
  ON public.assessment_attempts
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for assessment_answers
CREATE POLICY "Users can manage their own answers"
  ON public.assessment_answers
  FOR ALL
  USING (attempt_id IN (
    SELECT id FROM public.assessment_attempts 
    WHERE user_id IN (
      SELECT id FROM public.profiles 
      WHERE profiles.user_id = auth.uid()
    )
  ) OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- Insert the UI/UX Assessment
INSERT INTO public.assessments (title, description, instructions, time_limit_minutes, passing_score, total_questions, is_published, created_by)
VALUES (
  'UI/UX Module Assessment',
  'Comprehensive assessment covering fundamental UI/UX design principles, user research methods, and best practices.',
  'Instructions:
• Choose the best answer for each question
• Each question carries equal marks
• You have 20 minutes to complete 50 questions
• Click Submit when finished
• You need 70% to pass this assessment',
  20,
  70,
  50,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- Insert all 50 UI/UX questions
INSERT INTO public.assessment_questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
VALUES 
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which phase typically comes after "Ideation" in the UX design process?', 'User Research', 'Discovery', 'Prototype', 'Empathize', 'C', 1),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the primary purpose of a persona in UX design?', 'To determine the budget for a project.', 'To represent a typical user''s goals, behaviors, and motivations.', 'To outline the technical specifications of a product.', 'To list all the features to be included in an application.', 'B', 2),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What does "affordance" mean in UI design?', 'The decorative elements of an interface.', 'The cost-effectiveness of a design element.', 'The amount of information displayed on a screen.', 'The perceived property of an object that suggests how it can be used.', 'D', 3),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the main goal of Usability Testing?', 'To impress stakeholders with a polished design.', 'To gather demographic data about users.', 'To demonstrate all product features to potential users.', 'To identify user pain points and areas for improvement in a design.', 'D', 4),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of the following research methods is qualitative?', 'A/B Testing', 'Surveys with multiple-choice questions', 'User Interviews', 'Heatmaps analysis', 'C', 5),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which UX principle emphasizes designing for users with diverse abilities?', 'Minimalism', 'Flat Design', 'Accessibility', 'Skewmorphism', 'C', 6),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is a "wireframe" primarily used for?', 'To show the final visual design.', 'To depict the structural layout and content hierarchy of a page.', 'To test the backend functionality of a system.', 'To create animations and transitions.', 'B', 7),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the purpose of a "user journey map"?', 'To list all the competitors in the market.', 'To detail the technical architecture of a system.', 'To visualize the steps a user takes to achieve a goal with a product.', 'To track the project''s financial expenses.', 'C', 8),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which term describes the ease with which users can achieve their goals when interacting with a product?', 'Aesthetic appeal', 'Findability', 'Usability', 'Learnability', 'C', 9),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is Hick''s Law primarily concerned with in UI/UX?', 'The optimal font size for readability.', 'The ideal color palette for an interface.', 'The time it takes for a user to make a decision based on the number of choices.', 'The maximum number of items a user can remember.', 'C', 10),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the main benefit of conducting A/B testing?', 'To gather qualitative feedback on user emotions.', 'To determine which of two design variations performs better with users.', 'To create detailed user personas.', 'To develop new feature ideas.', 'B', 11),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which design principle suggests that similar items should be grouped together visually?', 'Proximity', 'Alignment', 'Contrast', 'Repetition', 'A', 12),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the primary role of a UI Style Guide?', 'To define the project scope and timeline.', 'To document user research findings.', 'To ensure visual consistency and brand identity across all interface elements.', 'To outline the development framework.', 'C', 13),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of the following is a common method for gathering quantitative user data?', 'Analytics (e.g., website traffic, click-through rates)', 'Focus Groups', 'Think-Aloud Protocols', 'Contextual Inquiries', 'A', 14),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is "Fitt''s Law" often applied to in UI design?', 'Determining the optimal number of navigation items.', 'Predicting the time required to move to and select a target.', 'Choosing the best color scheme for accessibility.', 'Estimating the project budget.', 'B', 15),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the purpose of an Information Architecture (IA) in UX design?', 'To define the visual aesthetics of a product.', 'To manage the project''s financial resources.', 'To organize, structure, and label content in an effective and sustainable way.', 'To conduct user interviews.', 'C', 16),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which term describes the process of creating a simplified, interactive version of a design to test concepts?', 'Documentation', 'Deployment', 'Debugging', 'Prototyping', 'D', 17),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the primary goal of creating a "Minimum Viable Product" (MVP) in a UX context?', 'To gather early feedback on core functionality with the least effort.', 'To launch a full-featured product immediately.', 'To ensure the product is bug-free before release.', 'To eliminate the need for further iterations.', 'A', 18),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the "Golden Ratio" sometimes used for in UI design?', 'To determine the ideal number of pages in a website.', 'To create aesthetically pleasing layouts and proportions.', 'To calculate the conversion rate of a landing page.', 'To measure user satisfaction.', 'B', 19),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of the following is an example of good feedback in a UI?', 'A button that does nothing when clicked.', 'A loading spinner that indicates an ongoing process.', 'A form field that doesn''t show an error message when invalid data is entered.', 'An unclickable element that looks clickable.', 'B', 20),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the primary benefit of responsive web design?', 'It makes websites more secure.', 'It makes websites load faster on all devices.', 'It ensures a consistent user experience across various screen sizes and devices.', 'It eliminates the need for separate mobile applications.', 'C', 21),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which UX principle states that users should be able to undo or redo actions easily?', 'User control and freedom.', 'Flexibility and efficiency of use.', 'Aesthetic and minimalist design.', 'Recognition rather than recall.', 'A', 22),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is "Cognitive Load" in UX design?', 'The processing power of the user''s device.', 'The mental effort required to understand and interact with an interface.', 'The amount of data transferred over a network.', 'The cost of developing a complex interface.', 'B', 23),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What does "Heuristic Evaluation" involve?', 'Directly asking users about their preferences.', 'Conducting A/B tests to compare different designs.', 'Experts evaluating an interface against a set of usability principles.', 'Analyzing website traffic data.', 'C', 24),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of these is a common deliverable at the "Define" stage of the UX process?', 'High-fidelity prototypes', 'Fully coded applications', 'Marketing campaign plans', 'User Personas and Problem Statements', 'D', 25),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the main purpose of "Gestalt Principles" in UI design?', 'To explain how humans perceive visual elements and group them together.', 'To guide the development of backend databases.', 'To determine the optimal server location.', 'To measure the effectiveness of marketing campaigns.', 'A', 26),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is "Dark Pattern" in UI/UX?', 'A design that uses a dark color scheme.', 'A user interface design that tricks users into doing things they might not want to do.', 'A design pattern that is difficult to understand.', 'A design that lacks sufficient lighting.', 'B', 27),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which stage of the design thinking process focuses on understanding the users'' needs and problems?', 'Ideate', 'Prototype', 'Test', 'Empathize', 'D', 28),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the main advantage of using a "design system"?', 'It limits creativity in design.', 'It makes the product more expensive to develop.', 'It speeds up design and development, ensuring consistency and scalability.', 'It is only useful for very small projects.', 'C', 29),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is a "card sorting" exercise used for in UX research?', 'To determine the visual hierarchy of an interface.', 'To test the responsiveness of a website.', 'To gather demographic data.', 'To understand how users mentally categorize and organize information.', 'D', 30),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of the following best describes "Microinteractions"?', 'Large, complex system interactions.', 'Small, subtle animations or feedback moments that enhance user experience.', 'Interactions that happen offline.', 'Interactions between different software applications.', 'B', 31),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the primary purpose of a "user flow"?', 'To outline the database structure.', 'To specify the programming language to be used.', 'To illustrate the path a user takes to complete a specific task or goal within a product.', 'To create a sitemap of the entire website.', 'C', 32),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the principle of "Progressive Disclosure"?', 'Showing all information at once to the user.', 'Hiding all information until the user specifically requests it.', 'Revealing only essential information initially and allowing users to access more detail as needed.', 'Displaying information in random order.', 'C', 33),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of these metrics is most directly related to the "findability" aspect of UX?', 'Number of clicks to reach a specific piece of information.', 'Time spent on a page.', 'User satisfaction score.', 'Website loading speed.', 'A', 34),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the main purpose of "Accessibility" in UI/UX?', 'To make the design look aesthetically pleasing.', 'To ensure the product can be used by people with a wide range of abilities and disabilities.', 'To optimize the product for search engines.', 'To reduce the development cost.', 'B', 35),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What does "CTR" stand for in a UX context?', 'Content Type Recognition', 'Click-Through Rate', 'Customer Tracking Report', 'Conversion Time Record', 'B', 36),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the primary characteristic of "Flat Design"?', 'Excessive use of shadows and textures.', 'Designs that look like real-world objects.', 'Designs that are difficult to understand.', 'Minimalist design, devoid of gradients, bevels, and drop shadows, focusing on usability.', 'D', 37),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'In UX, what does "Onboarding" refer to?', 'The initial experience new users have with a product to help them get started.', 'The process of hiring new designers.', 'The final stage of product development.', 'The process of getting feedback from existing users.', 'A', 38),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the main purpose of "User Research"?', 'To dictate the final design decisions without iteration.', 'To generate revenue for the product.', 'To understand user needs, behaviors, and motivations to inform design.', 'To create a marketing strategy.', 'C', 39),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of the following is a key element of persuasive design?', 'Overwhelming users with information.', 'Using aggressive marketing tactics.', 'Building trust and credibility.', 'Hiding important information.', 'C', 40),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of these is a common challenge in cross-cultural UX design?', 'Limited access to design tools.', 'High cost of development.', 'Difficulty in finding good designers.', 'Variations in iconography, color symbolism, and reading patterns.', 'D', 41),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What does "Information Foraging" theory suggest about user behavior?', 'Users will seek out information in a way that minimizes effort and maximizes reward, similar to animals foraging for food.', 'Users randomly click on elements until they find what they need.', 'Users prefer to be given all information at once.', 'Users only pay attention to the most prominent elements on a page.', 'A', 42),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is a "Call to Action" (CTA) in UI design?', 'The navigation bar of a website.', 'A prompt that tells the user what action to take next.', 'A descriptive paragraph about the product.', 'A list of all product features.', 'B', 43),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of the following is a benefit of conducting "contextual inquiry"?', 'It provides quick quantitative data.', 'It is a very low-cost research method.', 'It allows designers to observe users in their natural environment, providing rich insights.', 'It eliminates the need for further user testing.', 'C', 44),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is "Gamification" in UX?', 'Using video games to test product usability.', 'The process of designing video game interfaces.', 'Creating products solely for entertainment purposes.', 'Applying game-design elements and game principles in non-game contexts to engage users.', 'D', 45),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the primary difference between UI and UX?', 'UI focuses on the visual and interactive elements, while UX encompasses the entire user journey and experience.', 'UI is only about aesthetics, while UX is only about functionality.', 'UI is for websites, and UX is for mobile apps.', 'UI is a subset of UX, but UX is not a subset of UI.', 'A', 46),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of these is a key principle of good User Interface (UI) design?', 'Complexity', 'Consistency', 'Redundancy', 'Obscurity', 'B', 47),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of the following best defines User Experience (UX)?', 'The visual design of an interface.', 'The speed at which a website loads.', 'The overall feeling a user has while interacting with a product or service.', 'The number of features a product offers.', 'C', 48),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'What is the primary purpose of a "user journey map"?', 'To detail the technical architecture of a system.', 'To visualize the steps a user takes to achieve a goal with a product.', 'To list all the competitors in the market.', 'To track the project''s financial expenses.', 'B', 49),
((SELECT id FROM public.assessments WHERE title = 'UI/UX Module Assessment'), 'Which of the following research methods is qualitative?', 'A/B Testing', 'Surveys with multiple-choice questions', 'Heatmaps analysis', 'User Interviews', 'D', 50);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON public.assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
