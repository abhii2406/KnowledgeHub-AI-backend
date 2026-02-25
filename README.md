# KnowledgeHub AI - Backend

A production-ready RESTful API built with Node.js and Express, designed for a high-performance KnowledgeHub AI platform. This backend features robust security, a clean architectural pattern, and an integrated AI Assist system for content refinement and discovery.

---

## 🏗️ Architecture Overview

This project follows the **Clean Architecture** principles, specifically using a **Controller-Service-Repository** pattern. This ensures a strict separation of concerns, making the system highly testable and maintainable.

-   **Controllers**: Handle HTTP-specific logic, extracting request data and sending responses.
-   **Services**: Contain the core business logic. They are agnostic of the HTTP layer and database implementation.
-   **Repositories**: Abstact the database access. All SQL queries are encapsulated here.
-   **Middleware**: Handles cross-cutting concerns (Security, Auth, Validation, Logging).

---

## 📂 Folder Structure

```text
src/
├── ai/             # AI Service & logic (Mock/Real modes)
├── config/         # Database and environment configurations
├── controllers/    # Request handlers
├── middleware/     # Auth, validation, and security middleware
├── repositories/   # Database access layer (SQL)
├── routes/         # API Route definitions
├── services/       # Core business logic
├── utils/          # Global helpers and response formatters
app.js              # Express app configuration
server.js           # Entry point and server lifecycle management
```

---

## 💾 Database Schema Explanation

The system utilizes a relational **MySQL** schema designed for data integrity and efficient querying.

1.  **Users**: Stores user credentials, profiles, and timestamps.
2.  **Articles**: Contains the knowledge base (titles, content, summaries) with a foreign key to `Users`.
3.  **Tags**: Unique labels for categorizing content.
4.  **Article_Tags**: A many-to-many junction table linking articles and tags, enabling complex filtering.

---

## 🔐 Authentication Flow

We implement a stateless **JWT (JSON Web Token)** authentication strategy.

-   **Registration/Login**: Passwords are multi-hashed using `bcrypt` before storage.
-   **Access Tokens**: Issued upon successful login with a 24h expiration.
-   **Authorization**: Current user context is injected into requests via the `authMiddleware`.
-   **Security**: Includes protection against common vulnerabilities like Brute Force and JWT manipulation.

---

## ✍️ Article Management Logic

The backend supports full CRUD operations with sophisticated data handling:
-   **Automated Summarization**: AI-driven or heuristic-based summary generation.
-   **Tag Integration**: Seamless management of many-to-many relationships for categorization.
-   **Ownership Checks**: Strict authorization ensuring only authors can modify their content.

---

## 🤖 AI Service Architecture

The system features a dual-mode **AIService** for extreme flexibility:

-   **Mock Mode**: Enabled by default (`AI_MODE=mock`). Uses internal algorithms to simulate AI behavior (stripping HTML, suggesting titles, adding visual indicators like `✨`).
-   **Real Mode**: Plug-and-play integration with OpenAI API (`AI_MODE=real`).
-   **Features**:
    -   `Improve Content`: Prepends visual feedback and refines text.
    -   `Suggest Title`: Generates varied, plain-text titles based on content templates.
    -   `Suggest Tags`: Extracts keywords from plain text for better indexing.

---

## 🔍 Search & Pagination

To maintain performance with large datasets, the platform implements:
-   **Server-side Pagination**: Returns `totalRecords` and `totalPages` for efficient UI rendering.
-   **Fuzzy Search**: Implements `LIKE` queries across titles, content, and tags.
-   **SQL Optimization**: Uses `JOIN` operations instead of multiple queries to aggregate metadata.

---

## 🛡️ Security Practices

The application is hardened for production environments:
-   **Helmet**: Sets various HTTP headers for security (XSS, Clickjacking, etc.).
-   **CORS**: Restricted origins for frontend communication.
-   **Rate Limiting**: Protects against DoS and brute-force attacks.
-   **Validation**: Strict input sanitization and validation using `express-validator`.
-   **Error Handling**: Centralized error management to prevent information leakage.

---

## 🤖 AI Usage During Development

AI was utilized as a core collaborator during the development of this project:
1.  **Boilerplate Generation**: AI assisted in scaffolding the initial Repository and Controller structures.
2.  **Manual Hardening**: Architecture was manually refined to ensure strict Service-Repository separation.
3.  **Logic Tuning**: AI mock logic was custom-built and iteratively improved to handle HTML-rich content from the editor.
4.  **Issue Resolution**: AI played a key role in debugging specific environment-related SQL errors and React 19 compatibility issues.

---

## 🚀 Setup Instructions

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd knowledge-sharing-backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    - Copy `.env.example` to `.env`
    - Fill in your MySQL credentials and JWT secret.

4.  **Database Setup**:
    - Run the provided schema SQL in your MySQL instance.

5.  **Start the server**:
    ```bash
    npm start
    ```

---

## ⚙️ Environment Variables

| Variable       | Description                                  | Default                 |
| :------------- | :------------------------------------------- | :---------------------- |
| `PORT`         | Port to run the server on                    | `5000`                  |
| `DB_HOST`      | MySQL Hostname                               | `localhost`             |
| `DB_USER`      | MySQL Username                               | `root`                  |
| `JWT_SECRET`   | Secret key for token signing                 | `your_super_secret`     |
| `AI_MODE`      | AI Strategy (`mock` or `real`)               | `mock`                  |

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint         | Description           |
| :----- | :--------------- | :-------------------- |
| POST   | `/api/auth/register` | Create a new account |
| POST   | `/api/auth/login`    | Login and get token  |

### Articles
| Method | Endpoint               | Description                            |
| :----- | :--------------------- | :------------------------------------- |
| GET    | `/api/articles`        | List all articles (Search/Pagination) |
| GET    | `/api/articles/:id`    | Get single article detail              |
| POST   | `/api/articles`        | Create new article (Auth required)     |
| POST   | `/api/articles/ai/suggest` | Get AI title/tags/improved content |

---

## 📦 Example API Response Format

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Understanding AI Development",
    "content": "<p>✨ AI is transforming...</p>",
    "tags": ["nodejs", "ai"],
    "author_name": "Admin"
  },
  "message": "Resource fetched successfully"
}
```

---

## 🏭 Production Readiness Notes

-   [x] Environment variable validation.
-   [x] Secure password hashing (bcrypt).
-   [x] Global error propagation.
-   [x] Connection pooling for MySQL.
-   [x] XSS protection via input sanitization.
-   [ ] **TODO**: Implement Winston/Pino logging for better observability.
-   [ ] **TODO**: Setup Redis for JWT blacklisting and distributed caching.
