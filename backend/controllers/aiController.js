/**
 * AI Controller - Fixed for Production
 * Uses Gemini 2.5 Flash with proper error handling
 */

const { asyncHandler } = require('../middleware/error');

// ── Gemini API Call ──────────────────────────────────────────────────
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // No API key - use demo mode
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_key_here') {
    console.log('⚠️  No Gemini API key - using demo mode');
    return getMockResponse(prompt);
  }

  // Try models in order
  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-pro',
  ];

  for (const model of models) {
    try {
      console.log(`📡 Trying Gemini model: ${model}`);

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
        console.log(`⚠️  Model ${model} error: ${errMsg}`);

        // Quota exceeded - fall back to demo mode immediately
        if (errMsg.includes('quota') || errMsg.includes('QUOTA') ||
            errMsg.includes('RESOURCE_EXHAUSTED') || data.error.code === 429) {
          console.log('⚠️  Quota exceeded - using demo mode');
          return getMockResponse(prompt);
        }

        // Model not found - try next model
        if (errMsg.includes('not found') || errMsg.includes('404')) {
          continue;
        }

        // API key invalid
        if (errMsg.includes('API_KEY_INVALID') || data.error.code === 400) {
          console.log('❌ Invalid API key - using demo mode');
          return getMockResponse(prompt);
        }

        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`✅ Gemini ${model} responded successfully`);
        return text;
      }

    } catch (err) {
      console.log(`⚠️  Model ${model} fetch error: ${err.message}`);
      continue;
    }
  }

  // All models failed - use demo mode
  console.log('⚠️  All models failed - using demo mode');
  return getMockResponse(prompt);
};

// ── Demo responses ───────────────────────────────────────────────────
const getMockResponse = (prompt) => {
  const p = prompt.toLowerCase();

  if (p.includes('interview') || p.includes('interviewer')) {
    return `## Interview Question: Explain the difference between Array and Linked List

**What the interviewer is looking for:**
- Understanding of memory allocation
- Time complexity knowledge
- Real-world use cases

**Key Points to Cover:**

**Array:**
- Fixed size, contiguous memory
- O(1) random access by index
- O(n) insertion/deletion in middle
- Cache friendly

**Linked List:**
- Dynamic size, non-contiguous memory
- O(n) access by index
- O(1) insertion/deletion at head
- Extra memory for pointers

**When to use Array:** When you need random access and size is known

**When to use Linked List:** When frequent insertion/deletion needed

**Time Estimate:** 5-7 minutes

---
*Note: AI is in demo mode. Add a valid Gemini API key for personalized responses.*`;
  }

  if (p.includes('resume')) {
    return `# Professional Resume

## John Doe
📧 john@example.com | 📱 +91-9876543210
🔗 linkedin.com/in/johndoe | 💻 github.com/johndoe

---

## PROFESSIONAL SUMMARY
Results-driven Software Engineer with 2+ years of experience in full-stack development. Expertise in React.js, Node.js, and MongoDB. Passionate about building scalable web applications.

---

## TECHNICAL SKILLS
**Languages:** JavaScript, Python, Java, C++
**Frontend:** React.js, HTML5, CSS3, Tailwind CSS
**Backend:** Node.js, Express.js, REST APIs
**Database:** MongoDB, MySQL, PostgreSQL
**Tools:** Git, Docker, AWS, VS Code, Postman

---

## EDUCATION
**B.Tech - Computer Engineering**
SSBT College of Engineering | 2020-2024 | CGPA: 8.5/10

---

## EXPERIENCE
**Software Developer Intern | TechCorp Pvt Ltd**
Jun 2023 - Aug 2023
- Built RESTful APIs serving 10,000+ daily requests using Node.js
- Reduced database query time by 40% through optimization
- Developed React components improving UI performance by 30%

---

## PROJECTS
**Future Bridge - Education Platform**
React.js, Node.js, MongoDB, Socket.io
- Full-stack platform for 500+ engineering students
- AI-powered interview coach and resume generator
- Real-time chat using Socket.io

**E-Commerce Website**
MERN Stack
- Complete shopping platform with payment integration
- Admin dashboard with analytics

---

## ACHIEVEMENTS
- Solved 300+ problems on LeetCode (Rating: 1900+)
- Winner - Smart India Hackathon 2023
- 5-star rating on HackerRank in Problem Solving

---
*Note: AI is in demo mode. Add Gemini API key for personalized resume.*`;
  }

  if (p.includes('cover letter')) {
    return `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the Software Engineer position at your esteemed organization. As a Computer Engineering graduate from SSBT College with hands-on experience in full-stack development, I am excited about the opportunity to contribute to your team.

During my academic journey and internship experience, I have developed strong proficiency in React.js, Node.js, and MongoDB. I successfully built and deployed a smart education platform serving 500+ students, which involved implementing real-time features using Socket.io, AI integrations with Google Gemini, and a comprehensive REST API backend.

What particularly excites me about your organization is your commitment to innovation and technology excellence. I am confident that my technical skills, problem-solving abilities, and passion for creating impactful solutions align perfectly with your team's goals.

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to your organization's continued success. Thank you for considering my application.

Sincerely,
John Doe
john@example.com | +91-9876543210

---
*Note: AI is in demo mode. Add Gemini API key for personalized cover letters.*`;
  }

  if (p.includes('code') || p.includes('review')) {
    return `## Code Review Analysis

### 1. ✅ Correctness
The code appears to solve the intended problem correctly.

### 2. ⏱ Time Complexity
**Current:** O(n²) - nested loops detected
**Optimized:** O(n) - can use HashMap approach

### 3. 💾 Space Complexity
**Current:** O(1) extra space
**With optimization:** O(n) for HashMap

### 4. 📝 Code Quality
**Strengths:**
- Clear variable naming
- Readable logic flow
- Proper indentation

**Improvements needed:**
- Add input validation
- Handle edge cases (empty array, null input)
- Add comments for complex logic

### 5. 🔧 Suggested Improvements
\`\`\`javascript
// Add null check
if (!arr || arr.length === 0) return [];

// Use Map for O(n) solution
const map = new Map();
for (const num of arr) {
  map.set(num, (map.get(num) || 0) + 1);
}
\`\`\`

### 6. 🚀 Alternative Approach
Consider using built-in methods like \`reduce()\` or \`Map\` for cleaner code.

---
*Note: AI is in demo mode. Add Gemini API key for real code reviews.*`;
  }

  return `Thank you for your question! I am BridgeBot, the AI assistant for Future Bridge.

I can help you with:
- 🎯 Interview preparation and mock questions
- 📄 Resume and cover letter generation  
- 💻 Code review and optimization tips
- 📚 Study guidance for engineering subjects
- 💼 Career advice and job preparation

Currently running in demo mode. For personalized AI responses powered by Google Gemini, please ensure a valid API key is configured.

How can I assist you today?`;
};

// ── Route Handlers ───────────────────────────────────────────────────

const generateInterviewQuestion = asyncHandler(async (req, res) => {
  const { topic, difficulty, userAnswer, role: jobRole } = req.body;

  let prompt;
  if (userAnswer) {
    prompt = `You are an expert technical interviewer.
Topic: ${topic} (${difficulty} level) for ${jobRole || 'Software Developer'} role.
Candidate answer: "${userAnswer}"

Evaluate and provide:
1. Score out of 10
2. Strengths of the answer
3. Areas for improvement
4. Model answer
5. Follow-up question`;
  } else {
    prompt = `You are an expert technical interviewer for ${jobRole || 'Software Developer'}.
Generate a ${difficulty || 'medium'} level question about: ${topic || 'Data Structures'}.

Include:
1. The interview question
2. What interviewer looks for
3. Key points for a good answer
4. Time estimate`;
  }

  const response = await callGemini(prompt);
  res.json({ success: true, response });
});

const generateResume = asyncHandler(async (req, res) => {
  const { personalInfo, education, experience, skills, projects, targetRole } = req.body;

  const prompt = `Create a professional ATS-optimized resume in markdown for:
Name: ${personalInfo?.name || 'Candidate'}
Role: ${targetRole || 'Software Engineer'}
Email: ${personalInfo?.email || ''}
Phone: ${personalInfo?.phone || ''}
Skills: ${JSON.stringify(skills || [])}
Education: ${JSON.stringify(education || [])}
Experience: ${JSON.stringify(experience || [])}
Projects: ${JSON.stringify(projects || [])}

Make it professional with action verbs and quantified achievements.`;

  const response = await callGemini(prompt);
  res.json({ success: true, resume: response });
});

const generateCoverLetter = asyncHandler(async (req, res) => {
  const { personalInfo, jobTitle, companyName, jobDescription, userBackground } = req.body;

  const prompt = `Write a compelling cover letter for:
Applicant: ${personalInfo?.name || 'Applicant'}
Job: ${jobTitle || 'Software Engineer'} at ${companyName || 'Company'}
Job Description: ${jobDescription || 'Software development role'}
Background: ${userBackground || 'Software developer'}

Write 3-4 paragraphs: strong opening, experience match, company interest, call-to-action.`;

  const response = await callGemini(prompt);
  res.json({ success: true, coverLetter: response });
});

const codeReview = asyncHandler(async (req, res) => {
  const { code, language, problemTitle } = req.body;

  const prompt = `Senior engineer code review:
Problem: ${problemTitle || 'Programming problem'}
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Review: correctness, time complexity, space complexity, code quality, improvements, alternative approach.`;

  const response = await callGemini(prompt);
  res.json({ success: true, review: response });
});

const aiChat = asyncHandler(async (req, res) => {
  const { message, context } = req.body;

  const prompt = `You are BridgeBot, AI assistant for Future Bridge education platform.
Context: ${context || 'Student question'}
Message: ${message}
Reply helpfully and concisely in educational tone.`;

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