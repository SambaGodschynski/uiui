import React from "react";
import * as _ from 'lodash';
import { BaseComponent } from "../shared/base/base.component";


export class DebuggerComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        this.sendMessageToHost("debuggerview-ready");
    }

    handleMessage(message) {
    }
 
    render() {
        return (
            <div>
                <h1>
                    UiUiUi
                </h1>
            </div>
        );
    }
}