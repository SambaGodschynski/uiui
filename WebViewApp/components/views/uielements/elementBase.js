import React from "react";
import { evaluate } from 'mathjs';
//const math = create(all);

export class UiUiBase extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.onValueChange(this.id, this.getInitValue());
    }

    onValueChange(newValue) {}

    getInitValue() { return 0; }

    postProcess(value) {
        const expr = this.props.uiui.postProcess;
        if (!expr) {
            return value;
        }
        const scope = {value};
        value = evaluate(expr, scope);
        return value;
    }


}