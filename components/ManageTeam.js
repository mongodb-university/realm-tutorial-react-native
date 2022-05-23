import React, { useState, useEffect } from "react";
import { View, Button, TextInput, Alert } from "react-native";
import styles from "../stylesheet";
import { Text, ListItem } from "react-native-elements";

import { useAuth } from "../providers/AuthProvider";

export function ManageTeam() {
  const { user } = useAuth();
  const [newTeamMember, setNewTeamMember] = useState(null);
  const [teamMemberList, setTeamMemberList] = useState([]);

  // :code-block-start: get-team
  // getTeam calls the backend function getMyTeamMembers to retrieve the
  // team members of the logged in user's project
  const getTeam = async () => {
    try {
      // :state-start: final
      const teamMembers = await user.functions.getMyTeamMembers([]);
      setTeamMemberList(teamMembers);
      // :state-end: :state-uncomment-start: start
      //// TODO: Call the getMyTeamMembers Realm function and pass the result to setTeamMemberList().
      // :state-uncomment-end:
    } catch (err) {
      Alert.alert("An error occurred while getting team members", err);
    }
  };
  // :code-block-end:

  // :code-block-start: add-team-member
  // addTeamMember calls the backend function addTeamMember to add a
  // team member to the logged in user's project
  const addTeamMember = async () => {
    try {
       // :state-start: final
      await user.functions.addTeamMember(newTeamMember);
      getTeam();
      // :state-end: :state-uncomment-start: start
      //// TODO: Call the addTeamMember Realm function with the given email,
      //// then call getTeam() to refresh the list.
      // :state-uncomment-end:
    } catch (err) {
      Alert.alert("An error occurred while adding a team member", err.message);
    }
  };
  // :code-block-end:

  // :code-block-start: remove-team-member
  // removeTeamMember calls the backend function removeTeamMember to remove a
  // team member from the logged in user's project
  const removeTeamMember = async (email) => {
    try {
      // :state-start: final
      await user.functions.removeTeamMember(email);
      getTeam();
      // :state-end: :state-uncomment-start: start
      //// TODO: Call the removeTeamMember Realm function with the given email,
      //// then call getTeam() to refresh the list.
      // :state-uncomment-end:
    } catch (err) {
      Alert.alert("An error occurred while removing a team member", err);
    }
  };
  // :code-block-end:

  const openDeleteDialogue = (member) => {
    Alert.alert("Remove the following member from your team?", member.name, [
      {
        text: "Remove",
        onPress: () => {
          removeTeamMember(member.name);
        },
      },
      { text: "cancel", style: "cancel" },
    ]);
  };

  // Load the team when the component is first mounted or when the user changes.
  useEffect(() => {
    getTeam();
  }, [user]);

  return (
    <View style={styles.manageTeamWrapper}>
      <View style={styles.manageTeamTitle}>
        <Text h3>My Team</Text>
      </View>
      {teamMemberList.map((member) => (
        <ListItem
          onPress={() => openDeleteDialogue(member)}
          bottomDivider
          key={member.name}
        >
          <ListItem.Content>
              <ListItem.Title>
                {member.name}
              </ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ))}

      <Text h4> Add member:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(text) => setNewTeamMember(text)}
          value={newTeamMember}
          placeholder="new team member username"
          style={styles.addTeamMemberInput}
          autoCapitalize="none"
        />
      </View>
      <Button onPress={() => addTeamMember(newTeamMember)} title="Add Member" />
    </View>
  );
}
