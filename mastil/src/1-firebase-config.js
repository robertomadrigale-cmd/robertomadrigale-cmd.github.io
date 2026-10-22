/* Configuración de Firebase para la cuenta en la nube y el modo maestro.
   Mientras sea null, la app funciona igual que siempre y no muestra nada de cuentas.
   Para activarla, reemplaza null por el objeto que da Firebase (ver FIREBASE.md en la raíz del repo), por ejemplo:
   const FIREBASE_CONFIG={apiKey:"...",authDomain:"tu-proyecto.firebaseapp.com",projectId:"tu-proyecto",appId:"..."}; */
const FIREBASE_CONFIG={apiKey:"AIzaSyCx69uouBXA30FQQYtnSbD66cyeBr0ufHw",authDomain:"rokaguitarrall.firebaseapp.com",projectId:"rokaguitarrall",storageBucket:"rokaguitarrall.firebasestorage.app",messagingSenderId:"804560385041",appId:"1:804560385041:web:38262af85e5d3354aeedb0"};
// la base de datos de Firestore tiene nombre propio (no es la «(default)»)
const FIRESTORE_DB='rokaguitarrhero';
