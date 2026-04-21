# SYSTEM DESIGN AND IMPLEMENTATION

The system design and implementation phase outlines the transformation of conceptual architecture into a functional software system. It focuses on defining user interfaces, data flow, backend logic, and AI integration. The Expert Evaluator Assistant has been designed to ensure an intuitive user experience, robust state management, and secure communication with AI and backend services. This chapter describes the design structure of each key module, including the Landing Page, Dashboard, File Upload, Camera Verification, Question Generation, and Result Storage.

## 4.1 LANDING PAGE DESIGN

*(Fig no: 3)*

The Landing Page acts as the entry point to the Expert Evaluator Assistant, offering a clean, professional interface with quick access to login and navigation. Built with React and TailwindCSS, it uses a modern, responsive design optimized for all devices. A hero section highlights the system’s purpose—AI-driven project evaluation and plagiarism detection—while a cool, professional color palette ensures visual consistency. Reusable components and Tailwind utility classes enhance maintainability and responsiveness. Navigation is managed through React Router for smooth transitions between pages.

**Key Features:**
*   Navigation bar displaying the application name and links to “Home”, “About”, and “Login”
*   Login button redirecting to Supabase’s secure authentication page
*   Hero section emphasizing AI-powered project evaluation and plagiarism detection
*   Fully responsive layout for desktop, tablet, and mobile devices
*   Reusable UI components designed for maintainability and consistent styling

## 4.2 DASHBOARD MODULE

*(Fig no: 4)*

The Dashboard serves as the main hub of the Expert Evaluator Assistant, allowing users to view their profile, assessment history, and start new evaluations. It updates dynamically with real-time data from Supabase, showing project names, timestamps, and summarized results. Zustand manages user sessions and assessment states for smooth navigation and persistence. Built with responsive grids and TailwindCSS, the dashboard ensures an accessible and consistent experience across all devices.

**Key Features:**
*   User profile section showing name, email, and authentication status
*   Assessment history table listing all previous evaluations with project names, timestamps, and summarized results
*   “Take Assessment” button to initiate new project evaluations
*   Global accessibility via the navbar on every page, redirecting users to the Dashboard
*   Real-time data synchronization and state management using Zustand and Supabase
*   Responsive, professional layout optimized for desktop, tablet, and mobile devices

## 4.3 FILE UPLOAD AND EXTRACTION MODULE

*(Fig no: 5)*

The File Upload module enables users to upload their project files in ZIP format for analysis. It features a simple drag-and-drop interface built with React hooks and file input APIs. Once uploaded, JSZip extracts the contents, which are stored temporarily in Supabase. Users can preview extracted files before starting the assessment. The system then sends the data to Gemini for semantic analysis and question generation. Zustand manages upload progress and error handling, ensuring smooth transitions and reliable performance.

**Key Features:**
*   Drag-and-drop interface for intuitive file upload
*   ZIP file extraction using JSZip and temporary storage in Supabase
*   File preview displaying filenames and content snippets
*   Activation of “Start Assessment” button after successful extraction
*   Progress tracking and state management using Zustand
*   Error handling for unsupported formats and extraction issues

## 4.4 PERMISSIONS AND CAMERA VERIFICATION

*(Fig no: 6)*

Before beginning an assessment, the system verifies the user’s identity and environment to maintain test integrity. A permission modal requests camera access and checks for disabled external devices. The live video feed, powered by MediaDevices.getUserMedia(), is monitored in real time. Face detection using TensorFlow.js and FaceAPI.js ensures that only the registered user participates, matching the live face with the stored embedding for secure verification.

**Detection logic includes:**
*   If the registered user’s face is detected alone → the system allows proceeding to the assessment.
*   If multiple faces are detected → a warning message appears: “Multiple faces detected – only the registered user may take the assessment.”
*   If no face is detected → the user is prompted to adjust camera positioning for proper detection.

Additionally, the system continuously monitors for unwanted objects such as mobiles or earpods and ensures Bluetooth remains disabled throughout the assessment, blocking answer submission if any violations are detected. This ensures a secure and fair testing environment.

**Key Features:**
*   Permission request modal for camera access and environment checks
*   Real-time camera stream preview
*   Single-person face verification using TensorFlow.js / FaceAPI.js
*   Detection of multiple faces or absence of a face with appropriate alerts
*   Monitoring for external devices (mobiles, earpods) and Bluetooth status
*   Blocks assessment progress until verification criteria are met

## 4.5 QUESTION GENERATION AND TIMER LOGIC

*(Fig no: 7)*

This core module handles AI-driven question generation, response tracking, and real-time verification. After successful face verification, project data is sent to Gemini via the Vercel AI SDK, which generates 10 context-aware MCQs. Each question includes four options and a 30-second timer managed through Zustand for state persistence. The camera feed is continuously monitored to ensure only the verified user participates. If multiple faces are detected, answering is paused. Once all questions are completed, responses are sent back to Gemini for automated evaluation and result generation.

**Key Features:**
*   AI-generated questions via Gemini using project-specific data
*   Four-option multiple-choice layout with a 30-second timer per question
*   Real-time face verification to ensure only the registered user is taking the test
*   Monitoring for multiple faces, mobile devices, and other external objects
*   Local state management with Zustand for persistent progress tracking
*   Automatic progression if the timer expires and visual progress indicators

## 4.6 RESULT GENERATION AND STORAGE

*(Fig no: 8)*

Once the assessment is complete, Gemini evaluates the user’s answers, analyzes plagiarism, and generates a detailed assessment report.

**Report Components:**
*   **Accuracy Score:** Percentage of correct responses.
*   **Plagiarism Report:** Detailed similarity percentage and matching file snippets.
*   **Authenticity Check:** Gemini’s confirmation whether the project was genuinely completed by the user.
*   **Overall Remarks:** AI-generated summary of performance.

**Detail regarding Evaluation:**
*   After the user completes the assessment, Gemini evaluates the submitted answers, performs a plagiarism analysis, and generates a comprehensive AI-based assessment report. This report provides detailed insights into the user’s performance and the originality of their project.
*   The report includes several key components: the Accuracy Score, reflecting the percentage of correct answers; a Plagiarism Report, detailing similarity percentages and highlighting matching file snippets; an Authenticity Check, confirming whether the project was genuinely completed by the user; and Overall Remarks, which provide an AI-generated summary of the user’s performance and key observations.
*   All results are securely stored in Supabase, linked to the user’s unique ID. Zustand temporarily holds the assessment data for immediate UI rendering before it is fully written to the database, ensuring a smooth user experience. Each stored result includes metadata such as the Assessment ID, timestamp, user ID, and a link to the AI-generated report.
*   Users can view their past assessments via the Dashboard under “Assessment History.” Selecting an entry redirects them to a Result Details Page, displaying the full report, answers, plagiarism summary, and performance analytics.
*   The implementation flow includes: Gemini returning the evaluation output, the frontend displaying a success confirmation page, asynchronous writing of the result to Supabase, and Zustand updating the dashboard state in real time to reflect the latest assessment.

**Key Features:**
*   AI-generated assessment report with accuracy, plagiarism, and authenticity metrics
*   Temporary state management with Zustand for smooth UI updates
*   Secure storage of results and metadata in Supabase
*   Dashboard access to all past assessments with detailed result view
*   Real-time dashboard synchronization and immediate feedback after assessment completion

**Data Storage:**
*   All results are stored in Supabase, linked to the user’s unique ID.
*   Zustand temporarily holds the result data for immediate UI rendering before the database write completes.
*   Each result entry includes metadata such as:
    *   Assessment ID
    *   Timestamp
    *   User ID

**Result Display:**
Users can view all past assessments in the Dashboard under “Assessment History.” Selecting an entry redirects to a Result Details Page displaying the full report, answers, and plagiarism summary.

**Implementation Flow:**
1.  Gemini returns evaluation output.
2.  Frontend displays a success page confirming completion.
3.  The result is written to Supabase asynchronously.
4.  Zustand updates the dashboard state in real time.
