/**
 * AI Controller
 * Handles AI Interview Coach, Resume Generator, Cover Letter Generator
 * Uses Google Gemini 2.0 Flash API
 */

const { asyncHandler, AppError } = require('../middleware/error');

// ── Gemini API Call ──────────────────────────────────────────────────
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    console.log('⚠️  No Gemini API key found, using demo mode');
    return getMockResponse(prompt);
  }

  const model = 'gemini-2.5-flash';

  try {
    console.log(`📡 Calling Gemini API with model: ${model}`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('❌ Gemini API Error:', data.error.message);
      // If quota exceeded, fall back to demo mode gracefully
      if (data.error.status === 'RESOURCE_EXHAUSTED' || 
          data.error.message.includes('quota') ||
          data.error.message.includes('Quota')) {
        console.log('⚠️  Quota exceeded - switching to demo mode');
        return getMockResponse(prompt);
      }
      throw new Error(data.error.message);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');

    console.log('✅ Gemini responded successfully');
    return text;

  } catch (err) {
    console.error('❌ Gemini call failed:', err.message);
    throw err;
  }
};

// ── Mock responses for demo mode (no API key) ────────────────────────
const getMockResponse = (prompt) => {
  if (prompt.includes('interview question') || prompt.includes('interviewer')) {
    return `**Interview Question:** Explain the difference between Stack and Queue data structures.

**What the interviewer is looking for:**
- Understanding of LIFO vs FIFO principles
- Real-world use cases for each
- Time complexity of operations

**Key Points to Cover:**
1. Stack uses LIFO (Last In First Out) — like a stack of plates
2. Queue uses FIFO (First In First Out) — like a queue at a ticket counter
3. Stack operations: push(), pop(), peek() — all O(1)
4. Queue operations: enqueue(), dequeue() — all O(1)
5. Stack use cases: function call stack, undo operations, browser history
6. Queue use cases: CPU scheduling, print spooler, BFS traversal

**Time Estimate:** 5-7 minutes

*Note: This is a demo response. Add your Gemini API key for real AI responses.*`;
  }

  if (prompt.includes('resume')) {
    return `# Professional Resume

## Your Name
📧 email@example.com | 📱 +91-XXXXXXXXXX | 🔗 linkedin.com/in/yourname | 💻 github.com/yourusername

---

## PROFESSIONAL SUMMARY
Results-driven Software Engineer with expertise in full-stack development. Proven track record of delivering scalable solutions.

---

## TECHNICAL SKILLS
**Languages:** JavaScript, Python, Java, C++
**Frontend:** React.js, HTML5, CSS3, Tailwind CSS
**Backend:** Node.js, Express.js, REST APIs
**Database:** MongoDB, MySQL, PostgreSQL
**Tools:** Git, Docker, AWS, VS Code

---

## EDUCATION
**B.Tech in Computer Science** | SSBT College | 2020-2024
- CGPA: 8.5/10

---

## PROJECTS
**Smart Education System** | React, Node.js, MongoDB
- Built full-stack platform serving 500+ students
- Implemented real-time chat using Socket.io

*Note: This is a demo response. Add your Gemini API key for personalized resumes.*`;
  }

  if (prompt.includes('cover letter')) {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer role at your company.

With my background in full-stack development and passion for building impactful solutions, I am confident in my ability to contribute meaningfully to your team.

I would welcome the opportunity to discuss how my skills can contribute to your team's success.

Sincerely,
Your Name

*Note: This is a demo response. Add your Gemini API key for personalized cover letters.*`;
  }

  if (prompt.includes('code review') || prompt.includes('Code:')) {
    return `## Code Review

**1. Correctness:** The code appears to solve the intended problem.

**2. Time Complexity:** O(n) — single pass through the data structure.

**3. Space Complexity:** O(1) — constant extra space used.

**4. Code Quality:** 
- Variable names are clear and descriptive
- Logic flow is easy to follow

**5. Suggestions:**
- Add input validation for edge cases
- Consider adding comments for complex logic
- Handle null/undefined inputs

**6. Alternative Approach:**
Consider using built-in language methods which may be more optimized.

*Note: This is a demo response. Add your Gemini API key for real code reviews.*`;
  }

  return 'AI response in demo mode. Please add your Gemini API key to backend/.env for real AI responses.';
};

// ── Controllers ──────────────────────────────────────────────────────

/**
 * @desc    Generate interview question with AI feedback
 * @route   POST /api/ai/interview
 * @access  Private
 */
const generateInterviewQuestion = asyncHandler(async (req, res) => {
  const { topic, difficulty, userAnswer, role: jobRole } = req.body;

  let prompt;

  if (userAnswer) {
    prompt = `You are an expert technical interviewer. 
The candidate was asked about: ${topic} (${difficulty} level) for a ${jobRole || 'Software Developer'} role.
Their answer was: "${userAnswer}"

Please provide:
1. Score out of 10
2. What was good about the answer
3. What could be improved  
4. A model answer
5. Follow-up question

Format your response clearly with these sections.`;
  } else {
    prompt = `You are an expert technical interviewer for ${jobRole || 'Software Developer'} positions.
Generate a ${difficulty || 'medium'} level interview question about: ${topic || 'Data Structures and Algorithms'}.

Include:
1. The interview question
2. What the interviewer is looking for
3. Key points to cover in a good answer
4. Time estimate for answering

Make it realistic and commonly asked in top tech companies.`;
  }

  try {
    const response = await callGemini(prompt);
    res.json({ success: true, response });
  } catch (error) {
    console.error('Interview generation error:', error.message);
    res.status(500).json({
      success: false,
      message: `AI Error: ${error.message}. Please try again.`,
    });
  }
});

/**
 * @desc    Generate resume from user data
 * @route   POST /api/ai/resume
 * @access  Private
 */
const generateResume = asyncHandler(async (req, res) => {
  const { personalInfo, education, experience, skills, projects, targetRole } = req.body;

  const prompt = `You are a professional resume writer. Create a clean, ATS-optimized resume for:

Name: ${personalInfo?.name || 'Candidate'}
Target Role: ${targetRole || 'Software Engineer'}
Email: ${personalInfo?.email || ''}
Phone: ${personalInfo?.phone || ''}
LinkedIn: ${personalInfo?.linkedin || ''}
GitHub: ${personalInfo?.github || ''}

Education: ${JSON.stringify(education || [])}
Experience: ${JSON.stringify(experience || [])}
Skills: ${JSON.stringify(skills || [])}
Projects: ${JSON.stringify(projects || [])}

Create a professional, well-structured resume in markdown format. Use action verbs, quantify achievements where possible, and tailor it for the target role. Include relevant sections and make it stand out.`;

  try {
    const response = await callGemini(prompt);
    res.json({ success: true, resume: response });
  } catch (error) {
    console.error('Resume generation error:', error.message);
    res.status(500).json({
      success: false,
      message: `AI Error: ${error.message}. Please try again.`,
    });
  }
});

/**
 * @desc    Generate cover letter
 * @route   POST /api/ai/cover-letter
 * @access  Private
 */
const generateCoverLetter = asyncHandler(async (req, res) => {
  const { personalInfo, jobTitle, companyName, jobDescription, userBackground } = req.body;

  const prompt = `You are an expert career coach. Write a compelling, personalized cover letter for:

Applicant: ${personalInfo?.name || 'Applicant'}
Job Title: ${jobTitle || 'Software Engineer'}
Company: ${companyName || 'Company'}
Job Description: ${jobDescription || 'Software development role'}
Applicant Background: ${userBackground || 'Software developer with strong technical skills'}

Write a professional cover letter that:
1. Opens with a strong hook
2. Connects the applicant's experience to the role
3. Shows knowledge of the company
4. Has a compelling call-to-action closing
5. Is 3-4 paragraphs, professional tone

Make it genuine, specific, and persuasive.`;

  try {
    const response = await callGemini(prompt);
    res.json({ success: true, coverLetter: response });
  } catch (error) {
    console.error('Cover letter error:', error.message);
    res.status(500).json({
      success: false,
      message: `AI Error: ${error.message}. Please try again.`,
    });
  }
});

/**
 * @desc    AI Code Review
 * @route   POST /api/ai/code-review
 * @access  Private
 */
const codeReview = asyncHandler(async (req, res) => {
  const { code, language, problemTitle } = req.body;

  const prompt = `You are a senior software engineer doing a code review.

Problem: ${problemTitle || 'Programming problem'}
Language: ${language || 'Unknown'}
Code:
\`\`\`${language}
${code}
\`\`\`

Provide a detailed code review covering:
1. **Correctness** - Does the code solve the problem?
2. **Time Complexity** - Big O analysis
3. **Space Complexity** - Memory usage
4. **Code Quality** - Readability, naming, style
5. **Improvements** - Specific suggestions with examples
6. **Alternative Approach** - Better solution if applicable

Be constructive and educational.`;

  try {
    const response = await callGemini(prompt);
    res.json({ success: true, review: response });
  } catch (error) {
    console.error('Code review error:', error.message);
    res.status(500).json({
      success: false,
      message: `AI Error: ${error.message}. Please try again.`,
    });
  }
});

/**
 * @desc    AI Chat assistant
 * @route   POST /api/ai/chat
 * @access  Private
 */
const aiChat = asyncHandler(async (req, res) => {
  const { message, context } = req.body;

  const prompt = `You are an AI learning assistant for "Future Bridge", a smart education platform for engineering students.
Context: ${context || 'Student asking a general question'}
Student message: ${message}

Respond helpfully, concisely, and in a friendly educational tone. If it's a technical question, provide clear explanations with examples. If it's about career advice, be specific and actionable.`;

  try {
    const response = await callGemini(prompt);
    res.json({ success: true, response });
  } catch (error) {
    console.error('AI chat error:', error.message);
    res.status(500).json({
      success: false,
      message: `AI Error: ${error.message}. Please try again.`,
    });
  }
});

module.exports = {
  generateInterviewQuestion,
  generateResume,
  generateCoverLetter,
  codeReview,
  aiChat,
};