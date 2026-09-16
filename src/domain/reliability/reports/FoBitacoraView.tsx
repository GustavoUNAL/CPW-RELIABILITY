import { useMemo, useState } from "react";
import { BookOpen, ShieldCheck, AlertTriangle, Send } from "lucide-react";
import {
  FO_REGISTRY,
  computeFoRegistryStats,
  foMonthLabel,
  type FoMonth,
  type FoPenalty,
  type FoSendStatus,
  type FoRegistryEntry,
} from "../events/foRegistry";

type PenaltyFilter = "all" | FoPenalty;
type SendFilter = "all" | FoSendStatus;
type MonthFilter = "all" | FoMonth;

function fmtHours(value: number | null): string {
  if (value == null) return "—";
  if (value === 0) return "0";
  return value.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const mi = Number(m) - 1;
  return `${d} ${months[mi] ?? m} ${y}`;
}

function penaltyBadge(penalty: FoPenalty): { label: string; className: string } {
  if (penalty === "no_penaliza") return { label: "No penaliza", className: "badge success" };
  if (penalty === "penaliza") return { label: "Sí penaliza", className: "badge danger" };
  if (penalty === "reclamar") return { label: "Reclamar a GTE", className: "badge warning" };
  return { label: "Por clasificar", className: "badge neutral" };
}

function sendBadge(status: FoSendStatus): { label: string; className: string } {
  if (status === "enviado") return { label: "Enviado", className: "badge info" };
  if (status === "listo") return { label: "Pack listo", className: "badge warning" };
  if (status === "rca") return { label: "RCA entregado", className: "badge info" };
  return { label: "Sin FO", className: "badge neutral" };
}

function classLabel(entry: FoRegistryEntry): string {
  if (entry.classification === "PF_cli") return "PF_cli";
  if (entry.classification === "PF_contr") return "PF_contr";
  if (entry.classification === "SB") return "SB";
  if (entry.classification === "externa") return "Externa";
  return "Sin FO";
}

export function FoBitacoraView() {
  const [month, setMonth] = useState<MonthFilter>("all");
  const [penalty, setPenalty] = useState<PenaltyFilter>("all");
  const [send, setSend] = useState<SendFilter>("all");

  const rows = useMemo(() => {
    return FO_REGISTRY.filter((r) => {
      if (month !== "all" && r.month !== month) return false;
      if (penalty !== "all" && r.penalty !== penalty) return false;
      if (send !== "all" && r.sendStatus !== send) return false;
      return true;
    });
  }, [month, penalty, send]);

  const stats = useMemo(() => computeFoRegistryStats(rows), [rows]);
  const allStats = useMemo(() => computeFoRegistryStats(FO_REGISTRY), []);

  return (
    <div className="ev-module exec-dashboard fo-bitacora">
      <header className="exec-header">
        <div>
          <p className="eyebrow">Bitácora FO · junio a septiembre 2026</p>
          <h2>
            <BookOpen size={22} style={{ verticalAlign: "middle", marginRight: 8 }} />
            Eventos enviados a Gran Tierra
          </h2>
          <p className="muted">
            Qué FO-GE-033 (o RCA) se entregó y cuáles no deben bajar la confiabilidad contractual de
            COPOWER. SB y PF_cli cuentan como disponibles / cliente; solo PF_contr o FO imputable al
            grupo penalizan.
          </p>
        </div>
      </header>

      <div className="exec-kpi-row">
        <article className="exec-kpi">
          <span>Enviados / RCA</span>
          <strong>{allStats.enviados}</strong>
          <small>más {allStats.listos} pack listo</small>
        </article>
        <article className="exec-kpi">
          <span>
            <ShieldCheck size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
            No penalizan
          </span>
          <strong>{allStats.noPenalizan}</strong>
          <small>PF_cli · SB · externo</small>
        </article>
        <article className="exec-kpi">
          <span>
            <AlertTriangle size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Sí penalizan
          </span>
          <strong>{allStats.penalizan}</strong>
          <small>{fmtHours(allStats.pfContrHours)} h PF_contr</small>
        </article>
        <article className="exec-kpi pending">
          <span>
            <Send size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Reclamar
          </span>
          <strong>{allStats.reclamar}</strong>
          <small>FO externo con PF_contr imputado</small>
        </article>
      </div>

      <div className="fo-bitacora-legend">
        <p>
          <strong>No baja Conf COPOWER:</strong> PF_cli, SB, responsable GTE o Externo. El stand-by
          entra al numerador de disponibilidad: Disp% = (OP + SB) / calendario.
        </p>
        <p>
          <strong>Sí baja Conf COPOWER:</strong> PF_contr &gt; 0, o FO-GE-033 con responsable
          COPOWER. Agosto no tiene FO formal; la concertación 01–31 registra 0 fallas COPOWER.
        </p>
      </div>

      <div className="fo-bitacora-filters ev-filters">
        <label className="ev-filter-group">
          <span>Mes</span>
          <select value={month} onChange={(e) => setMonth(e.target.value as MonthFilter)}>
            <option value="all">Todos</option>
            <option value="Jun">Junio</option>
            <option value="Jul">Julio</option>
            <option value="Ago">Agosto</option>
            <option value="Sep">Septiembre</option>
          </select>
        </label>
        <label className="ev-filter-group">
          <span>Penalización</span>
          <select value={penalty} onChange={(e) => setPenalty(e.target.value as PenaltyFilter)}>
            <option value="all">Todas</option>
            <option value="no_penaliza">No penalizan</option>
            <option value="penaliza">Sí penalizan</option>
            <option value="reclamar">Reclamar a GTE</option>
            <option value="por_clasificar">Por clasificar</option>
          </select>
        </label>
        <label className="ev-filter-group">
          <span>Envío</span>
          <select value={send} onChange={(e) => setSend(e.target.value as SendFilter)}>
            <option value="all">Todos</option>
            <option value="enviado">Enviado</option>
            <option value="listo">Pack listo</option>
            <option value="rca">RCA</option>
            <option value="sin_fo">Sin FO</option>
          </select>
        </label>
      </div>

      {month === "Ago" && rows.length === 0 ? (
        <p className="muted fo-bitacora-empty">
          Agosto 2026 no tiene FO-GE-033 formal. G-801 es equipo diésel de campo GTE, no pack
          COPOWER. La concertación 01–31 cierra con 0 fallas imputables.
        </p>
      ) : null}

      <div className="table-scroll fo-bitacora-table">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Equipo</th>
              <th>FO</th>
              <th>Envío</th>
              <th>Clase</th>
              <th>Conf COPOWER</th>
              <th>SB</th>
              <th>PF_cli</th>
              <th>PF_contr</th>
              <th>Qué se dijo / carpeta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pen = penaltyBadge(row.penalty);
              const env = sendBadge(row.sendStatus);
              return (
                <tr key={row.id}>
                  <td>
                    <div className="fo-bitacora-date">{fmtDate(row.date)}</div>
                    <div className="muted">{foMonthLabel(row.month)}</div>
                  </td>
                  <td>
                    <strong>{row.equipment}</strong>
                    <div className="muted">{row.title}</div>
                  </td>
                  <td>
                    <strong>{row.foLabel}</strong>
                  </td>
                  <td>
                    <span className={env.className}>{env.label}</span>
                  </td>
                  <td>
                    {classLabel(row)}
                    <div className="muted">{row.responsible}</div>
                  </td>
                  <td>
                    <span className={pen.className}>{pen.label}</span>
                  </td>
                  <td>{fmtHours(row.sbHours)}</td>
                  <td>{fmtHours(row.pfCliHours)}</td>
                  <td>{fmtHours(row.pfContrHours)}</td>
                  <td>
                    <div>{row.note}</div>
                    <div className="muted fo-bitacora-folder">{row.folder}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="muted fo-bitacora-foot">
        {stats.total} evento{stats.total === 1 ? "" : "s"} en esta vista · {fmtHours(stats.pfContrHours)} h
        PF_contr · {fmtHours(stats.pfCliHours)} h PF_cli. Fuente:{" "}
        <code>src/domain/reliability/events/foRegistry.ts</code> + packs en{" "}
        <code>data/{"{Mes}"}/fallas/{"{DD}"}/</code>.
      </p>
    </div>
  );
}
