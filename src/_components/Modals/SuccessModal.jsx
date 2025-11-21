"use client";

import styles from "./SuccessModal.module.css";

export default function SuccessModal({ show, onClose, title, message }) {
    if (!show) return null;

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>

                <h3 className="fw-bold mb-2">{title}</h3>
                <p className="text-muted mb-4">{message}</p>

                <button className="btn btn-savia w-100" onClick={onClose}>
                    Aceptar
                </button>

            </div>
        </div>
    );
}
