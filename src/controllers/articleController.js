const articleService = require('../services/articleService');
const { sendResponse } = require('../utils/response');

class ArticleController {
    async create(req, res, next) {
        try {
            const articleId = await articleService.createArticle(req.user.id, req.body);
            return sendResponse(res, 201, true, 'Article created successfully', { articleId });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            await articleService.updateArticle(req.params.id, req.user.id, req.body);
            return sendResponse(res, 200, true, 'Article updated successfully');
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await articleService.deleteArticle(req.params.id, req.user.id);
            return sendResponse(res, 200, true, 'Article deleted successfully');
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const article = await articleService.getArticleById(req.params.id);
            if (!article) {
                return sendResponse(res, 404, false, 'Article not found');
            }
            return sendResponse(res, 200, true, 'Article fetched successfully', article);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const result = await articleService.getAllArticles(req.query);
            return sendResponse(res, 200, true, 'Articles fetched successfully', result);
        } catch (error) {
            next(error);
        }
    }

    async getMy(req, res, next) {
        try {
            const articles = await articleService.getMyArticles(req.user.id);
            return sendResponse(res, 200, true, 'Your articles fetched successfully', { articles });
        } catch (error) {
            next(error);
        }
    }

    async getAISuggestions(req, res, next) {
        try {
            const suggestions = await articleService.suggestAIFeatures(req.body.content);
            return sendResponse(res, 200, true, 'AI suggestions generated', suggestions);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ArticleController();
