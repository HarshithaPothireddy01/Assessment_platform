# Quiz Application Frontend

This is a React frontend for the Flask quiz application backend.

## Features

- User login with name and email
- Quiz topic selection and question count configuration
- Interactive multiple-choice questions
- Real-time progress tracking
- Score display with visual feedback
- Responsive design

## Setup

1. Make sure your Flask backend is running on `http://localhost:5000`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

## Usage

1. **Login**: Enter your name and email
2. **Setup Quiz**: Choose a topic and number of questions
3. **Take Quiz**: Answer multiple-choice questions one by one
4. **View Results**: See your score and performance

## Backend Integration

The frontend connects to these Flask API endpoints:
- `POST /login` - User authentication
- `POST /start-quiz` - Initialize a new quiz
- `GET /question/<quiz_id>` - Fetch next question
- `POST /answer/<quiz_id>` - Submit answer
- `POST /submit/<quiz_id>` - Complete quiz and get results

Make sure your Flask backend has CORS enabled and is running before starting the frontend.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
