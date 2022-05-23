import Realm from "realm";


// :code-block-start: instantiate-realm-app
// Invokes the shared instance of the Realm app.
// :state-start: final
// :replace-start: {
//   "terms": { "tasktracker-qczfq": "<your Realm app ID here>" }
// }
const app = new Realm.App({id: "tasktracker-qczfq"}); // Set Realm app ID here.
// :replace-end:
// :state-end: :state-uncomment-start: start
//// TODO: Create a Realm App instance with your Realm app ID.
// :state-uncomment-end:
// :code-block-end:
export default app;

