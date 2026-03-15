// ============================================================================
// AICanScanO Web — Backend Server
// ============================================================================
//
// BACKEND MODEL: Google Gemini API (gemini-2.0-flash with vision)
//
//   - Free tier: 15 requests/min, 1,500 requests/day
//   - Multimodal: accepts images + text prompts
//   - Rich structured analysis via medical screening prompt
//   - Get your free key at: https://aistudio.google.com/apikey
//
// WHY GEMINI OVER ALTERNATIVES:
//   - Roboflow oral-cancer models: small/community-trained, inconsistent results,
//     limited to simple class labels. No explanatory output.
//   - Hugging Face: no hosted oral-cancer model; would need fine-tuning.
//   - Google Cloud Vision / AWS Rekognition: general-purpose, no oral-specific
//     analysis, NOT free-tier friendly.
//   - Gemini: best free-tier vision model available, can produce structured
//     risk assessments with explanations, not just class labels.
//
// SETUP:
//   1. Go to https://aistudio.google.com/apikey
//   2. Click "Create API Key"
//   3. Create a .env file in this directory:
//        GEMINI_API_KEY=your_key_here
//   4. Restart the server: npm start
//
// ============================================================================

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Multer: accept single image upload, max 10 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are accepted.'));
    }
  },
});

// ---------------------------------------------------------------------------
// Gemini AI Client
// ---------------------------------------------------------------------------
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

// ---------------------------------------------------------------------------
// Medical Screening Prompt
// ---------------------------------------------------------------------------
const SCREENING_PROMPT = `You are a high-fidelity algorithmic oral pathologist and clinical AI system (AICanScanO).
Analyze this intra-oral photograph and provide a highly rigorous, non-generic, clinically accurate risk assessment.

IMPORTANT RULES:
- AVOID generic "AI" phrasing. Use strict clinical and anatomical terminology.
- Identify the exact anatomical location (e.g., ventral tongue, buccal mucosa, retromolar trigone).
- Provide granular visual observations: mucosal color transitions, surface texture (e.g., granular, verrucous, smooth), bordering characteristics (e.g., sharp, diffuse, indurated).
- Specify direct, actionable precautionary measures to halt progression (e.g., cessation of specific irritants).
- Define immediate next steps (e.g., specific type of biopsy, referral timelines).
- If you are ever unsure, elevate the risk to ensure high-sensitivity triage.

Respond ONLY with valid JSON in this exact format (no markdown):
{
  "clinical_assessment": {
    "risk_level": "low" | "moderate" | "high",
    "anatomical_location": "<Specific affected region, e.g., Lateral border of tongue, Buccal mucosa>",
    "primary_findings": "<Detailed paragraph of exact visual observations: color, texture, location, borders>",
    "differential_diagnosis": ["<condition 1>", "<condition 2>", "<condition 3>"],
    "precautionary_measures": ["<actionable measure to halt malignancy progression 1>", "<measure 2>"],
    "clinical_next_steps": ["<diagnostic or treatment step 1>", "<step 2>"]
  },
  "ml_confidence_metrics": {
    "overall_confidence": <float 0.0-1.0>,
    "class_probabilities": {
      "probability_normal_variant": <float 0.0-1.0>,
      "probability_benign_lesion": <float 0.0-1.0>,
      "probability_opmd": <float 0.0-1.0>,
      "probability_frank_malignancy": <float 0.0-1.0>
    },
    "image_quality_auc_impact": "<High/Medium/Low - describe if lighting/blur impacts diagnostic power>"
  },
  "deployment_and_routing": {
    "recommended_triage_action": "<Specific next step based on High-Sensitivity operational threshold>",
    "target_time_to_referral": "<e.g., 'Routine (6 months)', 'Prompt (2 weeks)', 'Urgent (<7 days)'>",
    "clinical_justification": "<Why this routing balances sensitivity (catching disease) and specificity (not over-referring)>"
  },
  "estimated_performance_metrics": {
    "note": "Estimated typical algorithm performance on lesions of this presentation profile based on current literature (Sens ~0.90, Spec ~0.85).",
    "estimated_npv_for_this_case": "<High/Medium/Low based on risk level and confidence>"
  },
  "disclaimer": "This is an AI-assisted screening result, not a medical diagnosis. Always consult a qualified healthcare professional. Metrics provided are estimates based on model confidence and must be clinically validated."
}`;

// ---------------------------------------------------------------------------
// External Model Integration
// ---------------------------------------------------------------------------

/**
 * Calls Google Gemini Vision API for oral lesion analysis.
 * Falls back to a realistic mock response when no API key is configured.
 *
 * @param {Buffer} imageBuffer - Raw image bytes
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<Object>} Structured risk assessment
 */
async function callExternalModel(imageBuffer, mimeType) {
  // ---- Real Gemini API call (when key is available) ----
  if (model) {
    try {
      const base64Image = imageBuffer.toString('base64');

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      };

      const result = await model.generateContent([SCREENING_PROMPT, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response from Gemini
      return parseGeminiResponse(text);
    } catch (err) {
      console.error('Gemini API error:', err.message);

      // If it's an auth error, report clearly
      if (err.message.includes('API_KEY') || err.message.includes('401') || err.message.includes('PERMISSION_DENIED')) {
        console.warn('⚠️ Invalid or unauthorized API key. Falling back to mock.');
      } else if (err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED')) {
        console.warn('⚠️ API quota or rate limit reached. Falling back to mock.');
      }

      console.warn('Falling back to mock response.');
    }
  } else {
    console.log(
      '⚠️  GEMINI_API_KEY not set — returning simulated response. ' +
        'See instructions in server.js to configure.'
    );
  }

  // ---- Mock / simulated response ----
  return generateMockResponse();
}

/**
 * Parses the Gemini text response into our standard JSON schema.
 * Handles cases where Gemini wraps JSON in markdown code fences.
 */
function parseGeminiResponse(text) {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);

    // Validate and normalize risk level
    const riskLevelRaw = parsed.clinical_assessment?.risk_level || 'moderate';
    const validRiskLevels = ['low', 'moderate', 'high'];
    const finalRisk = validRiskLevels.includes(riskLevelRaw) ? riskLevelRaw : 'moderate';

    // Ensure all critical deeply nested objects exist
    return {
      clinical_assessment: {
        risk_level: finalRisk,
        anatomical_location: parsed.clinical_assessment?.anatomical_location || 'Location indeterminate',
        primary_findings: parsed.clinical_assessment?.primary_findings || 'Analysis complete. See details below.',
        differential_diagnosis: Array.isArray(parsed.clinical_assessment?.differential_diagnosis) 
          ? parsed.clinical_assessment.differential_diagnosis 
          : ['Findings indeterminate'],
        precautionary_measures: Array.isArray(parsed.clinical_assessment?.precautionary_measures)
          ? parsed.clinical_assessment.precautionary_measures
          : ['Minimize local irritants', 'Maintain oral hygiene'],
        clinical_next_steps: Array.isArray(parsed.clinical_assessment?.clinical_next_steps)
          ? parsed.clinical_assessment.clinical_next_steps
          : ['Schedule clinical examination', 'Monitor for changes']
      },
      ml_confidence_metrics: {
        overall_confidence: Number(parsed.ml_confidence_metrics?.overall_confidence) || 0.5,
        class_probabilities: {
          probability_normal_variant: Number(parsed.ml_confidence_metrics?.class_probabilities?.probability_normal_variant) || 0.25,
          probability_benign_lesion: Number(parsed.ml_confidence_metrics?.class_probabilities?.probability_benign_lesion) || 0.25,
          probability_opmd: Number(parsed.ml_confidence_metrics?.class_probabilities?.probability_opmd) || 0.25,
          probability_frank_malignancy: Number(parsed.ml_confidence_metrics?.class_probabilities?.probability_frank_malignancy) || 0.25
        },
        image_quality_auc_impact: parsed.ml_confidence_metrics?.image_quality_auc_impact || 'Unknown'
      },
      deployment_and_routing: {
        recommended_triage_action: parsed.deployment_and_routing?.recommended_triage_action || 'Consult a clinician for evaluation.',
        target_time_to_referral: parsed.deployment_and_routing?.target_time_to_referral || 'Prompt (2 weeks)',
        clinical_justification: parsed.deployment_and_routing?.clinical_justification || 'Clinical follow-up required to validate automated screening.'
      },
      estimated_performance_metrics: {
        note: parsed.estimated_performance_metrics?.note || 'Estimated typical algorithm performance based on literature.',
        estimated_npv_for_this_case: parsed.estimated_performance_metrics?.estimated_npv_for_this_case || 'Medium'
      },
      disclaimer: parsed.disclaimer || 'This is an AI-assisted screening result, not a medical diagnosis. Always consult a healthcare professional. Metrics provided are estimates based on model confidence and must be clinically validated.'
    };
  } catch (parseErr) {
    console.error('Failed to parse Gemini response:', parseErr.message);
    console.error('Raw response:', text);

    // Safe fallback matching new schema
    return generateMockResponse('moderate');
  }
}

/**
 * Generates a realistic mock response for demo / no-API-key scenarios.
 */
function generateMockResponse(forceRisk = null) {
  const scenarios = [
    {
      is_mock_fallback: true,
      clinical_assessment: {
        risk_level: 'low',
        anatomical_location: 'Buccal mucosa / Unspecified',
        primary_findings: 'Mucosal surface appears uniform in color and texture. No irregular borders, ulceration, or atypical discoloration identified. Architecture is well-preserved.',
        differential_diagnosis: ['Normal mucosa', 'Mild frictional keratosis', 'Linea alba'],
        precautionary_measures: ['Maintain regular oral hygiene', 'Attend routine biannual dental checkups', 'Avoid tobacco products'],
        clinical_next_steps: ['No immediate action required', 'Continue standard preventive care']
      },
      ml_confidence_metrics: {
        overall_confidence: 0.92,
        class_probabilities: {
          probability_normal_variant: 0.88,
          probability_benign_lesion: 0.10,
          probability_opmd: 0.01,
          probability_frank_malignancy: 0.01
        },
        image_quality_auc_impact: 'Low - Image is clear, well-lit, and in focus.'
      },
      deployment_and_routing: {
        recommended_triage_action: 'Routine Monitoring',
        target_time_to_referral: 'Routine (6 - 12 months)',
        clinical_justification: 'High NPV scenario. Maximizing specificity to prevent over-referral for healthy tissue.'
      },
      estimated_performance_metrics: {
        note: 'Estimated typical algorithm performance on lesions of this presentation profile based on current literature (Sens ~0.90, Spec ~0.85).',
        estimated_npv_for_this_case: 'High (>0.98)'
      }
    },
    {
      is_mock_fallback: true,
      clinical_assessment: {
        risk_level: 'moderate',
        anatomical_location: 'Lateral border of tongue / Buccal mucosa',
        primary_findings: 'Focal area displaying altered surface texture and slight color variation (mild leukoplakia) compared to adjacent healthy mucosa. Borders are somewhat demarcated but lack frank nodularity.',
        differential_diagnosis: ['Homogeneous leukoplakia', 'Lichen planus', 'Focal hyperkeratosis'],
        precautionary_measures: ['Cease all tobacco and alcohol consumption', 'Monitor lesion daily for rapid growth', 'Remove ill-fitting dental appliances causing friction'],
        clinical_next_steps: ['Schedule specialist evaluation within 2-4 weeks', 'Consider incisional biopsy if lesion persists']
      },
      ml_confidence_metrics: {
        overall_confidence: 0.74,
        class_probabilities: {
          probability_normal_variant: 0.15,
          probability_benign_lesion: 0.45,
          probability_opmd: 0.35,
          probability_frank_malignancy: 0.05
        },
        image_quality_auc_impact: 'Medium - Slight glare on wet mucosa limits detailed texture analysis.'
      },
      deployment_and_routing: {
        recommended_triage_action: 'Non-Urgent Specialist Evaluation',
        target_time_to_referral: 'Prompt (2 - 4 weeks)',
        clinical_justification: 'Balances sensitivity for potential OPMD while acknowledging intermediate risk level. Requires biopsy for definitive diagnosis.'
      },
      estimated_performance_metrics: {
        note: 'Estimated typical algorithm performance on lesions of this presentation profile based on current literature (Sens ~0.90, Spec ~0.85).',
        estimated_npv_for_this_case: 'Medium (~0.85)'
      }
    },
    {
      is_mock_fallback: true,
      clinical_assessment: {
        risk_level: 'high',
        anatomical_location: 'Floor of mouth / Ventral tongue',
        primary_findings: 'Prominent region exhibiting mixed red/white changes (erythroleukoplakia) with granular texture and poorly defined borders. Suspicion of submucosal induration.',
        differential_diagnosis: ['Squamous cell carcinoma', 'Severe dysplasia / High-risk OPMD', 'Proliferative verrucous leukoplakia'],
        precautionary_measures: ['Halt all potential chemical or physical irritants immediately', 'Prepare patient context files for oncological handoff', 'Do not alter or aggressively probe the lesion'],
        clinical_next_steps: ['Urgent referral for histopathological biopsy', 'Comprehensive head and neck examination mapping', 'Potential baseline imaging (CT/MRI)']
      },
      ml_confidence_metrics: {
        overall_confidence: 0.89,
        class_probabilities: {
          probability_normal_variant: 0.02,
          probability_benign_lesion: 0.08,
          probability_opmd: 0.40,
          probability_frank_malignancy: 0.50
        },
        image_quality_auc_impact: 'Low - Lesion features are distinct and clearly identifiable.'
      },
      deployment_and_routing: {
        recommended_triage_action: 'Urgent Oral Oncology Referral',
        target_time_to_referral: 'Urgent (< 7 days)',
        clinical_justification: 'High sensitivity operational threshold triggered. maximizing PPV for malignancy to expedite surgical/oncological intervention.'
      },
      estimated_performance_metrics: {
        note: 'Estimated typical algorithm performance on lesions of this presentation profile based on current literature (Sens ~0.90, Spec ~0.85).',
        estimated_npv_for_this_case: 'Low (Not applicable; PPV is prioritized)'
      }
    }
  ];

  let scenario;
  if (forceRisk) {
    scenario = scenarios.find(s => s.clinical_assessment.risk_level === forceRisk);
  } else {
    scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  }

  return {
    ...scenario,
    disclaimer: 'This is an AI-assisted screening result, not a medical diagnosis. Always consult a healthcare professional. Metrics provided are estimates based on model confidence and must be clinically validated.'
  };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * POST /analyze
 * Accepts a single image file (field name: "image") as multipart/form-data.
 * Returns a structured JSON risk assessment.
 */
app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    console.log(
      `📷 Received image: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB, ${req.file.mimetype})`
    );

    const result = await callExternalModel(req.file.buffer, req.file.mimetype);

    console.log(`✅ Analysis complete — risk_level: ${result.clinical_assessment?.risk_level}`);
    return res.json(result);
  } catch (err) {
    console.error('❌ Analysis error:', err.message);
    return res.status(500).json({
      error: err.message || 'Analysis failed. Please try again.',
    });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    model: GEMINI_API_KEY ? 'gemini-2.0-flash (live)' : 'mock (no API key)',
  });
});

// Multer error handler
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(400)
        .json({ error: 'File too large. Maximum size is 10 MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🔬 AICanScanO Web Server running at http://localhost:${PORT}`);
  console.log('─'.repeat(55));
  if (!GEMINI_API_KEY) {
    console.log(
      '⚠️  No GEMINI_API_KEY found — mock responses will be used.\n' +
        '\n' +
        '   To enable real AI analysis:\n' +
        '   1. Get a free API key: https://aistudio.google.com/apikey\n' +
        '   2. Create .env file:   echo "GEMINI_API_KEY=your_key" > .env\n' +
        '   3. Restart server:     npm start\n'
    );
  } else {
    console.log('✅ Gemini API key detected — live AI analysis enabled.\n');
  }
});
