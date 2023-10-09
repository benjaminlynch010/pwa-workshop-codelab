import { openDB } from 'idb';

// Register the service worker
if ('serviceWorker' in navigator) {
  // Wait for the 'load' event to not block other work
  window.addEventListener('load', async () => {
    // Try to register the service worker.
    try {
      // Capture the registration for later use, if needed
      let reg;

      // import.meta.env.DEV is a special environment variable injected by Vite to let us know we're in development mode. Here, we can use the JS Module form of our service worker because we can control our browsers in dev.
      if (import.meta.env.DEV) {
        reg = await navigator.serviceWorker.register('/service-worker.js', {
          type: 'module',
        });
      } else {
        // In production, we use the normal service worker registration
        reg = await navigator.serviceWorker.register('/service-worker.js');
      }

      console.log('Service worker registered! 😎', reg);
    } catch (err) {
      console.log('😥 Service worker registration failed: ', err);
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  // Here, an IndexedDB database called settings-store is created. Its version is initialized to 1 and its initialized with an object store called settings. This is the most basic kind of object store, simple key-value pairs, but more complex object stores can be created as needed. Without this initialization of an object store, there will be nowhere to put data in, so leaving this out here would be like creating a database with no tables.
  const db = await openDB('settings-store', 1, {
    upgrade(db) {
      db.createObjectStore('settings');
    },
  });

  // Set up the editor
  const { Editor } = await import('./app/editor.js');
  const editor = new Editor(document.body);

  // Set up night mode toggle
  const { NightMode } = await import('./app/night-mode.js');
  new NightMode(
    document.querySelector('#mode'),
    async (mode) => {
      editor.setTheme(mode);
      // Save the night mode setting when changed
    },
    // Retrieve the night mode setting on initialization
  );

  // Set up the menu
  const { Menu } = await import('./app/menu.js');
  new Menu(document.querySelector('.actions'), editor);

  // Save content to database on edit
  // db is the previously opened IndexedDB database. The put method allows entries in an object store in that database to be created or updated. The first argument is the object store in the database to use, the second argument is the value to store, and the third argument is the key to save the value to if it's not clear from the value (in this case it's not as our database doesn't include specified keys). Because it's asynchronous, it's wrapped in async/await.
  editor.onUpdate(async (content) => {
    await db.put('settings', content, 'content');
  });

  // Set the initial state in the editor
  const defaultText = `# Welcome to PWA Edit!\n\nTo leave the editing area, press the \`esc\` key, then \`tab\` or \`shift+tab\`.`;
  

  // Instead of just setting the editor to the value of defaultText, it now attempts to get the content key from the settings object store in the settings-store IndexedDB database. If that value exists,, that's used. If not, the default text is used.
  editor.setContent((await db.get('settings', 'content')) || defaultText);
});
