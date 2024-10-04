import React from "react";

export class UiUiSlider extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <>
             <input style={{
                // transform: "rotate(-90deg)",
                // transformOrigin: "50% 50%"
             }} type="range" min="1" max="100"/>
        </>
    }
}