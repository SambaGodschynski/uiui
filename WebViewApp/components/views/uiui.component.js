import React from "react";
import * as _ from 'lodash';
import { BaseComponent } from "../shared/base/base.component";
import { UiUiElement } from "./uielements/element";


export class DebuggerComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            root: {}
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
        const json = JSON.parse(source);
        this.setState({root: json});
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
                {<UiUiElement uiui={this.state.root} depth={1}></UiUiElement>}
            </div>
        );
    }
}