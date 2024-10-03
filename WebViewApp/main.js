import ReactDOM from 'react-dom';
import React from 'react';
import { DebuggerComponent } from './components/views/uiui.component';


const DebuggerId = 'debugger-main-component';

const debugger_ = document.getElementById(DebuggerId);
if (debugger_) {
    ReactDOM.render(<DebuggerComponent></DebuggerComponent>, debugger_)
}