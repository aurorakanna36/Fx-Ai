import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {openAI} from '@genkit-ai/openai'; // OpenAI plugin import removed

// Inisialisasi plugin. Pastikan API Key yang sesuai (GOOGLE_API_KEY, OPENAI_API_KEY)
// sudah diatur di variabel lingkungan server Anda.
const plugins = [];
if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
}
// OpenAI plugin loading removed
// if (process.env.OPENAI_API_KEY) {
//   plugins.push(openAI());
// }

if (plugins.length === 0) {
  console.warn(
    'Tidak ada plugin AI (Google AI) yang dikonfigurasi di src/ai/genkit.ts karena tidak ada GOOGLE_API_KEY yang ditemukan di variabel lingkungan. Fungsi AI mungkin tidak bekerja atau terbatas.'
  );
}

export const ai = genkit({
  plugins: plugins,
  // Model default global bisa tetap Gemini, atau bisa juga dihapus jika kita selalu
  // menentukan model secara eksplisit di setiap panggilan.
  // Untuk saat ini, kita biarkan karena alur 'explain-trading-recommendation' mungkin masih menggunakannya.
  // Default to Gemini if Google AI plugin is available, otherwise undefined.
  model: plugins.some(p => p.name === 'googleAI') ? 'googleai/gemini-2.0-flash' : undefined,
});
