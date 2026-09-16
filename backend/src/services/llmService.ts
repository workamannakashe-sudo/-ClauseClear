import fs from 'fs';
import path from 'path';
import {
  LeaseAnalysisResult,
  LeaseComparisonResult,
  GroundedQAResult,
  ActionChecklistResult
} from '../types/index.js';
import { MockService } from './mockService.js';
import { evaluateLeaseRisk } from '../engine/riskEvaluator.js';
import { assessDocumentComplexity } from '../engine/toneComplexity.js';

export class LLMService {
  private promptsDir: string;
  private isMockMode: boolean;
  private geminiApiKey?: string;
  private openaiApiKey?: string;

  constructor() {
    this.promptsDir = path.resolve(process.cwd(), 'prompts');
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;

    // Force mock mode if explicitly requested or if no API keys are provided
    const forceMock = process.env.MOCK_MODE === 'true' || process.env.MOCK_MODE === '1';
    this.isMockMode = forceMock || (!this.geminiApiKey && !this.openaiApiKey);
  }

  private loadPrompt(filename: string): string {
    const fullPath = path.join(this.promptsDir, filename);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Prompt template not found at: ${fullPath}`);
    }
    return fs.readFileSync(fullPath, 'utf-8');
  }

  public getIsMockMode(): boolean {
    return this.isMockMode;
  }

  /**
   * Analyze residential lease agreement
   */
  public async analyzeLease(text: string): Promise<LeaseAnalysisResult> {
    if (this.isMockMode) {
      return MockService.analyzeLease(text);
    }

    try {
      const systemPrompt = this.loadPrompt('system_persona.txt');
      const extractionPromptTemplate = this.loadPrompt('clause_extraction.txt');
      const userPrompt = extractionPromptTemplate.replace('{{DOCUMENT_TEXT}}', text);

      const rawResponse = await this.callLLM(systemPrompt, userPrompt);
      const parsed = this.cleanAndParseJSON(rawResponse);

      // Enhance with deterministic risk evaluation
      const evaluated = evaluateLeaseRisk(parsed.clauses || []);
      const complexity = assessDocumentComplexity(text);

      return {
        summary: {
          ...parsed.summary,
          overallRiskScore: evaluated.overallRiskScore,
          riskLevel: evaluated.overallRiskLevel,
          criticalNotice: evaluated.advisorySummary,
          complexityLevel: complexity.complexityLevel
        },
        clauses: parsed.clauses || [],
        isMockMode: false
      };
    } catch (err: any) {
      console.warn(`LLM call failed (${err.message}). Falling back to deterministic Mock Engine.`);
      return MockService.analyzeLease(text);
    }
  }

  /**
   * Substantive comparison between two leases
   */
  public async compareLeases(
    versionA: string,
    versionB: string
  ): Promise<LeaseComparisonResult> {
    if (this.isMockMode) {
      return MockService.compareLeases(versionA, versionB);
    }

    try {
      const systemPrompt = this.loadPrompt('system_persona.txt');
      const comparisonPromptTemplate = this.loadPrompt('substantive_comparison.txt');
      const userPrompt = comparisonPromptTemplate
        .replace('{{VERSION_A}}', versionA)
        .replace('{{VERSION_B}}', versionB);

      const rawResponse = await this.callLLM(systemPrompt, userPrompt);
      const parsed = this.cleanAndParseJSON(rawResponse);
      return {
        ...parsed,
        isMockMode: false
      };
    } catch (err: any) {
      console.warn(`LLM compare failed (${err.message}). Falling back to Mock Engine.`);
      return MockService.compareLeases(versionA, versionB);
    }
  }

  /**
   * Grounded natural language Q&A
   */
  public async answerQuestion(text: string, question: string): Promise<GroundedQAResult> {
    if (this.isMockMode) {
      return MockService.answerQuestion(text, question);
    }

    try {
      const systemPrompt = this.loadPrompt('system_persona.txt');
      const qaPromptTemplate = this.loadPrompt('grounded_qa.txt');
      const userPrompt = qaPromptTemplate
        .replace('{{DOCUMENT_TEXT}}', text)
        .replace('{{QUESTION}}', question);

      const rawResponse = await this.callLLM(systemPrompt, userPrompt);
      const parsed = this.cleanAndParseJSON(rawResponse);
      return {
        ...parsed,
        isMockMode: false
      };
    } catch (err: any) {
      console.warn(`LLM QA failed (${err.message}). Falling back to Mock Engine.`);
      return MockService.answerQuestion(text, question);
    }
  }

  /**
   * Generate prioritized action checklist and communication template
   */
  public async generateChecklist(
    analysis: LeaseAnalysisResult
  ): Promise<ActionChecklistResult> {
    if (this.isMockMode) {
      return MockService.generateChecklist(analysis);
    }

    try {
      const systemPrompt = this.loadPrompt('system_persona.txt');
      const checklistPromptTemplate = this.loadPrompt('action_checklist.txt');
      const userPrompt = checklistPromptTemplate.replace(
        '{{ANALYSIS_FINDINGS}}',
        JSON.stringify(analysis, null, 2)
      );

      const rawResponse = await this.callLLM(systemPrompt, userPrompt);
      const parsed = this.cleanAndParseJSON(rawResponse);
      return {
        ...parsed,
        isMockMode: false
      };
    } catch (err: any) {
      console.warn(`LLM checklist failed (${err.message}). Falling back to Mock Engine.`);
      return MockService.generateChecklist(analysis);
    }
  }

  /**
   * Dispatches LLM call to Google Gemini (or OpenAI if configured)
   */
  private async callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
    if (this.geminiApiKey) {
      return this.callGemini(systemPrompt, userPrompt);
    } else if (this.openaiApiKey) {
      return this.callOpenAI(systemPrompt, userPrompt);
    }
    throw new Error('No valid LLM API key configured');
  }

  private async callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    return data.choices?.[0]?.message?.content || '{}';
  }

  private cleanAndParseJSON(raw: string): any {
    try {
      return JSON.parse(raw);
    } catch {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      return JSON.parse(cleaned);
    }
  }
}
