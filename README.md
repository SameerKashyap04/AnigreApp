# 🌿 Anigre: AI Crop Disease Detection System

**Anigre** is a professional-grade, offline-first mobile application designed to help farmers identify crop diseases instantly using on-device Artificial Intelligence. Built with React Native and TensorFlow Lite, it provides high-speed diagnostics without requiring an internet connection.

---

## 🚀 Key Features

### 1. Instant AI Diagnostics
- **39 Disease Categories:** Detects diseases across various crops including Tomato, Apple, Corn, Potato, Grape, and more.
- **Offline Inference:** Uses a custom 191MB TFLite model that runs entirely on the phone's hardware.
- **Smart Viewfinder:** Features a square-cropped camera interface to guide users for the best AI accuracy.

### 2. Treatment & Recommendations
- **Actionable Advice:** Every detection comes with specific organic and chemical treatment recommendations.
- **Severity Assessment:** Automatically calculates disease severity based on AI confidence.

### 3. Local History & Database
- **Offline History:** All scans are saved locally using `expo-sqlite`.
- **Scan Gallery:** Revisit previous detections, images, and treatments anytime, anywhere.

### 4. Community Feed
- **Knowledge Sharing:** A localized social feed where users can share their findings and help other farmers.
- **Image & Video Support:** Full support for uploading agricultural media.

---

## 🧠 Technical Architecture (The AI Pipeline)

The app utilizes a highly optimized image processing pipeline to ensure the AI "sees" the plant exactly as it was trained.

1. **Center-Square Cropping:** To prevent aspect-ratio distortion, the app crops a 1:1 square from the center of the high-res camera sensor.
2. **Dynamic Resizing:** Images are resized using the `Nitro Image` C++ engine to the model's native `224x224` resolution.
3. **Normalization:** Pixel values (0-255) are mapped to a `0.0 - 1.0` float range to match the neural network's mathematical requirements.
4. **Logit Parsing:** Raw model outputs are processed via a **Softmax** algorithm to provide accurate confidence percentages.

---

## 🛠️ Tech Stack

- **Framework:** [Expo](https://expo.dev/) / React Native (TypeScript)
- **AI Engine:** [React Native Fast TFLite](https://github.com/mrousavy/react-native-fast-tflite)
- **Image Processing:** [Nitro Image](https://github.com/mrousavy/react-native-nitro-image) (C++ based)
- **Camera:** [Vision Camera V4](https://github.com/mrousavy/react-native-vision-camera)
- **Database:** [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Styling:** Vanilla CSS with a High-Contrast "Farmer-First" UI.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Android Studio / Xcode
- Java Development Kit (JDK 17)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AnigreApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Android SDK:
   Create a file at `android/local.properties` and add your SDK path:
   ```text
   sdk.dir=/Users/YOUR_NAME/Library/Android/sdk
   ```

4. Run the Development Build:
   ```bash
   npx expo run:android
   ```

---

## 📁 Project Structure

- `src/screens/`: UI Components and Page Layouts.
- `src/services/`: Core logic (AI Inference, Database Management).
- `assets/model/`: The `.tflite` model and `labels.txt`.
- `android/`: Native Android configuration (including `largeHeap` memory optimization).

---

## 📄 License
This project is part of the Final Semester Project for Crop Disease Detection. All AI models and source code are proprietary.
