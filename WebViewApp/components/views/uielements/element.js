import React from "react";
import { UiUiSlider } from "./slider";

let nrElements = 0;

function nextKey() {
    ++nrElements;
    return nrElements;
}

export const CtrlTypes = {
    slider: "slider"
}

export class UiUiElement extends React.Component {
    constructor(props) {
        super(props);
        this.onValueChange = props.onValueChange || (() => {});
    }

    renderTitle(title) {
        switch (this.props.depth) {
            case 1: return <h1>{title}</h1>
            case 2: return <h2>{title}</h2>
            case 3: return <h3>{title}</h3>
            case 4: return <h4>{title}</h4>
            case 5: return <h5>{title}</h5>
            case 6: return <h6>{title}</h6>
            case 7: return <h7>{title}</h7>
            default: return <h8>{title}</h8>
        }
    }

    renderCtrl() {
        const el = this.props.uiui;
        const ctrl = el.ctrl;
        const initValue = this.props.initValues[el.id]; 
        if (!ctrl) {
            return <></>;
        }
        switch(ctrl) {
            case CtrlTypes.slider: return <UiUiSlider uiui={this.props.uiui} initValue={initValue} onValueChange={this.onValueChange}></UiUiSlider>;
        }
    }

    getStyle(el) {
        return {
            display: "flex",
            flexDirection: el.direction || "row"
        };
    }

    render() {
        const el = this.props.uiui;
        const ctrl = el.ctrl;
        const classes = ['uiui-element',`depth-${this.props.depth}`]
        if(ctrl) {
            classes.push(`ctrl-${ctrl}`)
        }
        const style = this.getStyle(el);
        return <div className={classes.join(' ')}>
            {el.title ? this.renderTitle(el.title) : <></> }
            {this.renderCtrl()}
            <div style={style}>
                { el.children ? el.children.map( x => 
                    <UiUiElement onValueChange={this.onValueChange} 
                        key={nextKey()} 
                        uiui={x} 
                        initValues={this.props.initValues}
                        depth={this.props.depth + 1}>
                    </UiUiElement>) 
                    : <></> 
                }
            </div>
        </div>
    }
}