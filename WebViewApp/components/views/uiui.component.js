import React from "react";
import * as _ from 'lodash';
import { BaseComponent } from "../shared/base/base.component";
import { UiUiElement } from "./uielements/element";


export class DebuggerComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            root: {},
            initValues: {}
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

    updateInitValues(initValues) {
        this.setState({initValues});
    }

    handleMessage(message) {
        switch(message.msg) {
            case 'updateSouce':
            this.updateSourceFile(message.source);
            this.updateInitValues(message.initValues);
            break;
        }
    }

    onValueChange(id, value) {
        this.sendMessageToHost("onvalue-changed", {id, value});
    }
 
    render() {
        return (
            <div>
                {<UiUiElement onValueChange={this.onValueChange.bind(this)} 
                    uiui={this.state.root} 
                    initValues={this.state.initValues} 
                    depth={1}>
                </UiUiElement>}
            </div>
        );
    }
}