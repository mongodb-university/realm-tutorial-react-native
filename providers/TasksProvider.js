import React, { useContext, useState, useEffect, useRef } from "react";
import Realm from "realm";
import { Task } from "../schemas";
import { useAuth } from "./AuthProvider";

const TasksContext = React.createContext(null);

const TasksProvider = ({ children, projectPartition }) => {
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();

  // Use a Ref to store the realm rather than the state because it is not
  // directly rendered, so updating it should not trigger a re-render as using
  // state would.
  const realmRef = useRef(null);

  useEffect(() => {
    // Enables offline-first: opens a local realm immediately without waiting 
    // for the download of a synchronized realm to be completed.
    const OpenRealmBehaviorConfiguration = {
      type: 'openImmediately',
    };
    // :code-block-start: open-project-realm
    const config = {
      schema: [Task.schema],
      sync: {
        user: user,
        partitionValue: projectPartition,
        newRealmFileBehavior: OpenRealmBehaviorConfiguration,
        existingRealmFileBehavior: OpenRealmBehaviorConfiguration,
      },
    };
    // :state-start: final
    // open a realm for this particular project
    Realm.open(config).then((projectRealm) => {
      realmRef.current = projectRealm;

      const syncTasks = projectRealm.objects("Task");
      let sortedTasks = syncTasks.sorted("name");
      setTasks([...sortedTasks]);
      sortedTasks.addListener(() => {
        setTasks([...sortedTasks]);
      });
    });
    // :state-end: :state-uncomment-start: start
    //// TODO: Open the project realm with the given configuration and store
    //// it in the realmRef. Once opened, fetch the Task objects in the realm,
    //// sorted by name, and attach a listener to the Task collection. When the
    //// listener fires, use the setTasks() function to apply the updated Tasks
    //// list to the state.
    // :state-uncomment-end:
    // :code-block-end:

    // :code-block-start: clean-up
    return () => {
      // cleanup function
      const projectRealm = realmRef.current;
      if (projectRealm) {
        // :state-start: final
        projectRealm.close();
        realmRef.current = null;
        // :state-end: :state-uncomment-start: start
        //// TODO: close the project realm and reset the realmRef's
        //// current value to null.
        // :state-uncomment-end:
        setTasks([]);
      }
    };
    // :code-block-end:
  }, [user, projectPartition]);

  // :code-block-start: create-task
  const createTask = (newTaskName) => {
    const projectRealm = realmRef.current;
    // :state-start: final
    projectRealm.write(() => {
      // Create a new task in the same partition -- that is, in the same project.
      projectRealm.create(
        "Task",
        new Task({
          name: newTaskName || "New Task",
          partition: projectPartition,
        })
      );
    });
    // :state-end: :state-uncomment-start: start
    //// TODO: Create the Task in a write block.
    // :state-uncomment-end:
  };
  // :code-block-end:

  // :code-block-start: set-task-status
  const setTaskStatus = (task, status) => {
    // One advantage of centralizing the realm functionality in this provider is
    // that we can check to make sure a valid status was passed in here.
    if (
      ![
        Task.STATUS_OPEN,
        Task.STATUS_IN_PROGRESS,
        Task.STATUS_COMPLETE,
      ].includes(status)
    ) {
      throw new Error(`Invalid status: ${status}`);
    }
    const projectRealm = realmRef.current;

    // :state-start: final
    projectRealm.write(() => {
      task.status = status;
    });
    // :state-end: :state-uncomment-start: start
    //// TODO: In a write block, update the Task's status.
    // :state-uncomment-end:
  };
  // :code-block-end:

  // :code-block-start: delete-task
  // Define the function for deleting a task.
  const deleteTask = (task) => {
    const projectRealm = realmRef.current;
    // :state-start: final
    projectRealm.write(() => {
      projectRealm.delete(task);
      setTasks([...projectRealm.objects("Task").sorted("name")]);
    });
    // :state-end: :state-uncomment-start: start
    //// TODO: In a write block, delete the Task.
    // :state-uncomment-end:
  };
  // :code-block-end:

  // Render the children within the TaskContext's provider. The value contains
  // everything that should be made available to descendants that use the
  // useTasks hook.
  return (
    <TasksContext.Provider
      value={{
        createTask,
        deleteTask,
        setTaskStatus,
        tasks,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

// The useTasks hook can be used by any descendant of the TasksProvider. It
// provides the tasks of the TasksProvider's project and various functions to
// create, update, and delete the tasks in that project.
const useTasks = () => {
  const task = useContext(TasksContext);
  if (task == null) {
    throw new Error("useTasks() called outside of a TasksProvider?"); // an alert is not placed because this is an error for the developer not the user
  }
  return task;
};

export { TasksProvider, useTasks };
