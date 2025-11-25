# Product Requirements Document (PRD): AI Proctoring System

## 1. Introduction
The AI Proctoring System is a web-based application designed to ensure the integrity of online examinations. It leverages computer vision and AI to monitor students in real-time, detecting potential violations such as suspicious eye movements, multiple faces, or absence from the camera view.

## 2. Goals & Objectives
- **Integrity**: Prevent cheating during online exams through automated monitoring.
- **Scalability**: Support multiple concurrent exam sessions.
- **Usability**: Provide a seamless experience for both students and instructors.
- **Real-time Feedback**: Alert instructors immediately when potential violations occur.

## 3. User Roles
### 3.1 Student
- **Access**: Log in to the portal (currently bypassed/mocked).
- **Exam Taking**: View and answer exam questions.
- **Monitoring**: Continuous webcam and screen monitoring during the exam.
- **Feedback**: Receive warnings for detected violations (e.g., "Please look at the screen").

### 3.2 Instructor
- **Dashboard**: View active and past exam sessions.
- **Live Proctoring**: Monitor multiple students simultaneously via a grid view of webcam feeds.
- **Violation Review**: Review flagged incidents with timestamps and snapshots.
- **Exam Management**: Create and configure exams (implied).

## 4. Key Features

### 4.1 Student Module
- **Dashboard**: View available exams.
- **Exam Interface**: 
    - Full-screen mode enforcement (planned/implied).
    - Question navigation.
    - Timer display.
- **Automated Proctoring**:
    - **Gaze Tracking**: Detects if the student is looking away from the screen.
    - **Face Detection**: Ensures exactly one face is visible.
    - **Audio Monitoring**: (Implied by `violations.ts` or future scope) Detects suspicious audio levels.

### 4.2 Instructor Module
- **Instructor Dashboard**: Overview of system status and recent activity.
- **Live Proctoring View**:
    - Real-time video feeds from student webcams.
    - Visual indicators for "Credibility Score" or trust level.
    - Alerts for active violations.
- **Session Management**:
    - View detailed logs of specific student sessions.
    - Terminate sessions if necessary.

### 4.3 Backend & Data
- **Session Tracking**: Records start/end times and status.
- **Violation Logging**: Stores type, timestamp, and metadata for every detected event.
- **Credibility Scoring**: Calculates a trust score based on the frequency and severity of violations.

## 5. Technical Architecture

### 5.1 Frontend (`/client`)
- **Framework**: React 19 with Vite.
- **Language**: TypeScript.
- **Styling**: Tailwind CSS.
- **State Management**: Zustand.
- **Routing**: React Router DOM.
- **AI/ML**: MediaPipe Tasks Vision (Client-side processing for low latency and privacy).

### 5.2 Backend (`/server`)
- **Runtime**: Node.js.
- **Framework**: Express.js.
- **Language**: TypeScript.
- **Role**: API aggregation, potential heavy-lifting not suitable for client, and centralized logging.

### 5.3 Database
- **Provider**: Supabase (PostgreSQL).
- **Schema**: Includes tables for `exams`, `exam_sessions`, `violations`, and `users` (pending full Auth integration).

## 6. Current Constraints & Known Issues
- **Authentication**: Supabase Auth is not fully integrated. A temporary fix (`DATABASE_FIX.md`) relaxes foreign key constraints on `user_id` to allow testing.
- **Browser Compatibility**: Relies on modern browser APIs for MediaPipe and Webcam access.

## 7. Future Roadmap
- **Phase 1 (Current)**: Core proctoring features (Gaze, Face), Basic Dashboards.
- **Phase 2**: Full Supabase Auth integration.
- **Phase 3**: Enhanced analytics and reporting for instructors.
- **Phase 4**: Mobile support and more robust anti-cheat measures (e.g., lock-down browser integration).
