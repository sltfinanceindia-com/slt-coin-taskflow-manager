-- Create assessments for 5 job categories
-- Note: created_by will need to be updated with actual admin user ID after running

-- 1. Operations & Process Analyst (BPO Services)
INSERT INTO public.assessments (title, description, instructions, time_limit_minutes, passing_score, total_questions, is_published, created_by)
VALUES (
  'Operations & Process Analyst (BPO Services)',
  'Assessment for Operations & Process Analyst position in BPO Services',
  'This assessment evaluates your understanding of BPO operations, process optimization, and analytical skills. You have 10 minutes to complete 22 questions. A score of 70% or higher is required to pass.',
  10,
  70,
  22,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- Get the assessment ID for Operations & Process Analyst
DO $$
DECLARE
  ops_assessment_id uuid;
BEGIN
  SELECT id INTO ops_assessment_id FROM public.assessments WHERE title = 'Operations & Process Analyst (BPO Services)';
  
  -- Insert 22 questions for Operations & Process Analyst
  INSERT INTO public.assessment_questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
  (ops_assessment_id, 'What does BPO stand for?', 'Business Process Outsourcing', 'Basic Process Operations', 'Business Protocol Order', 'Business Process Optimization', 'A', 1),
  (ops_assessment_id, 'Which metric measures the percentage of calls answered within a specific time frame?', 'Average Handle Time', 'Service Level', 'First Call Resolution', 'Call Abandonment Rate', 'B', 2),
  (ops_assessment_id, 'What is the primary goal of process mapping?', 'To increase costs', 'To visualize and analyze workflows', 'To reduce staff', 'To eliminate technology', 'B', 3),
  (ops_assessment_id, 'What does KPI stand for?', 'Key Performance Indicator', 'Key Process Information', 'Known Performance Index', 'Key Product Initiative', 'A', 4),
  (ops_assessment_id, 'Which tool is commonly used for process improvement?', 'Six Sigma', 'Microsoft Paint', 'Social Media', 'Video Games', 'A', 5),
  (ops_assessment_id, 'What is the purpose of a Standard Operating Procedure (SOP)?', 'To confuse employees', 'To provide consistent guidelines for tasks', 'To increase complexity', 'To reduce efficiency', 'B', 6),
  (ops_assessment_id, 'What does FCR stand for in BPO?', 'First Call Resolution', 'Fast Call Response', 'Final Customer Review', 'Frequent Call Record', 'A', 7),
  (ops_assessment_id, 'Which of these is a key responsibility of a Process Analyst?', 'Ignoring data', 'Identifying bottlenecks and inefficiencies', 'Avoiding documentation', 'Reducing communication', 'B', 8),
  (ops_assessment_id, 'What is Average Handle Time (AHT)?', 'Time spent on breaks', 'Average time to resolve a customer interaction', 'Time to start work', 'Time for lunch', 'B', 9),
  (ops_assessment_id, 'What does SLA stand for?', 'Service Level Agreement', 'Standard Labor Act', 'System Level Analysis', 'Service Login Authorization', 'A', 10),
  (ops_assessment_id, 'Which methodology focuses on eliminating waste?', 'Lean Management', 'Wasteful Management', 'Random Management', 'Chaos Theory', 'A', 11),
  (ops_assessment_id, 'What is a process flowchart used for?', 'Drawing pictures', 'Mapping sequential steps in a process', 'Creating art', 'Entertainment', 'B', 12),
  (ops_assessment_id, 'What does CSAT measure?', 'Customer Satisfaction', 'Call Service Time', 'Company Sales Target', 'Customer Service Alert', 'A', 13),
  (ops_assessment_id, 'Which of these is a common BPO service?', 'Customer Support', 'Manufacturing Cars', 'Building Houses', 'Cooking Food', 'A', 14),
  (ops_assessment_id, 'What is the purpose of root cause analysis?', 'To identify symptoms only', 'To find the underlying cause of problems', 'To ignore issues', 'To create more problems', 'B', 15),
  (ops_assessment_id, 'What does WFM stand for in BPO?', 'Workforce Management', 'Work From Monday', 'Wireless File Management', 'Weekend Force Maintenance', 'A', 16),
  (ops_assessment_id, 'Which metric indicates the percentage of issues resolved on first contact?', 'AHT', 'FCR', 'SLA', 'NPS', 'B', 17),
  (ops_assessment_id, 'What is continuous improvement also known as?', 'Kaizen', 'Regression', 'Stagnation', 'Deterioration', 'A', 18),
  (ops_assessment_id, 'What does NPS stand for?', 'Net Promoter Score', 'New Product Service', 'Network Performance System', 'National Process Standard', 'A', 19),
  (ops_assessment_id, 'Which software type is commonly used for BPO operations?', 'CRM (Customer Relationship Management)', 'Video Games', 'Photo Editors', 'Music Players', 'A', 20),
  (ops_assessment_id, 'What is the purpose of quality assurance in BPO?', 'To increase errors', 'To ensure service standards are met', 'To reduce training', 'To ignore feedback', 'B', 21),
  (ops_assessment_id, 'What does DMAIC stand for in Six Sigma?', 'Define, Measure, Analyze, Improve, Control', 'Do, Make, Act, Implement, Close', 'Data, Money, Analysis, Income, Cost', 'Decide, Monitor, Assess, Ignore, Continue', 'A', 22);
END $$;

-- 2. Marketing & Engagement Specialist
INSERT INTO public.assessments (title, description, instructions, time_limit_minutes, passing_score, total_questions, is_published, created_by)
VALUES (
  'Marketing & Engagement Specialist',
  'Assessment for Marketing & Engagement Specialist position',
  'This assessment evaluates your knowledge of marketing strategies, digital engagement, and customer relationship management. You have 10 minutes to complete 22 questions. A score of 70% or higher is required to pass.',
  10,
  70,
  22,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

DO $$
DECLARE
  marketing_assessment_id uuid;
BEGIN
  SELECT id INTO marketing_assessment_id FROM public.assessments WHERE title = 'Marketing & Engagement Specialist';
  
  INSERT INTO public.assessment_questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
  (marketing_assessment_id, 'What does SEO stand for?', 'Search Engine Optimization', 'Social Engagement Online', 'System Entry Operation', 'Service Enhancement Order', 'A', 1),
  (marketing_assessment_id, 'Which platform is primarily used for B2B marketing?', 'TikTok', 'LinkedIn', 'Snapchat', 'Pinterest', 'B', 2),
  (marketing_assessment_id, 'What does CTA stand for in marketing?', 'Call To Action', 'Customer Transaction Analysis', 'Content Type Article', 'Create Text Advertising', 'A', 3),
  (marketing_assessment_id, 'What is the marketing funnel?', 'A tool for pouring liquids', 'The customer journey from awareness to purchase', 'A type of advertisement', 'A sales report', 'B', 4),
  (marketing_assessment_id, 'What does ROI stand for?', 'Return On Investment', 'Rate Of Interest', 'Revenue Over Income', 'Result Of Implementation', 'A', 5),
  (marketing_assessment_id, 'Which metric measures the cost of acquiring a customer?', 'CAC (Customer Acquisition Cost)', 'ROI', 'CTR', 'CPM', 'A', 6),
  (marketing_assessment_id, 'What is content marketing?', 'Selling products directly', 'Creating valuable content to attract and engage audience', 'Sending spam emails', 'Cold calling', 'B', 7),
  (marketing_assessment_id, 'What does CTR stand for?', 'Click Through Rate', 'Customer Transaction Record', 'Content Type Rating', 'Call Time Response', 'A', 8),
  (marketing_assessment_id, 'Which social media metric indicates content popularity?', 'Engagement Rate', 'File Size', 'Load Time', 'Server Speed', 'A', 9),
  (marketing_assessment_id, 'What is A/B testing?', 'Testing two versions to see which performs better', 'Testing products alphabetically', 'A grading system', 'A type of exam', 'A', 10),
  (marketing_assessment_id, 'What does PPC stand for?', 'Pay Per Click', 'Product Price Comparison', 'Public Privacy Concern', 'Personal Preference Choice', 'A', 11),
  (marketing_assessment_id, 'What is a buyer persona?', 'A fictional character', 'A detailed profile of your ideal customer', 'A sales contract', 'A product feature', 'B', 12),
  (marketing_assessment_id, 'What does CPM stand for in advertising?', 'Cost Per Mile', 'Cost Per Thousand Impressions', 'Customer Product Management', 'Content Publishing Method', 'B', 13),
  (marketing_assessment_id, 'Which metric measures email marketing success?', 'Open Rate', 'File Size', 'Download Speed', 'Server Uptime', 'A', 14),
  (marketing_assessment_id, 'What is influencer marketing?', 'Partnering with influential people to promote products', 'Forcing people to buy', 'Direct sales', 'Cold emailing', 'A', 15),
  (marketing_assessment_id, 'What does UGC stand for?', 'User Generated Content', 'Universal Gaming Console', 'Unified Group Chat', 'Updated Graphics Card', 'A', 16),
  (marketing_assessment_id, 'What is brand awareness?', 'How well consumers recognize your brand', 'A type of advertisement', 'A sales technique', 'A product feature', 'A', 17),
  (marketing_assessment_id, 'What does CRM stand for?', 'Customer Relationship Management', 'Content Resource Manager', 'Corporate Risk Mitigation', 'Creative Resource Marketplace', 'A', 18),
  (marketing_assessment_id, 'What is viral marketing?', 'Marketing that spreads rapidly through sharing', 'Marketing during flu season', 'Computer virus marketing', 'Door-to-door sales', 'A', 19),
  (marketing_assessment_id, 'What does KPI stand for in marketing?', 'Key Performance Indicator', 'Known Product Information', 'Kitchen Preparation Instructions', 'Keyword Priority Index', 'A', 20),
  (marketing_assessment_id, 'What is retargeting?', 'Showing ads to people who visited your site', 'Changing your target market', 'Firing employees', 'Redesigning products', 'A', 21),
  (marketing_assessment_id, 'What does conversion rate measure?', 'Percentage of visitors who complete desired action', 'Currency exchange rate', 'File conversion speed', 'Temperature change', 'A', 22);
END $$;

-- 3. Content Editor / Proofreader
INSERT INTO public.assessments (title, description, instructions, time_limit_minutes, passing_score, total_questions, is_published, created_by)
VALUES (
  'Content Editor / Proofreader',
  'Assessment for Content Editor / Proofreader position',
  'This assessment evaluates your grammar, editing skills, and attention to detail. You have 10 minutes to complete 22 questions. A score of 70% or higher is required to pass.',
  10,
  70,
  22,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

DO $$
DECLARE
  editor_assessment_id uuid;
BEGIN
  SELECT id INTO editor_assessment_id FROM public.assessments WHERE title = 'Content Editor / Proofreader';
  
  INSERT INTO public.assessment_questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
  (editor_assessment_id, 'Which sentence is grammatically correct?', 'The team have finished their work.', 'The team has finished its work.', 'The team have finish their work.', 'The team has finish its work.', 'B', 1),
  (editor_assessment_id, 'What is a dangling modifier?', 'A modifier that clearly modifies a noun', 'A modifier that has no clear subject in the sentence', 'A type of punctuation', 'A writing style', 'B', 2),
  (editor_assessment_id, 'Which is the correct use of "its" vs "it''s"?', 'Its a beautiful day.', 'The dog wagged it''s tail.', 'It''s raining outside.', 'The company lost it''s funding.', 'C', 3),
  (editor_assessment_id, 'What does AP Style stand for?', 'Advanced Publishing Style', 'Associated Press Style', 'Academic Paper Style', 'Automated Proofreading Style', 'B', 4),
  (editor_assessment_id, 'Which is correct?', 'Their going to the store.', 'There going to the store.', 'They''re going to the store.', 'Theyre going to the store.', 'C', 5),
  (editor_assessment_id, 'What is a comma splice?', 'Using commas correctly', 'Joining two independent clauses with only a comma', 'A type of bread', 'A writing tool', 'B', 6),
  (editor_assessment_id, 'Which sentence uses proper parallel structure?', 'She likes reading, writing, and to edit.', 'She likes reading, writing, and editing.', 'She likes to read, writing, and editing.', 'She likes reading, to write, and editing.', 'B', 7),
  (editor_assessment_id, 'What is the Oxford comma?', 'A comma used before "and" in a list', 'A comma used in British English only', 'A comma after introductory phrases', 'A comma in compound sentences', 'A', 8),
  (editor_assessment_id, 'Which is correct?', 'Between you and I', 'Between you and me', 'Between you and myself', 'Between you and we', 'B', 9),
  (editor_assessment_id, 'What does "affect" vs "effect" difference mean?', 'They are the same', 'Affect is usually a verb, effect is usually a noun', 'Affect is a noun, effect is a verb', 'They can be used interchangeably', 'B', 10),
  (editor_assessment_id, 'Which sentence is in active voice?', 'The report was written by Sarah.', 'The meeting was attended by everyone.', 'Sarah wrote the report.', 'The document was reviewed by the team.', 'C', 11),
  (editor_assessment_id, 'What is proofreading?', 'Writing new content', 'Checking for errors in spelling, grammar, and punctuation', 'Designing layouts', 'Publishing content', 'B', 12),
  (editor_assessment_id, 'Which is the correct possessive form?', 'The childrens toys', 'The children''s toys', 'The childrens'' toys', 'The childrens toys''', 'B', 13),
  (editor_assessment_id, 'What does "ensure" vs "insure" mean?', 'They are the same', 'Ensure means to make certain, insure relates to insurance', 'Insure means to make certain, ensure relates to insurance', 'They are both incorrect', 'B', 14),
  (editor_assessment_id, 'Which is correct?', 'I could of done better.', 'I could have done better.', 'I could off done better.', 'I could have did better.', 'B', 15),
  (editor_assessment_id, 'What is a run-on sentence?', 'A sentence that is too short', 'Two or more independent clauses improperly joined', 'A sentence with good flow', 'A type of paragraph', 'B', 16),
  (editor_assessment_id, 'Which is correct?', 'Who''s book is this?', 'Whose book is this?', 'Who is book is this?', 'Whos'' book is this?', 'B', 17),
  (editor_assessment_id, 'What does consistency in style mean?', 'Using random formatting', 'Maintaining uniform formatting and tone throughout', 'Changing styles frequently', 'Ignoring guidelines', 'B', 18),
  (editor_assessment_id, 'Which is correct?', 'Less people attended the meeting.', 'Fewer people attended the meeting.', 'Lesser people attended the meeting.', 'Least people attended the meeting.', 'B', 19),
  (editor_assessment_id, 'What is a sentence fragment?', 'A complete sentence', 'An incomplete sentence missing a subject or verb', 'A long sentence', 'A paragraph', 'B', 20),
  (editor_assessment_id, 'Which is correct?', 'Your going to love this.', 'You''re going to love this.', 'Youre going to love this.', 'Yur going to love this.', 'B', 21),
  (editor_assessment_id, 'What does "principal" vs "principle" mean?', 'They are the same', 'Principal is a person/main thing, principle is a rule', 'Principal is a rule, principle is a person', 'Both are incorrect spellings', 'B', 22);
END $$;

-- 4. Content & Media Creator
INSERT INTO public.assessments (title, description, instructions, time_limit_minutes, passing_score, total_questions, is_published, created_by)
VALUES (
  'Content & Media Creator',
  'Assessment for Content & Media Creator position',
  'This assessment evaluates your knowledge of content creation, multimedia production, and creative skills. You have 10 minutes to complete 22 questions. A score of 70% or higher is required to pass.',
  10,
  70,
  22,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

DO $$
DECLARE
  creator_assessment_id uuid;
BEGIN
  SELECT id INTO creator_assessment_id FROM public.assessments WHERE title = 'Content & Media Creator';
  
  INSERT INTO public.assessment_questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
  (creator_assessment_id, 'What is the rule of thirds in photography?', 'Dividing image into three parts', 'Dividing image into 9 equal parts with gridlines', 'Taking three photos', 'Using three colors', 'B', 1),
  (creator_assessment_id, 'What does FPS stand for in video?', 'Frames Per Second', 'Files Per System', 'Focus Point Setting', 'Final Production Stage', 'A', 2),
  (creator_assessment_id, 'Which format is best for web graphics?', 'TIFF', 'PNG or JPEG', 'RAW', 'PSD', 'B', 3),
  (creator_assessment_id, 'What is color grading?', 'Sorting colors alphabetically', 'Adjusting colors in post-production for mood/style', 'Painting walls', 'Choosing fonts', 'B', 4),
  (creator_assessment_id, 'What does DSLR stand for?', 'Digital Single-Lens Reflex', 'Digital System Light Recording', 'Direct Sensor Light Reader', 'Digital Standard Lens Reference', 'A', 5),
  (creator_assessment_id, 'What is B-roll footage?', 'The main footage', 'Supplemental footage to enhance storytelling', 'Blooper footage', 'Behind-the-scenes footage', 'B', 6),
  (creator_assessment_id, 'What aspect ratio is standard for Instagram posts?', '16:9', '1:1', '4:3', '21:9', 'B', 7),
  (creator_assessment_id, 'What is white balance in photography?', 'Making everything white', 'Adjusting colors so white appears neutral', 'A type of lens', 'A camera brand', 'B', 8),
  (creator_assessment_id, 'Which software is industry standard for video editing?', 'Microsoft Word', 'Adobe Premiere Pro', 'Calculator', 'Notepad', 'B', 9),
  (creator_assessment_id, 'What does ISO control in camera settings?', 'Zoom level', 'Light sensitivity', 'Color temperature', 'File format', 'B', 10),
  (creator_assessment_id, 'What is a storyboard?', 'A type of wood', 'Visual plan showing sequence of scenes', 'A writing desk', 'A book genre', 'B', 11),
  (creator_assessment_id, 'What does aperture control?', 'Camera speed', 'Amount of light entering the lens', 'File size', 'Battery life', 'B', 12),
  (creator_assessment_id, 'What is typography?', 'Taking photos', 'The art and technique of arranging type', 'A printing machine', 'A camera setting', 'B', 13),
  (creator_assessment_id, 'What does render mean in video production?', 'Deleting footage', 'Processing final video file', 'Recording audio', 'Taking photos', 'B', 14),
  (creator_assessment_id, 'What is a call sheet?', 'A phone list', 'Document outlining daily shooting schedule', 'An invoice', 'A script', 'B', 15),
  (creator_assessment_id, 'What does royalty-free mean?', 'Content you can use without ongoing fees', 'Content that is completely free', 'Content for kings only', 'Expensive content', 'A', 16),
  (creator_assessment_id, 'What is the golden hour in photography?', 'Noon', 'Hour after sunrise or before sunset with soft light', 'Midnight', 'Any random hour', 'B', 17),
  (creator_assessment_id, 'What is a vector graphic?', 'A raster image', 'Image made of mathematical paths, scalable without quality loss', 'A type of photograph', 'A video format', 'B', 18),
  (creator_assessment_id, 'What does DPI stand for?', 'Dots Per Inch', 'Digital Photo Image', 'Display Picture Indicator', 'Direct Print Interface', 'A', 19),
  (creator_assessment_id, 'What is a mood board?', 'A bulletin board', 'Collection of images, colors, and textures for visual direction', 'A type of whiteboard', 'A schedule', 'B', 20),
  (creator_assessment_id, 'What is the purpose of a shot list?', 'Shopping list', 'Planned list of shots needed for production', 'List of crew members', 'Equipment inventory', 'B', 21),
  (creator_assessment_id, 'What does chroma key refer to?', 'Piano keys', 'Green/blue screen technique for background replacement', 'A color code', 'A type of paint', 'B', 22);
END $$;

-- 5. Innovation & Strategy Associate (Innovators)
INSERT INTO public.assessments (title, description, instructions, time_limit_minutes, passing_score, total_questions, is_published, created_by)
VALUES (
  'Innovation & Strategy Associate (Innovators)',
  'Assessment for Innovation & Strategy Associate position',
  'This assessment evaluates your strategic thinking, innovation mindset, and business acumen. You have 10 minutes to complete 22 questions. A score of 70% or higher is required to pass.',
  10,
  70,
  22,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

DO $$
DECLARE
  innovation_assessment_id uuid;
BEGIN
  SELECT id INTO innovation_assessment_id FROM public.assessments WHERE title = 'Innovation & Strategy Associate (Innovators)';
  
  INSERT INTO public.assessment_questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
  (innovation_assessment_id, 'What is disruptive innovation?', 'Breaking equipment', 'Innovation that creates new market and displaces established competitors', 'Loud innovation', 'Failed innovation', 'B', 1),
  (innovation_assessment_id, 'What does SWOT analysis stand for?', 'Strengths, Weaknesses, Opportunities, Threats', 'Systems, Work, Operations, Technology', 'Sales, Workforce, Output, Targets', 'Strategy, Workflow, Objectives, Tasks', 'A', 2),
  (innovation_assessment_id, 'What is a minimum viable product (MVP)?', 'Most Valuable Player', 'Product with minimum features to test market', 'Maximum Value Product', 'Minimum Viable Proposal', 'B', 3),
  (innovation_assessment_id, 'What is design thinking?', 'Interior design', 'Problem-solving approach focused on user needs', 'Graphic design process', 'Random thinking', 'B', 4),
  (innovation_assessment_id, 'What does agile methodology emphasize?', 'Rigid planning', 'Iterative development and flexibility', 'No planning', 'Long-term fixed plans', 'B', 5),
  (innovation_assessment_id, 'What is a blue ocean strategy?', 'Ocean conservation', 'Creating uncontested market space', 'Competing in existing markets', 'Water-based business', 'B', 6),
  (innovation_assessment_id, 'What does pivoting mean in business?', 'Physical exercise', 'Changing business strategy based on feedback', 'Standing in one place', 'Rotating staff', 'B', 7),
  (innovation_assessment_id, 'What is competitive advantage?', 'Being mean to competitors', 'Unique value that sets you apart from competitors', 'Lower prices only', 'Having more employees', 'B', 8),
  (innovation_assessment_id, 'What is a business model canvas?', 'Art canvas', 'Strategic management template for developing business models', 'Financial report', 'Sales pitch', 'B', 9),
  (innovation_assessment_id, 'What does lean startup methodology focus on?', 'Weight loss', 'Building-measuring-learning cycle to reduce waste', 'Hiring fewer people', 'Spending less money', 'B', 10),
  (innovation_assessment_id, 'What is market segmentation?', 'Breaking products', 'Dividing market into distinct groups of buyers', 'Random customer selection', 'Ignoring customers', 'B', 11),
  (innovation_assessment_id, 'What is a unique value proposition?', 'An expensive product', 'Clear statement of benefits that differentiate you', 'A discount code', 'A logo', 'B', 12),
  (innovation_assessment_id, 'What does scalability mean?', 'Weighing products', 'Ability to grow without proportional cost increase', 'Shrinking business', 'Staying the same size', 'B', 13),
  (innovation_assessment_id, 'What is benchmarking?', 'Sitting on benches', 'Comparing performance against industry standards', 'Random measurements', 'Ignoring competition', 'B', 14),
  (innovation_assessment_id, 'What is first-mover advantage?', 'Moving offices first', 'Benefits gained by entering market before competitors', 'Being fastest runner', 'Random luck', 'B', 15),
  (innovation_assessment_id, 'What does KPI stand for in strategy?', 'Key Performance Indicator', 'Known Product Information', 'Kitchen Preparation Instructions', 'Keyboard Password Input', 'A', 16),
  (innovation_assessment_id, 'What is a proof of concept?', 'Legal proof', 'Demonstration that idea is feasible', 'A type of insurance', 'Academic paper', 'B', 17),
  (innovation_assessment_id, 'What is brainstorming?', 'Weather event', 'Group creativity technique for generating ideas', 'Thinking alone', 'Avoiding ideas', 'B', 18),
  (innovation_assessment_id, 'What does ROI measure in innovation?', 'Return On Investment', 'Rate Of Inflation', 'Range Of Ideas', 'Risk Of Implementation', 'A', 19),
  (innovation_assessment_id, 'What is a strategic partnership?', 'Random business relationship', 'Mutually beneficial alliance between organizations', 'Competing directly', 'Ignoring other businesses', 'B', 20),
  (innovation_assessment_id, 'What is customer-centric innovation?', 'Ignoring customers', 'Innovation driven by understanding customer needs', 'Random product development', 'Technology-only focus', 'B', 21),
  (innovation_assessment_id, 'What does sustainable competitive advantage mean?', 'Temporary advantage', 'Long-term advantage that is difficult to duplicate', 'Environmental sustainability only', 'No real advantage', 'B', 22);
END $$;