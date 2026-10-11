import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vite's default targets Safari 16.4+; go lower so iPhones on iOS 15 / older Android Chrome still load the app
  build: { target: ['es2020', 'safari15', 'chrome90', 'firefox90'] },
});
