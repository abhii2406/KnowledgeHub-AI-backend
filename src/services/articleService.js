const articleRepository = require('../repositories/articleRepository');
const aiService = require('../ai/aiService');

class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.status = 403;
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.status = 404;
    }
}

class ArticleService {
    async createArticle(userId, articleData) {
        const { title, content, category, tags } = articleData;

        // Auto-generate summary
        const summary = await aiService.generateSummary(content);

        const articleId = await articleRepository.create({
            title,
            content,
            summary,
            category,
            author_id: userId
        });

        if (tags) {
            await this.processTags(articleId, tags);
        }

        return articleId;
    }

    async updateArticle(articleId, userId, articleData) {
        const article = await articleRepository.findById(articleId);
        if (!article) throw new NotFoundError('Article not found');

        // Secure Authorization Check: Prevent horizontal privilege escalation
        if (article.author_id !== userId) {
            throw new ForbiddenError('You are not authorized to edit this article');
        }

        const { title, content, category, tags } = articleData;

        // Auto-regenerate summary and tags on update
        const summary = await aiService.generateSummary(content);

        await articleRepository.update(articleId, {
            title,
            content,
            summary,
            category
        });

        if (tags) {
            await articleRepository.removeAllTagsFromArticle(articleId);
            await this.processTags(articleId, tags);
        } else {
            // If tags not provided, we could optionally auto-suggest them if content changed
            const suggestedTags = await aiService.suggestTags(content);
            await articleRepository.removeAllTagsFromArticle(articleId);
            await this.processTags(articleId, suggestedTags);
        }
    }

    async deleteArticle(articleId, userId) {
        const article = await articleRepository.findById(articleId);
        if (!article) throw new NotFoundError('Article not found');

        // Secure Authorization Check
        if (article.author_id !== userId) {
            throw new ForbiddenError('You are not authorized to delete this article');
        }

        await articleRepository.delete(articleId);
    }

    async getArticleById(id) {
        const article = await articleRepository.findById(id);
        if (!article) return null;

        const tags = await articleRepository.getTagsByArticleId(id);
        return { ...article, tags };
    }

    async getAllArticles(filters) {
        const { page = 1, limit = 10 } = filters;
        const { articles, totalRecords, totalPages } = await articleRepository.findAll(filters);

        return {
            articles,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalRecords,
                limit: parseInt(limit)
            }
        };
    }

    async getMyArticles(userId) {
        return await articleRepository.findByAuthor(userId);
    }

    // Tags processing
    async processTags(articleId, tagsInput) {
        const tagNames = Array.isArray(tagsInput)
            ? tagsInput
            : tagsInput.split(',').map(t => t.trim()).filter(t => t);

        for (const name of tagNames) {
            let tag = await articleRepository.findTagByName(name);
            let tagId;
            if (!tag) {
                tagId = await articleRepository.createTag(name);
            } else {
                tagId = tag.id;
            }
            await articleRepository.addTagToArticle(articleId, tagId);
        }
    }

    async suggestAIFeatures(content) {
        const [improved, summary, suggestedTitle, suggestedTags] = await Promise.all([
            aiService.improveContent(content),
            aiService.generateSummary(content),
            aiService.suggestTitle(content),
            aiService.suggestTags(content)
        ]);

        return { improved, summary, suggestedTitle, suggestedTags };
    }
}

module.exports = new ArticleService();
