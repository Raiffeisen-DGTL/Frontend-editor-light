import React, { useCallback, useEffect, useState } from 'react';
import base64js from 'base64-js';
import pako from 'pako';
import { Delimeter } from '../../components/Delimeter/Delimeter';
import { Editor, Playground, Console } from '..';
import { LogData } from '../Playground/Playground';
import { ActionType } from '../Editor/Editor';
import styles from './style.module.css';

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
    iframe: boolean;
    console: boolean;
    qr: boolean;
    horizontal: boolean;
    autorun: boolean;
}

const setDefaultSettings = (loaded: any): Settings => {
    if (loaded.settings) {
        if (loaded.settings.autorun === undefined) {
            return { ...loaded.settings, autorun: true };
        }
        return loaded.settings;
    }

    return {
        code: true,
        css: true,
        html: true,
        output: true,
        iframe: true,
        console: true,
        qr: false,
        horizontal: true,
        autorun: true,
    };
};

export const App: React.FC = () => {
    const loaded = JSON.parse(
        Base64Decode(location.hash.replace('#', '')) ||
            localStorage.getItem('r_editor_saved_code') ||
            '{}'
    );

    const [logs, setLogs] = useState<LogData[]>([]);
    const [code, setCode] = useState<string>(loaded.code ?? '');
    const [css, setCss] = useState<string>(loaded.css ?? '');
    const [html, setHtml] = useState<string>(loaded.html ?? '');
    // For autorun
    const [stashedCode, setStashedCode] = useState<string>('');
    const [stashedCss, setStashedCss] = useState<string>('');
    const [stashedHtml, setStashedHtml] = useState<string>('');

    const [settings, setSettings] = useState<Settings>(
        setDefaultSettings(loaded)
    );

    const logHandler = (data: LogData) => {
        if (data.data.console === 'clear') {
            setLogs([]);
        }
        setLogs((prev) => [...prev, data]);
    };

    const setStashed = () => {
        setStashedCode(code);
        setStashedCss(css);
        setStashedHtml(html);
    };

    const handleChangeModelCode = (code: string) => {
        const savedCode = JSON.parse(
            localStorage.getItem('r_editor_saved_code') || '{}'
        );
        localStorage.setItem(
            'r_editor_saved_code',
            JSON.stringify({ ...savedCode, code })
        );
        setCode(code);
    };

    const handleChangeModelCss = (code: string) => {
        const savedCode = JSON.parse(
            localStorage.getItem('r_editor_saved_code') || '{}'
        );
        localStorage.setItem(
            'r_editor_saved_code',
            JSON.stringify({ ...savedCode, css: code })
        );
        setCss(code);
    };

    const handleChangeModelHtml = (code: string) => {
        const savedCode = JSON.parse(
            localStorage.getItem('r_editor_saved_code') || '{}'
        );
        localStorage.setItem(
            'r_editor_saved_code',
            JSON.stringify({ ...savedCode, html: code })
        );
        setHtml(code);
    };

    const handleAction = (type: ActionType) => {
        const getEditorInstanses = (settings: Settings) =>
            Object.entries(settings).filter(([n, v]) => n !== 'output' && v)
                .length;
        const savedCode = JSON.parse(
            localStorage.getItem('r_editor_saved_code') || '{}'
        );
        switch (type) {
            case ActionType.COPY_URL:
                const saved = Base64Encode(
                    JSON.stringify({
                        code,
                        html,
                        css,
                        settings,
                    })
                );
                const res =
                    `${location.origin}/${location.pathname}#${saved}`.replace(
                        '//#',
                        '/#'
                    );
                navigator.clipboard.writeText(res);
                break;
            case ActionType.TOGGLE_TSX:
                if (getEditorInstanses({ ...settings, code: !settings.code })) {
                    setSettings((prev) => {
                        const currentSettings = { ...prev, code: !prev.code };
                        localStorage.setItem(
                            'r_editor_saved_code',
                            JSON.stringify({
                                ...savedCode,
                                settings: currentSettings,
                            })
                        );
                        return currentSettings;
                    });
                }
                break;
            case ActionType.TOGGLE_CSS:
                if (getEditorInstanses({ ...settings, css: !settings.css })) {
                    setSettings((prev) => {
                        const currentSettings = { ...prev, css: !prev.css };
                        localStorage.setItem(
                            'r_editor_saved_code',
                            JSON.stringify({
                                ...savedCode,
                                settings: currentSettings,
                            })
                        );
                        return currentSettings;
                    });
                }
                break;
            case ActionType.TOGGLE_HTML:
                if (getEditorInstanses({ ...settings, html: !settings.html })) {
                    setSettings((prev) => {
                        const currentSettings = { ...prev, html: !prev.html };
                        localStorage.setItem(
                            'r_editor_saved_code',
                            JSON.stringify({
                                ...savedCode,
                                settings: currentSettings,
                            })
                        );
                        return currentSettings;
                    });
                }
                break;
            case ActionType.TOGGLE_OUTPUT:
                setSettings((prev) => {
                    const currentSettings = {
                        ...prev,
                        output: !prev.output,
                        iframe: !prev.output,
                        console: !prev.output,
                    };
                    localStorage.setItem(
                        'r_editor_saved_code',
                        JSON.stringify({
                            ...savedCode,
                            settings: currentSettings,
                        })
                    );
                    return currentSettings;
                });
                break;
            case ActionType.TOGGLE_IFRAME:
                setSettings((prev) => {
                    const currentSettings = {
                        ...prev,
                        iframe: !prev.iframe,
                        output: prev.console || !prev.iframe,
                    };
                    localStorage.setItem(
                        'r_editor_saved_code',
                        JSON.stringify({
                            ...savedCode,
                            settings: currentSettings,
                        })
                    );
                    return currentSettings;
                });
                break;
            case ActionType.TOGGLE_CONSOLE:
                setSettings((prev) => {
                    const currentSettings = {
                        ...prev,
                        console: !prev.console,
                        output: prev.iframe || !prev.console,
                    };
                    localStorage.setItem(
                        'r_editor_saved_code',
                        JSON.stringify({
                            ...savedCode,
                            settings: currentSettings,
                        })
                    );
                    return currentSettings;
                });
                break;
            case ActionType.TOGGLE_VIEW:
                setSettings((prev) => {
                    const currentSettings = {
                        ...prev,
                        horizontal: !prev.horizontal,
                    };
                    localStorage.setItem(
                        'r_editor_saved_code',
                        JSON.stringify({
                            ...savedCode,
                            settings: currentSettings,
                        })
                    );
                    return currentSettings;
                });
                break;
            case ActionType.TOGGLE_AUTORUN:
                setSettings((prev) => {
                    const currentSettings = { ...prev, autorun: !prev.autorun };
                    localStorage.setItem(
                        'r_editor_saved_code',
                        JSON.stringify({
                            ...savedCode,
                            settings: currentSettings,
                        })
                    );
                    return currentSettings;
                });
                setStashed();
                break;
        }
    };

    useEffect(() => {
        location.hash = '';
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <Delimeter vertical={!settings.horizontal}>
                    <Delimeter vertical={!settings.horizontal}>
                        {settings.code && (
                            <Editor
                                defaultCode={code}
                                autorun={settings.autorun}
                                runCode={setStashed}
                                onChangeModel={handleChangeModelCode}
                                onAction={handleAction}
                            />
                        )}
                        {settings.css && (
                            <Editor
                                language='css'
                                defaultCode={css}
                                onChangeModel={handleChangeModelCss}
                                onAction={handleAction}
                            />
                        )}
                        {settings.html && (
                            <Editor
                                language='html'
                                defaultCode={html}
                                onChangeModel={handleChangeModelHtml}
                                onAction={handleAction}
                            />
                        )}
                    </Delimeter>
                    {settings.output && (
                        <Delimeter vertical={settings.horizontal}>
                            {settings.autorun ? (
                                <Playground
                                    data-hide={!settings.iframe}
                                    code={code}
                                    css={css}
                                    html={html}
                                    onLog={logHandler}
                                />
                            ) : (
                                <Playground
                                    data-hide={!settings.iframe}
                                    code={stashedCode}
                                    css={stashedCss}
                                    html={stashedHtml}
                                    onLog={logHandler}
                                />
                            )}
                            {settings.console && <Console logs={logs} />}
                        </Delimeter>
                    )}
                </Delimeter>
            </div>
        </div>
    );
};
