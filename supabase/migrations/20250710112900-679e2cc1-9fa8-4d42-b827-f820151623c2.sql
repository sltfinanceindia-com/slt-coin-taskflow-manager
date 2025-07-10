
-- Fix question options from question 26 onwards with proper answer keys
-- First, let's get the exam_id and question IDs for questions 26-50
WITH exam_info AS (
  SELECT id as exam_id FROM ui_ux_exams WHERE is_active = true LIMIT 1
),
question_ids AS (
  SELECT eq.id, eq.question_number, ei.exam_id
  FROM exam_questions eq
  CROSS JOIN exam_info ei
  WHERE eq.exam_id = ei.exam_id AND eq.question_number >= 26
)

-- Update options for question 26: "Law of Proximity states that:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Nearby elements are perceived as related'
  WHEN option_number = 2 THEN 'Fast pages are better'
  WHEN option_number = 3 THEN 'Buttons must be red'
  WHEN option_number = 4 THEN 'Bold font is best'
END,
is_correct = CASE WHEN option_number = 1 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 26);

-- Update options for question 27: "Which UX law affects choices?"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Law of Closure'
  WHEN option_number = 2 THEN 'Law of Similarity'
  WHEN option_number = 3 THEN 'Hick''s Law'
  WHEN option_number = 4 THEN 'Law of Color'
END,
is_correct = CASE WHEN option_number = 3 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 27);

-- Update options for question 28: "Affordance in UI means:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Expensive UI'
  WHEN option_number = 2 THEN 'Visual clue about how an element behaves'
  WHEN option_number = 3 THEN 'Motion design'
  WHEN option_number = 4 THEN 'Data flow'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 28);

-- Update options for question 29: "Which principle encourages immediate visual updates?"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Visibility'
  WHEN option_number = 2 THEN 'Animation'
  WHEN option_number = 3 THEN 'UX writing'
  WHEN option_number = 4 THEN 'Typography'
END,
is_correct = CASE WHEN option_number = 1 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 29);

-- Update options for question 30: "UX rule: Reduce ____ to increase usability."
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'White space'
  WHEN option_number = 2 THEN 'Load time'
  WHEN option_number = 3 THEN 'Button size'
  WHEN option_number = 4 THEN 'Font'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 30);

-- Continue with remaining questions 31-50...
-- Question 31: "Which of these is a prototyping tool?"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'MySQL'
  WHEN option_number = 2 THEN 'InVision'
  WHEN option_number = 3 THEN 'Firebase'
  WHEN option_number = 4 THEN 'Redis'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 31);

-- Question 32: "Which is not a design tool?"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Figma'
  WHEN option_number = 2 THEN 'Adobe XD'
  WHEN option_number = 3 THEN 'Canva'
  WHEN option_number = 4 THEN 'Firebase'
END,
is_correct = CASE WHEN option_number = 4 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 32);

-- Question 33: "What does A/B Testing mean?"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Testing colors'
  WHEN option_number = 2 THEN 'Testing layouts on different users'
  WHEN option_number = 3 THEN 'Performance testing'
  WHEN option_number = 4 THEN 'Source code testing'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 33);

-- Question 34: "What is the purpose of a mood board?"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Store database info'
  WHEN option_number = 2 THEN 'Collect visual inspiration'
  WHEN option_number = 3 THEN 'Backend design'
  WHEN option_number = 4 THEN 'Code testing'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 34);

-- Question 35: "User interviews are used for:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Hiring'
  WHEN option_number = 2 THEN 'Backend analysis'
  WHEN option_number = 3 THEN 'UX research'
  WHEN option_number = 4 THEN 'Code review'
END,
is_correct = CASE WHEN option_number = 3 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 35);

-- Question 36: "Journey maps show:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Roadmaps'
  WHEN option_number = 2 THEN 'Navigation design'
  WHEN option_number = 3 THEN 'User steps during interaction'
  WHEN option_number = 4 THEN 'Payment flows'
END,
is_correct = CASE WHEN option_number = 3 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 36);

-- Question 37: "A sitemap is a:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Data map'
  WHEN option_number = 2 THEN 'Map of pages and structure'
  WHEN option_number = 3 THEN 'Login design'
  WHEN option_number = 4 THEN 'Cookie file'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 37);

-- Question 38: "Usability testing checks:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Server response'
  WHEN option_number = 2 THEN 'User interactions with UI'
  WHEN option_number = 3 THEN 'Load time only'
  WHEN option_number = 4 THEN 'Coding errors'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 38);

-- Question 39: "Heatmaps help track:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Database errors'
  WHEN option_number = 2 THEN 'User click behavior'
  WHEN option_number = 3 THEN 'CPU temperature'
  WHEN option_number = 4 THEN 'API logs'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 39);

-- Question 40: "Card sorting helps with:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Frontend animation'
  WHEN option_number = 2 THEN 'Navigation structure'
  WHEN option_number = 3 THEN 'Server logic'
  WHEN option_number = 4 THEN 'Database sorting'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 40);

-- Question 41: "What is microcopy in UX?"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Paragraphs in blogs'
  WHEN option_number = 2 THEN 'Short helpful text in UI'
  WHEN option_number = 3 THEN 'Font size'
  WHEN option_number = 4 THEN 'Coding script'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 41);

-- Question 42: "What are microinteractions?"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Large animations'
  WHEN option_number = 2 THEN 'Small feedback events (like toggles)'
  WHEN option_number = 3 THEN 'Database actions'
  WHEN option_number = 4 THEN 'API errors'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 42);

-- Question 43: "Responsive design adapts to:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Server speed'
  WHEN option_number = 2 THEN 'Screen sizes'
  WHEN option_number = 3 THEN 'Keyboard'
  WHEN option_number = 4 THEN 'Fonts'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 43);

-- Question 44: "Dark mode improves:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Server speed'
  WHEN option_number = 2 THEN 'Eye comfort'
  WHEN option_number = 3 THEN 'UX performance'
  WHEN option_number = 4 THEN 'Button color'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 44);

-- Question 45: "Progress bars improve UX by:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Slowing down interaction'
  WHEN option_number = 2 THEN 'Showing status of actions'
  WHEN option_number = 3 THEN 'Filling screen'
  WHEN option_number = 4 THEN 'Using animations'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 45);

-- Question 46: "Skeleton screens are:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Debug tools'
  WHEN option_number = 2 THEN 'Placeholder for content loading'
  WHEN option_number = 3 THEN 'Wireframes'
  WHEN option_number = 4 THEN 'Final design'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 46);

-- Question 47: "Hamburger menu is:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'A type of layout icon'
  WHEN option_number = 2 THEN 'A user avatar'
  WHEN option_number = 3 THEN 'A font'
  WHEN option_number = 4 THEN 'A plugin'
END,
is_correct = CASE WHEN option_number = 1 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 47);

-- Question 48: "Which is NOT part of UI/UX testing?"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Click tracking'
  WHEN option_number = 2 THEN 'Load testing'
  WHEN option_number = 3 THEN 'Heatmaps'
  WHEN option_number = 4 THEN 'User feedback'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 48);

-- Question 49: "Inclusive design means:"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'Only mobile users'
  WHEN option_number = 2 THEN 'All user types, including those with disabilities'
  WHEN option_number = 3 THEN 'Specific gender'
  WHEN option_number = 4 THEN 'Only for iOS'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 49);

-- Question 50: "Why are onboarding screens important?"
UPDATE question_options 
SET option_text = CASE 
  WHEN option_number = 1 THEN 'For payment'
  WHEN option_number = 2 THEN 'To introduce app features to new users'
  WHEN option_number = 3 THEN 'To style font'
  WHEN option_number = 4 THEN 'To test backend'
END,
is_correct = CASE WHEN option_number = 2 THEN true ELSE false END
WHERE question_id = (SELECT id FROM question_ids WHERE question_number = 50);
