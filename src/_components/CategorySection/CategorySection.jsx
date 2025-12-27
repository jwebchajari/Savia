import Image from "next/image";
import Link from "next/link";
import styles from "./CategorySection.module.css";

export default function CategorySection({
    title,
    description,
    img,
    link,
}) {
    return (
        <section className={`container ${styles.section}`}>

            {/* ✅ Imagen clickeable */}
            <Link href={link} className={styles.imageWrapper}>
                <Image
                    src={img}
                    alt={title}
                    fill
                    className={styles.image}
                    unoptimized
                    priority={false}
                />
            </Link>

            <div className={styles.textBox}>
                <h2>{title}</h2>
                <p>{description}</p>

                <Link href={link} className={styles.btn}>
                    Ver más
                </Link>
            </div>

        </section>
    );
}
