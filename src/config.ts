console.log('✅ Is env loaded?', import.meta.env);
console.log('✅ VITE_API_URL =', import.meta.env.VITE_API_URL);

export const API_URL = `${import.meta.env.VITE_API_URL}/api`;
console.log('✅ Full API_URL =', API_URL);
