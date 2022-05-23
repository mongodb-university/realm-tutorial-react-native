import React, { useContext, useState, useEffect, useRef } from "react";
import Realm from "realm";
import app from "../realmApp";

// Create a new Context object that will be provided to descendants of
// the AuthProvider.
const AuthContext = React.createContext(null);

// The AuthProvider is responsible for user management and provides the
// AuthContext value to its descendants. Components under an AuthProvider can
// use the useAuth() hook to access the auth value.
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(app.currentUser);
  const realmRef = useRef(null);
  const [projectData, setProjectData] = useState([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    // The current user always has their own project, so we don't need
    // to wait for the user object to load before displaying that project.
    const myProject = { name: "My Project", partition: `project=${user.id}` };
    setProjectData([myProject]);

    // :code-block-start: open-user-realm
    // :state-start: final
    const config = {
      sync: {
        user,
        partitionValue: `user=${user.id}`,
      },
    };

    // Open a realm with the logged in user's partition value in order
    // to get the projects that the logged in user is a member of
    Realm.open(config).then((userRealm) => {
      realmRef.current = userRealm;
      const users = userRealm.objects("User");

      users.addListener(() => {
        // The user custom data object may not have been loaded on
        // the server side yet when a user is first registered.
        if (users.length === 0) {
          setProjectData([myProject]);
        } else {
          const { memberOf } = users[0];
          setProjectData([...memberOf]);
        }
      });
    });
    // :state-end: :state-uncomment-start: start
    //// TODO: Open the user realm, which contains at most one user custom data object
    //// for the logged-in user.
    // :state-uncomment-end:
    // :code-block-end:

    // :code-block-start: user-realm-cleanup
    // :state-start: final
    return () => {
      // cleanup function
      const userRealm = realmRef.current;
      if (userRealm) {
        userRealm.close();
        realmRef.current = null;
        setProjectData([]); // set project data to an empty array (this prevents the array from staying in state on logout)
      }
    };
    // :state-end: :state-uncomment-start: start
    //// TODO: Return a cleanup function that closes the user realm.
    // :state-uncomment-end:
    // :code-block-end:
  }, [user]);

  // :code-block-start: sign-in
  // The signIn function takes an email and password and uses the
  // emailPassword authentication provider to log in.
  const signIn = async (email, password) => {
    // :state-start: final
    const creds = Realm.Credentials.emailPassword(email, password);
    const newUser = await app.logIn(creds);
    setUser(newUser);
    // :state-end: :state-uncomment-start: start
    //// TODO: Pass the email and password to Realm's email password provider to log in.
    //// Use the setUser() function to set the logged-in user.
    // :state-uncomment-end:
  };
  // :code-block-end:

  // :code-block-start: sign-up
  // The signUp function takes an email and password and uses the
  // emailPassword authentication provider to register the user.
  const signUp = async (email, password) => {
    // :state-start: final
    await app.emailPasswordAuth.registerUser({ email, password });
    // :state-end: :state-uncomment-start: start
    //// TODO: Pass the email and password to Realm's email password provider to register the user.
    //// Registering only registers and does not log in.
    // :state-uncomment-end:
  };
  // :code-block-end:

  // :code-block-start: sign-out
  // The signOut function calls the logOut function on the currently
  // logged in user
  const signOut = () => {
    if (user == null) {
      console.warn("Not logged in, can't log out!");
      return;
    }
    // :state-start: final
    user.logOut();
    setUser(null);
    // :state-end: :state-uncomment-start: start
    //// TODO: Log out the current user and use the setUser() function to set the current user to null.
    // :state-uncomment-end:
  };
  // :code-block-end:

  return (
    <AuthContext.Provider
      value={{
        signUp,
        signIn,
        signOut,
        user,
        projectData, // list of projects the user is a memberOf
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// The useAuth hook can be used by components under an AuthProvider to
// access the auth context value.
const useAuth = () => {
  const auth = useContext(AuthContext);
  if (auth == null) {
    throw new Error("useAuth() called outside of a AuthProvider?");
  }
  return auth;
};

export { AuthProvider, useAuth };
