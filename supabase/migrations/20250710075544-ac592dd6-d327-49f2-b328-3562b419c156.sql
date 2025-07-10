
-- Complete the insertion of all 50 UI/UX exam questions
DO $$
DECLARE
  exam_uuid UUID;
  question_uuid UUID;
BEGIN
  SELECT id INTO exam_uuid FROM public.ui_ux_exams WHERE title = 'UI/UX Module Test';
  
  -- Delete existing questions to avoid duplicates
  DELETE FROM public.question_options WHERE question_id IN (
    SELECT id FROM public.exam_questions WHERE exam_id = exam_uuid
  );
  DELETE FROM public.exam_questions WHERE exam_id = exam_uuid;
  
  -- Insert all 50 questions with their options
  
  -- Question 1
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 1, 'What does UX stand for?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'User Xperience', false),
    (question_uuid, 1, 'Ultimate Experience', false),
    (question_uuid, 2, 'User Experience', true),
    (question_uuid, 3, 'Useful Experience', false);

  -- Question 2
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 2, 'What does UI stand for?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'User Intelligence', false),
    (question_uuid, 1, 'Uniform Interface', false),
    (question_uuid, 2, 'User Interface', true),
    (question_uuid, 3, 'Universal Interface', false);

  -- Question 3
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 3, 'The main goal of UX is to:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Make apps look colorful', false),
    (question_uuid, 1, 'Improve backend performance', false),
    (question_uuid, 2, 'Enhance user satisfaction', true),
    (question_uuid, 3, 'Increase app size', false);

  -- Question 4
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 4, 'Which of these is a UI element?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Server', false),
    (question_uuid, 1, 'Button', true),
    (question_uuid, 2, 'API', false),
    (question_uuid, 3, 'Database', false);

  -- Question 5
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 5, 'What is wireframing in UI/UX?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Designing with wires', false),
    (question_uuid, 1, 'Creating low-fidelity layouts', true),
    (question_uuid, 2, 'Final UI design', false),
    (question_uuid, 3, 'Animation of UI', false);

  -- Question 6
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 6, 'What is a prototype?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Final code version', false),
    (question_uuid, 1, 'Backend logic', false),
    (question_uuid, 2, 'Interactive design preview', true),
    (question_uuid, 3, 'Database schema', false);

  -- Question 7
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 7, 'A persona is:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'A real users photo', false),
    (question_uuid, 1, 'A sample database', false),
    (question_uuid, 2, 'Fictional user representation', true),
    (question_uuid, 3, 'Font style', false);

  -- Question 8
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 8, 'Which tool is mainly used for UI design?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Firebase', false),
    (question_uuid, 1, 'Figma', true),
    (question_uuid, 2, 'MySQL', false),
    (question_uuid, 3, 'Node.js', false);

  -- Question 9
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 9, 'UX design primarily focuses on:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'User journey and interactions', true),
    (question_uuid, 1, 'Bright colors', false),
    (question_uuid, 2, 'Code logic', false),
    (question_uuid, 3, 'File storage', false);

  -- Question 10
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 10, 'UI design focuses on:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Navigation speed', false),
    (question_uuid, 1, 'Interface visuals', true),
    (question_uuid, 2, 'API endpoints', false),
    (question_uuid, 3, 'Business logic', false);

  -- Question 11
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 11, 'Good UX should be:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Developer-friendly', false),
    (question_uuid, 1, 'User-centered', true),
    (question_uuid, 2, 'Business-focused only', false),
    (question_uuid, 3, 'Code-heavy', false);

  -- Question 12
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 12, 'Which of these improves UX?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Clear instructions', true),
    (question_uuid, 1, 'Multiple clicks for every action', false),
    (question_uuid, 2, 'Hidden features', false),
    (question_uuid, 3, 'Fancy animations only', false);

  -- Question 13
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 13, 'Which of the following is a low-fidelity design format?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Final HTML', false),
    (question_uuid, 1, 'Wireframe', true),
    (question_uuid, 2, 'Prototyped animation', false),
    (question_uuid, 3, 'CSS', false);

  -- Question 14
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 14, 'Navigation in UX should be:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Complicated', false),
    (question_uuid, 1, 'Simple and intuitive', true),
    (question_uuid, 2, 'Script-based', false),
    (question_uuid, 3, 'Long scroll', false);

  -- Question 15
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 15, 'The ideal number of font families in a UI should be:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, '4', false),
    (question_uuid, 1, '1 or 2', true),
    (question_uuid, 2, '6', false),
    (question_uuid, 3, '10', false);

  -- Question 16
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 16, 'Hicks Law in UX means:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'More options = faster decisions', false),
    (question_uuid, 1, 'More options = slower decisions', true),
    (question_uuid, 2, 'More fonts = better UI', false),
    (question_uuid, 3, 'Less feedback = good UX', false);

  -- Question 17
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 17, 'Fitts Law refers to:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Button shape', false),
    (question_uuid, 1, 'Size and distance affect click speed', true),
    (question_uuid, 2, 'Feedback tone', false),
    (question_uuid, 3, 'Color brightness', false);

  -- Question 18
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 18, 'Jakobs Law states that:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Users like new UIs', false),
    (question_uuid, 1, 'Users prefer familiar design patterns', true),
    (question_uuid, 2, 'Users hate menus', false),
    (question_uuid, 3, 'More animations are good', false);

  -- Question 19
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 19, 'Which is a UX heuristic?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Use of dark theme', false),
    (question_uuid, 1, 'Visibility of system status', true),
    (question_uuid, 2, 'CSS variables', false),
    (question_uuid, 3, 'Using React', false);

  -- Question 20
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 20, 'Aesthetic-Usability Effect means:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Ugly UI works better', false),
    (question_uuid, 1, 'Beautiful interfaces are perceived as more usable', true),
    (question_uuid, 2, 'Beautiful UIs are harder', false),
    (question_uuid, 3, 'Simple UI means poor UX', false);

  -- Question 21
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 21, 'Which UX law relates to mental load?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Law of Proximity', false),
    (question_uuid, 1, 'Millers Law', true),
    (question_uuid, 2, 'Newtons Law', false),
    (question_uuid, 3, 'Affordance', false);

  -- Question 22
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 22, 'Which one improves accessibility?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Red on black', false),
    (question_uuid, 1, 'Color contrast ratios', true),
    (question_uuid, 2, 'Brightness', false),
    (question_uuid, 3, 'Multiple animations', false);

  -- Question 23
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 23, 'Consistency principle means:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Using random layouts', false),
    (question_uuid, 1, 'Repeating UI elements in different ways', false),
    (question_uuid, 2, 'Making similar things look and behave the same', true),
    (question_uuid, 3, 'Designing without research', false);

  -- Question 24
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 24, 'Which principle helps avoid errors?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Visibility', false),
    (question_uuid, 1, 'Constraints', true),
    (question_uuid, 2, 'Personalization', false),
    (question_uuid, 3, 'Animation', false);

  -- Question 25
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 25, 'Feedback in UX means:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Animation speed', false),
    (question_uuid, 1, 'System responds to user action', true),
    (question_uuid, 2, 'Input validation', false),
    (question_uuid, 3, 'System restart', false);

  -- Question 26
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 26, 'Law of Proximity states that:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Nearby elements are perceived as related', true),
    (question_uuid, 1, 'Fast pages are better', false),
    (question_uuid, 2, 'Buttons must be red', false),
    (question_uuid, 3, 'Bold font is best', false);

  -- Question 27
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 27, 'Which UX law affects choices?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Law of Closure', false),
    (question_uuid, 1, 'Law of Similarity', false),
    (question_uuid, 2, 'Hicks Law', true),
    (question_uuid, 3, 'Law of Color', false);

  -- Question 28
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 28, 'Affordance in UI means:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Expensive UI', false),
    (question_uuid, 1, 'Visual clue about how an element behaves', true),
    (question_uuid, 2, 'Motion design', false),
    (question_uuid, 3, 'Data flow', false);

  -- Question 29
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 29, 'Which principle encourages immediate visual updates?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Visibility', true),
    (question_uuid, 1, 'Animation', false),
    (question_uuid, 2, 'UX writing', false),
    (question_uuid, 3, 'Typography', false);

  -- Question 30
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 30, 'UX rule: Reduce ____ to increase usability.') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'White space', false),
    (question_uuid, 1, 'Load time', true),
    (question_uuid, 2, 'Button size', false),
    (question_uuid, 3, 'Font', false);

  -- Question 31
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 31, 'Which of these is a prototyping tool?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Photoshop', false),
    (question_uuid, 1, 'InVision', true),
    (question_uuid, 2, 'Excel', false),
    (question_uuid, 3, 'Word', false);

  -- Question 32
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 32, 'Which is not a design tool?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Sketch', false),
    (question_uuid, 1, 'Adobe XD', false),
    (question_uuid, 2, 'Figma', false),
    (question_uuid, 3, 'Firebase', true);

  -- Question 33
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 33, 'What does A/B Testing mean?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Testing with alphabets', false),
    (question_uuid, 1, 'Comparing two design versions', true),
    (question_uuid, 2, 'Testing APIs', false),
    (question_uuid, 3, 'Bug testing', false);

  -- Question 34
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 34, 'What is the purpose of a mood board?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Track emotions', false),
    (question_uuid, 1, 'Visual inspiration and direction', true),
    (question_uuid, 2, 'User feedback', false),
    (question_uuid, 3, 'Code documentation', false);

  -- Question 35
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 35, 'User interviews are used for:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Hiring', false),
    (question_uuid, 1, 'Marketing', false),
    (question_uuid, 2, 'Understanding user needs', true),
    (question_uuid, 3, 'Performance review', false);

  -- Question 36
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 36, 'Journey maps show:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Geographic routes', false),
    (question_uuid, 1, 'Database relationships', false),
    (question_uuid, 2, 'User experience over time', true),
    (question_uuid, 3, 'Code structure', false);

  -- Question 37
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 37, 'A sitemap is a:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Geographic map', false),
    (question_uuid, 1, 'Visual structure of website pages', true),
    (question_uuid, 2, 'Code map', false),
    (question_uuid, 3, 'User location', false);

  -- Question 38
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 38, 'Usability testing checks:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Code quality', false),
    (question_uuid, 1, 'How easy it is to use', true),
    (question_uuid, 2, 'Performance', false),
    (question_uuid, 3, 'Security', false);

  -- Question 39
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 39, 'Heatmaps help track:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Temperature', false),
    (question_uuid, 1, 'User click/scroll behavior', true),
    (question_uuid, 2, 'Performance', false),
    (question_uuid, 3, 'Errors', false);

  -- Question 40
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 40, 'Card sorting helps with:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Playing cards', false),
    (question_uuid, 1, 'Information architecture', true),
    (question_uuid, 2, 'Performance', false),
    (question_uuid, 3, 'Security', false);

  -- Question 41
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 41, 'What is microcopy in UX?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Small fonts', false),
    (question_uuid, 1, 'Short instructional text', true),
    (question_uuid, 2, 'Code comments', false),
    (question_uuid, 3, 'File size', false);

  -- Question 42
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 42, 'What are microinteractions?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Small bugs', false),
    (question_uuid, 1, 'Small engaging UI moments', true),
    (question_uuid, 2, 'API calls', false),
    (question_uuid, 3, 'Database queries', false);

  -- Question 43
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 43, 'Responsive design adapts to:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'User mood', false),
    (question_uuid, 1, 'Different screen sizes', true),
    (question_uuid, 2, 'Server load', false),
    (question_uuid, 3, 'Database changes', false);

  -- Question 44
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 44, 'Dark mode improves:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Performance', false),
    (question_uuid, 1, 'Battery life and eye strain', true),
    (question_uuid, 2, 'Security', false),
    (question_uuid, 3, 'Loading speed', false);

  -- Question 45
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 45, 'Progress bars improve UX by:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Looking cool', false),
    (question_uuid, 1, 'Showing completion status', true),
    (question_uuid, 2, 'Increasing speed', false),
    (question_uuid, 3, 'Reducing errors', false);

  -- Question 46
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 46, 'Skeleton screens are:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Horror UI', false),
    (question_uuid, 1, 'Loading placeholders', true),
    (question_uuid, 2, 'Error pages', false),
    (question_uuid, 3, 'Admin panels', false);

  -- Question 47
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 47, 'Hamburger menu is:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Three horizontal lines menu', true),
    (question_uuid, 1, 'Food ordering', false),
    (question_uuid, 2, 'Error icon', false),
    (question_uuid, 3, 'Loading animation', false);

  -- Question 48
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 48, 'Which is NOT part of UI/UX testing?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Usability testing', false),
    (question_uuid, 1, 'Code testing', true),
    (question_uuid, 2, 'A/B testing', false),
    (question_uuid, 3, 'User interviews', false);

  -- Question 49
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 49, 'Inclusive design means:') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'Expensive design', false),
    (question_uuid, 1, 'Accessible to all users', true),
    (question_uuid, 2, 'Premium features', false),
    (question_uuid, 3, 'Complex interface', false);

  -- Question 50
  INSERT INTO public.exam_questions (exam_id, question_number, question_text) VALUES (exam_uuid, 50, 'Why are onboarding screens important?') RETURNING id INTO question_uuid;
  INSERT INTO public.question_options (question_id, option_number, option_text, is_correct) VALUES 
    (question_uuid, 0, 'They look good', false),
    (question_uuid, 1, 'Help users understand the app', true),
    (question_uuid, 2, 'Increase app size', false),
    (question_uuid, 3, 'Slow down users', false);

  -- Update the total_questions count
  UPDATE public.ui_ux_exams SET total_questions = 50 WHERE id = exam_uuid;
  
END $$;
