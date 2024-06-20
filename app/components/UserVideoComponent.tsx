import React, { Component } from 'react';
import OpenViduVideoComponent from './OvVideo';

interface Props {
    streamManager: any;
}

export default class UserVideoComponent extends Component<Props> {
    getNicknameTag() {
        return JSON.parse(this.props.streamManager.stream.connection.data).clientData;
    }

    render() {
        return (
            <div>
                {this.props.streamManager !== undefined ? (
                    <div className="streamcomponent">
                        <OpenViduVideoComponent streamManager={this.props.streamManager} />
                        <div><p>{this.getNicknameTag()}</p></div>
                    </div>
                ) : null}
            </div>
        );
    }
}
