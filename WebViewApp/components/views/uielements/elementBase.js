import React from "react";
import { evaluate } from 'mathjs';
//const math = create(all);

export class UiUiBase extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.onValueChange(this.getInitValue());
    }

    onValueChange(originalValue) {
        if (this.props.onValueChange) {
            const value = this.postProcess(originalValue);
            this.props.onValueChange(this.id, {value, originalValue});
        }
    }

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