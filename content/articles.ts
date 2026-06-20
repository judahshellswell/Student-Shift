export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface ContentItem {
  key: string;
  emoji: string;
  title: string;
  subtitle: string;
  readTime: string;
  section: string;
  content: { heading: string; body: string }[];
  comprehension: ComprehensionQuestion[];
}

export const CONTENT_ITEMS: ContentItem[] = [
  // ── Workplace basics ──
  {
    key: 'first_shift_tips',
    emoji: '🚀',
    title: 'Your First Shift',
    subtitle: 'What to expect on day one',
    readTime: '3 min read',
    section: 'Workplace basics',
    content: [
      { heading: 'Arrive early', body: 'Aim to arrive 10–15 minutes before your shift starts. This gives you time to find where to go, meet your supervisor and settle your nerves.' },
      { heading: 'Bring what you need', body: 'Ask your employer beforehand if there is anything you need to bring — ID, uniform, safety shoes, or documents. Being prepared shows initiative.' },
      { heading: 'Introduce yourself', body: "Say hello to colleagues. You do not need to remember everyone's name straight away, but a friendly greeting sets the right tone." },
      { heading: 'Ask questions', body: 'No one expects you to know everything on day one. Asking questions shows you care about doing the job right.' },
      { heading: 'Take notes', body: 'If you are being trained, write down the key steps. You will not remember everything and a note shows you are taking it seriously.' },
    ],
    comprehension: [
      { question: 'How early should you aim to arrive before your first shift?', options: ['Exactly on time', '10–15 minutes early', '30 minutes early', '5 minutes early'], correct: 1, explanation: 'Arriving 10–15 minutes early gives you time to settle in and shows your employer you are punctual and professional.' },
      { question: 'Why is taking notes during training a good idea?', options: ['To show off to colleagues', 'It shows you are engaged and helps you remember', 'Your employer requires it by law', 'To pass the time'], correct: 1, explanation: 'Taking notes means you have a reference to look back on, and it visibly demonstrates to your employer that you are engaged.' },
      { question: 'What should you do if you are unsure what to bring on your first day?', options: ['Just bring nothing and see what happens', 'Ask your employer beforehand', 'Copy what other staff wear', 'Wait until you get there'], correct: 1, explanation: 'Asking your employer beforehand is the professional approach — it shows preparation and avoids turning up without something essential.' },
    ],
  },
  {
    key: 'what_employers_expect',
    emoji: '⭐',
    title: 'What Employers Expect',
    subtitle: 'The basics that set great employees apart',
    readTime: '4 min read',
    section: 'Workplace basics',
    content: [
      { heading: 'Reliability', body: 'The number one thing employers look for. Turn up when you are supposed to, be on time, and do what you say you will do.' },
      { heading: 'A positive attitude', body: 'No one wants to work with someone who complains constantly. Even when tasks are boring, bring energy and willingness.' },
      { heading: 'Initiative', body: 'When you finish a task, do not just stand there — look for what needs doing next or ask your manager.' },
      { heading: 'Honesty', body: 'If you make a mistake, own it and tell your manager. Trying to hide errors makes things far worse.' },
      { heading: 'Respecting colleagues', body: 'Treat everyone — including other young workers, managers, and customers — with respect. A good attitude toward people is noticed.' },
    ],
    comprehension: [
      { question: 'According to this guide, what is the number one thing employers look for?', options: ['Intelligence', 'Reliability', 'Speed', 'Qualifications'], correct: 1, explanation: 'Reliability — turning up on time and doing what you say — is consistently ranked as the most important quality employers look for in young workers.' },
      { question: 'You finish a task at work. What should you do next?', options: ['Take a break', 'Check your phone', 'Ask your manager what to do next', 'Wait to be told'], correct: 2, explanation: 'Taking initiative — finding the next task without being asked — is one of the qualities employers value most.' },
      { question: 'You make a mistake at work. What does this guide say you should do?', options: ['Fix it quietly and say nothing', 'Blame a colleague', 'Own it and tell your manager', 'Ignore it'], correct: 2, explanation: 'Honesty builds trust. Telling your manager about a mistake — even a small one — shows maturity and stops the problem from getting worse.' },
    ],
  },
  {
    key: 'how_to_call_in',
    emoji: '📞',
    title: 'How to Handle Absence',
    subtitle: 'The right way to call in sick or miss a shift',
    readTime: '2 min read',
    section: 'Workplace basics',
    content: [
      { heading: 'Call, do not text', body: 'Whenever possible, phone your manager directly rather than sending a text or WhatsApp. It shows respect for their time.' },
      { heading: 'Tell them as early as possible', body: 'If you know you will not make it in, let them know before your shift starts — ideally a few hours before, or the night before if you can.' },
      { heading: 'Keep it brief and honest', body: "You do not need to over-explain. \"I am not well and won't be able to come in today\" is fine. If you can estimate when you will be back, say so." },
      { heading: 'Offer to help if possible', body: 'If appropriate, let them know you are happy to cover extra hours when you recover. This shows commitment even when you are sick.' },
      { heading: 'Do not make it a habit', body: 'Everyone gets ill, but if you are calling in regularly, employers will notice. Try to keep absences for genuine illness only.' },
    ],
    comprehension: [
      { question: 'When you cannot come in for a shift, what is the best way to let your manager know?', options: ['Send a WhatsApp', 'Phone them directly', 'Text a colleague to pass it on', 'Email them later'], correct: 1, explanation: "Phoning directly shows respect for your manager's time and ensures the message is definitely received." },
      { question: 'When should you tell your manager you cannot come in?', options: ['After your shift would start', 'As early as possible', 'Whenever you feel like it', 'Only if they ask'], correct: 1, explanation: 'Telling them as early as possible — ideally the night before or hours before — gives them time to find cover.' },
      { question: 'What does calling in sick regularly tell an employer?', options: ['That you are hardworking', 'That you are unreliable', 'That you need a promotion', 'Nothing in particular'], correct: 1, explanation: 'Employers notice patterns. Regular absences signal unreliability, which is the quality they value most highly.' },
    ],
  },
  {
    key: 'dress_code_basics',
    emoji: '👕',
    title: 'Dress Code Basics',
    subtitle: 'First impressions and looking the part',
    readTime: '3 min read',
    section: 'Workplace basics',
    content: [
      { heading: 'When in doubt, ask', body: 'Before your first shift, ask your manager about the dress code. It is much better to ask than to turn up inappropriately dressed.' },
      { heading: 'Smart casual is usually safe', body: 'If no uniform is provided and no dress code is given, clean, neat clothes are a safe bet. Avoid ripped jeans, hoodies, or overly casual sportswear.' },
      { heading: 'Keep it clean and ironed', body: 'Even basic clothes look professional when they are clean and neat. Iron your shirt. It takes five minutes and makes a real difference.' },
      { heading: 'Closed-toe shoes for most workplaces', body: 'In a shop, café, or warehouse, you will typically need closed-toe shoes. Flip flops and sandals are generally not appropriate.' },
      { heading: 'Hair and hygiene', body: 'Keep hair tidy and off your face where food is being handled. Basic hygiene — deodorant, clean teeth — is expected in every job.' },
    ],
    comprehension: [
      { question: 'If you are not sure about the dress code for a new job, what should you do?', options: ['Wear whatever feels comfortable', 'Ask your manager before your first shift', 'Copy what you see on their Instagram', 'Just see what others are wearing when you arrive'], correct: 1, explanation: 'Asking your manager is always the safest option. It shows professionalism and ensures you turn up correctly dressed.' },
      { question: 'Which of the following is NOT appropriate footwear in most workplaces?', options: ['Clean trainers', 'Flat shoes', 'Flip flops', 'Boots'], correct: 2, explanation: 'Flip flops and open-toe sandals are generally not appropriate in shops, cafés, or warehouses — both for safety and professionalism.' },
      { question: 'What is the safest clothing choice when no dress code is given?', options: ['Your favourite hoodie and jeans', 'Smart casual — clean and neat', 'A formal business suit', 'Your sports kit'], correct: 1, explanation: 'Smart casual strikes the right balance — it is professional without being over the top, and works in almost any workplace setting.' },
    ],
  },
  // ── Interview preparation ──
  {
    key: 'interview_what_to_wear',
    emoji: '👔',
    title: 'What to Wear to an Interview',
    subtitle: 'Dress to impress before you say a word',
    readTime: '3 min read',
    section: 'Interview preparation',
    content: [
      { heading: 'Research the company dress code first', body: 'A law firm and a surf shop have very different expectations. Check the company website or social media to understand the culture, then dress one level smarter than their everyday standard.' },
      { heading: 'When in doubt, go smart', body: 'For most interviews — retail, hospitality, office — smart casual is the safe choice. Clean trousers or a skirt, a neat top or shirt, and closed-toe shoes. Avoid hoodies, ripped clothing, or heavy logos.' },
      { heading: 'Grooming matters as much as clothes', body: 'Hair should be neat and off your face. Nails should be clean. Avoid strong perfume or aftershave — you want the interviewer to remember your answers, not your scent.' },
      { heading: 'Prepare your outfit the night before', body: 'Do not leave it to the morning. Iron your clothes, check for stains, and lay everything out so you are not rushing. Last-minute panic leads to poor choices.' },
      { heading: 'Comfort builds confidence', body: "Wear something you feel good in. If you are tugging at your clothes or uncomfortable, it will show. Confidence comes from feeling prepared." },
    ],
    comprehension: [
      { question: 'When should you prepare your interview outfit?', options: ['On the morning of the interview', 'The night before', 'On the way there', 'It does not matter'], correct: 1, explanation: 'Preparing the night before removes stress on the morning and ensures you have time to iron clothes, find missing items, or swap something if needed.' },
      { question: 'What is the safest interview outfit choice if you are unsure?', options: ['Your most casual clothes', 'Smart casual — clean and neat', 'A full suit regardless', 'Whatever you wear to school'], correct: 1, explanation: 'Smart casual is the universally safe interview choice — it shows effort and professionalism without being overdressed for the company culture.' },
      { question: 'Why should you avoid strong perfume or aftershave at an interview?', options: ['It is too expensive', 'It can distract from your answers', 'It is unprofessional to wear any', 'Only managers can wear it'], correct: 1, explanation: 'Strong scents can be distracting or even off-putting. You want the interviewer focused entirely on what you say.' },
    ],
  },
  {
    key: 'interview_what_to_ask',
    emoji: '🙋',
    title: 'Questions to Ask the Employer',
    subtitle: 'Show you are curious, prepared, and serious',
    readTime: '4 min read',
    section: 'Interview preparation',
    content: [
      { heading: 'Why asking questions matters', body: 'When an interviewer asks "Do you have any questions?", the worst answer is "No, not really." Asking good questions shows you have done your research and are genuinely interested in the role.' },
      { heading: 'Ask about day-to-day responsibilities', body: '"What would a typical day or week look like in this role?" This shows you want to understand what you are actually signing up for.' },
      { heading: 'Ask about training and growth', body: '"Is there training when I start?" or "Are there opportunities to take on more responsibility over time?" This signals ambition and willingness to develop.' },
      { heading: 'Ask about the team', body: '"Who would I be working with most closely?" Employers like candidates who think about fitting into a team, not just performing alone.' },
      { heading: 'Ask about next steps', body: '"What does the rest of the process look like, and when might I hear back?" This is professional, not pushy — it shows you are organised and keen.' },
      { heading: 'Questions to avoid', body: 'Do not ask about salary or holiday in a first interview unless the employer raises it. Focus your questions on the role and the company.' },
    ],
    comprehension: [
      { question: 'What is the worst response when an interviewer asks if you have any questions?', options: ['"What does a typical day look like?"', '"No, not really"', '"Can you tell me about training?"', '"When might I hear back?"'], correct: 1, explanation: 'Saying "no" signals a lack of interest or preparation. Asking questions shows you are engaged and have thought about the role seriously.' },
      { question: 'Which topic should you avoid bringing up in a first interview?', options: ['Training opportunities', 'Salary and holiday', 'Daily responsibilities', 'The team you would join'], correct: 1, explanation: 'Asking about salary or holiday in a first interview comes across as prioritising personal gain over the job itself. Wait until the employer raises it.' },
      { question: 'Why is asking "When might I hear back?" a good interview question?', options: ['It pressures the employer', 'It shows organisation and interest', 'It forces an instant decision', 'It is just small talk'], correct: 1, explanation: 'Asking about next steps is a confident, professional close to an interview. It shows you are organised and genuinely interested in the outcome.' },
    ],
  },
  {
    key: 'interview_prep_tips',
    emoji: '📋',
    title: 'How to Prepare for an Interview',
    subtitle: 'The preparation that separates confident candidates',
    readTime: '5 min read',
    section: 'Interview preparation',
    content: [
      { heading: 'Research the company before you go', body: 'Read the company website, check their social media, and look at recent news. Know what they do, who their customers are, and what they stand for. Interviewers always ask "What do you know about us?"' },
      { heading: 'Understand the job description', body: 'Go through the job description line by line. For each requirement, think of an example from your life — school, sport, volunteering — that shows you have that quality.' },
      { heading: 'Practise out loud', body: 'Reading answers in your head is not the same as saying them. Practise answering common questions out loud in front of a mirror or with a friend.' },
      { heading: 'Prepare for common questions', body: '"Tell me about yourself", "Why do you want this job?", "What are your strengths?", "Tell me about a time you dealt with a challenge." Have a short, honest answer ready for each.' },
      { heading: 'Plan your journey', body: 'Know exactly where you are going, how long it takes, and where to park or which bus to catch. Aim to arrive 10 minutes early. Being late — even for a genuine reason — creates a bad first impression.' },
      { heading: 'Bring what you need', body: 'A copy of your CV, any references you were asked for, and a notepad and pen. Bringing notes shows preparation.' },
    ],
    comprehension: [
      { question: 'Why should you practise interview answers out loud rather than just in your head?', options: ['It is not important', 'It builds real confidence and flow', 'It impresses interviewers to mention', 'So you memorise a script exactly'], correct: 1, explanation: 'Practising out loud is fundamentally different from reading silently. It builds the muscle memory and fluency you need under pressure.' },
      { question: 'Why is planning your journey to the interview important?', options: ['To show the employer your route', 'Being late creates a bad impression', 'So you take the scenic route', 'It is not important'], correct: 1, explanation: 'Arriving late, regardless of the reason, sets a negative tone. Planning ahead removes that risk entirely.' },
      { question: 'What is a good way to answer questions about skills you might not have direct experience in?', options: ['Claim the skill anyway', 'Use examples from school or sport', 'Avoid those questions', 'Change the subject'], correct: 1, explanation: 'Employers understand young people have limited work history. Drawing on school, sports, or volunteering is entirely valid — it shows self-awareness and transferable skills.' },
    ],
  },
  // ── Research skills ──
  {
    key: 'research_the_business',
    emoji: '🔎',
    title: 'Researching a Business',
    subtitle: 'How to understand who you are applying to',
    readTime: '4 min read',
    section: 'Research skills',
    content: [
      { heading: 'Start with their website', body: "A company's website tells you what they do, who they serve, and what they value. Look at the About page, the products or services they offer, and any news or blog posts." },
      { heading: 'Check their social media', body: 'Instagram, Facebook, and LinkedIn give you a feel for the company culture and how they present themselves. Pay attention to the tone — is it formal or relaxed, community-focused or commercial?' },
      { heading: 'Look for recent news', body: "Search the company name on Google News. Have they opened a new location? Won an award? Had any difficulties? Knowing this shows you're engaged with what's happening in the business." },
      { heading: 'Know their competitors', body: 'Understanding who else operates in the same space shows commercial awareness. You do not need to be an expert, but knowing "you compete with X and Y" is impressive in an interview.' },
      { heading: 'Understand their customers', body: 'Who buys from them or uses their service? Young people, families, professionals? Understanding the customer helps you understand why the role matters.' },
      { heading: 'Use what you find', body: 'Reference your research in the interview. "I noticed on your website that you recently launched X" or "I saw you won an award for Y" shows you made the effort — and that stands out.' },
    ],
    comprehension: [
      { question: "What should you look at on a company's social media before applying?", options: ['Their follower count', 'Their tone and everyday culture', "Their competitors' accounts", 'Whether they post daily'], correct: 1, explanation: "Social media reveals the company's personality and culture — formal or relaxed, community-driven or commercial — which helps you tailor your application and prepare for interview." },
      { question: "Why is it useful to know who a company's competitors are?", options: ['So you apply to them instead', 'It shows commercial awareness', 'So you can criticise the business', 'It is not useful'], correct: 1, explanation: 'Knowing the competitive landscape shows maturity and business awareness — it demonstrates you understand the industry, not just the job.' },
      { question: 'How should you use your research during the interview?', options: ['Keep it to yourself', 'Reference something specific you found', 'Recite their website from memory', 'Only mention it if asked'], correct: 1, explanation: 'Referencing specific details — a recent award, a new product, a community project — shows you genuinely researched the company and are not just saying what every other candidate says.' },
    ],
  },
  // ── Skills for work ──
  {
    key: 'communication_skills',
    emoji: '💬',
    title: 'Communication Skills',
    subtitle: 'How to speak and listen like a professional',
    readTime: '4 min read',
    section: 'Skills for work',
    content: [
      { heading: 'Listen more than you speak', body: 'Good communicators are good listeners. In an interview or on the job, focus fully on what the other person is saying before forming your response. Do not interrupt.' },
      { heading: 'Speak clearly and at a steady pace', body: 'Nerves can make you rush. Take a breath before answering. Slow down, speak clearly, and do not be afraid of a short pause — it shows you are thinking.' },
      { heading: 'Use eye contact', body: 'Eye contact shows confidence and respect. You do not need to stare — look away naturally, then return. In an interview panel, share eye contact across the group.' },
      { heading: 'Be aware of your body language', body: 'Sit up straight, keep your arms open (not crossed), and nod to show you are engaged. Your body communicates as much as your words do.' },
      { heading: 'Ask for clarity when needed', body: 'If you do not understand a question or instruction, it is always better to ask than to guess. "Could you explain what you mean by that?" is professional, not a sign of weakness.' },
      { heading: 'Written communication counts too', body: 'Emails and messages to employers should be polite, clear, and free from slang. Read what you write before sending. A professional tone in writing shows the same maturity as in person.' },
    ],
    comprehension: [
      { question: 'You do not understand an instruction your manager has given you. What should you do?', options: ['Guess and hope for the best', 'Ask for clarification politely', 'Ask a colleague instead', 'Ignore it'], correct: 1, explanation: 'Asking for clarification is always the right call. It prevents mistakes and shows you care about doing the job correctly.' },
      { question: 'What does good body language look like in a professional setting?', options: ['Arms crossed, looking down', 'Upright posture, nodding along', 'Checking your phone often', 'Leaning back in your chair'], correct: 1, explanation: 'Open, upright posture signals confidence and engagement. Your body communicates as much as your words — employers and interviewers notice both.' },
      { question: 'Why is it important to slow down when speaking, especially when nervous?', options: ['So you use fewer words', 'It sounds calmer and clearer', 'It makes talks longer', 'Employers prefer slow speakers'], correct: 1, explanation: 'Nerves cause rushing, which makes speech unclear. Taking a breath and slowing down actually sounds more confident and considered.' },
    ],
  },
  {
    key: 'open_mindedness',
    emoji: '🌱',
    title: 'Open-Mindedness at Work',
    subtitle: 'Adapting, learning, and growing on the job',
    readTime: '3 min read',
    section: 'Skills for work',
    content: [
      { heading: 'Every workplace is different', body: 'Even if you have worked before, each job has its own way of doing things. Go in with an open mind and be willing to learn the processes even if you think you know a better way.' },
      { heading: 'Welcome feedback', body: 'When a manager gives you feedback — even critical feedback — resist the urge to be defensive. Say "thank you, I will work on that." Employers remember people who take feedback well.' },
      { heading: 'Be willing to do things outside your comfort zone', body: 'You might be asked to do tasks you have never done before or that feel awkward at first. Give it a go. Employers value people who try, even if they are not perfect straight away.' },
      { heading: 'Different people think differently', body: 'You will work with people of all ages, backgrounds, and personalities. Respect different perspectives, even when you disagree. The ability to work with anyone is a powerful skill.' },
      { heading: 'Mistakes are how you grow', body: 'Everyone makes mistakes, especially when starting out. What matters is that you learn from them and do not repeat them. A growth mindset — believing you can improve — is what gets people noticed.' },
    ],
    comprehension: [
      { question: 'Your manager gives you critical feedback on your work. What is the best response?', options: ['Defend why you did it that way', 'Say "thank you" and act on it', 'Complain to a colleague later', 'Ignore it'], correct: 1, explanation: 'Taking feedback well — without defensiveness — is one of the most valued qualities in any workplace. Managers specifically remember those who respond positively.' },
      { question: 'You are asked to do a task you have never done before. What should you do?', options: ['Refuse until trained', 'Give it a go and try', 'Say you are not qualified', 'Wait to be shown every time'], correct: 1, explanation: 'Willingness to try new things shows initiative and adaptability. Perfection is not expected from the start — effort and attitude are.' },
      { question: 'What does having a "growth mindset" mean at work?', options: ['Believing you are perfect', 'Improving through effort and mistakes', 'Always asking for a pay rise', 'Avoiding difficult tasks'], correct: 1, explanation: 'A growth mindset means seeing mistakes as learning opportunities rather than failures. Employers value people who continually improve.' },
    ],
  },
  {
    key: 'workplace_attitude',
    emoji: '🏆',
    title: 'Workplace Attitude',
    subtitle: 'The mindset that makes a great employee',
    readTime: '4 min read',
    section: 'Skills for work',
    content: [
      { heading: 'Show up ready to work', body: 'The moment you arrive at work, your shift has started. Leave personal issues at the door as best you can, focus on the job, and bring energy — even when you are tired.' },
      { heading: 'Be a team player', body: "Help colleagues when you can. Cover each other, share the load, and celebrate each other's wins. Employers notice people who make the whole team better, not just themselves." },
      { heading: 'Take pride in your work', body: "Whether you are cleaning tables, serving customers, or filing paperwork — do it well. The attitude you bring to small tasks is exactly how employers judge whether to give you bigger ones." },
      { heading: 'Manage your attitude in difficult moments', body: 'Difficult customers, stressful shifts, and unfair situations happen. How you handle pressure is one of the most telling things an employer sees. Stay calm, stay professional.' },
      { heading: 'Be someone people want to work with', body: 'Reliability, positivity, and a willingness to pitch in — these are the qualities that get people kept on, promoted, and recommended. Skills can be taught; attitude cannot.' },
    ],
    comprehension: [
      { question: 'A customer is being rude and difficult. What is the right response?', options: ['Be rude back to match them', 'Stay calm and get a manager', 'Walk away without a word', 'Argue until they back down'], correct: 1, explanation: 'Staying calm under pressure is one of the most valued professional skills. Escalating to a manager when needed shows good judgement, not weakness.' },
      { question: 'Why does it matter how you approach small, unglamorous tasks?', options: ['It does not, big tasks count', 'It shows you are ready for more', 'Small tasks just fill time', 'Only managers do small tasks'], correct: 1, explanation: 'The attitude you bring to every task — however small — is exactly how employers evaluate you. Cutting corners on small jobs signals you will do the same on important ones.' },
      { question: 'What does it mean to be a "team player" at work?', options: ['Doing things your own way', 'Helping and supporting the team', 'Always getting the credit', 'Competing with colleagues'], correct: 1, explanation: "Being a team player means lifting everyone around you. Employers value this enormously — the team's success is more important than any individual's." },
    ],
  },
];

export const SECTIONS = [
  { key: 'Workplace basics', label: 'Workplace basics', subtitle: 'Each guide adds 6 points' },
  { key: 'Interview preparation', label: 'Interview preparation', subtitle: 'Each guide adds 6 points' },
  { key: 'Research skills', label: 'Research & business knowledge', subtitle: 'Adds 6 points' },
  { key: 'Skills for work', label: 'Skills for work', subtitle: 'Each guide adds 6 points' },
  { key: 'Final quiz', label: 'Final quiz', subtitle: 'Adds 6 points' },
];
