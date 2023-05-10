import React, { useEffect, useRef } from 'react';
import styles from './style.module.css';

export interface LogData {
    timestamp: Date;
    data: {
        console: "log" | "warn" | "error" | "clear";
        payload: number | string | boolean | object | [];
    }
}

interface Props {
    code: string;
    onLog(data: LogData): void;
}

export const Playground: React.FC<Props> = ({ onLog, code }) => {

    const frameRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        frameRef.current?.contentWindow?.postMessage(code);
    }, [code]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => { onLog({ timestamp: new Date(), data: event.data }) }
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        }
    }, []);

    return <div className={styles.container}>
        <iframe ref={frameRef} className={styles.iframe} title="Playground" src="./playground.html" sandbox='allow-scripts allow-same-origin'></iframe>
    </div>
}