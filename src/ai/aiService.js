/**
 * AI Service for KnowledgeHub AI
 * Supports both Mock and Real AI modes.
 * Configuration: Set AI_MODE="real" in .env to plug in real OpenAI integration.
 */

class AIService {
    constructor() {
        this.mode = process.env.AI_MODE || 'mock';
    }

    /**
     * Main entry point for improving content.
     */
    async improveContent(content) {
        if (this.mode === 'real') {
            return await this._improveContentReal(content);
        }
        return this._improveContentMock(content);
    }

    /**
     * Main entry point for generating summary.
     */
    async generateSummary(content) {
        if (this.mode === 'real') {
            return await this._generateSummaryReal(content);
        }
        return this._generateSummaryMock(content);
    }

    /**
     * Main entry point for suggesting title.
     */
    async suggestTitle(content) {
        if (this.mode === 'real') {
            return await this._suggestTitleReal(content);
        }
        return this._suggestTitleMock(content);
    }

    /**
     * Main entry point for suggesting tags.
     */
    async suggestTags(content) {
        if (this.mode === 'real') {
            return await this._suggestTagsReal(content);
        }
        return this._suggestTagsMock(content);
    }

    // --- MOCK IMPLEMENTATIONS ---

    _stripHtml(html) {
        if (!html) return '';
        return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    }

    _improveContentMock(content) {
        if (!content) return '';

        // Add a small visual indicator for the mock mode as requested by user
        if (content.includes('<p>')) {
            return content.replace('<p>', '<p>✨ ');
        }
        return '✨ ' + content;
    }

    _generateSummaryMock(content) {
        if (!content) return '';
        const plainText = this._stripHtml(content);
        const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
        const summary = sentences.slice(0, 3).join(' ');
        return summary.length > 200 ? summary.substring(0, 197) + '...' : summary;
    }

    _suggestTitleMock(content) {
        if (!content) return 'Untitled Article';
        const plainText = this._stripHtml(content);

        // If the content is short enough, use it directly as title
        if (plainText.length < 60 && plainText.length > 10) return plainText;

        const words = plainText.split(/\W+/)
            .filter(w => w.length > 5)
            .filter(w => !['really', 'should', 'could', 'would'].includes(w.toLowerCase()));

        const keywords = words.slice(0, 3).join(' ') || 'General Topic';

        // Use randomized templates for variety
        const templates = [
            `Understanding ${keywords}`,
            `Mastering ${keywords}: A Guide`,
            `The Future of ${keywords}`,
            `Exploring the world of ${keywords}`,
            `Why ${keywords} matters today`,
            `${keywords} Explained`
        ];

        return templates[Math.floor(Math.random() * templates.length)];
    }

    _suggestTagsMock(content) {
        if (!content) return [];
        const plainText = this._stripHtml(content);
        const stopWords = new Set(['the', 'and', 'this', 'that', 'with', 'from', 'using', 'about']);
        const words = plainText.toLowerCase().split(/\W+/).filter(w => w.length > 4 && !stopWords.has(w));
        const freq = {};
        words.forEach(w => freq[w] = (freq[w] || 0) + 1);
        return Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 5);
    }

    // --- REAL AI INTEGRATION PLACEHOLDERS ---
    // To use real AI: 
    // 1. Install openai: npm install openai
    // 2. Initialize OpenAI client here
    // 3. Implement the functions below using ChatCompletions API

    async _improveContentReal(content) {
        // Example: 
        // const response = await openai.chat.completions.create({ ... });
        // return response.choices[0].message.content;
        console.log("[AI] Real AI mode: improveContent placeholder");
        return this._improveContentMock(content); // Fallback for now
    }

    async _generateSummaryReal(content) {
        console.log("[AI] Real AI mode: generateSummary placeholder");
        return this._generateSummaryMock(content);
    }

    async _suggestTitleReal(content) {
        console.log("[AI] Real AI mode: suggestTitle placeholder");
        return this._suggestTitleMock(content);
    }

    async _suggestTagsReal(content) {
        console.log("[AI] Real AI mode: suggestTags placeholder");
        return this._suggestTagsMock(content);
    }
}

module.exports = new AIService();
