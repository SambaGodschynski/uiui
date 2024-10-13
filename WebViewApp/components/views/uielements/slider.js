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

    getInitValue() {
        if (this.props.initValue) {
            return this.props.initValue;
        }
        if (this.defaultValue) {
            return this.defaultValue;
        }
        return 0;
    }

    onSliderValueChange(event) {
        const value = Number.parseFloat(event.target.value);
        this.setState({ value });
        this.onValueChange(value);
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
                    width: "5ch",
                    verticalAlign: "text-bottom",
                    padding: "0"
                }}
            >
            </input>
        </div>
    }
}