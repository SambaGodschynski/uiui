import React from "react";
import { UiUiBase } from "./elementBase";

export class UiUiSlider extends UiUiBase {
    constructor(props) {
        super(props);
        this.id = props.uiui.id;
        this.minValue = props.uiui.minValue || 0;
        this.maxValue = props.uiui.maxValue || 100;
        this.defaultValue = props.uiui.defaultValue || 0;
        this.step = props.uiui.step || undefined;
        this.state = {
            value: this.getInitValue()
        }
    }

    getInitValue() { return this.props.initValue || this.defaultValue || 0; }

    onSliderValueChange(event) {
        const value = Number.parseFloat(event.target.value);
        this.onValueChange(value);
    }

    onValueChange(value) {
        this.setState({ value });
        if (this.props.onValueChange) {
            value = this.postProcess(value);
            this.props.onValueChange(this.id, value);
        }
    }

    render() {
        return <div style={{ padding: "0 5px" }}>
            <input
                onChange={this.onSliderValueChange.bind(this)}
                value={this.state.value}
                type="range"
                min={this.minValue}
                max={this.maxValue}
                step={this.step}
            />
            <input
                onChange={this.onSliderValueChange.bind(this)}
                value={this.state.value}
                type="number"
                min={this.minValue}
                max={this.maxValue}
                step={this.step}
                style={{
                    width: "3ch",
                    verticalAlign: "text-bottom"
                }}
            >
            </input>
        </div>
    }
}