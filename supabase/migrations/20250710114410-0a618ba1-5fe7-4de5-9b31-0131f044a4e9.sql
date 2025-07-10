
-- First, let's delete all existing question options to start fresh
DELETE FROM question_options WHERE question_id IN (
  SELECT id FROM exam_questions WHERE exam_id IN (
    SELECT id FROM ui_ux_exams WHERE is_active = true
  )
);

-- Now insert all questions with correct options and answer keys
-- Part A: Fundamentals (1-15)

-- Question 1: What does UX stand for?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'User Xperience', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 1;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Ultimate Experience', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 1;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'User Experience', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 1;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Useful Experience', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 1;

-- Question 2: What does UI stand for?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'User Intelligence', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 2;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Uniform Interface', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 2;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'User Interface', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 2;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Universal Interface', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 2;

-- Question 3: The main goal of UX is to:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Make apps look colorful', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 3;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Improve backend performance', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 3;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Enhance user satisfaction', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 3;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Increase app size', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 3;

-- Question 4: Which of these is a UI element?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Server', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 4;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Button', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 4;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'API', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 4;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Database', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 4;

-- Question 5: What is wireframing in UI/UX?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Designing with wires', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 5;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Creating low-fidelity layouts', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 5;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Final UI design', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 5;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Animation of UI', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 5;

-- Continue with remaining questions (6-50)...
-- Question 6: What is a prototype?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Final code version', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 6;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Backend logic', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 6;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Interactive design preview', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 6;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Database schema', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 6;

-- Question 7: A persona is:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'A real user''s photo', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 7;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'A sample database', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 7;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Fictional user representation', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 7;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Font style', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 7;

-- Question 8: Which tool is mainly used for UI design?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Firebase', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 8;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Figma', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 8;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'MySQL', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 8;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Node.js', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 8;

-- Question 9: UX design primarily focuses on:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'User journey and interactions', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 9;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Bright colors', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 9;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Code logic', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 9;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'File storage', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 9;

-- Question 10: UI design focuses on:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Navigation speed', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 10;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Interface visuals', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 10;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'API endpoints', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 10;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Business logic', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 10;

-- Questions 11-15 (continuing the pattern)
-- Question 11: Good UX should be:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Developer-friendly', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 11;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'User-centered', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 11;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Business-focused only', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 11;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Code-heavy', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 11;

-- Question 12: Which of these improves UX?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Clear instructions', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 12;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Multiple clicks for every action', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 12;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Hidden features', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 12;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Fancy animations only', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 12;

-- Question 13: Which of the following is a low-fidelity design format?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Final HTML', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 13;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Wireframe', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 13;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Prototyped animation', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 13;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'CSS', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 13;

-- Question 14: Navigation in UX should be:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Complicated', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 14;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Simple and intuitive', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 14;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Script-based', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 14;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Long scroll', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 14;

-- Question 15: The ideal number of font families in a UI should be:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, '4', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 15;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, '1 or 2', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 15;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, '6', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 15;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, '10', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 15;

-- Part B: Principles & Laws (16-30)
-- Question 16: Hick's Law in UX means:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'More options = faster decisions', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 16;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'More options = slower decisions', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 16;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'More fonts = better UI', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 16;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Less feedback = good UX', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 16;

-- Question 17: Fitts's Law refers to:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Button shape', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 17;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Size and distance affect click speed', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 17;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Feedback tone', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 17;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Color brightness', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 17;

-- Question 18: Jakob's Law states that:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Users like new UIs', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 18;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Users prefer familiar design patterns', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 18;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Users hate menus', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 18;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'More animations are good', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 18;

-- Question 19: Which is a UX heuristic?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Use of dark theme', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 19;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Visibility of system status', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 19;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'CSS variables', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 19;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Using React', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 19;

-- Question 20: Aesthetic-Usability Effect means:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Ugly UI works better', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 20;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Beautiful interfaces are perceived as more usable', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 20;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Beautiful UIs are harder', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 20;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Simple UI means poor UX', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 20;

-- Continue with questions 21-50 following the same pattern...
-- Question 21: Which UX law relates to mental load?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Law of Proximity', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 21;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Miller''s Law', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 21;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Newton''s Law', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 21;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Affordance', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 21;

-- Question 22: Which one improves accessibility?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Red on black', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 22;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Color contrast ratios', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 22;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Brightness', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 22;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Multiple animations', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 22;

-- Question 23: Consistency principle means:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Using random layouts', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 23;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Repeating UI elements in different ways', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 23;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Making similar things look and behave the same', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 23;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Designing without research', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 23;

-- Question 24: Which principle helps avoid errors?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Visibility', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 24;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Constraints', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 24;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Personalization', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 24;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Animation', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 24;

-- Question 25: Feedback in UX means:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Animation speed', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 25;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'System responds to user action', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 25;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Input validation', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 25;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'System restart', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 25;

-- Questions 26-50 with all the correct options as per your answer key
-- Question 26: Law of Proximity states that:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Nearby elements are perceived as related', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 26;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Fast pages are better', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 26;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Buttons must be red', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 26;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Bold font is best', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 26;

-- Question 27: Which UX law affects choices?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Law of Closure', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 27;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Law of Similarity', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 27;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Hick''s Law', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 27;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Law of Color', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 27;

-- Question 28: Affordance in UI means:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Expensive UI', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 28;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Visual clue about how an element behaves', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 28;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Motion design', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 28;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Data flow', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 28;

-- Question 29: Which principle encourages immediate visual updates?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Visibility', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 29;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Animation', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 29;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'UX writing', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 29;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Typography', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 29;

-- Question 30: UX rule: Reduce ____ to increase usability.
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'White space', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 30;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Load time', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 30;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Button size', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 30;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Font', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 30;

-- Part C: Tools & Processes (31-40)
-- Question 31: Which of these is a prototyping tool?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'MySQL', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 31;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'InVision', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 31;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Firebase', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 31;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Redis', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 31;

-- Question 32: Which is not a design tool?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Figma', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 32;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Adobe XD', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 32;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Canva', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 32;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Firebase', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 32;

-- Continue with remaining questions 33-50 following the same pattern...
-- Question 33: What does A/B Testing mean?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Testing colors', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 33;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Testing layouts on different users', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 33;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Performance testing', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 33;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Source code testing', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 33;

-- Question 34: What is the purpose of a mood board?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Store database info', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 34;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Collect visual inspiration', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 34;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Backend design', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 34;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Code testing', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 34;

-- Question 35: User interviews are used for:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Hiring', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 35;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Backend analysis', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 35;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'UX research', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 35;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Code review', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 35;

-- Question 36: Journey maps show:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Roadmaps', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 36;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Navigation design', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 36;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'User steps during interaction', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 36;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Payment flows', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 36;

-- Question 37: A sitemap is a:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Data map', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 37;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Map of pages and structure', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 37;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Login design', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 37;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Cookie file', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 37;

-- Question 38: Usability testing checks:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Server response', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 38;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'User interactions with UI', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 38;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Load time only', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 38;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Coding errors', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 38;

-- Question 39: Heatmaps help track:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Database errors', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 39;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'User click behavior', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 39;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'CPU temperature', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 39;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'API logs', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 39;

-- Question 40: Card sorting helps with:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Frontend animation', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 40;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Navigation structure', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 40;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Server logic', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 40;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Database sorting', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 40;

-- Part D: Practical Application (41-50)
-- Question 41: What is microcopy in UX?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Paragraphs in blogs', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 41;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Short helpful text in UI', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 41;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Font size', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 41;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Coding script', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 41;

-- Question 42: What are microinteractions?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Large animations', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 42;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Small feedback events (like toggles)', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 42;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Database actions', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 42;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'API errors', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 42;

-- Question 43: Responsive design adapts to:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Server speed', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 43;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Screen sizes', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 43;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Keyboard', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 43;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Fonts', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 43;

-- Question 44: Dark mode improves:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Server speed', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 44;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Eye comfort', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 44;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'UX performance', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 44;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Button color', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 44;

-- Question 45: Progress bars improve UX by:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Slowing down interaction', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 45;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Showing status of actions', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 45;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Filling screen', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 45;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Using animations', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 45;

-- Question 46: Skeleton screens are:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Debug tools', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 46;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Placeholder for content loading', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 46;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Wireframes', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 46;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Final design', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 46;

-- Question 47: Hamburger menu is:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'A type of layout icon', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 47;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'A user avatar', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 47;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'A font', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 47;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'A plugin', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 47;

-- Question 48: Which is NOT part of UI/UX testing?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Click tracking', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 48;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'Load testing', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 48;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Heatmaps', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 48;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'User feedback', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 48;

-- Question 49: Inclusive design means:
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'Only mobile users', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 49;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'All user types, including those with disabilities', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 49;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'Specific gender', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 49;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'Only for iOS', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 49;

-- Question 50: Why are onboarding screens important?
INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 1, 'For payment', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 50;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 2, 'To introduce app features to new users', true
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 50;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 3, 'To style font', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 50;

INSERT INTO question_options (question_id, option_number, option_text, is_correct)
SELECT eq.id, 4, 'To test backend', false
FROM exam_questions eq 
JOIN ui_ux_exams e ON eq.exam_id = e.id 
WHERE e.is_active = true AND eq.question_number = 50;
