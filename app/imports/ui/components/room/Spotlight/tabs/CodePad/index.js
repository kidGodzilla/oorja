import React, { Component } from 'react';

// man monaco editor is awesome imo
// I should replace ace with it. https://microsoft.github.io/monaco-editor/

import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/dawn';

import roomActivities from '../../../constants/roomActivities';

import Y from '../../../../../../modules/Yjs';
import tabPropTypes from '../tabPropTypes';

import './codepad.scss';

class CodePad extends Component {

  constructor(props) {
    super(props);

    this.editor = null; // will be replaced by ace editor instance later
    this.y = null;

    this.state = {
      initialSyncComplete: false,
      fontSize: 16,
    };
  }
  componentDidMount() {
    const { roomAPI, connectedUsers, tabInfo, roomInfo } = this.props;
    new Y({
      db: {
        name: 'indexeddb',
      },
      connector: {
        name: 'licodeConnector', // use webrtc connector
        room: `${roomInfo.roomName}:${tabInfo.name}`, // clients connecting to the same room share data
        role: 'slave',
        syncMethod: 'syncAll',
        roomAPI,
        connectedUsers,
        tabInfo,
        roomInfo,
      },
      share: {
        ace: 'Text',
      },
    }).then((y) => {
      this.y = y;

      const editor = ace.edit('codepad-editor');
      editor.getSession().setMode('ace/mode/javascript');
      editor.setTheme('ace/theme/dawn');
      y.share.ace.bindAce(editor, { aceRequire: ace.acequire });
      this.editor = editor;

      // add activity listner to focus editor when user switches to this tab.
      roomAPI.addActivityListener(roomActivities.TAB_SWITCH, (payload) => {
        if (payload.to === tabInfo.tabId) {
          editor.focus();
        }
      });

      y.connector.whenSynced(() => {
        this.setState({
          ...this.state,

          // synced with atleast one user. not called when no other user in the room.
          initialSyncComplete: true,
        });
        console.info(tabInfo.name, 'synced');
      });
    });
  }

  componentWillUnmount() {
    this.y.close();
    this.editor.destroy();
    this.editor.container.remove();
  }

  render() {
    const editorStyle = {
      height: '100%',
      width: '100%',
      position: 'relative',

      fontSize: this.state.fontSize,
    };
    const isSyncing = (!this.state.initialSyncComplete) && (this.props.connectedUsers.length > 1);
    return (
      <div className={this.props.classNames} style={this.props.style}>
        <this.props.Spinner show={this.props.onTop && isSyncing}/>
        <div id="codepad-editor" style={editorStyle}>
        </div>
      </div>
    );
  }
}

CodePad.propTypes = tabPropTypes;

export default CodePad;