import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {openAI} from '@genkit-ai/openai'; // Dihapus karena masalah instalasi

// Inisialisasi plugin. Pastikan API Key yang sesuai (GOOGLE_API_KEY)
// sudah diatur di variabel lingkungan server Anda.
const plugins = [];
if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
  console.log("Google AI plugin loaded.");
}
/*
if (process.env.OPENAI_API_KEY) {
  plugins.push(openAI()); // Dihapus
  console.log("OpenAI plugin loaded.");
}
*/

if (plugins.length === 0) {
  console.warn(
    'Tidak ada plugin AI (Google AI) yang dikonfigurasi di src/ai/genkit.ts karena tidak ada GOOGLE_API_KEY yang ditemukan di variabel lingkungan. Fungsi AI mungkin tidak bekerja atau terbatas.'
  );
}

export const ai = genkit({
  plugins: plugins,
  // Default model can be specified here if needed, but individual flows will select.
  // model: plugins.some(p => p.name === 'googleAI') ? 'googleai/gemini-2.0-flash' : undefined,
});
