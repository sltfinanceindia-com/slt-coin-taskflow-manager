-- Update all exam questions with the proper UI/UX content
-- Part A: Fundamentals (1-15)
UPDATE exam_questions SET question_text = 'What does UX stand for?' WHERE question_number = 1;
UPDATE exam_questions SET question_text = 'What does UI stand for?' WHERE question_number = 2;
UPDATE exam_questions SET question_text = 'The main goal of UX is to:' WHERE question_number = 3;
UPDATE exam_questions SET question_text = 'Which of these is a UI element?' WHERE question_number = 4;
UPDATE exam_questions SET question_text = 'What is wireframing in UI/UX?' WHERE question_number = 5;
UPDATE exam_questions SET question_text = 'What is a prototype?' WHERE question_number = 6;
UPDATE exam_questions SET question_text = 'A persona is:' WHERE question_number = 7;
UPDATE exam_questions SET question_text = 'Which tool is mainly used for UI design?' WHERE question_number = 8;
UPDATE exam_questions SET question_text = 'UX design primarily focuses on:' WHERE question_number = 9;
UPDATE exam_questions SET question_text = 'UI design focuses on:' WHERE question_number = 10;
UPDATE exam_questions SET question_text = 'Good UX should be:' WHERE question_number = 11;
UPDATE exam_questions SET question_text = 'Which of these improves UX?' WHERE question_number = 12;
UPDATE exam_questions SET question_text = 'Which of the following is a low-fidelity design format?' WHERE question_number = 13;
UPDATE exam_questions SET question_text = 'Navigation in UX should be:' WHERE question_number = 14;
UPDATE exam_questions SET question_text = 'The ideal number of font families in a UI should be:' WHERE question_number = 15;

-- Part B: Principles & Laws (16-30)
UPDATE exam_questions SET question_text = 'Hick''s Law in UX means:' WHERE question_number = 16;
UPDATE exam_questions SET question_text = 'Fitts''s Law refers to:' WHERE question_number = 17;
UPDATE exam_questions SET question_text = 'Jakob''s Law states that:' WHERE question_number = 18;
UPDATE exam_questions SET question_text = 'Which is a UX heuristic?' WHERE question_number = 19;
UPDATE exam_questions SET question_text = 'Aesthetic-Usability Effect means:' WHERE question_number = 20;
UPDATE exam_questions SET question_text = 'Which UX law relates to mental load?' WHERE question_number = 21;
UPDATE exam_questions SET question_text = 'Which one improves accessibility?' WHERE question_number = 22;
UPDATE exam_questions SET question_text = 'Consistency principle means:' WHERE question_number = 23;
UPDATE exam_questions SET question_text = 'Which principle helps avoid errors?' WHERE question_number = 24;
UPDATE exam_questions SET question_text = 'Feedback in UX means:' WHERE question_number = 25;
UPDATE exam_questions SET question_text = 'Law of Proximity states that:' WHERE question_number = 26;
UPDATE exam_questions SET question_text = 'Which UX law affects choices?' WHERE question_number = 27;
UPDATE exam_questions SET question_text = 'Affordance in UI means:' WHERE question_number = 28;
UPDATE exam_questions SET question_text = 'Which principle encourages immediate visual updates?' WHERE question_number = 29;
UPDATE exam_questions SET question_text = 'UX rule: Reduce ____ to increase usability.' WHERE question_number = 30;

-- Part C: Tools & Processes (31-40)
UPDATE exam_questions SET question_text = 'Which of these is a prototyping tool?' WHERE question_number = 31;
UPDATE exam_questions SET question_text = 'Which is not a design tool?' WHERE question_number = 32;
UPDATE exam_questions SET question_text = 'What does A/B Testing mean?' WHERE question_number = 33;
UPDATE exam_questions SET question_text = 'What is the purpose of a mood board?' WHERE question_number = 34;
UPDATE exam_questions SET question_text = 'User interviews are used for:' WHERE question_number = 35;
UPDATE exam_questions SET question_text = 'Journey maps show:' WHERE question_number = 36;
UPDATE exam_questions SET question_text = 'A sitemap is a:' WHERE question_number = 37;
UPDATE exam_questions SET question_text = 'Usability testing checks:' WHERE question_number = 38;
UPDATE exam_questions SET question_text = 'Heatmaps help track:' WHERE question_number = 39;
UPDATE exam_questions SET question_text = 'Card sorting helps with:' WHERE question_number = 40;

-- Part D: Practical Application (41-50)
UPDATE exam_questions SET question_text = 'What is microcopy in UX?' WHERE question_number = 41;
UPDATE exam_questions SET question_text = 'What are microinteractions?' WHERE question_number = 42;
UPDATE exam_questions SET question_text = 'Responsive design adapts to:' WHERE question_number = 43;
UPDATE exam_questions SET question_text = 'Dark mode improves:' WHERE question_number = 44;
UPDATE exam_questions SET question_text = 'Progress bars improve UX by:' WHERE question_number = 45;
UPDATE exam_questions SET question_text = 'Skeleton screens are:' WHERE question_number = 46;
UPDATE exam_questions SET question_text = 'Hamburger menu is:' WHERE question_number = 47;
UPDATE exam_questions SET question_text = 'Which is NOT part of UI/UX testing?' WHERE question_number = 48;
UPDATE exam_questions SET question_text = 'Inclusive design means:' WHERE question_number = 49;
UPDATE exam_questions SET question_text = 'Why are onboarding screens important?' WHERE question_number = 50;

-- Now update all the options with proper text and correct answers
-- Question 1: What does UX stand for? (Answer: C)
UPDATE question_options SET option_text = 'User Xperience', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 1) AND option_number = 0;
UPDATE question_options SET option_text = 'Ultimate Experience', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 1) AND option_number = 1;
UPDATE question_options SET option_text = 'User Experience', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 1) AND option_number = 2;
UPDATE question_options SET option_text = 'Useful Experience', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 1) AND option_number = 3;

-- Question 2: What does UI stand for? (Answer: C)
UPDATE question_options SET option_text = 'User Intelligence', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 2) AND option_number = 0;
UPDATE question_options SET option_text = 'Uniform Interface', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 2) AND option_number = 1;
UPDATE question_options SET option_text = 'User Interface', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 2) AND option_number = 2;
UPDATE question_options SET option_text = 'Universal Interface', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 2) AND option_number = 3;

-- Question 3: The main goal of UX is to: (Answer: C)
UPDATE question_options SET option_text = 'Make apps look colorful', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 3) AND option_number = 0;
UPDATE question_options SET option_text = 'Improve backend performance', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 3) AND option_number = 1;
UPDATE question_options SET option_text = 'Enhance user satisfaction', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 3) AND option_number = 2;
UPDATE question_options SET option_text = 'Increase app size', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 3) AND option_number = 3;

-- Question 4: Which of these is a UI element? (Answer: B)
UPDATE question_options SET option_text = 'Server', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 4) AND option_number = 0;
UPDATE question_options SET option_text = 'Button', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 4) AND option_number = 1;
UPDATE question_options SET option_text = 'API', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 4) AND option_number = 2;
UPDATE question_options SET option_text = 'Database', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 4) AND option_number = 3;

-- Question 5: What is wireframing in UI/UX? (Answer: B)
UPDATE question_options SET option_text = 'Designing with wires', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 5) AND option_number = 0;
UPDATE question_options SET option_text = 'Creating low-fidelity layouts', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 5) AND option_number = 1;
UPDATE question_options SET option_text = 'Final UI design', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 5) AND option_number = 2;
UPDATE question_options SET option_text = 'Animation of UI', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 5) AND option_number = 3;

-- Question 6: What is a prototype? (Answer: C)
UPDATE question_options SET option_text = 'Final code version', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 6) AND option_number = 0;
UPDATE question_options SET option_text = 'Backend logic', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 6) AND option_number = 1;
UPDATE question_options SET option_text = 'Interactive design preview', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 6) AND option_number = 2;
UPDATE question_options SET option_text = 'Database schema', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 6) AND option_number = 3;

-- Question 7: A persona is: (Answer: C)
UPDATE question_options SET option_text = 'A real user''s photo', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 7) AND option_number = 0;
UPDATE question_options SET option_text = 'A sample database', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 7) AND option_number = 1;
UPDATE question_options SET option_text = 'Fictional user representation', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 7) AND option_number = 2;
UPDATE question_options SET option_text = 'Font style', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 7) AND option_number = 3;

-- Question 8: Which tool is mainly used for UI design? (Answer: B)
UPDATE question_options SET option_text = 'Firebase', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 8) AND option_number = 0;
UPDATE question_options SET option_text = 'Figma', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 8) AND option_number = 1;
UPDATE question_options SET option_text = 'MySQL', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 8) AND option_number = 2;
UPDATE question_options SET option_text = 'Node.js', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 8) AND option_number = 3;

-- Question 9: UX design primarily focuses on: (Answer: A)
UPDATE question_options SET option_text = 'User journey and interactions', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 9) AND option_number = 0;
UPDATE question_options SET option_text = 'Bright colors', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 9) AND option_number = 1;
UPDATE question_options SET option_text = 'Code logic', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 9) AND option_number = 2;
UPDATE question_options SET option_text = 'File storage', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 9) AND option_number = 3;

-- Question 10: UI design focuses on: (Answer: B)
UPDATE question_options SET option_text = 'Navigation speed', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 10) AND option_number = 0;
UPDATE question_options SET option_text = 'Interface visuals', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 10) AND option_number = 1;
UPDATE question_options SET option_text = 'API endpoints', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 10) AND option_number = 2;
UPDATE question_options SET option_text = 'Business logic', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 10) AND option_number = 3;

-- Question 11: Good UX should be: (Answer: B)
UPDATE question_options SET option_text = 'Developer-friendly', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 11) AND option_number = 0;
UPDATE question_options SET option_text = 'User-centered', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 11) AND option_number = 1;
UPDATE question_options SET option_text = 'Business-focused only', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 11) AND option_number = 2;
UPDATE question_options SET option_text = 'Code-heavy', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 11) AND option_number = 3;

-- Question 12: Which of these improves UX? (Answer: A)
UPDATE question_options SET option_text = 'Clear instructions', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 12) AND option_number = 0;
UPDATE question_options SET option_text = 'Multiple clicks for every action', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 12) AND option_number = 1;
UPDATE question_options SET option_text = 'Hidden features', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 12) AND option_number = 2;
UPDATE question_options SET option_text = 'Fancy animations only', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 12) AND option_number = 3;

-- Question 13: Which of the following is a low-fidelity design format? (Answer: B)
UPDATE question_options SET option_text = 'Final HTML', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 13) AND option_number = 0;
UPDATE question_options SET option_text = 'Wireframe', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 13) AND option_number = 1;
UPDATE question_options SET option_text = 'Prototyped animation', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 13) AND option_number = 2;
UPDATE question_options SET option_text = 'CSS', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 13) AND option_number = 3;

-- Question 14: Navigation in UX should be: (Answer: B)
UPDATE question_options SET option_text = 'Complicated', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 14) AND option_number = 0;
UPDATE question_options SET option_text = 'Simple and intuitive', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 14) AND option_number = 1;
UPDATE question_options SET option_text = 'Script-based', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 14) AND option_number = 2;
UPDATE question_options SET option_text = 'Long scroll', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 14) AND option_number = 3;

-- Question 15: The ideal number of font families in a UI should be: (Answer: B)
UPDATE question_options SET option_text = '4', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 15) AND option_number = 0;
UPDATE question_options SET option_text = '1 or 2', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 15) AND option_number = 1;
UPDATE question_options SET option_text = '6', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 15) AND option_number = 2;
UPDATE question_options SET option_text = '10', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 15) AND option_number = 3;

-- Question 16: Hick's Law in UX means: (Answer: B)
UPDATE question_options SET option_text = 'More options = faster decisions', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 16) AND option_number = 0;
UPDATE question_options SET option_text = 'More options = slower decisions', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 16) AND option_number = 1;
UPDATE question_options SET option_text = 'More fonts = better UI', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 16) AND option_number = 2;
UPDATE question_options SET option_text = 'Less feedback = good UX', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 16) AND option_number = 3;

-- Question 17: Fitts's Law refers to: (Answer: B)
UPDATE question_options SET option_text = 'Button shape', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 17) AND option_number = 0;
UPDATE question_options SET option_text = 'Size and distance affect click speed', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 17) AND option_number = 1;
UPDATE question_options SET option_text = 'Feedback tone', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 17) AND option_number = 2;
UPDATE question_options SET option_text = 'Color brightness', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 17) AND option_number = 3;

-- Question 18: Jakob's Law states that: (Answer: B)
UPDATE question_options SET option_text = 'Users like new UIs', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 18) AND option_number = 0;
UPDATE question_options SET option_text = 'Users prefer familiar design patterns', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 18) AND option_number = 1;
UPDATE question_options SET option_text = 'Users hate menus', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 18) AND option_number = 2;
UPDATE question_options SET option_text = 'More animations are good', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 18) AND option_number = 3;

-- Question 19: Which is a UX heuristic? (Answer: B)
UPDATE question_options SET option_text = 'Use of dark theme', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 19) AND option_number = 0;
UPDATE question_options SET option_text = 'Visibility of system status', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 19) AND option_number = 1;
UPDATE question_options SET option_text = 'CSS variables', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 19) AND option_number = 2;
UPDATE question_options SET option_text = 'Using React', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 19) AND option_number = 3;

-- Question 20: Aesthetic-Usability Effect means: (Answer: B)
UPDATE question_options SET option_text = 'Ugly UI works better', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 20) AND option_number = 0;
UPDATE question_options SET option_text = 'Beautiful interfaces are perceived as more usable', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 20) AND option_number = 1;
UPDATE question_options SET option_text = 'Beautiful UIs are harder', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 20) AND option_number = 2;
UPDATE question_options SET option_text = 'Simple UI means poor UX', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 20) AND option_number = 3;

-- Question 21: Which UX law relates to mental load? (Answer: B)
UPDATE question_options SET option_text = 'Law of Proximity', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 21) AND option_number = 0;
UPDATE question_options SET option_text = 'Miller''s Law', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 21) AND option_number = 1;
UPDATE question_options SET option_text = 'Newton''s Law', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 21) AND option_number = 2;
UPDATE question_options SET option_text = 'Affordance', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 21) AND option_number = 3;

-- Question 22: Which one improves accessibility? (Answer: B)
UPDATE question_options SET option_text = 'Red on black', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 22) AND option_number = 0;
UPDATE question_options SET option_text = 'Color contrast ratios', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 22) AND option_number = 1;
UPDATE question_options SET option_text = 'Brightness', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 22) AND option_number = 2;
UPDATE question_options SET option_text = 'Multiple animations', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 22) AND option_number = 3;

-- Question 23: Consistency principle means: (Answer: C)
UPDATE question_options SET option_text = 'Using random layouts', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 23) AND option_number = 0;
UPDATE question_options SET option_text = 'Repeating UI elements in different ways', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 23) AND option_number = 1;
UPDATE question_options SET option_text = 'Making similar things look and behave the same', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 23) AND option_number = 2;
UPDATE question_options SET option_text = 'Designing without research', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 23) AND option_number = 3;

-- Question 24: Which principle helps avoid errors? (Answer: B)
UPDATE question_options SET option_text = 'Visibility', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 24) AND option_number = 0;
UPDATE question_options SET option_text = 'Constraints', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 24) AND option_number = 1;
UPDATE question_options SET option_text = 'Personalization', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 24) AND option_number = 2;
UPDATE question_options SET option_text = 'Animation', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 24) AND option_number = 3;

-- Question 25: Feedback in UX means: (Answer: B)
UPDATE question_options SET option_text = 'Animation speed', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 25) AND option_number = 0;
UPDATE question_options SET option_text = 'System responds to user action', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 25) AND option_number = 1;
UPDATE question_options SET option_text = 'Input validation', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 25) AND option_number = 2;
UPDATE question_options SET option_text = 'System restart', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 25) AND option_number = 3;

-- Question 26: Law of Proximity states that: (Answer: A)
UPDATE question_options SET option_text = 'Nearby elements are perceived as related', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 26) AND option_number = 0;
UPDATE question_options SET option_text = 'Fast pages are better', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 26) AND option_number = 1;
UPDATE question_options SET option_text = 'Buttons must be red', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 26) AND option_number = 2;
UPDATE question_options SET option_text = 'Bold font is best', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 26) AND option_number = 3;

-- Question 27: Which UX law affects choices? (Answer: C)
UPDATE question_options SET option_text = 'Law of Closure', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 27) AND option_number = 0;
UPDATE question_options SET option_text = 'Law of Similarity', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 27) AND option_number = 1;
UPDATE question_options SET option_text = 'Hick''s Law', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 27) AND option_number = 2;
UPDATE question_options SET option_text = 'Law of Color', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 27) AND option_number = 3;

-- Question 28: Affordance in UI means: (Answer: B)
UPDATE question_options SET option_text = 'Expensive UI', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 28) AND option_number = 0;
UPDATE question_options SET option_text = 'Visual clue about how an element behaves', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 28) AND option_number = 1;
UPDATE question_options SET option_text = 'Motion design', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 28) AND option_number = 2;
UPDATE question_options SET option_text = 'Data flow', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 28) AND option_number = 3;

-- Question 29: Which principle encourages immediate visual updates? (Answer: A)
UPDATE question_options SET option_text = 'Visibility', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 29) AND option_number = 0;
UPDATE question_options SET option_text = 'Animation', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 29) AND option_number = 1;
UPDATE question_options SET option_text = 'UX writing', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 29) AND option_number = 2;
UPDATE question_options SET option_text = 'Typography', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 29) AND option_number = 3;

-- Question 30: UX rule: Reduce ____ to increase usability. (Answer: B)
UPDATE question_options SET option_text = 'White space', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 30) AND option_number = 0;
UPDATE question_options SET option_text = 'Load time', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 30) AND option_number = 1;
UPDATE question_options SET option_text = 'Button size', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 30) AND option_number = 2;
UPDATE question_options SET option_text = 'Font', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 30) AND option_number = 3;

-- Question 31: Which of these is a prototyping tool? (Answer: B)
UPDATE question_options SET option_text = 'MySQL', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 31) AND option_number = 0;
UPDATE question_options SET option_text = 'InVision', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 31) AND option_number = 1;
UPDATE question_options SET option_text = 'Firebase', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 31) AND option_number = 2;
UPDATE question_options SET option_text = 'Redis', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 31) AND option_number = 3;

-- Question 32: Which is not a design tool? (Answer: D)
UPDATE question_options SET option_text = 'Figma', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 32) AND option_number = 0;
UPDATE question_options SET option_text = 'Adobe XD', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 32) AND option_number = 1;
UPDATE question_options SET option_text = 'Canva', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 32) AND option_number = 2;
UPDATE question_options SET option_text = 'Firebase', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 32) AND option_number = 3;

-- Question 33: What does A/B Testing mean? (Answer: B)
UPDATE question_options SET option_text = 'Testing colors', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 33) AND option_number = 0;
UPDATE question_options SET option_text = 'Testing layouts on different users', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 33) AND option_number = 1;
UPDATE question_options SET option_text = 'Performance testing', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 33) AND option_number = 2;
UPDATE question_options SET option_text = 'Source code testing', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 33) AND option_number = 3;

-- Question 34: What is the purpose of a mood board? (Answer: B)
UPDATE question_options SET option_text = 'Store database info', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 34) AND option_number = 0;
UPDATE question_options SET option_text = 'Collect visual inspiration', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 34) AND option_number = 1;
UPDATE question_options SET option_text = 'Backend design', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 34) AND option_number = 2;
UPDATE question_options SET option_text = 'Code testing', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 34) AND option_number = 3;

-- Question 35: User interviews are used for: (Answer: C)
UPDATE question_options SET option_text = 'Hiring', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 35) AND option_number = 0;
UPDATE question_options SET option_text = 'Backend analysis', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 35) AND option_number = 1;
UPDATE question_options SET option_text = 'UX research', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 35) AND option_number = 2;
UPDATE question_options SET option_text = 'Code review', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 35) AND option_number = 3;

-- Question 36: Journey maps show: (Answer: C)
UPDATE question_options SET option_text = 'Roadmaps', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 36) AND option_number = 0;
UPDATE question_options SET option_text = 'Navigation design', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 36) AND option_number = 1;
UPDATE question_options SET option_text = 'User steps during interaction', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 36) AND option_number = 2;
UPDATE question_options SET option_text = 'Payment flows', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 36) AND option_number = 3;

-- Question 37: A sitemap is a: (Answer: B)
UPDATE question_options SET option_text = 'Data map', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 37) AND option_number = 0;
UPDATE question_options SET option_text = 'Map of pages and structure', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 37) AND option_number = 1;
UPDATE question_options SET option_text = 'Login design', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 37) AND option_number = 2;
UPDATE question_options SET option_text = 'Cookie file', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 37) AND option_number = 3;

-- Question 38: Usability testing checks: (Answer: B)
UPDATE question_options SET option_text = 'Server response', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 38) AND option_number = 0;
UPDATE question_options SET option_text = 'User interactions with UI', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 38) AND option_number = 1;
UPDATE question_options SET option_text = 'Load time only', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 38) AND option_number = 2;
UPDATE question_options SET option_text = 'Coding errors', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 38) AND option_number = 3;

-- Question 39: Heatmaps help track: (Answer: B)
UPDATE question_options SET option_text = 'Database errors', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 39) AND option_number = 0;
UPDATE question_options SET option_text = 'User click behavior', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 39) AND option_number = 1;
UPDATE question_options SET option_text = 'CPU temperature', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 39) AND option_number = 2;
UPDATE question_options SET option_text = 'API logs', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 39) AND option_number = 3;

-- Question 40: Card sorting helps with: (Answer: B)
UPDATE question_options SET option_text = 'Frontend animation', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 40) AND option_number = 0;
UPDATE question_options SET option_text = 'Navigation structure', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 40) AND option_number = 1;
UPDATE question_options SET option_text = 'Server logic', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 40) AND option_number = 2;
UPDATE question_options SET option_text = 'Database sorting', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 40) AND option_number = 3;

-- Question 41: What is microcopy in UX? (Answer: B)
UPDATE question_options SET option_text = 'Paragraphs in blogs', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 41) AND option_number = 0;
UPDATE question_options SET option_text = 'Short helpful text in UI', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 41) AND option_number = 1;
UPDATE question_options SET option_text = 'Font size', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 41) AND option_number = 2;
UPDATE question_options SET option_text = 'Coding script', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 41) AND option_number = 3;

-- Question 42: What are microinteractions? (Answer: B)
UPDATE question_options SET option_text = 'Large animations', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 42) AND option_number = 0;
UPDATE question_options SET option_text = 'Small feedback events (like toggles)', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 42) AND option_number = 1;
UPDATE question_options SET option_text = 'Database actions', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 42) AND option_number = 2;
UPDATE question_options SET option_text = 'API errors', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 42) AND option_number = 3;

-- Question 43: Responsive design adapts to: (Answer: B)
UPDATE question_options SET option_text = 'Server speed', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 43) AND option_number = 0;
UPDATE question_options SET option_text = 'Screen sizes', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 43) AND option_number = 1;
UPDATE question_options SET option_text = 'Keyboard', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 43) AND option_number = 2;
UPDATE question_options SET option_text = 'Fonts', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 43) AND option_number = 3;

-- Question 44: Dark mode improves: (Answer: B)
UPDATE question_options SET option_text = 'Server speed', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 44) AND option_number = 0;
UPDATE question_options SET option_text = 'Eye comfort', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 44) AND option_number = 1;
UPDATE question_options SET option_text = 'UX performance', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 44) AND option_number = 2;
UPDATE question_options SET option_text = 'Button color', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 44) AND option_number = 3;

-- Question 45: Progress bars improve UX by: (Answer: B)
UPDATE question_options SET option_text = 'Slowing down interaction', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 45) AND option_number = 0;
UPDATE question_options SET option_text = 'Showing status of actions', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 45) AND option_number = 1;
UPDATE question_options SET option_text = 'Filling screen', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 45) AND option_number = 2;
UPDATE question_options SET option_text = 'Using animations', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 45) AND option_number = 3;

-- Question 46: Skeleton screens are: (Answer: B)
UPDATE question_options SET option_text = 'Debug tools', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 46) AND option_number = 0;
UPDATE question_options SET option_text = 'Placeholder for content loading', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 46) AND option_number = 1;
UPDATE question_options SET option_text = 'Wireframes', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 46) AND option_number = 2;
UPDATE question_options SET option_text = 'Final design', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 46) AND option_number = 3;

-- Question 47: Hamburger menu is: (Answer: A)
UPDATE question_options SET option_text = 'A type of layout icon', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 47) AND option_number = 0;
UPDATE question_options SET option_text = 'A user avatar', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 47) AND option_number = 1;
UPDATE question_options SET option_text = 'A font', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 47) AND option_number = 2;
UPDATE question_options SET option_text = 'A plugin', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 47) AND option_number = 3;

-- Question 48: Which is NOT part of UI/UX testing? (Answer: B)
UPDATE question_options SET option_text = 'Click tracking', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 48) AND option_number = 0;
UPDATE question_options SET option_text = 'Load testing', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 48) AND option_number = 1;
UPDATE question_options SET option_text = 'Heatmaps', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 48) AND option_number = 2;
UPDATE question_options SET option_text = 'User feedback', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 48) AND option_number = 3;

-- Question 49: Inclusive design means: (Answer: B)
UPDATE question_options SET option_text = 'Only mobile users', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 49) AND option_number = 0;
UPDATE question_options SET option_text = 'All user types, including those with disabilities', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 49) AND option_number = 1;
UPDATE question_options SET option_text = 'Specific gender', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 49) AND option_number = 2;
UPDATE question_options SET option_text = 'Only for iOS', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 49) AND option_number = 3;

-- Question 50: Why are onboarding screens important? (Answer: B)
UPDATE question_options SET option_text = 'For payment', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 50) AND option_number = 0;
UPDATE question_options SET option_text = 'To introduce app features to new users', is_correct = true WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 50) AND option_number = 1;
UPDATE question_options SET option_text = 'To style font', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 50) AND option_number = 2;
UPDATE question_options SET option_text = 'To test backend', is_correct = false WHERE question_id = (SELECT id FROM exam_questions WHERE question_number = 50) AND option_number = 3;