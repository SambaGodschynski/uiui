import React from "react";
import { UiUiBase } from "./elementBase";

export class UiUiSlider extends UiUiBase {
    constructor(props) {
        super(props);
        this.id = props.uiui.id;
        this.state = {
            value: props.defaultValue || 0
        }
    }

    onSliderValueChange(event) {
        const value = Number.parseFloat(event.target.value);
        this.onValueChange(value);
    }

    onValueChange(value) {
        this.setState({value});
        if (this.props.onValueChange) {
            this.props.onValueChange(this.id, value);
        }
    }

    render() {
        return <>
             <input onChange={this.onSliderValueChange.bind(this)} value={this.state.value} style={{
                // transform: "rotate(-90deg)",
                // transformOrigin: "50% 50%"
             }} type="range" min="1" max="100"/>
        </>
    }
}