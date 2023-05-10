import React, { useCallback, useRef } from 'react';
import styles from './style.module.css';

const headerHeight = 0;
let isDrag = false;
let target: HTMLDivElement;

interface Props extends React.PropsWithChildren {
    vertical?: boolean;
}

export const Delimeter: React.FC<Props> = ({ vertical, children }) => {

    const delimeterRef = useRef<HTMLDivElement>(null);

    const handleDrag = useCallback((e: MouseEvent) => {
        if (e.clientX === 0 && e.clientY === 0 || !isDrag) return;
        const delimeter = delimeterRef.current;
        if (delimeter && target) {
            const parentElement = target.parentElement;
            if (parentElement) {
                const delimeterRect = delimeter?.getBoundingClientRect();
                const nextSibling = parentElement.nextSibling as HTMLDivElement;
                // const previousSibling = parentElement.previousSibling as HTMLDivElement;
                // const nextRect = nextSibling?.getBoundingClientRect();
                // const prevRect = previousSibling?.getBoundingClientRect();
                if (!vertical) {
                    const newRight = delimeterRect?.width - e.clientX;
                    const newLeft = e.clientX - delimeterRect?.left;
                    parentElement.style.right = `${newRight * 100 / delimeterRect.width}%`;
                    nextSibling.style.left = `${newLeft * 100 / delimeterRect.width}%`;
                }
                else if (target.parentElement) {
                    const newBottom = delimeterRect?.height - e.clientY + headerHeight;
                    const newTop = e.clientY - delimeterRect?.top;
                    parentElement.style.bottom = `${newBottom * 100 / delimeterRect.height}%`;
                    nextSibling.style.top = `${newTop * 100 / delimeterRect.height}%`;
                }
            }
        }
    }, [vertical])

    const handleDragEnd = useCallback((e: MouseEvent) => {
        isDrag = false;
        document.body.style.userSelect = "";
        document.body.removeEventListener('mousemove', handleDrag);
        document.body.removeEventListener('mouseup', handleDragEnd);
    }, [vertical])

    const handleDragStart: React.MouseEventHandler<HTMLDivElement> = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        document.body.style.userSelect = "none";
        isDrag = true;
        target = e.currentTarget;
        document.body.addEventListener('mousemove', handleDrag);
        document.body.addEventListener('mouseup', handleDragEnd);
    }, [vertical])

    const childrenLength = React.Children.count(children);
    const constructStyle = (n: number) => {
        if (!vertical) {
            return {
                left: `${100 / childrenLength * n}%`,
                right: `${100 / childrenLength * (childrenLength - n - 1)}%`
            }
        }
        return {
            top: `${100 / childrenLength * n}%`,
            bottom: `${100 / childrenLength * (childrenLength - n - 1)}%`
        }
    }

    return <div className={styles.container} data-vertical={vertical} ref={delimeterRef}>
        {React.Children.map(children, (child, idx) => {
            return <div className={styles.child} style={constructStyle(idx)}>
                {child}
                <div className={styles.handle} onMouseDown={handleDragStart}></div>
            </div>
        })}
    </div >
}