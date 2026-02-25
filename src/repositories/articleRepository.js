const pool = require('../config/db');

class ArticleRepository {
    async create(articleData) {
        const { title, content, summary, category, author_id } = articleData;
        const [result] = await pool.execute(
            'INSERT INTO articles (title, content, summary, category, author_id) VALUES (?, ?, ?, ?, ?)',
            [title, content, summary, category, author_id]
        );
        return result.insertId;
    }

    async update(id, articleData) {
        const { title, content, summary, category } = articleData;
        // Note: Database will handle updated_at automatically via ON UPDATE CURRENT_TIMESTAMP
        await pool.execute(
            'UPDATE articles SET title = ?, content = ?, summary = ?, category = ? WHERE id = ?',
            [title, content, summary, category, id]
        );
    }

    async delete(id) {
        await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
    }

    async findById(id) {
        const [rows] = await pool.execute(
            `SELECT a.*, u.username as author_name, u.email as author_email 
       FROM articles a 
       JOIN users u ON a.author_id = u.id 
       WHERE a.id = ?`,
            [id]
        );
        return rows[0];
    }

    async findAll(filters) {
        const { search, category, page = 1, limit = 10 } = filters;
        const offset = (page - 1) * limit;

        let baseQuery = `
      FROM articles a 
      JOIN users u ON a.author_id = u.id 
      LEFT JOIN article_tags at ON a.id = at.article_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE 1=1
    `;
        const params = [];

        if (search) {
            // NOTE: Consider adding FULLTEXT index on articles(title, content) and tags(name) for SQL optimization
            // ALTER TABLE articles ADD FULLTEXT(title, content);
            baseQuery += ` AND (a.title LIKE ? OR a.content LIKE ? OR t.name LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (category) {
            baseQuery += ` AND a.category = ?`;
            params.push(category);
        }

        // Get total records for pagination
        const countQuery = `SELECT COUNT(DISTINCT a.id) as total ${baseQuery}`;
        const [countRows] = await pool.execute(countQuery, params);
        const totalRecords = countRows[0].total;

        // Get data
        let dataQuery = `
      SELECT a.*, u.username as author_name, GROUP_CONCAT(t.name) as tags
      ${baseQuery}
      GROUP BY a.id 
      ORDER BY a.created_at DESC 
      LIMIT ? OFFSET ?
    `;

        // Add pagination params
        const queryParams = [...params, parseInt(limit), parseInt(offset)];
        const [rows] = await pool.query(dataQuery, queryParams);

        // Format tags from comma string to array
        const formattedRows = rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
        }));

        return {
            articles: formattedRows,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit)
        };
    }

    async findByAuthor(authorId) {
        const [rows] = await pool.execute(
            'SELECT * FROM articles WHERE author_id = ? ORDER BY created_at DESC',
            [authorId]
        );
        return rows;
    }

    async getTagsByArticleId(id) {
        const [rows] = await pool.execute(
            'SELECT t.name FROM tags t JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = ?',
            [id]
        );
        return rows.map(row => row.name);
    }

    // Tags handling
    async findTagByName(name) {
        const [rows] = await pool.execute('SELECT * FROM tags WHERE name = ?', [name]);
        return rows[0];
    }

    async createTag(name) {
        const [result] = await pool.execute('INSERT INTO tags (name) VALUES (?)', [name]);
        return result.insertId;
    }

    async addTagToArticle(articleId, tagId) {
        await pool.execute('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)', [articleId, tagId]);
    }

    async removeAllTagsFromArticle(articleId) {
        await pool.execute('DELETE FROM article_tags WHERE article_id = ?', [articleId]);
    }
}

module.exports = new ArticleRepository();
