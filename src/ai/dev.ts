import { config } from 'dotenv';
config();

// import '@/ai/flows/suggest-demand-adjustments.ts'; // Removido ou comentado
import '@/ai/flows/general-chat-flow.ts'; 
import '@/ai/flows/generate-spending-report-flow.ts'; 
import '@/ai/flows/generate-recipe-flow.ts'; // Adicionado

