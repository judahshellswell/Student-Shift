export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizDefinition {
  key: string;
  emoji: string;
  title: string;
  subtitle: string;
  section: string;
  questions: QuizQuestion[];
}

export const SECTION_QUIZZES: QuizDefinition[] = [
  {
    key: 'quiz_workplace_basics',
    emoji: '🧠',
    title: 'Workplace Basics Quiz',
    subtitle: 'Test what you know about showing up and fitting in',
    section: 'Workplace basics',
    questions: [
      { question: 'Your shift starts at 9am. What time do you arrive?', options: ['9:00am exactly', '8:45am', '9:10am — a bit late is fine', '8:30am'], correct: 1, explanation: 'Arriving 10–15 minutes early is best practice. It shows respect and gives you time to settle in.' },
      { question: 'You finish a task early. What do you do?', options: ['Stand around and wait', 'Check your phone', 'Ask your manager what needs doing next', 'Leave early'], correct: 2, explanation: 'Showing initiative by asking for more work is one of the qualities employers love most.' },
      { question: 'You feel unwell the night before a shift. What do you do?', options: ['Just not turn up and message later', 'Text a colleague to let the manager know', 'Phone your manager as early as possible', 'Turn up anyway and see how it goes'], correct: 2, explanation: 'Calling your manager directly and as early as possible is the professional approach — it gives them time to arrange cover.' },
      { question: 'What clothing choice is generally safe if you are unsure about a workplace dress code?', options: ['Whatever you normally wear', 'Smart casual — clean, neat clothes without rips', 'Full business formal', 'Sports kit'], correct: 1, explanation: 'Smart casual works in almost every workplace — it shows effort without being overdressed.' },
      { question: 'A colleague tells you to cover up a mistake instead of telling your manager. What should you do?', options: ["Cover it up — no one will know", 'Tell your manager honestly', 'Do nothing and wait', 'Blame the colleague'], correct: 1, explanation: 'Honesty is always the right call. Covering up mistakes makes them far worse when they eventually surface.' },
    ],
  },
  {
    key: 'quiz_interview_prep',
    emoji: '💼',
    title: 'Interview Preparation Quiz',
    subtitle: 'Prove you are ready to walk into any interview',
    section: 'Interview preparation',
    questions: [
      { question: 'An interviewer asks "Do you have any questions for us?" What do you say?', options: ['"No, I think you covered everything."', '"What is the salary?"', '"What does a typical day look like in this role?"', '"When can I start?"'], correct: 2, explanation: 'Asking thoughtful questions shows genuine interest. Questions about day-to-day work, training, or the team always impress.' },
      { question: 'When should you prepare your interview outfit?', options: ['Morning of the interview', 'Night before', 'On the way there', 'It does not matter'], correct: 1, explanation: 'Preparing the night before removes morning stress and ensures you have everything ready.' },
      { question: 'Which of these is a strong interview question to ask the employer?', options: ['"How long are the lunch breaks?"', '"Are there opportunities to take on more responsibility over time?"', '"How soon can I get a pay rise?"', '"Do I have to wear the uniform?"'], correct: 1, explanation: 'Asking about growth and responsibility signals ambition and a genuine interest in developing in the role.' },
      { question: 'You are asked a question about a skill you have not used in a job before. What do you do?', options: ['Say you have the skill even if you have not', 'Use an example from school, sport, or volunteering', 'Say "I do not know" and move on', 'Ask to skip the question'], correct: 1, explanation: 'Examples from school, sport, or volunteering are perfectly valid — employers understand young people have limited work history.' },
      { question: 'Why should you research the company before an interview?', options: ['So you can correct them if they get something wrong', 'To show genuine interest and answer "What do you know about us?"', 'It is not important', 'To compare them with competitors in front of them'], correct: 1, explanation: 'Research shows genuine interest and prepares you for the most common opening question in any interview.' },
    ],
  },
  {
    key: 'quiz_research_skills',
    emoji: '🔍',
    title: 'Research Skills Quiz',
    subtitle: 'Show you know how to find out about a business',
    section: 'Research skills',
    questions: [
      { question: 'Where is the best starting point for researching a company before an interview?', options: ['Ask a friend who works there', 'Their website — About page, products, and news sections', 'Their review page on Glassdoor', 'Their job advert'], correct: 1, explanation: "A company's own website tells you what they do, who they serve, and what they value — straight from the source." },
      { question: "What can you learn from a company's social media that you cannot get from their website?", options: ['Their company registration number', 'Their culture, tone, and how they present themselves day-to-day', 'Their annual turnover', 'Their full staff list'], correct: 1, explanation: 'Social media shows the personality behind the brand — casual or formal, community-focused or product-driven.' },
      { question: 'During an interview you say: "I noticed you recently won an award for customer service." What does this show?', options: ['That you are trying to flatter them', 'That you did your research and are genuinely interested in the business', 'That you have too much free time', 'That you know their competitors'], correct: 1, explanation: 'Referencing specific details from your research shows real engagement and stands out from candidates who give generic answers.' },
      { question: "Why is knowing who a company's customers are useful?", options: ['So you can contact them directly', 'It helps you understand why the role matters and how you can contribute', 'It is not useful for a first job', 'Only managers need to know this'], correct: 1, explanation: 'Understanding the customer helps you understand the purpose of the role — and lets you speak about your contribution to the interview panel.' },
    ],
  },
  {
    key: 'quiz_work_skills',
    emoji: '🤝',
    title: 'Skills for Work Quiz',
    subtitle: 'Communication, attitude, and open-mindedness tested',
    section: 'Skills for work',
    questions: [
      { question: 'A manager gives you critical feedback. What is the best response?', options: ['Defend yourself and explain why you did it that way', 'Say "thank you, I will work on that" and act on it', 'Complain to a colleague about it later', 'Ignore it'], correct: 1, explanation: 'Taking feedback well — without defensiveness — is one of the most valued qualities in any employee.' },
      { question: 'What does good eye contact in an interview or at work communicate?', options: ['Aggression', 'Confidence and respect', 'That you are nervous', 'Nothing in particular'], correct: 1, explanation: 'Appropriate eye contact signals confidence, engagement, and respect — all qualities that make a strong impression.' },
      { question: 'You are asked to do a task you have never done before. What do you do?', options: ['Refuse until you have full training', 'Give it a go — employers value willingness to try', 'Say it is not your job', 'Do it wrong on purpose so they stop asking'], correct: 1, explanation: 'Willingness to try is what employers want to see. Nobody expects perfection from a new starter — attitude matters far more.' },
      { question: 'Why do small tasks matter as much as big ones?', options: ['They do not — only results count', 'Your attitude on small tasks is how employers judge if you are ready for bigger ones', 'Small tasks are only for junior staff', 'They are practice for later'], correct: 1, explanation: 'The care you bring to every task — however small — tells an employer everything about how you will handle greater responsibility.' },
      { question: 'You do not understand an instruction. What should you do?', options: ['Guess and hope for the best', 'Ask for clarification — it is professional, not a weakness', 'Do nothing and wait', 'Ask another colleague to do it instead'], correct: 1, explanation: 'Asking for clarity is always the right move. It prevents mistakes and shows you care about getting things right.' },
    ],
  },
];

export const FINAL_QUIZ: QuizDefinition = {
  key: 'work_ethic_quiz',
  emoji: '🎯',
  title: 'Final Work Readiness Quiz',
  subtitle: 'Everything covered — prove you are ready',
  section: 'Final quiz',
  questions: [
    { question: 'Your shift starts at 9am. What time do you arrive?', options: ['9:00am exactly', '8:45am', '9:10am — a bit late is fine', '8:30am'], correct: 1, explanation: 'Arriving 10–15 minutes early shows respect and gives you time to settle in.' },
    { question: 'You make a mistake at work. What do you do?', options: ['Hope no one notices', 'Blame a colleague', 'Tell your manager honestly', 'Fix it quietly and never mention it'], correct: 2, explanation: 'Honesty is always the best policy. Telling your manager shows maturity — hiding mistakes makes things far worse.' },
    { question: 'An interviewer asks "Do you have any questions?" What do you say?', options: ['"No, I think you covered everything."', '"What is the salary?"', '"What does a typical day look like in this role?"', '"When can I start?"'], correct: 2, explanation: 'Asking thoughtful questions shows genuine interest in the role and that you prepared.' },
    { question: 'Your manager gives you critical feedback. What do you do?', options: ['Defend yourself', 'Say "thank you, I will work on that"', 'Complain to a colleague', 'Ignore it'], correct: 1, explanation: 'Taking feedback well — without defensiveness — is one of the most valued workplace qualities.' },
    { question: 'A customer is being rude. What is the best response?', options: ['Be rude back', 'Walk away', 'Stay calm, be polite, get a manager if needed', 'Argue your point'], correct: 2, explanation: 'Staying calm under pressure is a key professional skill. Escalating to a manager when needed is always the right call.' },
    { question: 'Before an interview, you should:', options: ['Read the job description and practise answers out loud', 'Look up the salary and prepare to negotiate', 'Just show up and be yourself — preparation is overrated', 'Memorise a script word for word'], correct: 0, explanation: 'Understanding the job description and practising out loud are the most effective preparation steps.' },
    { question: 'You do not understand an instruction. What do you do?', options: ['Guess and hope for the best', 'Ask for clarification', 'Do nothing', 'Ask a colleague to do it instead'], correct: 1, explanation: 'Asking for clarity prevents mistakes and shows you care about doing the job correctly.' },
    { question: 'Why does your attitude on small tasks matter?', options: ['It does not — only big results count', 'Employers use small tasks to judge if you are ready for bigger ones', 'Small tasks are just to fill time', 'Only managers care about small tasks'], correct: 1, explanation: 'The care you bring to every task tells an employer everything about how you will handle greater responsibility.' },
  ],
};

export const ALL_QUIZZES: QuizDefinition[] = [...SECTION_QUIZZES, FINAL_QUIZ];
