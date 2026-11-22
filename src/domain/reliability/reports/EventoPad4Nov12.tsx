const EVIDENCE = "/fallas/acordionero-2026-11-12";

const UNITS = [
  {
    id: "G-807",
    time: "16:58:58",
    kw: "1.517",
    hz: "60,00",
    motor: "Shutdown Detonación",
    note: "Primera. Seguía en 60 Hz y a plena carga.",
  },
  {
    id: "G-803",
    time: "16:58:59",
    kw: "1.407",
    hz: "58,24",
    motor: "Shutdown Detonación",
    note: "El bus ya empezaba a caer.",
  },
  {
    id: "G-805",
    time: "16:58:59",
    kw: "1.625",
    hz: "58,18",
    motor: "Detonación y HT 95 °C",
    note: "También dispara por temperatura de HT a la salida.",
  },
  {
    id: "G-806",
    time: "16:58:59",
    kw: "1.518",
    hz: "59,05",
    motor: "Detonación y HT 95 °C",
    note: "Misma orden, con shutdown de HT a la salida.",
  },
  {
    id: "G-801",
    time: "16:59:00",
    kw: "1.583",
    hz: "49,28",
    motor: "Shutdown Detonación",
    note: "Cierra la cascada. El bus ya iba en 49 Hz.",
  },
  {
    id: "J320",
    time: "17:00:06",
    kw: "1.520",
    hz: "46,53",
    motor: "Sigue al bus",
    note: "Un minuto después, con falla de red.",
  },
] as const;

const STEPS = [
  ["10:59", "Se pierde el nodo CAN 1. Las Guascor siguen entre 1,0 y 1,2 MW, a 60 Hz."],
  ["16:58:58", "G-807 recibe 3000 Shd Comun IE650 en 1.517 kW y 60,00 Hz, y abre el interruptor."],
  ["16:59:00", "G-803, G-805, G-806 y G-801 registran la misma alarma. A las 16:59:27 están en RPM cero."],
  ["17:00:06", "El J320 sale con la misma alarma. El bus va en 46,5 Hz y el controlador anota MAINS FAILURE."],
  ["17:19", "G-801 vuelve a barra, después de dos aperturas por potencia inversa."],
  ["17:55", "Los cinco Guascor están en línea. G-803 y G-807 fallaron el primer arranque, a las 17:25."],
  ["19:19", "El J320 sincroniza, tras reinicio del controlador a las 18:44 y tres fallas de sincronismo."],
  ["21:11", "El J320 sale por comando remoto, en 863 kW."],
] as const;

const BACK = [
  ["G-801", "20 min", "17:19", "Dos intentos se abren por potencia inversa (−108 kW y −104 kW)."],
  ["G-803", "32 min", "17:31", "El primer arranque falla a las 17:25 (alarma 4570)."],
  ["G-805", "34 min", "17:33", "Un arranque de las 17:04 se detiene por comando remoto a las 17:07."],
  ["G-806", "47 min", "17:46", "Arranque remoto a las 17:41 y cierre a las 17:46."],
  ["G-807", "56 min", "17:55", "Falla el arranque de las 17:25. Queda en barra a las 17:55."],
  ["J320", "139 min", "19:19", "Reinicio del controlador y tres fallas de sincronismo."],
] as const;

const SHOTS = [
  {
    src: `${EVIDENCE}/tendencia-g801.png`,
    alt: "Tendencia de G-801 el 12 de noviembre: la potencia cae en vertical y la velocidad baja desde 1.800 rpm.",
    title: "G-801 · tendencia",
    text: "El corte está sobre las 16:59. La potencia se va a cero y la velocidad decae desde 1.800 rpm.",
  },
  {
    src: `${EVIDENCE}/tendencia-j320.png`,
    alt: "Tendencia del J320: corte de potencia y velocidad bajando después de la salida del bus.",
    title: "J320 · tendencia",
    text: "El mismo corte, un minuto más tarde, con el bus ya fuera de 60 Hz.",
  },
  {
    src: `${EVIDENCE}/alarmas-g801.png`,
    alt: "Pantalla de alarmas de G-801 con Shutdown Detonación y avisos de temperatura de aceite y knocking.",
    title: "G-801 · motor",
    text: "Shutdown Detonación, con aceite cerca de 85 °C, presión baja y knocking.",
  },
  {
    src: `${EVIDENCE}/alarmas-g806.png`,
    alt: "Pantalla de alarmas de G-806 con Shutdown Detonación y shutdown por temperatura de HT a la salida.",
    title: "G-806 · motor",
    text: "Shutdown Detonación y temperatura de HT a la salida en 95,25 °C.",
  },
] as const;

export function EventoPad4Nov12() {
  return (
    <article className="ev1211">
      <header className="ev1211-head">
        <p className="ev1211-kicker">Pad 4 · Acordionero · 12 de noviembre de 2026</p>
        <h2>Parada común a las 16:58</h2>
        <p>
          Las seis máquinas recibieron la misma orden por el canal IE650. Los Guascor ya venían en
          detonación y con temperatura alta. El J320 se fue con el bus.
        </p>
      </header>

      <dl className="ev1211-facts">
        <div>
          <dt>Potencia en el corte</dt>
          <dd>9,2 MW</dd>
        </div>
        <div>
          <dt>Máquinas</dt>
          <dd>6 de 6</dd>
        </div>
        <div>
          <dt>Ventana</dt>
          <dd>68 s</dd>
        </div>
        <div>
          <dt>Alarma</dt>
          <dd>3000 IE650</dd>
        </div>
      </dl>

      <section>
        <h3>Registro del disparo</h3>
        <div className="ev1211-scroll">
          <table className="ev1211-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Unidad</th>
                <th>kW</th>
                <th>Hz</th>
                <th>Pantalla de motor</th>
                <th>Lectura</th>
              </tr>
            </thead>
            <tbody>
              {UNITS.map((u) => (
                <tr key={u.id}>
                  <td>{u.time}</td>
                  <td>{u.id}</td>
                  <td className="num">{u.kw}</td>
                  <td className="num">{u.hz}</td>
                  <td>{u.motor}</td>
                  <td>{u.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ev1211-split">
        <div>
          <h3>Motor · Guascor</h3>
          <p>
            Las cinco pantallas nombran la parada Shutdown Detonación. En la hora previa hay knocking,
            derate, aceite cerca de 85 °C, presión de aceite entre 3,0 y 3,7 bar y HT de salida en 90 °C.
            G-805 y G-806 llegan al shutdown de HT en 95 °C.
          </p>
          <p className="ev1211-note">
            Esas pantallas no comparten el reloj del DEIF. La hora del parque es 16:58:58.
          </p>
        </div>
        <div>
          <h3>Red CAN</h3>
          <p>
            A las 10:59 falta el nodo 1 y las máquinas siguen entre 1,0 y 1,2 MW. A las 17:00:52 falta el
            nodo 10, ya con los motores en cero. El nodo 9 falta otra vez a las 18:13, con los Guascor
            entre 758 y 924 kW.
          </p>
          <p className="ev1211-note">
            La pérdida de un nodo queda como alarma. La apertura del interruptor queda como shutdown común.
          </p>
        </div>
      </section>

      <section>
        <h3>Secuencia</h3>
        <ol className="ev1211-steps">
          {STEPS.map(([time, text]) => (
            <li key={time}>
              <time>{time}</time>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3>Retorno a barra</h3>
        <p className="ev1211-note">Minutos desde las 16:59 hasta el cierre del interruptor.</p>
        <div className="ev1211-scroll">
          <table className="ev1211-table ev1211-table--back">
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Tiempo</th>
                <th>En barra</th>
                <th>Qué pasó en el arranque</th>
              </tr>
            </thead>
            <tbody>
              {BACK.map(([id, mins, back, detail]) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td className="num">{mins}</td>
                  <td className="num">{back}</td>
                  <td>{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>Evidencia</h3>
        <div className="ev1211-shots">
          {SHOTS.map((shot) => (
            <figure key={shot.src}>
              <img src={shot.src} alt={shot.alt} />
              <figcaption>
                <strong>{shot.title}</strong>
                {shot.text}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <p className="ev1211-source">
        Fuente: logs DEIF de G-801, G-803, G-805, G-806, G-807 y J320. El archivo de alarmas del J320
        está rotulado J230-1 y comparte los sellos de tiempo del log de eventos. La frecuencia del DEIF
        está en centésimas de hertz: 6000 equivale a 60,00 Hz.
      </p>
    </article>
  );
}
