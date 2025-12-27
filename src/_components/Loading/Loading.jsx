"use client";

import Image from "next/image";
import styles from "./Loading.module.css";

export default function Loading({ text = "Cargando…" }) {
    return (
        <div className={styles.wrapper}>
            <Image
                src="/favicon.png"
                alt="Savia"
                width={80}
                height={80}
                className={styles.logo}
            />
            <p className={styles.text}>{text}</p>
        </div>
    );
}
