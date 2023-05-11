import React, { useEffect, useState } from 'react';
import base64js from 'base64-js';
import pako from 'pako';
import { Delimeter } from '../../components/Delimeter/Delimeter';
import { Editor, Playground, Console } from '..';
import styles from './style.module.css';
import { LogData } from '../Playground/Playground';

function Base64Encode(str: string) {
    var bytes = pako.deflate(new TextEncoder().encode(str));
    return base64js.fromByteArray(bytes);
}

function Base64Decode(str: string, encoding = 'utf-8') {
    var bytes = base64js.toByteArray(str);
    return new TextDecoder(encoding).decode(pako.inflate(bytes));
}

export const App: React.FC = () => {

    const loaded = JSON.parse(Base64Decode(location.hash.replace('#', '')) || '{}');

    const [logs, setLogs] = useState<LogData[]>([]);
    const [code, setCode] = useState<string>(loaded.code ?? '');
    const [css, setCss] = useState<string>(loaded.css ?? '');
    const [html, setHtml] = useState<string>(loaded.html ?? '');

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

    const buildUrl = () => {
        const saved = Base64Encode(JSON.stringify({
            code,
            html,
            css
        }))
        const res = `${location.origin}/${location.pathname}#${saved}`.replace('//#', '/#');
        navigator.clipboard.writeText(res);
    }

    useEffect(() => {
        location.hash = "";
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <Delimeter>
                    <Delimeter>
                        <Editor defaultCode={code} onChangeModel={handleChangeModelCode} requestURL={buildUrl} />
                        <Editor language='css' defaultCode={css} onChangeModel={handleChangeModelCss} requestURL={buildUrl} />
                        <Editor language='html' defaultCode={html} onChangeModel={handleChangeModelHtml} requestURL={buildUrl} />
                    </Delimeter>
                    <Delimeter vertical>
                        <Playground code={code} css={css} html={html} onLog={logHandler} />
                        <Console logs={logs} />
                    </Delimeter>
                </Delimeter>
            </div>
        </div>
    );
}