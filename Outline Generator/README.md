# InfraContentGenerator
![Deployment](https://github.com/ScaleupInfra/InfraContentGenerator/actions/workflows/ci.yaml/badge.svg)

An app that generates topic outlines based on a specified topic and level (Beginner, Intermediate, or Advanced). It leverages AI to provide insightful and structured outlines for content creators, educators, and learners.

## 🎯 Features
- 📋 **Outline Generation:** Generate outlines based on the selected topic and level.
- 🔍 **Custom Levels:** Choose from Beginner, Intermediate, or Advanced levels.
- 🚀 **Fast and Efficient:** Provides results quickly with high accuracy.

## 🛠️ Tech Stack
- **Frontend:** [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Deployment:** [Google Cloud Run](https://cloud.google.com/run)
- **CI/CD:** [GitHub Actions](https://github.com/features/actions)

## 📦 Installation and Usage

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Yarn](https://yarnpkg.com/) (or npm)

### Running Locally
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ScaleupInfra/InfraContentGenerator.git
   cd InfraContentGenerator
2. **Install Dependencies:**
   ```bash
   yarn install
   # or
   npm install
3. **Set Environment Variables:**
Create a .env file in the root directory and provide your API keys:
   ```bash
    touch .env
4. **Populate the .env file with:**
.env
   ```bash
      NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-firebase-project-id>
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
      NEXT_PUBLIC_FIREBASE_APP_ID=<your-firebase-app-id>
      OPENAI_API_KEY=<your-openai-api-key>
      KEYWORD_API_KEY=<your-keyword-api-key>
5. **Start the Development Server:**
   ```bash
   yarn dev
   # or
   npm run dev
   
Visit http://localhost:3000 to see the app in action.

