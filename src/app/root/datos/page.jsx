"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import { getLocalData, updateLocalData } from "@/services/localService";
import styles from "./DatosComerciales.module.css";

const DIAS = [
  { key: "lunes", label: "Lun" },
  { key: "martes", label: "Mar" },
  { key: "miércoles", label: "Mié" },
  { key: "jueves", label: "Jue" },
  { key: "viernes", label: "Vie" },
  { key: "sábado", label: "Sáb" },
  { key: "domingo", label: "Dom" },
];

const DEFAULT_DAY = (cerrado = false) => ({
  cerrado,
  franja1: { desde: "07:30", hasta: "12:45" },
  franja2: { desde: "15:30", hasta: "21:00" },
});

const DEFAULT_HORARIOS = {
  lunes: DEFAULT_DAY(false),
  martes: DEFAULT_DAY(false),
  miércoles: DEFAULT_DAY(false),
  jueves: DEFAULT_DAY(false),
  viernes: DEFAULT_DAY(false),
  sábado: DEFAULT_DAY(false),
  domingo: {
    cerrado: true,
    franja1: { desde: "", hasta: "" },
    franja2: { desde: "", hasta: "" },
  },
};

function safeTime(value) {
  return typeof value === "string" ? value : "";
}

function normalizeHorarios(horarios) {
  const out = {};
  for (const d of DIAS) {
    const src = horarios?.[d.key] || {};
    const base = DEFAULT_HORARIOS[d.key];

    out[d.key] = {
      cerrado: typeof src.cerrado === "boolean" ? src.cerrado : base.cerrado,
      franja1: {
        desde: safeTime(src?.franja1?.desde ?? base.franja1.desde),
        hasta: safeTime(src?.franja1?.hasta ?? base.franja1.hasta),
      },
      franja2: {
        desde: safeTime(src?.franja2?.desde ?? base.franja2.desde),
        hasta: safeTime(src?.franja2?.hasta ?? base.franja2.hasta),
      },
    };

    // Si está cerrado, vaciamos franjas para no confundir
    if (out[d.key].cerrado) {
      out[d.key].franja1 = { desde: "", hasta: "" };
      out[d.key].franja2 = { desde: "", hasta: "" };
    }
  }
  return out;
}

export default function DatosComerciales() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI: días seleccionados para aplicar el bloque
  const [selectedDays, setSelectedDays] = useState([
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
  ]);
  // UI: bloque editable
  const [bulkClosed, setBulkClosed] = useState(false);
  const [bulkF1Desde, setBulkF1Desde] = useState("07:30");
  const [bulkF1Hasta, setBulkF1Hasta] = useState("12:45");
  const [bulkF2Desde, setBulkF2Desde] = useState("15:30");
  const [bulkF2Hasta, setBulkF2Hasta] = useState("21:00");

  // UI: mostrar editor por día (opcional)
  const [showPerDay, setShowPerDay] = useState(false);

  // Modal
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "success", // "success" | "error"
  });
  const closeBtnRef = useRef(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const data = await getLocalData();

    const normalized = {
      ...data,
      direccion: data?.direccion || "",
      delivery: Number.isFinite(Number(data?.delivery)) ? Number(data?.delivery) : 0,
      redes: data?.redes || {},
      horarios: normalizeHorarios(data?.horarios),
    };

    setForm(normalized);
    setLoading(false);
  }

  function update(path, value) {
    setForm((prev) => {
      const copy = structuredClone(prev);
      const keys = path.split(".");
      let p = copy;
      while (keys.length > 1) p = p[keys.shift()];
      p[keys[0]] = value;
      return copy;
    });
  }

  function toggleDay(dayKey) {
    setSelectedDays((prev) => {
      const exists = prev.includes(dayKey);
      if (exists) return prev.filter((d) => d !== dayKey);
      return [...prev, dayKey];
    });
  }

  const selectedLabel = useMemo(() => {
    if (selectedDays.length === 0) return "Ningún día seleccionado";
    const order = DIAS.map((d) => d.key);
    const sorted = [...selectedDays].sort(
      (a, b) => order.indexOf(a) - order.indexOf(b)
    );
    return sorted
      .map((k) => DIAS.find((d) => d.key === k)?.label || k)
      .join(" · ");
  }, [selectedDays]);

  function selectPreset(preset) {
    if (preset === "lun-vie")
      setSelectedDays(["lunes", "martes", "miércoles", "jueves", "viernes"]);
    if (preset === "lun-sab")
      setSelectedDays([
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
      ]);
    if (preset === "todos") setSelectedDays(DIAS.map((d) => d.key));
    if (preset === "ninguno") setSelectedDays([]);
  }

  function applyBulkToSelected() {
    if (!form) return;
    if (selectedDays.length === 0) return;

    const payload = {
      cerrado: !!bulkClosed,
      franja1: bulkClosed
        ? { desde: "", hasta: "" }
        : { desde: bulkF1Desde, hasta: bulkF1Hasta },
      franja2: bulkClosed
        ? { desde: "", hasta: "" }
        : { desde: bulkF2Desde, hasta: bulkF2Hasta },
    };

    setForm((prev) => {
      const copy = structuredClone(prev);
      selectedDays.forEach((day) => {
        if (!copy.horarios?.[day]) copy.horarios[day] = DEFAULT_HORARIOS[day];
        copy.horarios[day] = payload;
      });
      return copy;
    });
  }

  function setSundayClosed() {
    setForm((prev) => {
      const copy = structuredClone(prev);
      copy.horarios.domingo = {
        cerrado: true,
        franja1: { desde: "", hasta: "" },
        franja2: { desde: "", hasta: "" },
      };
      return copy;
    });
  }

  function openModal({ title, message, variant = "success" }) {
    setModal({ open: true, title, message, variant });
  }

  function closeModal() {
    setModal((m) => ({ ...m, open: false }));
  }

  // Cerrar con ESC
  useEffect(() => {
    if (!modal.open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal.open]);

  // Enfocar botón al abrir
  useEffect(() => {
    if (modal.open) closeBtnRef.current?.focus();
  }, [modal.open]);

  async function guardar() {
    try {
      setSaving(true);
      await updateLocalData(form);
      await load();

      openModal({
        title: "¡Listo!",
        message: "Datos guardados correctamente.",
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      openModal({
        title: "Ups…",
        message: "No se pudieron guardar los cambios. Probá de nuevo.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <p className="container py-5">Cargando...</p>;

  return (
    <>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Datos Comerciales</h1>
          <p className={styles.subtitle}>
            Cargá un horario una sola vez, seleccioná los días y aplicalo. Se guarda en Firebase por día.
          </p>
        </header>

        {/* INFO LOCAL */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Información del Local</h2>

          <div className={styles.field}>
            <label className={styles.label}>Dirección</label>
            <input
              className={styles.input}
              value={form.direccion}
              onChange={(e) => update("direccion", e.target.value)}
              placeholder="Ej: Av. Belgrano 2011"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Costo de delivery</label>
            <input
              type="number"
              inputMode="numeric"
              className={styles.input}
              value={form.delivery}
              onChange={(e) => update("delivery", Number(e.target.value))}
              placeholder="Ej: 3500"
            />
            <div className={styles.help}>Se usa para calcular el total en el carrito.</div>
          </div>
        </section>

        {/* HORARIOS - BULK */}
        <section className={styles.card}>
          <div className={styles.cardHeaderRow}>
            <h2 className={styles.cardTitle}>Horarios</h2>

            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => setShowPerDay((v) => !v)}
              aria-expanded={showPerDay}
            >
              {showPerDay ? "Ocultar detalle por día" : "Ver detalle por día"}
            </button>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>1) Elegí los días</div>

            <div className={styles.presetRow}>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => selectPreset("lun-vie")}
              >
                Lun–Vie
              </button>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => selectPreset("lun-sab")}
              >
                Lun–Sáb
              </button>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => selectPreset("todos")}
              >
                Todos
              </button>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => selectPreset("ninguno")}
              >
                Limpiar
              </button>
            </div>

            <div className={styles.daysGrid}>
              {DIAS.map((d) => {
                const active = selectedDays.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    className={`${styles.dayChip} ${active ? styles.dayChipActive : ""
                      }`}
                    onClick={() => toggleDay(d.key)}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            <div className={styles.selectedHint}>
              Seleccionados: {selectedLabel}
            </div>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>2) Definí el horario</div>

            <label className={styles.switchRow}>
              <input
                type="checkbox"
                checked={bulkClosed}
                onChange={() => setBulkClosed((v) => !v)}
              />
              <span>Cerrado todo el día</span>
            </label>

            {!bulkClosed && (
              <div className={styles.timeBlocks}>
                <div className={styles.timeBlock}>
                  <div className={styles.timeTitle}>Franja 1</div>
                  <div className={styles.timeRow}>
                    <input
                      type="time"
                      className={styles.timeInput}
                      value={bulkF1Desde}
                      onChange={(e) => setBulkF1Desde(e.target.value)}
                    />
                    <span className={styles.timeSep}>a</span>
                    <input
                      type="time"
                      className={styles.timeInput}
                      value={bulkF1Hasta}
                      onChange={(e) => setBulkF1Hasta(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.timeBlock}>
                  <div className={styles.timeTitle}>Franja 2</div>
                  <div className={styles.timeRow}>
                    <input
                      type="time"
                      className={styles.timeInput}
                      value={bulkF2Desde}
                      onChange={(e) => setBulkF2Desde(e.target.value)}
                    />
                    <span className={styles.timeSep}>a</span>
                    <input
                      type="time"
                      className={styles.timeInput}
                      value={bulkF2Hasta}
                      onChange={(e) => setBulkF2Hasta(e.target.value)}
                    />
                  </div>
                  <div className={styles.help}>
                    Si no usás franja 2, podés dejarla vacía.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={applyBulkToSelected}
              disabled={selectedDays.length === 0}
              title={
                selectedDays.length === 0
                  ? "Seleccioná al menos un día"
                  : "Aplicar horario"
              }
            >
              Aplicar a días seleccionados
            </button>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={setSundayClosed}
            >
              Domingo cerrado
            </button>
          </div>

          {/* DETALLE POR DÍA (opcional) */}
          {showPerDay && (
            <div className={styles.perDay}>
              <div className={styles.blockTitle}>
                Detalle por día (se guarda así en Firebase)
              </div>

              <div className={styles.perDayList}>
                {DIAS.map((d) => {
                  const day = form.horarios[d.key];
                  return (
                    <div key={d.key} className={styles.perDayCard}>
                      <div className={styles.perDayHeader}>
                        <div className={styles.perDayName}>{d.key}</div>

                        <label className={styles.switchRow}>
                          <input
                            type="checkbox"
                            checked={!!day.cerrado}
                            onChange={() =>
                              update(`horarios.${d.key}.cerrado`, !day.cerrado)
                            }
                          />
                          <span>Cerrado</span>
                        </label>
                      </div>

                      {!day.cerrado && (
                        <>
                          <div className={styles.timeRow}>
                            <input
                              type="time"
                              className={styles.timeInput}
                              value={day.franja1.desde}
                              onChange={(e) =>
                                update(
                                  `horarios.${d.key}.franja1.desde`,
                                  e.target.value
                                )
                              }
                            />
                            <span className={styles.timeSep}>a</span>
                            <input
                              type="time"
                              className={styles.timeInput}
                              value={day.franja1.hasta}
                              onChange={(e) =>
                                update(
                                  `horarios.${d.key}.franja1.hasta`,
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className={styles.timeRow}>
                            <input
                              type="time"
                              className={styles.timeInput}
                              value={day.franja2.desde}
                              onChange={(e) =>
                                update(
                                  `horarios.${d.key}.franja2.desde`,
                                  e.target.value
                                )
                              }
                            />
                            <span className={styles.timeSep}>a</span>
                            <input
                              type="time"
                              className={styles.timeInput}
                              value={day.franja2.hasta}
                              onChange={(e) =>
                                update(
                                  `horarios.${d.key}.franja2.hasta`,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* BARRA STICKY MOBILE */}
        <div className={styles.stickyBar}>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={guardar}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        <div className={styles.spacer} />
      </div>

      {/* MODAL */}
      {modal.open && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
          onMouseDown={(e) => {
            // click afuera cierra
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className={styles.modalCard}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div
                className={`${styles.modalIcon} ${modal.variant === "success"
                    ? styles.modalIconSuccess
                    : styles.modalIconError
                  }`}
              >
                {modal.variant === "success" ? "✓" : "!"}
              </div>

              <div className={styles.modalTitles}>
                <div id="modal-title" className={styles.modalTitle}>
                  {modal.title}
                </div>
                <div id="modal-desc" className={styles.modalDesc}>
                  {modal.message}
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                ref={closeBtnRef}
                type="button"
                className={styles.modalPrimaryBtn}
                onClick={closeModal}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
