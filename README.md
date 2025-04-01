
# ManisR Backend

This repository contains the backend server for the **ManisR** application. The backend is built with Node.js, Express, PostgreSQL, and socket.io, and it provides all the REST API endpoints and real-time communication features required by the app.

## Quick Start

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/ManisR-backend.git
   cd ManisR-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**  
   Create a `.env` file in the root directory with the following (adjust values as needed):

   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
   JWT_SECRET=yourSecretKey
   DEFAULT_AVATAR=default_logo.png
   NODE_ENV=development
   PORT=3000
   ```

4. **Run the Server:**

   ```bash
   npm run dev
   ```

### API Endpoints

The backend includes endpoints for:

- **Authentication:**  
  `/auth/register`, `/auth/login`, `/auth/verify-email`

- **User Management:**  
  `/users/profile`, `/users/avatar`, `/users/delete`

- **Meal & Review Management:**  
  `/food/give`, `/food/available`, `/food/status/:mealId`, `/meal-history/archive/:mealId`, `/meal_reviews`, `/meal_reviews/giverCount/:userId`


## Note

For complete documentation, architecture details, feature explanations, and full setup instructions, please visit the **ManisR Frontend Repository**:
[ManisR Frontend Repository](https://github.com/Galomer310/ManisR-frontend)

## License

This project is licensed under the MIT License.
