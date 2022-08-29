import './App.css';

import React from 'react';

import * as microsoftTeams from '@microsoft/teams-js';
import { Button } from "@fluentui/react-northstar";
import { useContext } from "react";
import { TeamsFxContext } from "./Context";
import { useGraph } from "@microsoft/teamsfx-react";
import { PersonCardGraphToolkit } from './PersonCardGraphToolkit';

/**
 * The 'Config' component is used to display your group tabs
 * user configuration options.  Here you will allow the user to
 * make their choices and once they are done you will need to validate
 * their choices and communicate that to Teams to enable the save button.
 */
class TabConfig extends React.Component {
  
  render() {
    // Initialize the Microsoft Teams SDK
    microsoftTeams.initialize();

    /**
     * When the user clicks "Save", save the url for your configured tab.
     * This allows for the addition of query string parameters based on
     * the settings selected by the user.
     */
    microsoftTeams.settings.registerOnSaveHandler((saveEvent) => {
      const baseUrl = `https://${window.location.hostname}:${window.location.port}`;
      microsoftTeams.settings.setSettings({
        suggestedDisplayName: "My Tab",
        entityId: "Test",
        contentUrl: baseUrl + "/index.html#/tab",
        websiteUrl: baseUrl + "/index.html#/tab",
      });
      saveEvent.notifySuccess();
    });

    /**
     * After verifying that the settings for your tab are correctly
     * filled in by the user you need to set the state of the dialog
     * to be valid.  This will enable the save button in the configuration
     * dialog.
     */
    microsoftTeams.settings.setValidityState(true);

    const { teamsfx } = useContext(TeamsFxContext);
    const { loading, error, data, reload } = useGraph(
      async (graph, teamsfx, scope) => {
        // Call graph api directly to get user profile information
        const profile = await graph.api("/me").get();
  
        // Initialize Graph Toolkit TeamsFx provider
        const provider = new TeamsFxProvider(teamsfx, scope);
        Providers.globalProvider = provider;
        Providers.globalProvider.setState(ProviderState.SignedIn);
  
        let photoUrl = "";
        try {
          const photo = await graph.api("/me/photo/$value").get();
          photoUrl = URL.createObjectURL(photo);
        } catch {
          // Could not fetch photo from user's profile, return empty string as placeholder.
        }
        return { profile, photoUrl };
      },
      { scope: ["User.Read"], teamsfx: teamsfx }
    );

    return (
      <div>
        <h1>Tab Configuration</h1>
        <div>
          This is where you will add your tab configuration options the user can choose when the tab
          is added to your team/group chat.
          <Button primary content="Authorize" disabled={loading} onClick={reload} />
          <PersonCardGraphToolkit loading={loading} data={data} error={error} />
        </div>
      </div>
    );
  }
}

export default TabConfig;
