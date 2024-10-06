import React from "react";

export class UiUiBase extends React.Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount() {
        this.onValueChange(this.getDefaultValue())
    }
    onValueChange(newValue) {}
    getDefaultValue() { return 0; }

}