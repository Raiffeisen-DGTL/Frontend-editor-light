import React from 'react';
import { LogData } from '../Playground/Playground';
import styles from './style.module.css';

interface Props {
    logs: LogData[];
}

export const Console: React.FC<Props> = ({ logs }) => {
    return <div className={styles.container}>
        <div className={styles.label}>console</div>
        {logs.filter(log => log.data.console && log.data.payload).map((log, idx) => {
            const currentPayload = Array.from(
                JSON.parse(log.data.payload)
            );

            return (<div key={idx} className={styles.line} data-type={log.data.console}>
                <span className={styles.timestamp}>{log.timestamp.toLocaleTimeString()}</span>
                {currentPayload.map((pl, i) => (
                    <span
                        key={i}
                        className={styles.data}
                    >
                        {JSON.stringify(pl)}
                    </span>
                ))}
            </div>)
        })}
    </div>
}