import * as Babel from '@babel/standalone';

import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

console.log = (...attrs) => { parent.postMessage({ console: "log", payload: JSON.stringify(...attrs) }) }
console.warn = (...attrs) => { parent.postMessage({ console: "warn", payload: JSON.stringify(...attrs) }) }
console.error = (...attrs) => { parent.postMessage({ console: "error", payload: JSON.stringify(...attrs) }) }
console.clear = () => parent.postMessage({ console: "clear" });

window.onerror = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => console.error(error);

window.React = React;
window.ReactDOM = ReactDOM;
window.styled = styled;

let output = "";
let oldOutput = output;
window.onmessage = (event: MessageEvent) => {
    document.body.innerHTML = '';
    if (event.data) {
        try {
            oldOutput = output;
            output = Babel.transform(event.data, { filename: "index.tsx", presets: ["typescript", "react", "env"] }).code;
        }
        catch (error) {
            // console.error(error.message);
            output = oldOutput;
        }
        finally {
            try {
                eval(output);
            }
            catch (error) {
                console.error(error.message);
            }
        }
    }
}
