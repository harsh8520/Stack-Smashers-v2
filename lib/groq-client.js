const Groq = require('groq-sdk');

const MODEL = 'llama-3.3-70b-versatile'; // Fast and capable model
const MAX_RETRIES = 2;
const TEMPERATURE = 0.05; // Extremely low temperature for maximum strictness

/**
 * Get Groq API key from environment
 */
function getGroqKey() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Initialize Groq client
 */
function getGroqClient() {
  return new Groq({ apiKey: getGroqKey() });
}

/**
 * Sleep for a specified duration
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Construct analysis prompt for Groq
 */
function constructAnalysisPrompt(input) {
  return `You are a STRICT but FAIR content analyst. Score based on objective quality metrics. Be critical but accurate.

Content: "${input.content}"
Target Platform: ${input.targetPlatform}
Content Intent: ${input.contentIntent}
Word Count: ${input.wordCount}

SCORING GUIDELINES:
- 90-100: EXCELLENT - Professional quality, publication-ready, minimal flaws
- 80-89: VERY GOOD - Strong content, minor improvements needed
- 70-79: GOOD - Solid foundation, some notable issues to address
- 60-69: ACCEPTABLE - Meets basic standards, needs improvements
- 50-59: BELOW AVERAGE - Significant issues, major revisions required
- 40-49: POOR - Fundamental problems, complete rewrite recommended
- Below 40: UNACCEPTABLE - Fails basic quality standards

CRITICAL ISSUES TO IDENTIFY:
- Sentences over 25 words (flag each one)
- Filler words: "very", "really", "like", "just", "actually", "basically", "literally", "a lot of", "kind of", "sort of"
- Missing structure (no headings, bullets, or lists)
- Vague statements without specific data or examples
- No call-to-action
- Wall of text (no paragraph breaks)
- Repetitive words or phrases
- Poor readability
- Platform misalignment

SCORING APPROACH:
- Start with a base score reflecting overall quality
- Identify ALL issues with specific examples
- Provide 8-12 detailed, actionable recommendations
- Be specific about what's wrong and how to fix it

CRITICAL EVALUATION:

1. DIMENSION SCORES (BE THOROUGH AND ACCURATE):
   - score: 0-100 (Score based on actual quality - good content gets 70-85, bad content gets 35-50)
   - confidence: 0-1
   - issues: Array with 6-10 SPECIFIC ISSUES (quote exact problems with measurements)
   - strengths: Array of genuine strengths (ALWAYS include 2-4 for good content, 0-1 for bad content)
   - explanation: 3-4 sentences explaining the score
   - examples: 2-4 quoted sections showing problems with exact measurements

2. SUGGESTIONS (DETAILED - 8-12 RECOMMENDATIONS):
   Provide actionable improvements. Each must include:
   - priority: "high" (for critical flaws), "medium", "low"
   - category: specific dimension
   - title: Clear, specific title
   - description: 4-6 sentence explanation:
     * Exact problem with specific quotes
     * Why this matters for ${input.targetPlatform}
     * Precise fix with measurements
     * Expected improvement
   - reasoning: Why this is important
   - examples: 3-4 before/after examples

3. READABILITY METRICS (BE HONEST):
   - fleschKincaidScore: Calculate ACCURATELY (penalize heavily for complexity)
   - gradeLevel: Be realistic (most content is 12-16, not 8-10)
   - readingTimeMinutes: wordCount / 200
   - interpretation: HARSH assessment of readability problems

4. KEYWORD ANALYSIS (FIND PROBLEMS):
   - primary: Top keywords with EXACT frequency and density
   - density: Flag ANY keyword over 2.5% as stuffing
   - suggestions: Specific SEO improvements needed

5. EMOTIONAL TONE (BE CRITICAL):
   - primary: Identify actual tone (often "boring", "academic", "confusing")
   - confidence: Realistic scores
   - alignment: Point out misalignment with platform

6. REWRITES (SHOW DRAMATIC IMPROVEMENTS):
   - 3-4 examples showing how bad the original is vs. how good it should be
   - Mark impact as "critical" for major flaws

7. IMPROVEMENT CHECKLIST (PRIORITIZE HARSHLY):
   - 5-8 items ordered by severity
   - Be specific about effort required

SCORING INSTRUCTIONS:
- Evaluate content objectively based on quality
- Good content with structure, data, and clarity should score 75-85
- Mediocre content with basic issues should score 55-65
- Poor content with major flaws should score 40-50
- Terrible content with catastrophic issues should score 30-40
- ALWAYS include strengths array for each dimension (even bad content has 1-2 strengths)
- Good content should have 3-5 strengths per dimension

Return ONLY valid JSON:
{
  "dimensionScores": {
    "structure": {"score": 45, "confidence": 0.90, "issues": [
      {"type": "critical", "category": "structure", "description": "Zero structural elements - no headings, bullets, or lists. Content is a wall of text.", "suggestion": "Add 3-4 clear H2 headings and convert key points to bullet lists", "reasoning": "Unstructured content has 70% higher bounce rates on blogs"},
      {"type": "critical", "category": "structure", "description": "Sentences average 35+ words - far exceeding the 15-20 word optimal range", "suggestion": "Break every sentence over 20 words into 2-3 shorter sentences", "reasoning": "Long sentences reduce comprehension by 60%"}
    ], "strengths": ["Clear topic focus", "Consistent terminology"], "explanation": "This content completely fails structural standards. No headings, no bullets, run-on sentences throughout. Unacceptable for ${input.targetPlatform}. Requires complete restructuring.", "examples": [{"quote": "First 50 words of problematic sentence...", "issue": "58-word run-on sentence", "suggestion": "Break into 3 sentences of 15-20 words each"}]},
    "tone": {"score": 52, "confidence": 0.88, "issues": [
      {"type": "important", "category": "tone", "description": "Excessive use of filler words: 'like', 'very', 'a lot of' - unprofessional", "suggestion": "Remove all filler words and use precise language", "reasoning": "Filler words reduce credibility by 40%"}
    ], "strengths": ["Conversational approach"], "explanation": "Tone is weak and unprofessional. Filled with hedging language and vague statements. Lacks authority.", "examples": []},
    "accessibility": {"score": 48, "confidence": 0.85, "issues": [
      {"type": "critical", "category": "accessibility", "description": "Flesch-Kincaid grade level of 16+ - requires graduate-level education", "suggestion": "Simplify vocabulary and sentence structure to achieve grade 10-12", "reasoning": "Content should be accessible to 80% of target audience"}
    ], "strengths": [], "explanation": "Extremely difficult to read. Complex sentences and jargon make this inaccessible to most readers.", "examples": []},
    "platformAlignment": {"score": 40, "confidence": 0.92, "issues": [
      {"type": "critical", "category": "platform", "description": "Missing ALL blog essentials: no subheadings, no scannable format, no clear takeaways", "suggestion": "Add H2/H3 headings, bullet points, bold key phrases, and a summary box", "reasoning": "Blog readers scan first - this format guarantees immediate bounce"}
    ], "strengths": [], "explanation": "Completely misaligned with blog format. Reads like an academic paper, not engaging blog content. Fails platform requirements.", "examples": []}
  },
  "overallScore": 46,
  "suggestions": [
    {
      "priority": "high",
      "category": "structure",
      "title": "CRITICAL: Eliminate All Run-On Sentences Immediately",
      "description": "Your content is plagued with sentences exceeding 40-50 words. This is UNACCEPTABLE for blog content. The first sentence alone is 58 words - readers will abandon immediately. EVERY sentence must be 15-20 words maximum. Break complex thoughts into multiple clear statements. Use periods liberally. This single issue is destroying your readability and engagement.",
      "reasoning": "Neuroscience research proves sentences over 25 words cause cognitive overload. Readers must re-read 2-3 times to comprehend. On blogs, 80% of users scan rather than read. Long sentences guarantee they'll leave. Professional content writers NEVER exceed 25 words per sentence. This is Content Writing 101.",
      "examples": [
        "BEFORE (58 words): 'AI is like very powerful and important thing that is changing everything today and companies everywhere are using it in many different ways that include data analysis, automation, marketing predictions and a lot of other applications that sometimes are not very clear to normal people who do not work in technology fields.'",
        "AFTER (3 sentences, 15-18 words each): 'AI is transforming modern business operations. Companies leverage it for data analysis, automation, and predictive marketing. However, many non-technical professionals struggle to understand its practical applications.'",
        "IMPACT: Readability improves from grade 16 to grade 10. Comprehension increases 65%. Engagement time doubles."
      ]
    },
    {
      "priority": "high",
      "category": "structure",
      "title": "CRITICAL: Add Structural Elements - Content is Unreadable Wall of Text",
      "description": "Your content has ZERO structural elements. No headings, no bullet points, no numbered lists, no bold text. This is a complete failure of basic content formatting. Blog readers scan before reading - your format guarantees instant bounce. You need 3-4 H2 headings, bullet lists for key points, and bold text for emphasis. This is non-negotiable for ${input.targetPlatform}.",
      "reasoning": "Eye-tracking studies show 79% of blog readers scan headings first. Without headings, your content is invisible. Bullet points increase retention by 50%. Your current format violates every principle of web content design. Professional blogs ALWAYS use clear hierarchy and scannable elements.",
      "examples": [
        "ADD: '## Why AI Matters for Business' (H2 heading)",
        "ADD: '• Data analysis\n• Process automation\n• Predictive analytics' (bullet list)",
        "ADD: Bold key phrases like **artificial intelligence** and **business transformation**"
      ]
    }
  ],
  "readability": {"fleschKincaidScore": 35, "gradeLevel": 16, "readingTimeMinutes": 2, "interpretation": "SEVERELY DIFFICULT - Requires graduate-level education. Completely inappropriate for blog audience. Must simplify immediately."},
  "keywords": {"primary": [{"keyword": "AI", "frequency": 12, "density": 6.8}], "density": {"AI": 6.8}, "suggestions": ["CRITICAL: Keyword 'AI' is stuffed at 6.8% density (max should be 2%). Use synonyms: 'artificial intelligence', 'machine learning', 'intelligent systems'"]},
  "emotionalTone": {"primary": ["academic", "boring", "confusing"], "confidence": {"academic": 0.9, "boring": 0.85, "confusing": 0.8}, "alignment": "COMPLETELY MISALIGNED - Reads like a research paper, not engaging blog content. Tone is dry, passive, and sleep-inducing."},
  "rewrites": [
    {"original": "AI is like very powerful and important thing that is changing everything", "improved": "AI is revolutionizing business operations", "explanation": "Removed filler words ('like', 'very'), vague language ('thing', 'everything'), and made specific", "impact": "critical"},
    {"original": "a lot of other applications that sometimes are not very clear", "improved": "applications that remain unclear to many", "explanation": "Eliminated weak phrases ('a lot of', 'sometimes', 'very'), used active voice", "impact": "high"}
  ],
  "improvementChecklist": [
    {"priority": 1, "action": "IMMEDIATELY break all sentences over 20 words into shorter statements (15-20 words max)", "impact": "Will improve readability score by 25+ points and double engagement", "effort": "high"},
    {"priority": 2, "action": "Add 3-4 H2 headings and convert key points to bullet lists", "impact": "Transforms unreadable wall of text into scannable, professional content", "effort": "medium"},
    {"priority": 3, "action": "Remove ALL filler words: 'like', 'very', 'really', 'a lot of', 'kind of'", "impact": "Increases professionalism and credibility by 40%", "effort": "low"},
    {"priority": 4, "action": "Reduce 'AI' keyword density from 6.8% to under 2.5% using synonyms", "impact": "Prevents SEO penalties for keyword stuffing", "effort": "low"},
    {"priority": 5, "action": "Add specific data, statistics, or examples to replace vague statements", "impact": "Increases trust and authority by 50%", "effort": "medium"}
  ]
}`;
}

/**
 * Parse and validate AI response
 */
function parseAIResponse(content, originalContent = '') {
  try {
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(cleanContent);
    
    if (!parsed.dimensionScores || !parsed.overallScore) {
      throw new Error('Invalid response structure');
    }
    
    // Apply ONLY hard caps (no penalties - AI already considers issues)
    const hardCaps = enforceHardCaps(originalContent);
    
    const requiredDimensions = ['structure', 'tone', 'accessibility', 'platformAlignment'];
    for (const dimension of requiredDimensions) {
      if (!parsed.dimensionScores[dimension]) {
        throw new Error(`Missing dimension: ${dimension}`);
      }
      const dimScore = parsed.dimensionScores[dimension];
      
      // Apply hard cap if content is severely flawed
      if (hardCaps.maxScore < 100) {
        dimScore.score = Math.min(dimScore.score, hardCaps.maxScore);
      }
      
      dimScore.explanation = dimScore.explanation || '';
      dimScore.examples = dimScore.examples || [];
    }
    
    // Calculate overall score with hard cap applied
    const avgScore = requiredDimensions.reduce((sum, dim) => 
      sum + parsed.dimensionScores[dim].score, 0) / requiredDimensions.length;
    let finalScore = Math.round(avgScore);
    
    // ENFORCE HARD CAP - Override AI if content is severely flawed
    finalScore = Math.min(finalScore, hardCaps.maxScore);
    
    parsed.overallScore = finalScore;
    
    parsed.readability = parsed.readability || null;
    parsed.keywords = parsed.keywords || null;
    parsed.emotionalTone = parsed.emotionalTone || null;
    parsed.rewrites = parsed.rewrites || [];
    parsed.improvementChecklist = parsed.improvementChecklist || [];
    parsed.suggestions = parsed.suggestions || [];
    
    console.log(`Scoring: AI=${Math.round(avgScore)}, HardCap=${hardCaps.maxScore}, Final=${finalScore}`);
    if (hardCaps.reasons.length > 0) {
      console.log(`  Reasons: ${hardCaps.reasons.join(', ')}`);
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse Groq response:', error);
    console.error('Response content:', content.substring(0, 500));
    return generateFallbackResponse();
  }
}

/**
 * Enforce hard score caps based on severe content flaws
 * This prevents AI from being too generous with severely flawed content
 */
function enforceHardCaps(content) {
  if (!content) return { maxScore: 100, reasons: [] };
  
  const caps = {
    maxScore: 100,
    reasons: []
  };
  
  // Check for catastrophic run-on sentences (40+ words)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const extremeLongSentences = sentences.filter(s => s.trim().split(/\s+/).length > 40).length;
  
  if (extremeLongSentences > 0) {
    caps.maxScore = Math.min(caps.maxScore, 42);
    caps.reasons.push(`${extremeLongSentences} catastrophic run-on sentences (40+ words)`);
  }
  
  // Check for multiple long sentences (25+ words)
  const longSentences = sentences.filter(s => {
    const wc = s.trim().split(/\s+/).length;
    return wc > 25 && wc <= 40;
  }).length;
  
  if (longSentences >= 3) {
    caps.maxScore = Math.min(caps.maxScore, 48);
    caps.reasons.push(`${longSentences} long sentences (25+ words)`);
  }
  
  // Check for excessive filler words
  const fillerWords = ['very', 'really', 'like', 'just', 'actually', 'basically', 'literally', 'a lot of', 'kind of', 'sort of'];
  const lowerContent = content.toLowerCase();
  let fillerCount = 0;
  fillerWords.forEach(filler => {
    fillerCount += (lowerContent.match(new RegExp('\\b' + filler + '\\b', 'g')) || []).length;
  });
  
  if (fillerCount >= 8) {
    caps.maxScore = Math.min(caps.maxScore, 45);
    caps.reasons.push(`${fillerCount} filler words`);
  } else if (fillerCount >= 5) {
    caps.maxScore = Math.min(caps.maxScore, 52);
    caps.reasons.push(`${fillerCount} filler words`);
  }
  
  // Check for no structure
  const hasStructure = content.match(/^#+\s/m) || content.match(/^[-*•]\s/m) || content.match(/^\d+\.\s/m);
  if (!hasStructure) {
    caps.maxScore = Math.min(caps.maxScore, 50);
    caps.reasons.push('No structural elements');
  }
  
  // Check for wall of text
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  if (paragraphs.length <= 1 && content.length > 200) {
    caps.maxScore = Math.min(caps.maxScore, 48);
    caps.reasons.push('Wall of text - no paragraph breaks');
  }
  
  // Check for no specific data/numbers
  const hasData = content.match(/\d+%|\d+\.\d+|\$\d+|\d+ [a-z]+/i);
  if (!hasData) {
    caps.maxScore = Math.min(caps.maxScore, 55);
    caps.reasons.push('No specific data or statistics');
  }
  
  // Combine multiple severe issues
  const severeIssues = caps.reasons.length;
  if (severeIssues >= 4) {
    caps.maxScore = Math.min(caps.maxScore, 38);
    caps.reasons.push(`${severeIssues} severe issues combined`);
  } else if (severeIssues >= 3) {
    caps.maxScore = Math.min(caps.maxScore, 45);
  }
  
  return caps;
}

/**
 * Generate fallback response
 */
function generateFallbackResponse() {
  return {
    dimensionScores: {
      structure: { score: 50, confidence: 0.3, issues: [], strengths: [], explanation: '', examples: [] },
      tone: { score: 50, confidence: 0.3, issues: [], strengths: [], explanation: '', examples: [] },
      accessibility: { score: 50, confidence: 0.3, issues: [], strengths: [], explanation: '', examples: [] },
      platformAlignment: { score: 50, confidence: 0.3, issues: [], strengths: [], explanation: '', examples: [] }
    },
    overallScore: 50,
    suggestions: [{
      priority: 'high',
      category: 'system',
      title: 'Analysis Unavailable',
      description: 'AI analysis temporarily unavailable',
      reasoning: 'Service error'
    }],
    readability: null,
    keywords: null,
    emotionalTone: null,
    rewrites: [],
    improvementChecklist: []
  };
}

/**
 * Analyze content with Groq API
 */
async function analyzeContentWithAI(input) {
  const groq = getGroqClient();
  const prompt = constructAnalysisPrompt(input);
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Groq attempt ${attempt + 1}...`);
      
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a professional content analyst. Score accurately based on objective quality. Good content scores 75-85, mediocre 55-65, poor 40-50. Be thorough and fair. Return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: TEMPERATURE,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0].message.content;
      console.log('Groq response received, parsing...');
      return parseAIResponse(content, input.content);
    } catch (error) {
      console.error(`Groq attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${backoffMs}ms...`);
        await sleep(backoffMs);
      }
    }
  }
  
  console.log('All Groq attempts failed, returning fallback response');
  return generateFallbackResponse();
}

module.exports = {
  analyzeContentWithAI,
  constructAnalysisPrompt,
  parseAIResponse,
  generateFallbackResponse
};
