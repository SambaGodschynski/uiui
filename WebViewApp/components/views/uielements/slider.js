import React from "react";

export class UiUiSlider extends React.Component {
    constructor(props) {
        super(props);
        this.id = props.uiui.id;
        this.state = {
            value: props.defaultValue || 0
        }
    }

    onValueChange(event) {
        const value = Number.parseFloat(event.target.value);
        this.setState({value});
        if (this.props.onValueChange) {
            this.props.onValueChange(this.id, value);
        }
    }

    render() {
        return <>
             <input onChange={this.onValueChange.bind(this)} value={this.value} style={{
                // transform: "rotate(-90deg)",
                // transformOrigin: "50% 50%"
             }} type="range" min="1" max="100"/>
        </>
    }
}