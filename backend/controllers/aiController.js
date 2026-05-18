/**
 * AI Controller - Multi-Key Rotation System
 * Automatically rotates between multiple Gemini API keys
 * Falls back to demo mode only when ALL keys are exhausted
 */

const { asyncHandler } = require('../middleware/error');

// ── Key Rotation State ───────────────────────────────────────────────
let currentKeyIndex = 0;
const keyUsageCount = {};

// Get all available API keys
const getApiKeys = () => {
  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    // Fallback to single key if using old config
    process.env.GEMINI_API_KEY,
  ].filter(k => k && k.trim() !== '' && k !== 'your_gemini_key_here');

  // Remove duplicates
  return [...new Set(keys)];
};

// ── Gemini API Call With Key Rotation ───────────────────────────────
const callGemini = async (prompt) => {
  const apiKeys = getApiKeys();

  if (apiKeys.length === 0) {
    console.log('⚠️  No Gemini API keys configured - using demo mode');
    return getMockResponse(prompt);
  }

  console.log(`🔑 Available API keys: ${apiKeys.length}`);

  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-pro',
  ];

  // Try each key
  for (let keyAttempt = 0; keyAttempt < apiKeys.length; keyAttempt++) {
    // Rotate to next key in round-robin fashion
    const keyIndex = (currentKeyIndex + keyAttempt) % apiKeys.length;
    const apiKey = apiKeys[keyIndex];

    console.log(`🔑 Trying key ${keyIndex + 1} of ${apiKeys.length}`);

    // Try each model with this key
    for (const model of models) {
      try {
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
          const errMsg = data.error.message || '';
          const errCode = data.error.code;
          const errStatus = data.error.status;

          console.log(`⚠️  Key ${keyIndex + 1} / Model ${model}: ${errMsg}`);

          // Quota exceeded for this key - try next key
          if (
            errStatus === 'RESOURCE_EXHAUSTED' ||
            errCode === 429 ||
            errMsg.toLowerCase().includes('quota') ||
            errMsg.toLowerCase().includes('limit')
          ) {
            console.log(`🔄 Key ${keyIndex + 1} quota exceeded - rotating to next key`);
            break; // Break model loop, try next key
          }

          // Model not found - try next model
          if (errMsg.includes('not found') || errCode === 404) {
            continue; // Try next model
          }

          // Invalid key - try next key
          if (
            errMsg.includes('API_KEY_INVALID') ||
            errMsg.includes('invalid') ||
            errCode === 400
          ) {
            console.log(`❌ Key ${keyIndex + 1} is invalid - trying next key`);
            break; // Break model loop, try next key
          }

          continue; // Try next model
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          // Success - update current key index for next request (round-robin)
          currentKeyIndex = (keyIndex + 1) % apiKeys.length;
          console.log(`✅ Success! Key ${keyIndex + 1} / Model: ${model}`);

          // Track usage
          keyUsageCount[keyIndex] = (keyUsageCount[keyIndex] || 0) + 1;
          console.log(`📊 Key usage counts:`, keyUsageCount);

          return text;
        }

      } catch (err) {
        console.log(`❌ Network error key ${keyIndex + 1} / ${model}: ${err.message}`);
        continue;
      }
    }
  }

  // All keys exhausted - use demo mode
  console.log('⚠️  All API keys exhausted - switching to demo mode');
  return getMockResponse(prompt);
};

// ── Demo Responses ───────────────────────────────────────────────────
const getMockResponse = (prompt) => {
  const p = prompt.toLowerCase();

  if (p.includes('interview') || p.includes('interviewer')) {
    return `## 🎯 Interview Question: Explain the difference between Process and Thread

**What the interviewer is looking for:**
- Understanding of OS concepts
- Memory management knowledge
- Practical use cases

**Key Points:**

**Process:**
- Independent program in execution
- Has its own memory space
- More overhead to create
- Communication via IPC (Inter-Process Communication)
- Crash of one doesn't affect others

**Thread:**
- Lightweight unit within a process
- Shares memory with other threads
- Less overhead to create
- Communication via shared memory
- Crash can affect entire process

**Real-world example:**
- Chrome browser: each tab = separate process (isolation)
- Web server: each request = new thread (performance)

**Time Estimate:** 5-7 minutes

---
*💡 Demo mode — All API keys quota exceeded. Will restore automatically after 24 hours.*`;
  }

  if (p.includes('resume')) {
    return `# Professional Resume

## Your Name
📧 email@gmail.com | 📱 +91-9876543210
🔗 linkedin.com/in/yourname | 💻 github.com/yourname
📍 Jalgaon, Maharashtra

---

## PROFESSIONAL SUMMARY
Motivated Computer Engineering graduate from SSBT College with strong foundation in full-stack development and competitive programming. Proven ability to build scalable web applications and solve complex algorithmic problems.

---

## TECHNICAL SKILLS
**Languages:** C++, Java, Python, JavaScript
**Frontend:** React.js, HTML5, CSS3, Tailwind CSS
**Backend:** Node.js, Express.js, REST APIs, Socket.io
**Database:** MongoDB, MySQL, PostgreSQL
**Tools:** Git, GitHub, VS Code, Postman, Docker
**Cloud:** AWS basics, MongoDB Atlas, Vercel, Render

---

## EDUCATION
**B.Tech - Computer Engineering**
SSBT College of Engineering & Technology, Jalgaon
2020 - 2024 | CGPA: 8.7/10

**Key Courses:** DSA, DBMS, OS, Computer Networks, Software Engineering

---

## PROJECTS
**Future Bridge - Smart Education Platform**
*React.js, Node.js, MongoDB, Socket.io, Gemini AI*
- Built full-stack education platform for 500+ engineering students
- Integrated AI Interview Coach using Google Gemini API
- Implemented real-time chat using Socket.io
- Features: DSA tracker, code editor, attendance system, job portal

**E-Commerce Platform**
*MERN Stack, Redux, Stripe*
- Complete shopping platform with payment integration
- Admin dashboard with sales analytics
- 99.9% uptime with optimized MongoDB queries

---

## EXPERIENCE
**Web Developer Intern | TechStartup Pvt Ltd**
June 2023 - August 2023
- Developed 15+ React components reducing load time by 35%
- Built RESTful APIs handling 50,000+ daily requests
- Collaborated with 8-member agile development team

---

## ACHIEVEMENTS
- ⭐ Solved 400+ problems on LeetCode (Rating: 1950)
- 🏆 Winner - Smart India Hackathon 2023 (Regional Level)
- 🎖️ 5-star Gold Badge on HackerRank in Problem Solving
- 📜 AWS Cloud Practitioner Certified

---
*💡 Demo mode - Add valid Gemini API keys for personalized resume generation.*`;
  }

  if (p.includes('cover letter')) {
    return `[Your Name]
[Your Email] | [Your Phone]
[Date]

Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position at [Company Name]. As a Computer Engineering graduate from SSBT College of Engineering with hands-on experience in full-stack development and AI integration, I am excited about the opportunity to contribute meaningfully to your team.

During my academic journey, I built Future Bridge — a comprehensive education platform serving 500+ engineering students. This project involved implementing real-time features with Socket.io, integrating Google Gemini AI for intelligent coaching, and building a scalable REST API backend with Node.js and MongoDB. This experience sharpened my ability to architect production-ready systems and work with modern cloud infrastructure.

What excites me most about [Company Name] is your commitment to [specific company value]. Your work on [specific product/project] aligns perfectly with my passion for building technology that creates real-world impact. I am confident that my technical skills in React.js, Node.js, and problem-solving mindset make me an excellent fit for your engineering team.

I would welcome the opportunity to discuss how my background can contribute to [Company Name]'s continued growth. Thank you for considering my application.

Sincerely,
[Your Name]
[LinkedIn] | [GitHub] | [Portfolio]

---
*💡 Demo mode - Add valid Gemini API keys for personalized cover letters.*`;
  }

  if (p.includes('code') || p.includes('review')) {
    return `## 🔍 AI Code Review

### ✅ Correctness
The code logic appears correct and handles the main use case.

### ⏱ Time Complexity Analysis
- **Current:** O(n²) due to nested iterations
- **Optimized:** O(n) using HashMap/Set approach
- **Recommendation:** Use a Map for O(1) lookups

### 💾 Space Complexity
- **Current:** O(1) extra space
- **After optimization:** O(n) for the HashMap

### 📝 Code Quality Score: 7/10

**Strengths:**
- ✅ Clean variable naming
- ✅ Readable logic flow
- ✅ Proper code structure

**Issues Found:**
- ⚠️ Missing input validation (null/empty check)
- ⚠️ No error handling for edge cases
- ⚠️ Magic numbers without constants
- ⚠️ Missing code comments

### 🔧 Suggested Improvements

\`\`\`javascript
// 1. Add input validation
if (!input || input.length === 0) {
  throw new Error('Input cannot be empty');
}

// 2. Use constants for magic numbers
const MAX_SIZE = 1000;

// 3. Optimized O(n) approach
const seen = new Map();
for (const item of input) {
  if (seen.has(item)) return seen.get(item);
  seen.set(item, currentIndex);
}
\`\`\`

### 🚀 Alternative Approach
Consider using built-in JavaScript methods like \`Array.reduce()\` or \`Map\` for cleaner, more idiomatic code.

### 📚 Resources to Learn More
- MDN Web Docs: Array methods
- LeetCode: Hash Table problems
- Big-O Cheat Sheet: bigocheatsheet.com

---
*💡 Demo mode - Add valid Gemini API keys for real-time code review.*`;
  }

  return `## 👋 Hello! I'm BridgeBot

I'm the AI assistant for Future Bridge Smart Education Platform.

**I can help you with:**
- 🎯 Mock interview questions and feedback
- 📄 Professional resume generation
- ✉️ Personalized cover letters
- 💻 Code review and optimization
- 📚 Study guidance for engineering

**Currently in Demo Mode**
The AI is showing sample responses. For real personalized AI responses:
1. Add valid Gemini API keys to the backend
2. Each key provides 1500 free requests/day
3. Multiple keys can be added for higher limits

How can I help you today?`;
};

// ── Controllers ──────────────────────────────────────────────────────

const generateInterviewQuestion = asyncHandler(async (req, res) => {
  const { topic, difficulty, userAnswer, role: jobRole } = req.body;

  let prompt;
  if (userAnswer) {
    prompt = `You are an expert technical interviewer.
Topic: ${topic} (${difficulty} level) for ${jobRole || 'Software Developer'} role.
Candidate answer: "${userAnswer}"

Evaluate with:
1. Score out of 10
2. Strengths
3. Areas to improve
4. Model answer
5. Follow-up question`;
  } else {
    prompt = `You are an expert technical interviewer for ${jobRole || 'Software Developer'}.
Generate a ${difficulty || 'medium'} level interview question about: ${topic || 'Data Structures'}.

Include:
1. The question
2. What interviewer looks for
3. Key points for a good answer
4. Estimated answer time`;
  }

  const response = await callGemini(prompt);
  res.json({ success: true, response });
});

const generateResume = asyncHandler(async (req, res) => {
  const { personalInfo, education, experience, skills, projects, targetRole } = req.body;

  const prompt = `Create a professional ATS-optimized resume in markdown format for:
Name: ${personalInfo?.name || 'Candidate'}
Target Role: ${targetRole || 'Software Engineer'}
Email: ${personalInfo?.email || ''}
Phone: ${personalInfo?.phone || ''}
LinkedIn: ${personalInfo?.linkedin || ''}
GitHub: ${personalInfo?.github || ''}
Skills: ${JSON.stringify(skills || [])}
Education: ${JSON.stringify(education || [])}
Experience: ${JSON.stringify(experience || [])}
Projects: ${JSON.stringify(projects || [])}

Make it professional with action verbs and quantified achievements. Include all standard resume sections.`;

  const response = await callGemini(prompt);
  res.json({ success: true, resume: response });
});

const generateCoverLetter = asyncHandler(async (req, res) => {
  const { personalInfo, jobTitle, companyName, jobDescription, userBackground } = req.body;

  const prompt = `Write a compelling professional cover letter for:
Applicant: ${personalInfo?.name || 'Applicant'}
Email: ${personalInfo?.email || ''}
Job Title: ${jobTitle || 'Software Engineer'}
Company: ${companyName || 'Company'}
Job Description: ${jobDescription || 'Software development role'}
Background: ${userBackground || 'Software developer with strong technical skills'}

Write 3-4 paragraphs: strong opening hook, match experience to role, show company knowledge, strong call-to-action closing.`;

  const response = await callGemini(prompt);
  res.json({ success: true, coverLetter: response });
});

const codeReview = asyncHandler(async (req, res) => {
  const { code, language, problemTitle } = req.body;

  const prompt = `You are a senior software engineer doing a detailed code review.
Problem: ${problemTitle || 'Programming problem'}
Language: ${language || 'Unknown'}
Code:
\`\`\`${language}
${code}
\`\`\`

Provide review covering:
1. Correctness - does it solve the problem?
2. Time Complexity - Big O analysis
3. Space Complexity
4. Code Quality - readability, naming, style
5. Specific improvements with code examples
6. Alternative better approach if applicable`;

  const response = await callGemini(prompt);
  res.json({ success: true, review: response });
});

const aiChat = asyncHandler(async (req, res) => {
  const { message, context } = req.body;

  const prompt = `You are BridgeBot, the AI learning assistant for Future Bridge - a smart education platform for engineering students at SSBT College.
Context: ${context || 'Student asking a question'}
Student message: ${message}

Respond helpfully, concisely and in a friendly educational tone. For technical questions provide clear explanations with examples.`;

  const response = await callGemini(prompt);
  res.json({ success: true, response });
});

module.exports = {
  generateInterviewQuestion,
  generateResume,
  generateCoverLetter,
  codeReview,
  aiChat,
};