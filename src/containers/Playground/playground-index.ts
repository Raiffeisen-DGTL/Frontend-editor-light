import * as Babel from '@babel/standalone';

import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';

console.log = (...attrs) => {
    parent.postMessage({ console: 'log', payload: JSON.stringify(attrs) });
};
console.warn = (...attrs) => {
    parent.postMessage({ console: 'warn', payload: JSON.stringify(attrs) });
};
console.error = (...attrs) => {
    parent.postMessage({ console: 'error', payload: JSON.stringify(attrs) });
};
console.clear = () => parent.postMessage({ console: 'clear' });

window.onerror = (
    event: Event | string,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
) => console.error(error);

window.React = React;
window.ReactDOM = ReactDOM;
//@ts-ignore
window.styled = styled;

const style = document.createElement('style');
document.body.prepend(style);

let output = '';
let oldOutput = output;

window.onmessage = (event: MessageEvent) => {
    // TSX
    if (event.data.code) {
        try {
            oldOutput = output;
            const babelResult = Babel.transform(event.data.code, {
                filename: 'index.tsx',
                presets: ['typescript', 'react', 'env'],
            }).code;

            if (babelResult) output = babelResult;
        } catch (_) {
            output = oldOutput;
        } finally {
            try {
                document.body.innerHTML = '<div id="app"></div>';
                const App = eval(output);
                createRoot(
                    document.getElementById('app') as HTMLDivElement
                ).render(App);
            } catch (error) {
                console.error(error);
            }
        }
    }

    // CSS
    if (event.data.css) {
        style.innerHTML = event.data.css;
    }

    // HTML
    if (event.data.html) {
        document.body.innerHTML = event.data.html;
        document.body.prepend(style);
        try {
            eval(output);
        } catch (error) {
            console.error(error);
        }
    }

    // API
    if (
        typeof event.data === 'object' &&
        'api' in event.data &&
        'serviceWorker' in navigator
    ) {
        navigator.serviceWorker.controller?.postMessage({
            type: 'updateApiHandler',
            apiCode: event.data.api,
        });
    }
};

console.clear();
parent.postMessage('request_default_api');
parent.postMessage('request_default_static');
parent.postMessage('request_default_code');
