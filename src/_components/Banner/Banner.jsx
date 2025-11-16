import Image from "next/image";
import styles from "./Banner.module.css";

export default function Banner() {
    return (
        <section className={`container-fluid p-0 ${styles.bannerContainer}`}>
            <div className={styles.bannerOverlay}></div>

            <Image
                src="/banner-chat.png"
                alt="Banner Savia"
                fill
                priority
                unoptimized
                className={styles.bannerImg}
            />

        </section>
    );
}
