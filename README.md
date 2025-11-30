# Premium Notes App

A simple, premium-looking notes application built with Electron.

## Features
- Create and delete notes
- Data persistence (notes are saved to your user data folder)
- Dark mode with glassmorphism design

## For Users (How to Install)
If you just want to use the app:
1.  Go to the **Releases** section of this repository (on the right sidebar).
2.  Download the latest `.exe` installer (e.g., `premium-notes-app Setup 1.0.0.exe`).
3.  Run the installer. The app will launch automatically and be available in your Start menu.

## For Developers (How to Build)
If you want to modify the code:

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/Vimalkanth7/premium-notes-app-built_by_AI.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the app:
    ```bash
    npm start
    ```

### Build Installer
To create a Windows installer locally:
```bash
npm run dist
```
The installer will be generated in the `dist` folder.

## For Mobile (Android)
To build the Android application:

1.  **Prerequisites**: Install [Android Studio](https://developer.android.com/studio).
2.  **Sync Project**:
    ```bash
    npm run build
    npx cap sync
    ```
3.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```
4.  **Run/Build**:
    -   In Android Studio, wait for Gradle sync to finish.
    -   Click the **Run** button (green triangle) to run on an emulator or connected device.
    -   To build an APK: Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
