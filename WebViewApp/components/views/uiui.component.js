import React from "react";
import * as _ from 'lodash';
import { BaseComponent } from "../shared/base/base.component";


export class DebuggerComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            json: null
        }
        window.addEventListener('message', event => { // get vscode message
            const message = event.data;
            this.handleMessage(message);
        });
    }

    componentDidMount() {
        this.sendMessageToHost("uiuiview-ready");
    }

    updateSourceFile(source) {
        this.setState({json: source});
    }

    handleMessage(message) {
        switch(message.msg) {
            case 'updateSouce':
            this.updateSourceFile(message.source);
            break;
        }
    }
 
    render() {
        return (
            <div>
                <h1>
                    UiUiUi
                </h1>
                {this.state.json}
            </div>
        );
    }
}