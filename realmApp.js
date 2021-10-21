import Realm from "realm";


// Invokes the shared instance of the Realm app.
const app = new Realm.App({id: "<your Realm app ID here>"}); // Set Realm app ID here.
export default app;

