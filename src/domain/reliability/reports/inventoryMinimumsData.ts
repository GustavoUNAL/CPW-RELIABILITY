/** Generado por scripts/etl-inventario.mjs — no editar a mano. */
export type InventoryMinItem = {
  id: string;
  family: string;
  description: string;
  status: string;
  /** STOCK / STOK — mínimo requerido. */
  stockMin: number;
  /** EXISTENCIA — cantidad actual en inventario. */
  onHand: number;
  partNumber: string;
};

export type InventoryMinPack = {
  sourceFile: string;
  sheet: string;
  extractedAt: string;
  notes: string;
  items: InventoryMinItem[];
};

export const INVENTORY_MINIMUMS: InventoryMinPack = {
  "sourceFile": "data/mantenimiento /INVENTARIO ACTUALIZADO 2026.xlsx",
  "sheet": "REPUESTOS Y CONSUMIBLES EQIPOS",
  "extractedAt": "2026-07-24",
  "notes": "STOCK (columna D) = stock mínimo · EXISTENCIA = cantidad actual. Fuente: hoja REPUESTOS Y CONSUMIBLES.",
  "items": [
    {
      "id": "INV-0001",
      "family": "J320",
      "description": "FILTRO DE AIRE",
      "status": "BUENO",
      "stockMin": 11,
      "onHand": 11,
      "partNumber": "1023529A"
    },
    {
      "id": "INV-0002",
      "family": "J320",
      "description": "FILTRO AIRE",
      "status": "BUENO",
      "stockMin": 5,
      "onHand": 5,
      "partNumber": "464424"
    },
    {
      "id": "INV-0003",
      "family": "J420",
      "description": "FILTRO DE AIRE",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "1237578"
    },
    {
      "id": "INV-0004",
      "family": "J420",
      "description": "FILTRO ACEITE",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "245488"
    },
    {
      "id": "INV-0005",
      "family": "JINAN",
      "description": "FILTRO DE ACEITE",
      "status": "BUENO",
      "stockMin": 72,
      "onHand": 72,
      "partNumber": "12VB.18.10B"
    },
    {
      "id": "INV-0006",
      "family": "J420",
      "description": "FILTRO DE GAS ENTRADA",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "217P-5M"
    },
    {
      "id": "INV-0007",
      "family": "J420",
      "description": "FILTRO INTERNO DE AIRE CPW06",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "1227732"
    },
    {
      "id": "INV-0008",
      "family": "JINAN",
      "description": "VALVULA CULATA DE ADMISION",
      "status": "BUENO",
      "stockMin": 56,
      "onHand": 56,
      "partNumber": "12VB.03.37"
    },
    {
      "id": "INV-0009",
      "family": "JINAN",
      "description": "VALVULA CULATA DE ESCAPE",
      "status": "BUENO",
      "stockMin": 52,
      "onHand": 52,
      "partNumber": "12VB.03.22"
    },
    {
      "id": "INV-0010",
      "family": "JINAN",
      "description": "ASIENTOS CULATA ADMISION",
      "status": "BUENO",
      "stockMin": 97,
      "onHand": 97,
      "partNumber": "127.03.80.04"
    },
    {
      "id": "INV-0011",
      "family": "JINAN",
      "description": "ASIENTOS CULATA ESCAPE",
      "status": "BUENO",
      "stockMin": 104,
      "onHand": 104,
      "partNumber": "127.03.80.05"
    },
    {
      "id": "INV-0012",
      "family": "JINAN",
      "description": "CAMISAS DE PISTON",
      "status": "BUENO",
      "stockMin": 11,
      "onHand": 11,
      "partNumber": "12V.01.02C"
    },
    {
      "id": "INV-0013",
      "family": "JINAN",
      "description": "GUIA DE VALVULA CULATA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "12V-01-02C"
    },
    {
      "id": "INV-0014",
      "family": "MATERIALES",
      "description": "FILTRO GAS DENTRO DE SCRUBBER",
      "status": "BUENO",
      "stockMin": 10,
      "onHand": 10,
      "partNumber": "—"
    },
    {
      "id": "INV-0015",
      "family": "J320",
      "description": "MOTOR DE ARRANQUE",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "1201862"
    },
    {
      "id": "INV-0016",
      "family": "J320",
      "description": "MOTOR DE ARRANQUE",
      "status": "REPARADO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "1238548"
    },
    {
      "id": "INV-0017",
      "family": "JINAN",
      "description": "MOTOR DE ARRANQUE",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "12VB.46.03"
    },
    {
      "id": "INV-0018",
      "family": "J420",
      "description": "HIDROFLOW",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "102268"
    },
    {
      "id": "INV-0019",
      "family": "MATERIALES",
      "description": "VALVULA MEDENUS",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0020",
      "family": "MATERIALES",
      "description": "BATERIAS 8D",
      "status": "REGULAR",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "—"
    },
    {
      "id": "INV-0021",
      "family": "MATERIALES",
      "description": "CINTA DE SELLADOS FLUIDOS",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "—"
    },
    {
      "id": "INV-0022",
      "family": "J320",
      "description": "TERMOCUPLAS",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "550401"
    },
    {
      "id": "INV-0023",
      "family": "J420",
      "description": "TERMOCUPLAS",
      "status": "BUENO",
      "stockMin": 34,
      "onHand": 34,
      "partNumber": "550401"
    },
    {
      "id": "INV-0024",
      "family": "J320",
      "description": "BOMBA DE RECIRCULACION AGUA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "1207471"
    },
    {
      "id": "INV-0025",
      "family": "J320",
      "description": "FUENTE DE BATERIAS",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0026",
      "family": "J320",
      "description": "VALVULA MIXER",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0027",
      "family": "MATERIALES",
      "description": "BATERIAS 12V",
      "status": "BUENO",
      "stockMin": 8,
      "onHand": 8,
      "partNumber": "—"
    },
    {
      "id": "INV-0028",
      "family": "J320",
      "description": "CAMISAS DE PISTON",
      "status": "BUENO",
      "stockMin": 5,
      "onHand": 5,
      "partNumber": "448651"
    },
    {
      "id": "INV-0029",
      "family": "J320",
      "description": "VALVULA REGULADORA DN80",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0030",
      "family": "J320",
      "description": "CULATA",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "453448"
    },
    {
      "id": "INV-0031",
      "family": "MATERIALES",
      "description": "BAYPASS",
      "status": "BUENO",
      "stockMin": 5,
      "onHand": 5,
      "partNumber": "516231"
    },
    {
      "id": "INV-0032",
      "family": "J320",
      "description": "BIELAS",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "424942"
    },
    {
      "id": "INV-0033",
      "family": "J320",
      "description": "SCRAPER RING \"ANILLOS DE FUEGO\"",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "337459"
    },
    {
      "id": "INV-0034",
      "family": "J320",
      "description": "RODAMIENTO TRASERO",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0035",
      "family": "J320",
      "description": "RODAMIENTO DELANTERO",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0036",
      "family": "J420",
      "description": "JUNTAS FLEXIBLES",
      "status": "BUENO",
      "stockMin": 8,
      "onHand": 8,
      "partNumber": "249011"
    },
    {
      "id": "INV-0037",
      "family": "J320",
      "description": "VALVULA 3 VIAS LT",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "1207424"
    },
    {
      "id": "INV-0038",
      "family": "MATERIALES",
      "description": "ELECTROBOMBA DE 1HP",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0039",
      "family": "J320",
      "description": "BOMBA DE AGUA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0040",
      "family": "MATERIALES",
      "description": "VALVULA DE AGUJA 1/2",
      "status": "BUENO",
      "stockMin": 34,
      "onHand": 34,
      "partNumber": "—"
    },
    {
      "id": "INV-0041",
      "family": "MATERIALES",
      "description": "SENSORES DIGITALES MSA",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "—"
    },
    {
      "id": "INV-0042",
      "family": "MATERIALES",
      "description": "CONTROL DE NIVEL",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "—"
    },
    {
      "id": "INV-0043",
      "family": "J320",
      "description": "FILTRO ACEITE",
      "status": "BUENO",
      "stockMin": 22,
      "onHand": 22,
      "partNumber": "225125"
    },
    {
      "id": "INV-0044",
      "family": "J320",
      "description": "FILTRO DE GAS",
      "status": "BUENO",
      "stockMin": 15,
      "onHand": 15,
      "partNumber": "—"
    },
    {
      "id": "INV-0045",
      "family": "J320",
      "description": "FILTRO ACEITE PRELUBRICACION",
      "status": "BUENO",
      "stockMin": 11,
      "onHand": 11,
      "partNumber": "235027"
    },
    {
      "id": "INV-0046",
      "family": "JINAN",
      "description": "FILTRO DE GAS",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0047",
      "family": "JINAN",
      "description": "BUJIAS",
      "status": "BUENO",
      "stockMin": 15,
      "onHand": 15,
      "partNumber": "—"
    },
    {
      "id": "INV-0048",
      "family": "J320",
      "description": "BOBINA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0049",
      "family": "J320",
      "description": "CAPUCHON BUJIAS O VELAS",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0050",
      "family": "J320",
      "description": "GASKET MULTIPLE DE ESCAPE",
      "status": "BUENO",
      "stockMin": 73,
      "onHand": 73,
      "partNumber": "320983"
    },
    {
      "id": "INV-0051",
      "family": "J320",
      "description": "ORING",
      "status": "BUENO",
      "stockMin": 124,
      "onHand": 124,
      "partNumber": "1251252"
    },
    {
      "id": "INV-0052",
      "family": "J320",
      "description": "GASKET BOMBA DE ALTA DESCARGA",
      "status": "BUENO",
      "stockMin": 18,
      "onHand": 18,
      "partNumber": "505738"
    },
    {
      "id": "INV-0053",
      "family": "J320",
      "description": "GASKET FLAUTA DE AGUA A CULATA",
      "status": "BUENO",
      "stockMin": 13,
      "onHand": 13,
      "partNumber": "100875"
    },
    {
      "id": "INV-0054",
      "family": "J320",
      "description": "GASKET ADMISION MESCLA",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "100947"
    },
    {
      "id": "INV-0055",
      "family": "J320",
      "description": "GASKET TAPA VALVULAS",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "100548"
    },
    {
      "id": "INV-0056",
      "family": "J320",
      "description": "ORING MANIFOLD ADMISION",
      "status": "BUENO",
      "stockMin": 7,
      "onHand": 7,
      "partNumber": "102131"
    },
    {
      "id": "INV-0057",
      "family": "J320",
      "description": "EJE VALVULA THROTTLE",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "234272"
    },
    {
      "id": "INV-0058",
      "family": "J320",
      "description": "VARILLA DE EMPUJE",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "241958"
    },
    {
      "id": "INV-0059",
      "family": "J320",
      "description": "PERNO DE BIELA",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "379058"
    },
    {
      "id": "INV-0060",
      "family": "J320",
      "description": "BALANCIN DE ADMISION",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "242329"
    },
    {
      "id": "INV-0061",
      "family": "J320",
      "description": "BALANCIN DE ESCAPE",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "242328"
    },
    {
      "id": "INV-0062",
      "family": "MATERIALES",
      "description": "ACCESORIOS ACTUADOR",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "585704"
    },
    {
      "id": "INV-0063",
      "family": "MATERIALES",
      "description": "ACCESORIOS ACTUADOR",
      "status": "BUENO",
      "stockMin": 7,
      "onHand": 7,
      "partNumber": "585703"
    },
    {
      "id": "INV-0064",
      "family": "J320",
      "description": "CASQUETE DE BIELA JUEGO X2",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "482681"
    },
    {
      "id": "INV-0065",
      "family": "J320",
      "description": "GASKET CULATA (CYLINDER HEAD GASKET)",
      "status": "BUENO",
      "stockMin": 7,
      "onHand": 7,
      "partNumber": "448657"
    },
    {
      "id": "INV-0066",
      "family": "J320",
      "description": "TERMOSTATO",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "321540"
    },
    {
      "id": "INV-0067",
      "family": "J320",
      "description": "ENFOCADOR",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0068",
      "family": "J320",
      "description": "FILTRO NIEBLA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "9010789"
    },
    {
      "id": "INV-0069",
      "family": "J320",
      "description": "COMPENSATOR",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "105174"
    },
    {
      "id": "INV-0070",
      "family": "MATERIALES",
      "description": "ARANDELAS BUJIAS",
      "status": "BUENO",
      "stockMin": 188,
      "onHand": 188,
      "partNumber": "102981"
    },
    {
      "id": "INV-0071",
      "family": "J420",
      "description": "BUJIAS",
      "status": "BUENO",
      "stockMin": 20,
      "onHand": 20,
      "partNumber": "1254664"
    },
    {
      "id": "INV-0072",
      "family": "J420",
      "description": "COUPLING",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "334304"
    },
    {
      "id": "INV-0073",
      "family": "J420",
      "description": "PUENTES DE CULATA",
      "status": "BUENO",
      "stockMin": 8,
      "onHand": 8,
      "partNumber": "21993199"
    },
    {
      "id": "INV-0074",
      "family": "J420",
      "description": "TUERCA ESPARRAGO CULATA",
      "status": "BUENO",
      "stockMin": 7,
      "onHand": 7,
      "partNumber": "291723, 100083"
    },
    {
      "id": "INV-0075",
      "family": "J420",
      "description": "TUERCA BALANCIN",
      "status": "BUENO",
      "stockMin": 8,
      "onHand": 8,
      "partNumber": "101823"
    },
    {
      "id": "INV-0076",
      "family": "J420",
      "description": "TUERCA TORNILLO REGULADOR",
      "status": "BUENO",
      "stockMin": 12,
      "onHand": 12,
      "partNumber": "113807"
    },
    {
      "id": "INV-0077",
      "family": "J420",
      "description": "PERNO DE AJUSTE PUENTE CULATA",
      "status": "BUENO",
      "stockMin": 12,
      "onHand": 12,
      "partNumber": "281881"
    },
    {
      "id": "INV-0078",
      "family": "J420",
      "description": "TUERCA BALANCIN",
      "status": "BUENO",
      "stockMin": 12,
      "onHand": 12,
      "partNumber": "161400"
    },
    {
      "id": "INV-0079",
      "family": "J420",
      "description": "TORNILLO DE REGULACION BALANCIN",
      "status": "BUENO",
      "stockMin": 8,
      "onHand": 8,
      "partNumber": "121209"
    },
    {
      "id": "INV-0080",
      "family": "J420",
      "description": "ANILLOS DE FUEGO (CYLINDER HEAD GASKET)",
      "status": "BUENO",
      "stockMin": 10,
      "onHand": 10,
      "partNumber": "448559"
    },
    {
      "id": "INV-0081",
      "family": "J420",
      "description": "BIELA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "11020200"
    },
    {
      "id": "INV-0082",
      "family": "J420",
      "description": "RODAMIENTO DE ALTERNADOR INDIA GA-251711",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "GA-251711"
    },
    {
      "id": "INV-0083",
      "family": "J420",
      "description": "PERNO DE BIELA",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "1103091"
    },
    {
      "id": "INV-0084",
      "family": "J420",
      "description": "EMPAQUE SALIDA DE ESCAPE",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "PO1335"
    },
    {
      "id": "INV-0085",
      "family": "MATERIALES",
      "description": "MANGUERA MATALICA FLEXIBLE",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "—"
    },
    {
      "id": "INV-0086",
      "family": "J420",
      "description": "CAMISAS",
      "status": "BUENO",
      "stockMin": 5,
      "onHand": 5,
      "partNumber": "448556"
    },
    {
      "id": "INV-0087",
      "family": "J420",
      "description": "SCRAPE RING",
      "status": "BUENO",
      "stockMin": 40,
      "onHand": 40,
      "partNumber": "421782"
    },
    {
      "id": "INV-0088",
      "family": "J420",
      "description": "MOTOR DE ARRANQUE",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "1238548"
    },
    {
      "id": "INV-0089",
      "family": "J420",
      "description": "PISTON 12.5",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "1102352"
    },
    {
      "id": "INV-0090",
      "family": "J420",
      "description": "GASKET MUTIPLE DE ESCAPE",
      "status": "BUENO",
      "stockMin": 20,
      "onHand": 20,
      "partNumber": "7001950"
    },
    {
      "id": "INV-0091",
      "family": "J420",
      "description": "GASKET MULTIPLE DE ESCAPE",
      "status": "BUENO",
      "stockMin": 20,
      "onHand": 20,
      "partNumber": "306099"
    },
    {
      "id": "INV-0092",
      "family": "J420",
      "description": "O-RING REGULADOR OIL",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "456731"
    },
    {
      "id": "INV-0093",
      "family": "J420",
      "description": "GASKET RIEL TUBERIA AGUA",
      "status": "BUENO",
      "stockMin": 97,
      "onHand": 97,
      "partNumber": "290213"
    },
    {
      "id": "INV-0094",
      "family": "J420",
      "description": "O-RING CAMISAS",
      "status": "BUENO",
      "stockMin": 56,
      "onHand": 56,
      "partNumber": "348964"
    },
    {
      "id": "INV-0095",
      "family": "J420",
      "description": "GASKET MULTIPLE ESCAPE SALIDA",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "356298"
    },
    {
      "id": "INV-0096",
      "family": "J420",
      "description": "O-RING",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "319742"
    },
    {
      "id": "INV-0097",
      "family": "J420",
      "description": "O-RING CULATIN",
      "status": "BUENO",
      "stockMin": 18,
      "onHand": 18,
      "partNumber": "456732"
    },
    {
      "id": "INV-0098",
      "family": "J420",
      "description": "TRANSFORMADOR DE MEDICION",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "415442"
    },
    {
      "id": "INV-0099",
      "family": "J420",
      "description": "O-RING DE ADMISION",
      "status": "BUENO",
      "stockMin": 5,
      "onHand": 5,
      "partNumber": "456747"
    },
    {
      "id": "INV-0100",
      "family": "J420",
      "description": "EMPAQUE SALIDA DE ESCAPE",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "107744"
    },
    {
      "id": "INV-0101",
      "family": "J420",
      "description": "CULATA EQUIPO G56",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "1247730"
    },
    {
      "id": "INV-0102",
      "family": "J420",
      "description": "PISTON",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "1102352"
    },
    {
      "id": "INV-0103",
      "family": "J420",
      "description": "ENGRANAJES ARBOL DE LEVAS",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "9013876"
    },
    {
      "id": "INV-0104",
      "family": "J420",
      "description": "BIELA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "22355251"
    },
    {
      "id": "INV-0105",
      "family": "J420",
      "description": "EMPAQUE INTERCOOLER",
      "status": "BUENO",
      "stockMin": 12,
      "onHand": 12,
      "partNumber": "303923"
    },
    {
      "id": "INV-0106",
      "family": "J420",
      "description": "SWITCH DE NIVEL",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "12522080"
    },
    {
      "id": "INV-0107",
      "family": "J420",
      "description": "BALANCIN DE ADMISION",
      "status": "BUENO",
      "stockMin": 5,
      "onHand": 5,
      "partNumber": "276617"
    },
    {
      "id": "INV-0108",
      "family": "J420",
      "description": "CHAVETAS BULONPISTON",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "277937"
    },
    {
      "id": "INV-0109",
      "family": "J420",
      "description": "ANILLOS DE COMPRESION",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "372382"
    },
    {
      "id": "INV-0110",
      "family": "J420",
      "description": "ANILLOS LUBRICADOR",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "525691"
    },
    {
      "id": "INV-0111",
      "family": "J420",
      "description": "ANILLOS RASCADOR",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "574332"
    },
    {
      "id": "INV-0112",
      "family": "J420",
      "description": "ARANDELAS DE BRONCE",
      "status": "BUENO",
      "stockMin": 20,
      "onHand": 20,
      "partNumber": "100639"
    },
    {
      "id": "INV-0113",
      "family": "J420",
      "description": "ARANDELAS AXIALES CIGUEÑAL",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "344227"
    },
    {
      "id": "INV-0114",
      "family": "J420",
      "description": "BUJES DE BIELAS",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "277872"
    },
    {
      "id": "INV-0115",
      "family": "J420",
      "description": "TORNILLO AJUSTE ROCIADOR",
      "status": "BUENO",
      "stockMin": 20,
      "onHand": 20,
      "partNumber": "101363"
    },
    {
      "id": "INV-0116",
      "family": "J420",
      "description": "O-RING ROCIADOR PINONERIA DE REPARTICION",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "456748"
    },
    {
      "id": "INV-0117",
      "family": "J420",
      "description": "ROCIADOR ACEITE PIÑONERIA DE REPARTICION",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "9014144"
    },
    {
      "id": "INV-0118",
      "family": "J420",
      "description": "EMPAQUES INTERCOOLER",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "9029034"
    },
    {
      "id": "INV-0119",
      "family": "",
      "description": "MANGUERA DE ALTA PRESION 1.5MTS",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0120",
      "family": "J420",
      "description": "EMPAQUE INTERCOOLER",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "303923"
    },
    {
      "id": "INV-0121",
      "family": "J420",
      "description": "EMPAQUE INTERCOOLER",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "326970"
    },
    {
      "id": "INV-0122",
      "family": "J420",
      "description": "AMORTIGUADORES ALTERNADOR",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "326960"
    },
    {
      "id": "INV-0123",
      "family": "J420",
      "description": "EMPAQUE DE CARTER",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "352496"
    },
    {
      "id": "INV-0124",
      "family": "J420",
      "description": "EMPAQUE DE CARTER",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "352495"
    },
    {
      "id": "INV-0125",
      "family": "J420",
      "description": "EMPAQUE DE CARTER",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "352954"
    },
    {
      "id": "INV-0126",
      "family": "J420",
      "description": "EMPAQUE DE CARTER",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "352953"
    },
    {
      "id": "INV-0127",
      "family": "J420",
      "description": "O-RING SALIDA CARTER",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "302612"
    },
    {
      "id": "INV-0128",
      "family": "J420",
      "description": "O-RING TAPA FILTRO OIL",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "162817"
    },
    {
      "id": "INV-0129",
      "family": "J420",
      "description": "O-RING TUBERIA DE AGUA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "468727"
    },
    {
      "id": "INV-0130",
      "family": "J420",
      "description": "O-RING DE ADMISION",
      "status": "BUENO",
      "stockMin": 20,
      "onHand": 20,
      "partNumber": "225040"
    },
    {
      "id": "INV-0131",
      "family": "J420",
      "description": "GASKET BY-PASS",
      "status": "BUENO",
      "stockMin": 7,
      "onHand": 7,
      "partNumber": "107725"
    },
    {
      "id": "INV-0132",
      "family": "J420",
      "description": "O-RING BY PASS",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "301384"
    },
    {
      "id": "INV-0133",
      "family": "J420",
      "description": "ORING BY PASS",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "323220"
    },
    {
      "id": "INV-0134",
      "family": "J420",
      "description": "EMPAQUE DE EXOSTO",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "107744"
    },
    {
      "id": "INV-0135",
      "family": "J420",
      "description": "EMPAQUE DE EXOSTO",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "356298"
    },
    {
      "id": "INV-0136",
      "family": "J420",
      "description": "EMPAQUE DE EXOSTO",
      "status": "BUENO",
      "stockMin": 20,
      "onHand": 20,
      "partNumber": "7001950"
    },
    {
      "id": "INV-0137",
      "family": "J420",
      "description": "O-RING TUBERIA DE AGUA",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "468727"
    },
    {
      "id": "INV-0138",
      "family": "J420",
      "description": "EMPAQUE DE AGUA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "103143"
    },
    {
      "id": "INV-0139",
      "family": "J420",
      "description": "FIKTRO DE AIRE",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "1227732"
    },
    {
      "id": "INV-0140",
      "family": "J420",
      "description": "FILTRO DE AIRE",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "1227733"
    },
    {
      "id": "INV-0141",
      "family": "J420",
      "description": "GASKET FLEXIBLE BOMBA DE RECIRCULACION AGUA",
      "status": "BUENO",
      "stockMin": 11,
      "onHand": 11,
      "partNumber": "100606"
    },
    {
      "id": "INV-0142",
      "family": "J420",
      "description": "O-RING VALVULAS",
      "status": "BUENO",
      "stockMin": 60,
      "onHand": 60,
      "partNumber": "456737"
    },
    {
      "id": "INV-0143",
      "family": "J420",
      "description": "EMPAQUE ASIENTO DE TURBO",
      "status": "BUENO",
      "stockMin": 16,
      "onHand": 16,
      "partNumber": "376511"
    },
    {
      "id": "INV-0144",
      "family": "J420",
      "description": "O-RING TAPA MOTOR",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "236907"
    },
    {
      "id": "INV-0145",
      "family": "J420",
      "description": "O-RING",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "513686"
    },
    {
      "id": "INV-0146",
      "family": "J420",
      "description": "O-RING",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "513685"
    },
    {
      "id": "INV-0147",
      "family": "J420",
      "description": "BOMBA DE AGUA SISTEMA HT",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "1204119"
    },
    {
      "id": "INV-0148",
      "family": "J420",
      "description": "CASQUETE DE BIELA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "351228"
    },
    {
      "id": "INV-0149",
      "family": "MATERIALES",
      "description": "VALVULA MAGNETICA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "659643"
    },
    {
      "id": "INV-0150",
      "family": "J320",
      "description": "CASQUETE BULON BIELA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "190308"
    },
    {
      "id": "INV-0151",
      "family": "J320",
      "description": "COMPENSATOR",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "105174"
    },
    {
      "id": "INV-0152",
      "family": "JINAN",
      "description": "GUIAS PUENTES VALVULAS",
      "status": "BUENO",
      "stockMin": 30,
      "onHand": 30,
      "partNumber": "12VB.03.70.01"
    },
    {
      "id": "INV-0153",
      "family": "JINAN",
      "description": "RESORTE GRANDE CULATA",
      "status": "BUENO",
      "stockMin": 32,
      "onHand": 32,
      "partNumber": "Z12V.03.18A"
    },
    {
      "id": "INV-0154",
      "family": "JINAN",
      "description": "RESORTE PEQUEÑO CULATA",
      "status": "BUENO",
      "stockMin": 57,
      "onHand": 57,
      "partNumber": "Z12V.03.17A"
    },
    {
      "id": "INV-0155",
      "family": "JINAN",
      "description": "ASIENTO BALANCIN",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "12VB.03.10.05A"
    },
    {
      "id": "INV-0156",
      "family": "JINAN",
      "description": "SELLOS VALVULAS",
      "status": "BUENO",
      "stockMin": 66,
      "onHand": 66,
      "partNumber": "—"
    },
    {
      "id": "INV-0157",
      "family": "JINAN",
      "description": "TERMOCUPLAS",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0158",
      "family": "JINAN",
      "description": "CHAVETAS O KEEPERS DE VALVULA",
      "status": "BUENO",
      "stockMin": 80,
      "onHand": 80,
      "partNumber": "12V.03.16A"
    },
    {
      "id": "INV-0159",
      "family": "JINAN",
      "description": "SELLOS CULATA",
      "status": "BUENO",
      "stockMin": 184,
      "onHand": 184,
      "partNumber": "—"
    },
    {
      "id": "INV-0160",
      "family": "JINAN",
      "description": "PUENTE",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "12VB.03.03B"
    },
    {
      "id": "INV-0161",
      "family": "JINAN",
      "description": "SELLOS CULATA",
      "status": "BUENO",
      "stockMin": 15,
      "onHand": 15,
      "partNumber": "—"
    },
    {
      "id": "INV-0162",
      "family": "JINAN",
      "description": "GASKET JUNTA BUJIA",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "127.03.06"
    },
    {
      "id": "INV-0163",
      "family": "JINAN",
      "description": "GASKET ASIENTO BALANCIN",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "12VB.03.51"
    },
    {
      "id": "INV-0164",
      "family": "JINAN",
      "description": "GASKET TUBERIA AGUA CULATA",
      "status": "BUENO",
      "stockMin": 16,
      "onHand": 16,
      "partNumber": "12VB.24.07"
    },
    {
      "id": "INV-0165",
      "family": "JINAN",
      "description": "ANILLO BRONCE ASIENTO CULATA",
      "status": "BUENO",
      "stockMin": 16,
      "onHand": 16,
      "partNumber": "12VB.01.03"
    },
    {
      "id": "INV-0166",
      "family": "J320",
      "description": "GASKET SALIDA TURBO",
      "status": "BUENO",
      "stockMin": 14,
      "onHand": 14,
      "partNumber": "268630"
    },
    {
      "id": "INV-0167",
      "family": "J320",
      "description": "TORNILLO DE REGULACION BALANCIN",
      "status": "BUENO",
      "stockMin": 18,
      "onHand": 18,
      "partNumber": "100653"
    },
    {
      "id": "INV-0168",
      "family": "J320",
      "description": "SELLOS CULATA",
      "status": "BUENO",
      "stockMin": 124,
      "onHand": 124,
      "partNumber": "1251252"
    },
    {
      "id": "INV-0169",
      "family": "J320",
      "description": "GASKET BOMBA HT",
      "status": "BUENO",
      "stockMin": 9,
      "onHand": 9,
      "partNumber": "103143"
    },
    {
      "id": "INV-0170",
      "family": "J320",
      "description": "SELLOS CULATA",
      "status": "BUENO",
      "stockMin": 20,
      "onHand": 20,
      "partNumber": "1248243"
    },
    {
      "id": "INV-0171",
      "family": "J420",
      "description": "GASKET MULTIPLE ESCAPE SALIDA",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "356298"
    },
    {
      "id": "INV-0172",
      "family": "J420",
      "description": "ARANDELA DE BRONCE ACCESORIOS INTERCOOLER",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "100834"
    },
    {
      "id": "INV-0173",
      "family": "J420",
      "description": "GASKET MULTIPLE ESCAPE SALIDA",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "356298"
    },
    {
      "id": "INV-0174",
      "family": "J420",
      "description": "ORING TAPA MOTOR",
      "status": "BUENO",
      "stockMin": 9,
      "onHand": 9,
      "partNumber": "348964"
    },
    {
      "id": "INV-0175",
      "family": "J420",
      "description": "ORING TUBERIA REFRIGERACION",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "100017"
    },
    {
      "id": "INV-0176",
      "family": "JINAN",
      "description": "GASKET ASIENTO SLEEVE",
      "status": "BUENO",
      "stockMin": 10,
      "onHand": 10,
      "partNumber": "127.03.03"
    },
    {
      "id": "INV-0177",
      "family": "JINAN",
      "description": "TORNILLO DE REGULACION BALANCIN",
      "status": "BUENO",
      "stockMin": 65,
      "onHand": 65,
      "partNumber": "12VB.03.09B"
    },
    {
      "id": "INV-0178",
      "family": "JINAN",
      "description": "GASKET MULTIPLE ESCAPE",
      "status": "BUENO",
      "stockMin": 13,
      "onHand": 13,
      "partNumber": "Z12VB.09.04B"
    },
    {
      "id": "INV-0179",
      "family": "JINAN",
      "description": "GASKET TAPA VALVULAS",
      "status": "BUENO",
      "stockMin": 23,
      "onHand": 23,
      "partNumber": "12VB.03.20.06B"
    },
    {
      "id": "INV-0180",
      "family": "J420",
      "description": "FLEXIBLE TURBO",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "351248"
    },
    {
      "id": "INV-0181",
      "family": "J320",
      "description": "ACTUADOR",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0182",
      "family": "J320",
      "description": "FLEXIBLE SALIDA MULTIPLE ESCAPE",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "238824"
    },
    {
      "id": "INV-0183",
      "family": "J420",
      "description": "BOMA PRELUBRICACION",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "1247616"
    },
    {
      "id": "INV-0184",
      "family": "MATERIALES",
      "description": "MANGUERA 1\" BAR1262",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "—"
    },
    {
      "id": "INV-0185",
      "family": "MATERIALES",
      "description": "MANGUERA 3/4 BAR1523",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "—"
    },
    {
      "id": "INV-0186",
      "family": "J420",
      "description": "MANGUERA ACEITE",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "632865"
    },
    {
      "id": "INV-0187",
      "family": "J420",
      "description": "MANGUERA ACEITE",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "106946"
    },
    {
      "id": "INV-0188",
      "family": "J420",
      "description": "MANGUERA ACEITE",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "104233"
    },
    {
      "id": "INV-0189",
      "family": "MATERIALES",
      "description": "MANGUERAS VARIAS",
      "status": "BUENO",
      "stockMin": 5,
      "onHand": 5,
      "partNumber": "—"
    },
    {
      "id": "INV-0190",
      "family": "MATERIALES",
      "description": "MANOMETRO DE PRESION",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0191",
      "family": "MATERIALES",
      "description": "REGULADOR PRESION AGUA",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "—"
    },
    {
      "id": "INV-0192",
      "family": "MATERIALES",
      "description": "SWITCH DE NIVEL",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "1252080"
    },
    {
      "id": "INV-0193",
      "family": "MATERIALES",
      "description": "TERMOMETROS TRANSFORMADORES",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "—"
    },
    {
      "id": "INV-0194",
      "family": "MATERIALES",
      "description": "MANOMETROS DE PRESION",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "—"
    },
    {
      "id": "INV-0195",
      "family": "MATERIALES",
      "description": "CHAQUETAS",
      "status": "BUENO",
      "stockMin": 12,
      "onHand": 12,
      "partNumber": "—"
    },
    {
      "id": "INV-0196",
      "family": "JINAN",
      "description": "PICKUPS",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "—"
    },
    {
      "id": "INV-0197",
      "family": "MATERIALES",
      "description": "PICKUPS",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "—"
    },
    {
      "id": "INV-0198",
      "family": "MATERIALES",
      "description": "RESISTENCIA TERMOMETRO",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0199",
      "family": "MATERIALES",
      "description": "SENSOR DE TEMPERATURA",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0200",
      "family": "MATERIALES",
      "description": "ACOPLES DE MEDICION",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "—"
    },
    {
      "id": "INV-0201",
      "family": "JINAN",
      "description": "TRANSDUCTOR DE PRESION",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0202",
      "family": "JINAN",
      "description": "GASKET EXOSTO",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "—"
    },
    {
      "id": "INV-0203",
      "family": "JINAN",
      "description": "GASKET EXOSTO",
      "status": "BUENO",
      "stockMin": 19,
      "onHand": 19,
      "partNumber": "—"
    },
    {
      "id": "INV-0204",
      "family": "JINAN",
      "description": "SENSOR DE OXIGENO",
      "status": "BUENO",
      "stockMin": 1,
      "onHand": 1,
      "partNumber": "—"
    },
    {
      "id": "INV-0205",
      "family": "J320",
      "description": "ESPARRAGO CULATA",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "—"
    },
    {
      "id": "INV-0206",
      "family": "MATERIALES",
      "description": "ORING VARIOS",
      "status": "BUENO",
      "stockMin": 395,
      "onHand": 395,
      "partNumber": "—"
    },
    {
      "id": "INV-0207",
      "family": "JINAN",
      "description": "ORING AGUA CAMISA CILINDRO",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "12VB.01.130"
    },
    {
      "id": "INV-0208",
      "family": "J320",
      "description": "GASKET MULTIPLE ESCAPE SALIDA HACIA TURBO",
      "status": "BUENO",
      "stockMin": 8,
      "onHand": 8,
      "partNumber": "100099"
    },
    {
      "id": "INV-0209",
      "family": "JINAN",
      "description": "SELLO MECANICO BOMBA DE AGUA",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "HU21-25"
    },
    {
      "id": "INV-0210",
      "family": "JINAN",
      "description": "DIAFRAGMA MESCLADOR",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "127-3"
    },
    {
      "id": "INV-0211",
      "family": "JINAN",
      "description": "DIFRAGMA MESCLADOR",
      "status": "BUENO",
      "stockMin": 3,
      "onHand": 3,
      "partNumber": "GE29721X012"
    },
    {
      "id": "INV-0212",
      "family": "JINAN",
      "description": "ORING CAMISA",
      "status": "BUENO",
      "stockMin": 8,
      "onHand": 8,
      "partNumber": "12V.01.14"
    },
    {
      "id": "INV-0213",
      "family": "JINAN",
      "description": "ORING CAMISA",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "12VB.01.134"
    },
    {
      "id": "INV-0214",
      "family": "JINAN",
      "description": "ORING TUBOS ENFRIAMNIENTO DE ACEITE",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "Q/JC12003"
    },
    {
      "id": "INV-0215",
      "family": "JINAN",
      "description": "ORING GRANDE ENFRIADOR DE ACITE",
      "status": "BUENO",
      "stockMin": 6,
      "onHand": 6,
      "partNumber": "Q/JC12003"
    },
    {
      "id": "INV-0216",
      "family": "JINAN",
      "description": "ORING PEQUEÑO TAPAS ENFRIADOR DE ACEITE",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "127.03.08"
    },
    {
      "id": "INV-0217",
      "family": "JINAN",
      "description": "ORING ENFRIADOR DE ACITE",
      "status": "BUENO",
      "stockMin": 2,
      "onHand": 2,
      "partNumber": "127.03.08"
    },
    {
      "id": "INV-0218",
      "family": "JINAN",
      "description": "ORING CONEXIONES GALERIA ACEITE",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "12VB.20.02"
    },
    {
      "id": "INV-0219",
      "family": "JINAN",
      "description": "ORING ENFRIADOR DE ACITE",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "Q/JC12003"
    },
    {
      "id": "INV-0220",
      "family": "JINAN",
      "description": "ORING ENFRIADOR DE ACITE",
      "status": "BUENO",
      "stockMin": 4,
      "onHand": 4,
      "partNumber": "12VB.20.02"
    },
    {
      "id": "INV-0221",
      "family": "J320",
      "description": "TUERCAS TORNILLO REGULADOR BALANCIN",
      "status": "BUENO",
      "stockMin": 8,
      "onHand": 8,
      "partNumber": "101819"
    }
  ]
};
