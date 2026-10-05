import * as XLSX from 'xlsx';
import { BodyCompositionRecord, Quarter } from '../types';

/**
 * Extracts Google Spreadsheet ID from a URL
 */
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match && match[1] ? match[1] : null;
}

/**
 * Normalizes and converts a Google Sheets URL into a direct CSV export endpoint
 */
export function convertGoogleSheetsUrlToCsvUrl(inputUrl: string, sheetNameOrGid?: string): string {
  const trimmed = inputUrl.trim();

  // If already an Apps Script endpoint or direct CSV link
  if (trimmed.includes('script.google.com') || (trimmed.endsWith('.csv') && !sheetNameOrGid)) {
    return trimmed;
  }

  const spreadsheetId = extractSpreadsheetId(trimmed);
  if (spreadsheetId) {
    if (sheetNameOrGid) {
      // If it's a numeric gid
      if (/^\d+$/.test(sheetNameOrGid)) {
        return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${sheetNameOrGid}`;
      }
      // Use GViz query endpoint to fetch specific sheet tab by name
      return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetNameOrGid)}`;
    }

    // Default gid if present in URL
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    const gidParam = gidMatch && gidMatch[1] ? `&gid=${gidMatch[1]}` : '&gid=0';
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv${gidParam}`;
  }

  return trimmed;
}

/**
 * Detects Quarter ('Q1' | 'Q2' | 'Q3' | 'Q4') from a tab name, filename, or text
 */
export function detectQuarterFromName(name: string): Quarter | undefined {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();

  // Priority 1: Explicit Quarter notations (Q4, Q3, Q2, Q1, ไตรมาส 1-4, Quarter 1-4)
  // Evaluated in Q4 -> Q3 -> Q2 -> Q1 order, and BEFORE generic visit counters like "ครั้งที่ 1"
  // so that "ไตรมาส 4 ครั้งที่ 1" or "Q4 ครั้ง 1" is correctly recognized as Q4!
  if (
    n.includes('ไตรมาส 4') || n.includes('ไตรมาส4') ||
    n.includes('quarter 4') || n.includes('quarter4') ||
    n.includes('q4') ||
    n.includes('งวดที่ 4') || n.includes('งวดที่4') || n.includes('งวด 4') || n.includes('งวด4') ||
    n.includes('แผ่นงาน 4') || n.includes('แผ่นงาน4') ||
    n.includes('sheet 4') || n.includes('sheet4') ||
    n.includes('phase 4') || n.includes('phase4') ||
    n.includes('part 4') || n.includes('part4') ||
    n.includes('กรกฎาคม') || n.includes('ก.ค') || n.includes('สิงหาคม') || n.includes('ส.ค') || n.includes('กันยายน') || n.includes('ก.ย') ||
    n.includes('jul') || n.includes('aug') || n.includes('sep') ||
    n.endsWith('_4') || n.endsWith('-4') || n === '4' || n === 'iv'
  ) {
    return 'Q4';
  }

  if (
    n.includes('ไตรมาส 3') || n.includes('ไตรมาส3') ||
    n.includes('quarter 3') || n.includes('quarter3') ||
    n.includes('q3') ||
    n.includes('งวดที่ 3') || n.includes('งวดที่3') || n.includes('งวด 3') || n.includes('งวด3') ||
    n.includes('แผ่นงาน 3') || n.includes('แผ่นงาน3') ||
    n.includes('sheet 3') || n.includes('sheet3') ||
    n.includes('phase 3') || n.includes('phase3') ||
    n.includes('part 3') || n.includes('part3') ||
    n.includes('เมษายน') || n.includes('เม.ย') || n.includes('พฤษภาคม') || n.includes('พ.ค') || n.includes('มิถุนายน') || n.includes('มิ.ย') ||
    n.includes('apr') || n.includes('may') || n.includes('jun') ||
    n.endsWith('_3') || n.endsWith('-3') || n === '3' || n === 'iii'
  ) {
    return 'Q3';
  }

  if (
    n.includes('ไตรมาส 2') || n.includes('ไตรมาส2') ||
    n.includes('quarter 2') || n.includes('quarter2') ||
    n.includes('q2') ||
    n.includes('งวดที่ 2') || n.includes('งวดที่2') || n.includes('งวด 2') || n.includes('งวด2') ||
    n.includes('แผ่นงาน 2') || n.includes('แผ่นงาน2') ||
    n.includes('sheet 2') || n.includes('sheet2') ||
    n.includes('phase 2') || n.includes('phase2') ||
    n.includes('part 2') || n.includes('part2') ||
    n.includes('มกราคม') || n.includes('ม.ค') || n.includes('กุมภาพันธ์') || n.includes('ก.พ') || n.includes('มีนาคม') || n.includes('มี.ค') ||
    n.includes('jan') || n.includes('feb') || n.includes('mar') ||
    n.endsWith('_2') || n.endsWith('-2') || n === '2' || n === 'ii'
  ) {
    return 'Q2';
  }

  if (
    n.includes('ไตรมาส 1') || n.includes('ไตรมาส1') ||
    n.includes('quarter 1') || n.includes('quarter1') ||
    n.includes('q1') ||
    n.includes('งวดที่ 1') || n.includes('งวดที่1') || n.includes('งวด 1') || n.includes('งวด1') ||
    n.includes('แผ่นงาน 1') || n.includes('แผ่นงาน1') ||
    n.includes('sheet 1') || n.includes('sheet1') ||
    n.includes('phase 1') || n.includes('phase1') ||
    n.includes('part 1') || n.includes('part1') ||
    n.includes('ตุลาคม') || n.includes('ต.ค') || n.includes('พฤศจิกายน') || n.includes('พ.ย') || n.includes('ธันวาคม') || n.includes('ธ.ค') ||
    n.includes('oct') || n.includes('nov') || n.includes('dec') ||
    n.endsWith('_1') || n.endsWith('-1') || n === '1' || n === 'i'
  ) {
    return 'Q1';
  }

  // Priority 2: Only fallback to explicit round/phase notation if NO quarter is found
  if (
    n.includes('รอบที่ 4') || n.includes('รอบที่4') ||
    n.includes('round 4') || n.includes('round4')
  ) {
    return 'Q4';
  }

  if (
    n.includes('รอบที่ 3') || n.includes('รอบที่3') ||
    n.includes('round 3') || n.includes('round3')
  ) {
    return 'Q3';
  }

  if (
    n.includes('รอบที่ 2') || n.includes('รอบที่2') ||
    n.includes('round 2') || n.includes('round2')
  ) {
    return 'Q2';
  }

  if (
    n.includes('รอบที่ 1') || n.includes('รอบที่1') ||
    n.includes('round 1') || n.includes('round1')
  ) {
    return 'Q1';
  }

  return undefined;
}

/**
 * Robust RFC-4180 CSV / TSV row tokenizer supporting multiline cells and escaped quotes
 */
/**
 * Robust RFC-4180 CSV / TSV row tokenizer that is immune to unclosed quotes (e.g. waist inches 32").
 * Preserves all rows and never swallows subsequent lines.
 */
function parseCsvRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);

  let multilineCell = '';
  let inMultiline = false;
  let partialRow: string[] = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    if (!line && !inMultiline) continue;

    const cells: string[] = [];
    let token = inMultiline ? multilineCell : '';
    let inQuotes = inMultiline;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (!inQuotes && token.trim().length === 0) {
          inQuotes = true;
        } else if (inQuotes) {
          if (nextChar === '"') {
            token += '"';
            i++;
          } else if (nextChar === delimiter || i === line.length - 1) {
            inQuotes = false;
          } else {
            token += '"';
          }
        } else {
          token += '"';
        }
      } else if (char === delimiter && !inQuotes) {
        cells.push(token.trim());
        token = '';
      } else {
        token += char;
      }
    }

    if (inQuotes) {
      // If line already has multiple columns, it was likely a stray quote (e.g. 32" inch sign)
      // Close quote to prevent consuming subsequent lines
      if (cells.length >= 2) {
        cells.push(token.trim());
        inQuotes = false;
        inMultiline = false;
        multilineCell = '';
        rows.push(cells);
      } else {
        inMultiline = true;
        multilineCell = token + '\n';
        if (cells.length > 0 && partialRow.length === 0) {
          partialRow = cells;
        }
      }
    } else {
      inMultiline = false;
      multilineCell = '';
      cells.push(token.trim());
      if (partialRow.length > 0) {
        rows.push([...partialRow, ...cells]);
        partialRow = [];
      } else if (cells.some((c) => c.length > 0)) {
        rows.push(cells);
      }
    }
  }

  return rows;
}

/**
 * Detect delimiter by counting frequency in lines outside quotes
 */
function detectDelimiter(text: string): string {
  const sample = text.slice(0, 4000);
  let commas = 0;
  let semicolons = 0;
  let tabs = 0;
  let pipes = 0;
  let inQuotes = false;

  for (let i = 0; i < sample.length; i++) {
    const char = sample[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes) {
      if (char === ',') commas++;
      else if (char === ';') semicolons++;
      else if (char === '\t') tabs++;
      else if (char === '|') pipes++;
    }
  }

  if (tabs > commas && tabs > semicolons) return '\t';
  if (semicolons > commas) return ';';
  if (pipes > commas && pipes > semicolons) return '|';
  return ',';
}

/**
 * Smartly parse CSV / TSV text containing Health & Wellness body composition records.
 */
export function parseHealthRecordsCsv(csvText: string, fallbackQuarter?: Quarter): BodyCompositionRecord[] {
  if (!csvText || !csvText.trim()) return [];

  // Strip BOM (Byte Order Mark) and zero-width spaces
  const cleanCsvText = csvText.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '');

  const delimiter = detectDelimiter(cleanCsvText);
  const rawRows = parseCsvRows(cleanCsvText, delimiter);

  return parseHealthRecordsFromRows(rawRows, fallbackQuarter);
}

/**
 * Core Health & Wellness Body Composition record parser that works directly with 2D row arrays.
 * Handles Thai & English headers, multiple delimiters, non-row-0 headers, and preserves all rows.
 */
export function parseHealthRecordsFromRows(
  rawRows: (string | number | undefined)[][],
  fallbackQuarter?: Quarter
): BodyCompositionRecord[] {
  if (!rawRows || rawRows.length === 0) return [];

  // Known header aliases for scoring and column matching
  const knownHeaderKeywords = [
    'person', 'id', 'รหัส', 'pid', 'no', 'ลำดับ', 'ชื่อ', 'name',
    'height', 'ส่วนสูง', 'ht', 'cm', 'ความสูง', 'สส',
    'weight', 'น้ำหนัก', 'wt', 'kg', 'นน', 'bw',
    'muscle', 'กล้ามเนื้อ', 'smm', 'slm',
    'bmi', 'ดัชนี',
    'fat', 'ไขมัน', 'pbf', 'fm',
    'visceral', 'ช่องท้อง', 'vfl', 'vat',
    'quarter', 'ไตรมาส', 'รอบ', 'งวด', 'ครั้ง', 'วันที่', 'date',
    'department', 'แผนก', 'ฝ่าย', 'หน่วยงาน',
    'gender', 'เพศ', 'age', 'อายุ',
  ];

  // Scan first 15 rows to find the actual table header (in case of title/metadata rows)
  let headerRowIndex = 0;
  let maxKeywordScore = -1;

  const maxScanRows = Math.min(15, rawRows.length);
  for (let r = 0; r < maxScanRows; r++) {
    const row = rawRows[r] || [];
    const rowStr = row.map((cell) => String(cell || '').toLowerCase().replace(/[\s_#%.-]/g, '')).join(' ');
    let score = 0;
    for (const kw of knownHeaderKeywords) {
      if (rowStr.includes(kw)) {
        score++;
      }
    }
    if (score > maxKeywordScore) {
      maxKeywordScore = score;
      headerRowIndex = r;
    }
  }

  if (maxKeywordScore <= 0) {
    headerRowIndex = 0;
  }

  // Create sanitized header cells, and optionally merge with row above/below if multi-row headers exist
  const currentHeaderRow = rawRows[headerRowIndex] || [];
  const prevHeaderRow = headerRowIndex > 0 ? rawRows[headerRowIndex - 1] : [];
  const nextHeaderRow = headerRowIndex + 1 < rawRows.length ? rawRows[headerRowIndex + 1] : [];

  const headerCells = currentHeaderRow.map((h, colIdx) => {
    const base = String(h || '').toLowerCase().replace(/[\s_#%.\-–—/()]/g, '').trim();
    const prevCell = String(prevHeaderRow[colIdx] || '').toLowerCase().replace(/[\s_#%.\-–—/()]/g, '').trim();
    const nextCell = String(nextHeaderRow[colIdx] || '').toLowerCase().replace(/[\s_#%.\-–—/()]/g, '').trim();
    return {
      base,
      combinedWithPrev: prevCell ? `${prevCell}_${base}` : base,
      combinedWithNext: nextCell ? `${base}_${nextCell}` : base,
    };
  });

  // Helper to find column index with strict priority groups
  const findIndexByPriority = (...priorityGroups: { exact?: string[]; contains?: string[] }[]) => {
    for (const group of priorityGroups) {
      if (group.exact) {
        for (const alias of group.exact) {
          const idx = headerCells.findIndex(
            (h) => h.base === alias || h.combinedWithPrev === alias || h.combinedWithNext === alias
          );
          if (idx !== -1) return idx;
        }
      }
      if (group.contains) {
        for (const alias of group.contains) {
          const idx = headerCells.findIndex(
            (h) =>
              h.base.includes(alias) ||
              h.combinedWithPrev.includes(alias) ||
              h.combinedWithNext.includes(alias)
          );
          if (idx !== -1) return idx;
        }
      }
    }
    return -1;
  };

  const idxPerson = findIndexByPriority(
    // 1. High-priority explicit Person/Employee IDs
    {
      exact: [
        'personid', 'person_id', 'รหัสพนักงาน', 'รหัสบุคลากร', 'รหัสเจ้าหน้าที่', 'รหัสจนท',
        'empid', 'emp_id', 'employeeid', 'userid', 'user_id', 'pid', 'hn', 'vn', 'code',
        'เลขประจำตัว', 'เลขประจำตัวพนักงาน', 'staffid', 'staff_id', 'empno', 'emp_no'
      ],
      contains: ['personid', 'รหัสพนักงาน', 'รหัสบุคลากร', 'empid', 'employee_id', 'employeeid', 'เลขประจำตัว', 'staffid'],
    },
    // 2. Medium-priority general ID / รหัส
    {
      exact: ['รหัส', 'id', 'pid', 'code', 'memberid'],
      contains: ['รหัส', 'id'],
    },
    // 3. Name columns (if ID is not present)
    {
      exact: [
        'ชื่อ-สกุล', 'ชื่อสกุล', 'ชื่อ-นามสกุล', 'ชื่อนามสกุล', 'ชื่อ', 'name', 'fullname',
        'fullname_th', 'ชื่อจริง', 'ผู้รับการตรวจ', 'รายชื่อ', 'employee_name', 'staffname'
      ],
      contains: ['ชื่อสกุล', 'ชื่อนามสกุล', 'ชื่อพนักงาน', 'ชื่อบุคลากร', 'fullname', 'รายชื่อ', 'ชื่อ'],
    },
    // 4. Low-priority sequence numbers (ลำดับ / no)
    {
      exact: ['ลำดับ', 'ลำดับที่', 'ที่', 'no', 'no.', 'item'],
      contains: ['ลำดับ'],
    }
  );

  const idxQuarter = findIndexByPriority(
    {
      exact: [
        'quarter', 'ไตรมาส', 'ไตรมาสที่', 'รอบไตรมาส', 'งวดไตรมาส', 'q', 'quarter_no'
      ],
      contains: ['ไตรมาส', 'quarter'],
    }
  );

  const idxHeight = findIndexByPriority(
    {
      exact: ['height', 'ht', 'cm', 'h', 'ส่วนสูง', 'ความสูง', 'สส', 'ส่วนสูงซม', 'ความสูงซม', 'สสซม', 'heightcm'],
      contains: ['ส่วนสูง', 'ความสูง', 'height', 'สสซม', 'สส'],
    }
  );

  const idxWeight = findIndexByPriority(
    {
      exact: ['weight', 'wt', 'kg', 'bw', 'w', 'น้ำหนัก', 'นน', 'น้ำหนักกก', 'นนกก', 'น้ำหนักตัว', 'weightkg', 'bodyweight'],
      contains: ['น้ำหนัก', 'weight', 'bodyweight', 'นนกก', 'นน'],
    }
  );

  const idxMuscle = findIndexByPriority(
    {
      exact: ['musclemass', 'muscle', 'smm', 'slm', 'มวลกล้ามเนื้อ', 'กล้ามเนื้อ', 'มวลกล้ามเนื้อลาย', 'มวลกล้ามเนื้อกก', 'smmkg', 'กล้ามเนื้อกก'],
      contains: ['มวลกล้ามเนื้อ', 'กล้ามเนื้อ', 'musclemass', 'muscle', 'skeletal', 'smm', 'slm'],
    }
  );

  const idxBmi = findIndexByPriority(
    {
      exact: ['bmi', 'ดัชนีมวลกาย', 'ค่าbmi', 'bmikgm2'],
      contains: ['ดัชนีมวลกาย', 'bmi'],
    }
  );

  const idxFatPct = findIndexByPriority(
    {
      exact: [
        'bodyfatpercentage', 'bodyfat', 'fatpercentage', 'fatpct', 'pbf', 'fat',
        'เปอร์เซ็นต์ไขมัน', 'เปอร์เซ็นไขมัน', 'เปอร์เซนต์ไขมัน', 'ไขมัน', 'ร้อยละไขมัน',
        'ไขมันร่างกาย', 'ไขมันร้อยละ', 'ไขมันในร่างกาย', 'pbfpct', 'pbf%'
      ],
      contains: [
        'bodyfat', 'fatpercentage', 'fatpct', 'เปอร์เซ็นต์ไขมัน', 'เปอร์เซ็นไขมัน', 'เปอร์เซนต์ไขมัน',
        'ร้อยละไขมัน', 'ไขมันร่างกาย', 'ไขมันในร่างกาย', 'pbf'
      ],
    }
  );

  const idxFatMass = findIndexByPriority(
    {
      exact: ['fatmass', 'fm', 'มวลไขมัน', 'ไขมันกก', 'มวลไขมันกก', 'fmkg', 'fatmasskg'],
      contains: ['fatmass', 'มวลไขมัน', 'fmkg'],
    }
  );

  const idxVisceral = findIndexByPriority(
    {
      exact: [
        'visceralfat', 'visceral', 'vfl', 'vat', 'ไขมันช่องท้อง', 'ช่องท้อง',
        'ระดับไขมันช่องท้อง', 'ระดับช่องท้อง', 'ไขมันในช่องท้อง', 'ระดับไขมันในช่องท้อง', 'vfllevel'
      ],
      contains: ['visceral', 'ช่องท้อง', 'vfl', 'vat'],
    }
  );

  const idxDept = findIndexByPriority(
    {
      exact: ['department', 'dept', 'แผนก', 'ฝ่าย', 'สำนัก', 'กอง', 'หน่วยงาน', 'สังกัด', 'กลุ่มงาน', 'สาขา', 'งาน'],
      contains: ['department', 'แผนก', 'ฝ่าย', 'หน่วยงาน', 'สังกัด', 'กลุ่มงาน'],
    }
  );

  const idxGender = findIndexByPriority(
    {
      exact: ['gender', 'sex', 'เพศ'],
      contains: ['gender', 'เพศ', 'sex'],
    }
  );

  const idxAge = findIndexByPriority(
    {
      exact: ['age', 'อายุ'],
      contains: ['age', 'อายุ'],
    }
  );

  // Robust numeric parser handling European commas, units, signs, and note suffixes
  const parseNum = (val: string | number | undefined): number | null => {
    if (val === undefined || val === null) return null;
    if (typeof val === 'number') return isNaN(val) ? null : val;
    let str = String(val).trim();
    if (
      !str ||
      str === '-' ||
      str === '--' ||
      str === '#N/A' ||
      str === 'null' ||
      str === 'undefined' ||
      str === '*' ||
      str === 'None' ||
      str === 'ไม่มี' ||
      str === 'ไม่ระบุ' ||
      str === 'N/A'
    ) {
      return null;
    }

    let clean = str.replace(/["'%\s\u00A0\u200B-\u200D]/g, '').trim();
    clean = clean.replace(/(kg|กก|cm|ซม|lv|level|กก\.|ซม\.)/gi, '');

    // Comma as decimal separator: "58,8"
    if (/^[+-]?\d+,\d+$/.test(clean)) {
      clean = clean.replace(',', '.');
    } else {
      // Thousands separator: "1,200.5" -> "1200.5"
      clean = clean.replace(/,/g, '');
    }

    let n = parseFloat(clean);
    if (!isNaN(n)) return n;

    // Fallback: extract the first valid floating number (e.g. "> 10.5", "(ปกติ) 24.5", "Lv. 12")
    const match = clean.match(/[+-]?\d+(?:\.\d+)?/);
    if (match) {
      n = parseFloat(match[0]);
      return isNaN(n) ? null : n;
    }
    return null;
  };

  const records: BodyCompositionRecord[] = [];

  for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
    const parts = rawRows[i];
    if (!parts || parts.length === 0) continue;

    // Person ID resolution & normalization
    let rawPersonId = idxPerson !== -1 ? parts[idxPerson] : '';
    if (!rawPersonId) {
      // Find the first non-empty text cell
      for (let c = 0; c < parts.length; c++) {
        const val = String(parts[c] || '').trim();
        if (val && !['#n/a', '-', 'null', 'undefined'].includes(val.toLowerCase())) {
          rawPersonId = val;
          break;
        }
      }
      if (!rawPersonId) {
        rawPersonId = parts[0];
      }
    }

    let personId = String(rawPersonId || '').trim();
    personId = personId.replace(/^["']|["']$/g, '').trim().replace(/\.0+$/, '');

    // Check if summary row
    const pLower = personId.toLowerCase();
    if (
      pLower === 'total' ||
      pLower === 'average' ||
      pLower === 'mean' ||
      pLower === 'รวม' ||
      pLower === 'เฉลี่ย' ||
      pLower === 'ผลรวม'
    ) {
      continue;
    }

    // Quarter extraction: If fallbackQuarter is already provided (e.g. sheet Q4, ไตรมาส 4),
    // the sheet (tab) is the authoritative source for all its rows.
    // It must NEVER be overridden by visit-counter columns such as 'ครั้งที่ 1' or '1'!
    let quarter: Quarter = fallbackQuarter || 'Q4';

    // Only attempt row-level quarter detection if sheet-level quarter was NOT provided
    if (!fallbackQuarter && idxQuarter !== -1 && parts[idxQuarter]) {
      const qRaw = String(parts[idxQuarter]).trim();
      const detected = detectQuarterFromName(qRaw);
      if (detected) {
        quarter = detected;
      }
    }

    const height = idxHeight !== -1 ? parseNum(parts[idxHeight]) : 160;
    const weight = idxWeight !== -1 ? parseNum(parts[idxWeight]) : null;
    const muscle = idxMuscle !== -1 ? parseNum(parts[idxMuscle]) : null;
    let bmi = idxBmi !== -1 ? parseNum(parts[idxBmi]) : null;
    const fatPct = idxFatPct !== -1 ? parseNum(parts[idxFatPct]) : null;
    let fatMass = idxFatMass !== -1 ? parseNum(parts[idxFatMass]) : null;
    let visceral = idxVisceral !== -1 ? parseNum(parts[idxVisceral]) : null;
    const department = idxDept !== -1 ? String(parts[idxDept] || '').trim() || undefined : undefined;
    const genderRaw = idxGender !== -1 ? String(parts[idxGender] || '').trim().toUpperCase() : undefined;
    const gender: 'M' | 'F' | undefined =
      genderRaw?.startsWith('M') || genderRaw?.includes('ชาย')
        ? 'M'
        : genderRaw?.startsWith('F') || genderRaw?.includes('หญิง')
        ? 'F'
        : undefined;
    const age = idxAge !== -1 ? parseNum(parts[idxAge]) ?? undefined : undefined;

    // Auto-calculate BMI if missing
    if (bmi === null && height && weight && height > 0) {
      bmi = Number((weight / ((height / 100) ** 2)).toFixed(2));
    }

    // Auto-calculate Fat Mass if missing
    if (fatMass === null && weight !== null && fatPct !== null) {
      fatMass = Number((weight * (fatPct / 100)).toFixed(1));
    }

    // Auto-calculate Visceral Fat proxy if missing
    if (visceral === null && bmi !== null && fatPct !== null) {
      visceral = Math.max(1, Math.round((bmi - 18) * 0.45 + (fatPct - 15) * 0.22 + 1));
    }

    // Skip empty trailing padding rows where no health data or identity exists
    const hasHealthData = weight !== null || muscle !== null || bmi !== null || fatPct !== null || fatMass !== null || visceral !== null;
    if (!hasHealthData && !personId && !department) {
      continue;
    }

    // Infallible fallback ID for rows with valid measurements
    if (!personId || personId === '-' || personId === '#n/a' || personId === 'null' || personId === 'undefined') {
      personId = `P-${String(i).padStart(4, '0')}`;
    }

    records.push({
      person_id: personId,
      quarter,
      height,
      weight,
      muscle_mass: muscle,
      bmi,
      body_fat_percentage: fatPct,
      fat_mass: fatMass,
      visceral_fat: visceral,
      department,
      gender,
      age,
    });
  }

  return records;
}

export interface MultiSheetFetchResult {
  records: BodyCompositionRecord[];
  fetchedTabs: string[];
  quarterCounts: { Q1: number; Q2: number; Q3: number; Q4: number };
  sheetDetails?: { name: string; quarter: Quarter; rows: number }[];
  errors: string[];
}

/**
 * Parses an entire Excel Workbook (Buffer or Uint8Array) containing multiple sheets (tabs).
 * Seamlessly iterates through every sheet, detects quarter per tab, and merges records.
 */
export function parseWorkbookBuffer(
  buffer: ArrayBuffer | Uint8Array,
  fallbackQuarter?: Quarter
): {
  records: BodyCompositionRecord[];
  fetchedTabs: string[];
  quarterCounts: { Q1: number; Q2: number; Q3: number; Q4: number };
  sheetDetails: { name: string; quarter: Quarter; rows: number }[];
} {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetDetails: { name: string; quarter: Quarter; rows: number }[] = [];
  const fetchedTabs: string[] = [];
  const recordMap = new Map<string, BodyCompositionRecord>();

  const totalSheets = wb.SheetNames.length;

  wb.SheetNames.forEach((sheetName, idx) => {
    let sheetQ = detectQuarterFromName(sheetName);
    if (!sheetQ) {
      if (totalSheets === 4) {
        sheetQ = idx === 0 ? 'Q1' : idx === 1 ? 'Q2' : idx === 2 ? 'Q3' : 'Q4';
      } else if (totalSheets === 3) {
        sheetQ = idx === 0 ? 'Q1' : idx === 1 ? 'Q2' : 'Q3';
      } else if (totalSheets === 2) {
        sheetQ = idx === 0 ? 'Q1' : 'Q2';
      } else {
        sheetQ = fallbackQuarter || 'Q4';
      }
    }

    const sheet = wb.Sheets[sheetName];
    if (!sheet) return;

    // Extract rows directly from worksheet (immune to quote, delimiter, or newline escaping issues)
    const rawRows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false,
    }) as (string | number | undefined)[][];

    const parsed = parseHealthRecordsFromRows(rawRows, sheetQ);

    if (parsed.length > 0) {
      fetchedTabs.push(`${sheetName} (${sheetQ})`);
      sheetDetails.push({ name: sheetName, quarter: sheetQ, rows: parsed.length });

      parsed.forEach((r) => {
        const key = `${r.person_id}_${r.quarter}`;
        const existing = recordMap.get(key);
        if (existing) {
          recordMap.set(key, {
            ...existing,
            ...r,
            weight: r.weight ?? existing.weight,
            height: r.height ?? existing.height,
            muscle_mass: r.muscle_mass ?? existing.muscle_mass,
            bmi: r.bmi ?? existing.bmi,
            body_fat_percentage: r.body_fat_percentage ?? existing.body_fat_percentage,
            fat_mass: r.fat_mass ?? existing.fat_mass,
            visceral_fat: r.visceral_fat ?? existing.visceral_fat,
            department: r.department || existing.department,
            gender: r.gender || existing.gender,
            age: r.age ?? existing.age,
          });
        } else {
          recordMap.set(key, r);
        }
      });
    }
  });

  const records = Array.from(recordMap.values());
  const quarterCounts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  records.forEach((r) => {
    if (r.quarter === 'Q1') quarterCounts.Q1++;
    else if (r.quarter === 'Q2') quarterCounts.Q2++;
    else if (r.quarter === 'Q3') quarterCounts.Q3++;
    else if (r.quarter === 'Q4') quarterCounts.Q4++;
  });

  return { records, fetchedTabs, quarterCounts, sheetDetails };
}

/**
 * Automatically probes and fetches all sheets/tabs from a Google Spreadsheet or Apps Script Web App.
 * Uses high-speed direct XLSX export to read all sheets simultaneously, with intelligent GViz & GID fallbacks.
 */
export async function fetchAllSheetsFromSpreadsheet(
  inputUrl: string,
  userTabNames?: string[],
  onProgress?: (msg: string) => void
): Promise<MultiSheetFetchResult> {
  const trimmed = inputUrl.trim();
  const spreadsheetId = extractSpreadsheetId(trimmed);

  const result: MultiSheetFetchResult = {
    records: [],
    fetchedTabs: [],
    quarterCounts: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
    sheetDetails: [],
    errors: [],
  };

  const recordMap = new Map<string, BodyCompositionRecord>();

  const addRecords = (recs: BodyCompositionRecord[], tabLabel: string) => {
    recs.forEach((r) => {
      const key = `${r.person_id}_${r.quarter}`;
      const existing = recordMap.get(key);
      if (existing) {
        recordMap.set(key, {
          ...existing,
          ...r,
          weight: r.weight ?? existing.weight,
          height: r.height ?? existing.height,
          muscle_mass: r.muscle_mass ?? existing.muscle_mass,
          bmi: r.bmi ?? existing.bmi,
          body_fat_percentage: r.body_fat_percentage ?? existing.body_fat_percentage,
          fat_mass: r.fat_mass ?? existing.fat_mass,
          visceral_fat: r.visceral_fat ?? existing.visceral_fat,
          department: r.department || existing.department,
          gender: r.gender || existing.gender,
          age: r.age ?? existing.age,
        });
      } else {
        recordMap.set(key, r);
      }
    });
    if (recs.length > 0 && !result.fetchedTabs.includes(tabLabel)) {
      result.fetchedTabs.push(tabLabel);
    }
  };

  // Case 1: Google Apps Script Web App or direct JSON/CSV endpoint
  if (trimmed.includes('script.google.com') || (!spreadsheetId && trimmed.startsWith('http'))) {
    onProgress?.('กำลังดึงข้อมูลจาก Apps Script Web App...');
    try {
      const res = await fetch(trimmed);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        const json = JSON.parse(text);
        const list: BodyCompositionRecord[] = Array.isArray(json.records) ? json.records : Array.isArray(json) ? json : [];
        addRecords(list, 'AppsScript WebApp');
      } else {
        const list = parseHealthRecordsCsv(text);
        addRecords(list, 'CSV Endpoint');
      }
    } catch (err: any) {
      result.errors.push(`Apps Script fetch failed: ${err.message}`);
    }
  } else if (spreadsheetId) {
    // Case 2: Google Spreadsheet - Strategy 1: Direct XLSX Export (Pulls ALL tabs in a single query!)
    try {
      onProgress?.('กำลังดาวน์โหลดและอ่านข้อมูลครบทุกชีทจาก Google Spreadsheet (.xlsx)...');
      const exportXlsxUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
      const res = await fetch(exportXlsxUrl);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        if (buffer && buffer.byteLength > 100) {
          const parsedWb = parseWorkbookBuffer(buffer);
          if (parsedWb.records.length > 0) {
            parsedWb.records.forEach((r) => {
              const key = `${r.person_id}_${r.quarter}`;
              recordMap.set(key, r);
            });
            result.fetchedTabs = parsedWb.fetchedTabs;
            result.sheetDetails = parsedWb.sheetDetails;
            onProgress?.(`อ่านสำเร็จ ${parsedWb.fetchedTabs.length} ชีท (${parsedWb.records.length} รายการ)...`);
          }
        }
      }
    } catch (err: any) {
      console.warn('Direct XLSX export failed, falling back to GViz/GID:', err);
    }

    // Strategy 2: If XLSX export was empty or restricted, probe via GViz / GID with batching
    if (recordMap.size === 0) {
      const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
      const specifiedGid = gidMatch ? gidMatch[1] : undefined;

      let tabCandidates: string[] = [];
      if (userTabNames && userTabNames.length > 0) {
        tabCandidates = userTabNames.map((t) => t.trim()).filter(Boolean);
      } else {
        // High-priority standard tab names
        tabCandidates = [
          'Q1', 'Q2', 'Q3', 'Q4',
          'ไตรมาส 1', 'ไตรมาส 2', 'ไตรมาส 3', 'ไตรมาส 4',
          'ไตรมาส1', 'ไตรมาส2', 'ไตรมาส3', 'ไตรมาส4',
          'รอบที่ 1', 'รอบที่ 2', 'รอบที่ 3', 'รอบที่ 4',
          'รอบ 1', 'รอบ 2', 'รอบ 3', 'รอบ 4',
          'แผ่นงาน 1', 'แผ่นงาน 2', 'แผ่นงาน 3', 'แผ่นงาน 4',
          'แผ่นงาน1', 'แผ่นงาน2', 'แผ่นงาน3', 'แผ่นงาน4',
          'Sheet1', 'Sheet2', 'Sheet3', 'Sheet4',
          'Data', 'ข้อมูล',
        ];
      }

      onProgress?.('กำลังดึงข้อมูลชีทผ่าน Google Visualization API...');
      const batchSize = 4;
      for (let b = 0; b < tabCandidates.length; b += batchSize) {
        const chunk = tabCandidates.slice(b, b + batchSize);
        await Promise.all(
          chunk.map(async (tabName) => {
            const fallbackQuarter = detectQuarterFromName(tabName);
            const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
            try {
              const res = await fetch(csvUrl);
              if (!res.ok) return;
              const text = await res.text();
              if (!text || text.includes('Error in query') || text.startsWith('<!DOCTYPE')) return;
              const parsed = parseHealthRecordsCsv(text, fallbackQuarter);
              if (parsed.length > 0) {
                addRecords(parsed, tabName);
              }
            } catch {
              // ignore
            }
          })
        );
      }

      // Also try specified GID or default GIDs
      if (specifiedGid) {
        try {
          const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${specifiedGid}`;
          const res = await fetch(exportUrl);
          if (res.ok) {
            const text = await res.text();
            if (text && !text.startsWith('<!DOCTYPE')) {
              const parsed = parseHealthRecordsCsv(text);
              if (parsed.length > 0) addRecords(parsed, `gid=${specifiedGid}`);
            }
          }
        } catch {
          // ignore
        }
      }

      if (recordMap.size === 0) {
        for (const gid of ['0', '1', '2', '3']) {
          try {
            const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
            const res = await fetch(exportUrl);
            if (res.ok) {
              const text = await res.text();
              if (text && !text.startsWith('<!DOCTYPE')) {
                const defaultQ: Quarter = gid === '0' ? 'Q1' : gid === '1' ? 'Q2' : gid === '2' ? 'Q3' : 'Q4';
                const parsed = parseHealthRecordsCsv(text, defaultQ);
                if (parsed.length > 0) addRecords(parsed, `Sheet (gid=${gid})`);
              }
            }
          } catch {
            // ignore
          }
        }
      }
    }
  }

  // Compile final array & quarter counts
  result.records = Array.from(recordMap.values());
  result.records.forEach((r) => {
    if (r.quarter === 'Q1') result.quarterCounts.Q1++;
    else if (r.quarter === 'Q2') result.quarterCounts.Q2++;
    else if (r.quarter === 'Q3') result.quarterCounts.Q3++;
    else if (r.quarter === 'Q4') result.quarterCounts.Q4++;
  });

  return result;
}
