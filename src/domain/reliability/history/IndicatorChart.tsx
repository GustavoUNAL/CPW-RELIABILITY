import type { ReactNode } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type IndicatorPoint = {
  mes: string;
  valor: number | null;
};

export function IndicatorChart({
  data,
  goal,
}: {
  data: IndicatorPoint[];
  goal?: number;
}) {
  return (
    <div className="indicator-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
          <YAxis
            domain={["dataMin - 2", 100]}
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            tickFormatter={(value) => String(Math.round(Number(value)))}
            width={44}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [
              value == null || Number.isNaN(Number(value))
                ? "—"
                : `${Number(value).toFixed(2).replace(".", ",")} %`,
              "Disponibilidad",
            ]}
          />
          {goal != null ? (
            <ReferenceLine y={goal} stroke="#94a3b8" strokeDasharray="4 4" />
          ) : null}
          <Line
            type="monotone"
            dataKey="valor"
            stroke="#409eff"
            strokeWidth={2}
            dot={{ r: 3, fill: "#409eff" }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NovemberChart({
  data,
}: {
  data: { nombre: string; valor: number }[];
}) {
  const max = Math.max(1, ...data.map((item) => item.valor));
  return (
    <div className="nov-bars" role="img" aria-label="Registros de noviembre">
      {data.map((item) => (
        <div key={item.nombre} className="nov-bar">
          <span className="nov-bar-value">{item.valor}</span>
          <span className="nov-bar-track">
            <span style={{ height: item.valor === 0 ? "0%" : `${(item.valor / max) * 100}%` }} />
          </span>
          <span className="nov-bar-name">{item.nombre}</span>
        </div>
      ))}
    </div>
  );
}

export function ExplainDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="modal-card section-explain" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="hist-link" onClick={onClose}>
            Cerrar
          </button>
        </header>
        <div className="section-explain-body">{children}</div>
      </div>
    </div>
  );
}
