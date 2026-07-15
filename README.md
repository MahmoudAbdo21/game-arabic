# Arabic Phonics

This is the technical foundation for the Arabic Phonics project. 
The foundation is prepared, but educational content implementation has not yet started.

## Development Prerequisites
- Node.js (v24.18.0 or later)
- npm

## Installation
To install the project dependencies:
```bash
npm ci
```

## Development
To start the development server, you have two options:

**One-Click Launcher (Windows):**
Double-click `RUN-PROJECT-6500.cmd` in the project root.

**Manual Development Command:**
```bash
npm run dev -- -p 6500
```
Then open [http://localhost:6500](http://localhost:6500) in your browser.

## Build
To build the project for production:
```bash
npm run build
```

## Important Notes
- **Audio:** Real audio is not currently part of the application. The future audio review site is a separate application that will be located under the `dev/` directory, and it is not yet implemented.
