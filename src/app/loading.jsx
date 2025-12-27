"use client";

import Image from "next/image";
import styles from "./loading.module.css";

export default function Loading() {
    return (
        <div className={styles.wrapper}>
            <Image
                src="/favicon.png"
                alt="Savia"
                width={90}
                height={90}
                className={styles.logo}
                priority
            />
            <p className={styles.text}>Cargando…</p>
        </div>
    );
}
