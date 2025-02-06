import React, { useEffect, useRef, useState } from 'react';
import styles from './style.module.css';

export interface LogData {
    timestamp: Date;
    data: {
        console: "log" | "warn" | "error" | "clear";
        payload: string;
    }
}

interface Props {
    code: string;
    html: string;
    css: string;
    onLog(data: LogData): void;
}

export const Playground: React.FC<Props> = ({ onLog, code, html, css }) => {

    const [showOverlay, setShowOverlay] = useState(false);

    const frameRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        frameRef.current?.contentWindow?.postMessage({ code });
    }, [code]);

    useEffect(() => {
        frameRef.current?.contentWindow?.postMessage({ html });
    }, [html]);


    useEffect(() => {
        frameRef.current?.contentWindow?.postMessage({ css });
    }, [css]);


    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data !== 'request_static') {
                onLog({ timestamp: new Date(), data: event.data });
            }
            if (event.data === 'request_static') {
                frameRef.current?.contentWindow?.postMessage({ html });
                frameRef.current?.contentWindow?.postMessage({ css });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('dragdelimeterstart', () => setShowOverlay(true));
        document.addEventListener('dragdelimeterend', () => setShowOverlay(false));
    }, []);

    return <div className={styles.container}>
        <iframe ref={frameRef} className={styles.iframe} title="Playground" src="./playground.html" sandbox='allow-scripts allow-same-origin'></iframe>
        {showOverlay && <div className={styles.overlay}></div>}
    </div>
}