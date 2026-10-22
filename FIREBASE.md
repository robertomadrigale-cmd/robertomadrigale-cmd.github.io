# Activar la cuenta en la nube y el modo maestro (Roka Guitar for All)

La app ya tiene programados el inicio de sesión, la sincronización del progreso y el modo maestro. Solo falta crear el proyecto de Firebase y pegar su configuración. Son unos 10 minutos y es gratis (plan Spark).

## 1. Crear el proyecto
1. Entra a https://console.firebase.google.com con tu cuenta de Google.
2. «Crear un proyecto» → nombre, por ejemplo `roka-guitar`. Puedes desactivar Google Analytics.

## 2. Activar el inicio de sesión
1. Menú **Compilación → Authentication → Comenzar**.
2. En **Método de acceso**, activa **Google** (elige tu correo de soporte) y **Correo electrónico/contraseña**.
3. En **Configuración → Dominios autorizados**, agrega: `robertomadrigale-cmd.github.io`

## 3. Crear la base de datos
1. Menú **Compilación → Firestore Database → Crear base de datos**.
2. Ubicación: `nam5 (United States)` o la más cercana. Modo: **producción**.
3. En la pestaña **Reglas**, borra lo que hay, pega el contenido del archivo `firestore.rules` de este repositorio y toca **Publicar**.

## 4. Registrar la app web y copiar la configuración
1. En **Configuración del proyecto** (engrane) → **Tus apps** → ícono **</>** (Web).
2. Apodo: `Roka Guitar`. No marques Firebase Hosting. **Registrar app**.
3. Copia el bloque `firebaseConfig = { apiKey: ..., authDomain: ..., projectId: ..., ... }`.

## 5. Pegarla en la app
- En `mastil/src/1-firebase-config.js`, reemplaza `null` por ese objeto:
  ```js
  const FIREBASE_CONFIG={apiKey:"...",authDomain:"roka-guitar.firebaseapp.com",projectId:"roka-guitar",storageBucket:"...",messagingSenderId:"...",appId:"..."};
  ```
- Reconstruye y publica (ver CLAUDE.md). Si lo hace Claude, solo pásale el bloque copiado.

La `apiKey` de Firebase para web no es secreta: identifica el proyecto. La seguridad la dan las reglas de `firestore.rules` (cada quien solo ve su progreso; el maestro solo ve a los alumnos de sus clases).

## Cómo se usa
- **Alumno:** Inicio → «Guarda tu progreso en la nube» → entra con Google o correo. Su progreso queda en la nube y aparece igual en todos sus dispositivos. Con el código de su maestro se une a la clase.
- **Maestro:** en la misma pantalla, «Soy maestro» → crea una clase → «Código» copia una invitación para mandar por WhatsApp. Ve a cada alumno con ejercicios hechos, minutos de la semana, racha, lección actual, última conexión y su promedio con micrófono.

## Qué se guarda
- `users/{uid}`: nombre, correo, progreso (ejercicios, minutos por día, mejores marcas), canciones pegadas, respuestas de bienvenida y clase.
- `groups/{código}`: nombre de la clase y dueño. `groups/{código}/members/{uid}`: resumen del alumno.
