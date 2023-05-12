import React, { useEffect, useState } from 'react';
import base64js from 'base64-js';
import pako from 'pako';
import { Delimeter } from '../../components/Delimeter/Delimeter';
import { Editor, Playground, Console } from '..';
import styles from './style.module.css';
import { LogData } from '../Playground/Playground';
import { ActionType } from '../Editor/Editor';

function Base64Encode(str: string) {
    var bytes = pako.deflate(new TextEncoder().encode(str));
    return base64js.fromByteArray(bytes);
}

function Base64Decode(str: string, encoding = 'utf-8') {
    var bytes = base64js.toByteArray(str);
    return new TextDecoder(encoding).decode(pako.inflate(bytes));
}

interface Settings {
    code: boolean;
    css: boolean;
    html: boolean;
    output: boolean;
}

export const App: React.FC = () => {

    const loaded = JSON.parse(Base64Decode(location.hash.replace('#', '')) || '{}');

    const [logs, setLogs] = useState<LogData[]>([]);
    const [code, setCode] = useState<string>(loaded.code ?? '');
    const [css, setCss] = useState<string>(loaded.css ?? '');
    const [html, setHtml] = useState<string>(loaded.html ?? '');
    const [settings, setSettings] = useState<Settings>(loaded.settings ?? { code: true, css: true, html: true, output: true });

    const logHandler = (data: LogData) => {
        if (data.data.console === 'clear') {
            setLogs([]);
        }
        setLogs(prev => [...prev, data]);
    }

    const handleChangeModelCode = (code: string) => {
        setCode(code);
    }

    const handleChangeModelCss = (code: string) => {
        setCss(code);
    }

    const handleChangeModelHtml = (code: string) => {
        setHtml(code);
    }

    const handleAction = (type: ActionType) => {
        const getEditorInstanses = (settings: Settings) => Object.entries(settings).filter(([n, v]) => n !== 'output' && v).length;
        switch (type) {
            case ActionType.COPY_URL:
                const saved = Base64Encode(JSON.stringify({
                    code,
                    html,
                    css,
                    settings
                }))
                const res = `${location.origin}/${location.pathname}#${saved}`.replace('//#', '/#');
                navigator.clipboard.writeText(res);
                break;
            case ActionType.TOGGLE_TSX:
                if (getEditorInstanses({ ...settings, code: !settings.code })) {
                    setSettings(prev => ({ ...prev, code: !prev.code }))
                }
                break;
            case ActionType.TOGGLE_CSS:
                if (getEditorInstanses({ ...settings, css: !settings.css })) {
                    setSettings(prev => ({ ...prev, css: !prev.css }))
                }
                break;
            case ActionType.TOGGLE_HTML:
                if (getEditorInstanses({ ...settings, html: !settings.html })) {
                    setSettings(prev => ({ ...prev, html: !prev.html }))
                }
                break;
            case ActionType.TOGGLE_OUTPUT:
                setSettings(prev => ({ ...prev, output: !prev.output }))
                break;
        }
    }

    useEffect(() => {
        location.hash = "";
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <Delimeter>
                    <Delimeter>
                        {settings.code && <Editor defaultCode={code} onChangeModel={handleChangeModelCode} onAction={handleAction} />}
                        {settings.css && <Editor language='css' defaultCode={css} onChangeModel={handleChangeModelCss} onAction={handleAction} />}
                        {settings.html && <Editor language='html' defaultCode={html} onChangeModel={handleChangeModelHtml} onAction={handleAction} />}
                    </Delimeter>
                    {settings.output && <Delimeter vertical>
                        <Playground code={code} css={css} html={html} onLog={logHandler} />
                        <Console logs={logs} />
                    </Delimeter>
                    }
                </Delimeter>
            </div>
        </div>
    );
}