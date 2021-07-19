// To get the app working with your backend, you first need to instantiate the Realm app.
// The Realm app is the interface to the MongoDB Realm backend.

import Realm from 'realm';

let app;

// Returns the shared instance of the Realm app.
export function getRealmApp() {
  if (app === undefined) {
    const appId = 'tasktracker-klsjn'; // Set Realm app ID here.
    const appConfig = {
      id: appId,
      timeout: 10000,
      app: {
        name: 'default',
        version: '0',
      },
    };
    app = new Realm.App(appConfig);
  }
  return app;
}
