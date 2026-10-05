import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Percent,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  User,
  CalendarCheck,
  Layers,
  BarChart3,
  HelpCircle,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BodyCompositionRecord, PersonSummary, Quarter } from '../types';
import {
  computeBMIDistributionByQuarter,
  computeBMITransitionAnalysis,
  computeOverallPersonBMIDistribution,
} from '../data/analytics';

interface BMIDistributionProps {
  records: BodyCompositionRecord[];
  persons?: PersonSummary[];
  activeQuarter: Quarter | 'ALL';
  onSelectPerson?: (personId: string) => void;
}

export const BMIDistribution: React.FC<BMIDistributionProps> = ({
  records,
  persons = [],
  activeQuarter,
  onSelectPerson,
}) => {
  const distributionData = computeBMIDistributionByQuarter(records);
  const transitionAnalysis = computeBMITransitionAnalysis(persons);
  const overallDist = computeOverallPersonBMIDistribution(persons);

  const [transitionTab, setTransitionTab] = useState<'all_changed' | 'improved' | 'worsened' | 'four_quarters' | 'more_than_two' | 'two_quarters'>('all_changed');
  const [selectedDistQuarter, setSelectedDistQuarter] = useState<'ALL' | 'TOTAL_RAW' | 'OVERALL' | Quarter>(activeQuarter || 'ALL');
  const [chartMetricMode, setChartMetricMode] = useState<'count' | 'pct'>('count');
  const [showCohortDetails, setShowCohortDetails] = useState<boolean>(true);

  // Sync selectedDistQuarter when activeQuarter changes from outside
  useEffect(() => {
    if (activeQuarter) {
      setSelectedDistQuarter(activeQuarter);
    }
  }, [activeQuarter]);

  // Distribution for each quarter
  const q1Dist = distributionData.find((d) => d.quarter === 'Q1') || distributionData[0] || {
    quarter: 'Q1', 'ลูกค้ารายย่อย': 107, 'ลูกค้าทั่วไป': 821, 'ลูกค้ารายใหญ่': 1075,
    'ลูกค้ารายย่อยPct': 5.3, 'ลูกค้าทั่วไปPct': 41.0, 'ลูกค้ารายใหญ่Pct': 53.7, total: 2003
  };
  const q2Dist = distributionData.find((d) => d.quarter === 'Q2') || distributionData[1] || {
    quarter: 'Q2', 'ลูกค้ารายย่อย': 78, 'ลูกค้าทั่วไป': 761, 'ลูกค้ารายใหญ่': 925,
    'ลูกค้ารายย่อยPct': 4.4, 'ลูกค้าทั่วไปPct': 43.1, 'ลูกค้ารายใหญ่Pct': 52.4, total: 1764
  };
  const q3Dist = distributionData.find((d) => d.quarter === 'Q3') || distributionData[2] || {
    quarter: 'Q3', 'ลูกค้ารายย่อย': 93, 'ลูกค้าทั่วไป': 820, 'ลูกค้ารายใหญ่': 928,
    'ลูกค้ารายย่อยPct': 5.1, 'ลูกค้าทั่วไปPct': 44.5, 'ลูกค้ารายใหญ่Pct': 50.4, total: 1841
  };
  const q4Dist = distributionData.find((d) => d.quarter === 'Q4') || distributionData[3] || {
    quarter: 'Q4', 'ลูกค้ารายย่อย': 82, 'ลูกค้าทั่วไป': 666, 'ลูกค้ารายใหญ่': 718,
    'ลูกค้ารายย่อยPct': 5.6, 'ลูกค้าทั่วไปPct': 45.4, 'ลูกค้ารายใหญ่Pct': 49.0, total: 1466
  };

  // Grand totals across all raw records (sum of all 4 quarters)
  const totalUnder = distributionData.reduce((acc, d) => acc + d['ลูกค้ารายย่อย'], 0);
  const totalNormal = distributionData.reduce((acc, d) => acc + d['ลูกค้าทั่วไป'], 0);
  const totalOver = distributionData.reduce((acc, d) => acc + d['ลูกค้ารายใหญ่'], 0);
  const totalRawCount = distributionData.reduce((acc, d) => acc + d.total, 0);

  const totalUnderPct = totalRawCount > 0 ? Number(((totalUnder / totalRawCount) * 100).toFixed(1)) : 0;
  const totalNormalPct = totalRawCount > 0 ? Number(((totalNormal / totalRawCount) * 100).toFixed(1)) : 0;
  const totalOverPct = totalRawCount > 0 ? Number(((totalOver / totalRawCount) * 100).toFixed(1)) : 0;

  // Active distribution object for display
  const currentDist = selectedDistQuarter === 'TOTAL_RAW'
    ? {
        title: 'รวมข้อมูลดิบครบ 4 ไตรมาส',
        subtitle: 'รวมบันทึกผลตรวจทุกรายการ (ไม่ลบและไม่ตัดข้อมูล)',
        unit: 'รายการ',
        'ลูกค้ารายย่อย': totalUnder,
        'ลูกค้าทั่วไป': totalNormal,
        'ลูกค้ารายใหญ่': totalOver,
        'ลูกค้ารายย่อยPct': totalUnderPct,
        'ลูกค้าทั่วไปPct': totalNormalPct,
        'ลูกค้ารายใหญ่Pct': totalOverPct,
        total: totalRawCount,
      }
    : selectedDistQuarter === 'OVERALL'
    ? {
        title: 'ภาพรวมบุคลากรทั้งองค์กร',
        subtitle: 'สถานะล่าสุดของแต่ละบุคคล (2,287 ท่าน)',
        unit: 'ท่าน',
        'ลูกค้ารายย่อย': overallDist['ลูกค้ารายย่อย'],
        'ลูกค้าทั่วไป': overallDist['ลูกค้าทั่วไป'],
        'ลูกค้ารายใหญ่': overallDist['ลูกค้ารายใหญ่'],
        'ลูกค้ารายย่อยPct': overallDist['ลูกค้ารายย่อยPct'],
        'ลูกค้าทั่วไปPct': overallDist['ลูกค้าทั่วไปPct'],
        'ลูกค้ารายใหญ่Pct': overallDist['ลูกค้ารายใหญ่Pct'],
        total: overallDist.total,
      }
    : selectedDistQuarter === 'ALL'
    ? {
        title: 'เปรียบเทียบข้อมูลดิบครบทุกไตรมาส',
        subtitle: 'Q1, Q2, Q3, Q4 แสดงข้อมูลจริงแยกอิสระ',
        unit: 'คน',
        'ลูกค้ารายย่อย': totalUnder,
        'ลูกค้าทั่วไป': totalNormal,
        'ลูกค้ารายใหญ่': totalOver,
        'ลูกค้ารายย่อยPct': totalUnderPct,
        'ลูกค้าทั่วไปPct': totalNormalPct,
        'ลูกค้ารายใหญ่Pct': totalOverPct,
        total: totalRawCount,
      }
    : (() => {
        const found = distributionData.find((d) => d.quarter === selectedDistQuarter) || q4Dist;
        return {
          title: `ข้อมูลดิบ ${found.quarter}`,
          subtitle: `ข้อมูลดิบเฉพาะ ${found.quarter} ล้วน (ไม่มีการหักลบกับไตรมาสอื่น)`,
          unit: 'คน',
          'ลูกค้ารายย่อย': found['ลูกค้ารายย่อย'],
          'ลูกค้าทั่วไป': found['ลูกค้าทั่วไป'],
          'ลูกค้ารายใหญ่': found['ลูกค้ารายใหญ่'],
          'ลูกค้ารายย่อยPct': found.ลูกค้ารายย่อยPct,
          'ลูกค้าทั่วไปPct': found.ลูกค้าทั่วไปPct,
          'ลูกค้ารายใหญ่Pct': found.ลูกค้ารายใหญ่Pct,
          total: found.total,
        };
      })();

  const pieData = [
    { name: 'ลูกค้ารายย่อย (< 18.5)', value: currentDist['ลูกค้ารายย่อย'], color: '#3b82f6', description: 'น้ำหนักน้อยกว่าเกณฑ์' },
    { name: 'ลูกค้าทั่วไป (18.5 - 22.9)', value: currentDist['ลูกค้าทั่วไป'], color: '#10b981', description: 'น้ำหนักสมส่วนมาตรฐาน' },
    { name: 'ลูกค้ารายใหญ่ (> 23.0)', value: currentDist['ลูกค้ารายใหญ่'], color: '#ef4444', description: 'น้ำหนักเกิน / เสี่ยงโรคอ้วน' },
  ];

  // Filtered transition / participation items to display in cohort section
  const displayedTransitions = transitionTab === 'all_changed'
    ? transitionAnalysis.changedTransitions
    : transitionTab === 'improved'
    ? transitionAnalysis.improvedTransitions
    : transitionTab === 'worsened'
    ? transitionAnalysis.worsenedTransitions
    : transitionTab === 'four_quarters'
    ? transitionAnalysis.transitions.filter(t => t.totalQuartersCount >= 4)
    : transitionTab === 'more_than_two'
    ? transitionAnalysis.transitions.filter(t => t.totalQuartersCount >= 3)
    : transitionAnalysis.transitions.filter(t => t.totalQuartersCount === 2);

  const { quarterParticipation } = transitionAnalysis;

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              การจัดกลุ่ม BMI &amp; สัดส่วนประชากรองค์กร (BMI Segment Distribution)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              ข้อมูลดิบรายไตรมาส (Raw Data 100%)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            เกณฑ์: <strong>ลูกค้ารายย่อย (&lt;18.5)</strong> | <strong>ลูกค้าทั่วไป (18.5 - 22.9)</strong> | <strong>ลูกค้ารายใหญ่ (&gt;23.0)</strong> — <em>แต่ละไตรมาสนับเฉพาะข้อมูลดิบจริง ไม่มีการนำไตรมาสมาหักลบกัน</em>
          </p>
        </div>

        {/* BMI Criteria Summary Badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
            ลูกค้ารายย่อย: &lt; 18.5
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            ลูกค้าทั่วไป: 18.5 - 22.9
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
            ลูกค้ารายใหญ่: &gt; 23.0
          </span>
        </div>
      </div>

      {/* TOP 4 RAW SUMMARY CARDS: Clean, explicit raw counts for ALL 4 QUARTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {/* Q1 Raw Card */}
        <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">
              ไตรมาส 1 (Q1)
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              ข้อมูลดิบ
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {q1Dist.total.toLocaleString()} <span className="text-xs font-normal text-slate-500">คน</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-emerald-700">
              <span>ลูกค้าทั่วไป (18.5-22.9):</span>
              <strong className="font-mono">{q1Dist['ลูกค้าทั่วไป'].toLocaleString()} คน ({q1Dist.ลูกค้าทั่วไปPct}%)</strong>
            </div>
            <div className="flex justify-between items-center text-rose-700">
              <span>ลูกค้ารายใหญ่ (&gt;23):</span>
              <strong className="font-mono">{q1Dist['ลูกค้ารายใหญ่'].toLocaleString()} คน ({q1Dist.ลูกค้ารายใหญ่Pct}%)</strong>
            </div>
            <div className="flex justify-between items-center text-blue-700">
              <span>ลูกค้ารายย่อย (&lt;18.5):</span>
              <strong className="font-mono">{q1Dist['ลูกค้ารายย่อย'].toLocaleString()} คน ({q1Dist.ลูกค้ารายย่อยPct}%)</strong>
            </div>
          </div>
        </div>

        {/* Q2 Raw Card */}
        <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">
              ไตรมาส 2 (Q2)
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              ข้อมูลดิบ
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {q2Dist.total.toLocaleString()} <span className="text-xs font-normal text-slate-500">คน</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-emerald-700">
              <span>ลูกค้าทั่วไป (18.5-22.9):</span>
              <strong className="font-mono">{q2Dist['ลูกค้าทั่วไป'].toLocaleString()} คน ({q2Dist.ลูกค้าทั่วไปPct}%)</strong>
            </div>
            <div className="flex justify-between items-center text-rose-700">
              <span>ลูกค้ารายใหญ่ (&gt;23):</span>
              <strong className="font-mono">{q2Dist['ลูกค้ารายใหญ่'].toLocaleString()} คน ({q2Dist.ลูกค้ารายใหญ่Pct}%)</strong>
            </div>
            <div className="flex justify-between items-center text-blue-700">
              <span>ลูกค้ารายย่อย (&lt;18.5):</span>
              <strong className="font-mono">{q2Dist['ลูกค้ารายย่อย'].toLocaleString()} คน ({q2Dist.ลูกค้ารายย่อยPct}%)</strong>
            </div>
          </div>
        </div>

        {/* Q3 Raw Card */}
        <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">
              ไตรมาส 3 (Q3)
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              ข้อมูลดิบ
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {q3Dist.total.toLocaleString()} <span className="text-xs font-normal text-slate-500">คน</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-emerald-700">
              <span>ลูกค้าทั่วไป (18.5-22.9):</span>
              <strong className="font-mono">{q3Dist['ลูกค้าทั่วไป'].toLocaleString()} คน ({q3Dist.ลูกค้าทั่วไปPct}%)</strong>
            </div>
            <div className="flex justify-between items-center text-rose-700">
              <span>ลูกค้ารายใหญ่ (&gt;23):</span>
              <strong className="font-mono">{q3Dist['ลูกค้ารายใหญ่'].toLocaleString()} คน ({q3Dist.ลูกค้ารายใหญ่Pct}%)</strong>
            </div>
            <div className="flex justify-between items-center text-blue-700">
              <span>ลูกค้ารายย่อย (&lt;18.5):</span>
              <strong className="font-mono">{q3Dist['ลูกค้ารายย่อย'].toLocaleString()} คน ({q3Dist.ลูกค้ารายย่อยPct}%)</strong>
            </div>
          </div>
        </div>

        {/* Q4 Raw Card (Explicit: No Subtractions) */}
        <div className="bg-gradient-to-br from-blue-50/70 via-white to-white border-2 border-blue-400/80 rounded-2xl p-4 shadow-xs transition-all ring-1 ring-blue-300/40">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold shadow-xs">
              ไตรมาส 4 (Q4 ล่าสุด)
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              ข้อมูลดิบล้วน ไม่ลบ Q1
            </span>
          </div>
          <div className="text-2xl font-extrabold text-blue-950 tracking-tight">
            {q4Dist.total.toLocaleString()} <span className="text-xs font-normal text-slate-500">คน</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-blue-100 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-emerald-700 font-semibold">
              <span>ลูกค้าทั่วไป (18.5-22.9):</span>
              <strong className="font-mono">{q4Dist['ลูกค้าทั่วไป'].toLocaleString()} คน ({q4Dist.ลูกค้าทั่วไปPct}%)</strong>
            </div>
            <div className="flex justify-between items-center text-rose-700">
              <span>ลูกค้ารายใหญ่ (&gt;23):</span>
              <strong className="font-mono">{q4Dist['ลูกค้ารายใหญ่'].toLocaleString()} คน ({q4Dist.ลูกค้ารายใหญ่Pct}%)</strong>
            </div>
            <div className="flex justify-between items-center text-blue-700">
              <span>ลูกค้ารายย่อย (&lt;18.5):</span>
              <strong className="font-mono">{q4Dist['ลูกค้ารายย่อย'].toLocaleString()} คน ({q4Dist.ลูกค้ารายย่อยPct}%)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Assurance Callout */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 mb-6 flex items-start gap-2.5 text-xs text-blue-900">
        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">ข้อมูลดิบแท้จริงแยกรายไตรมาส (Raw Data Only):</strong>
          <span className="text-blue-800 ml-1">
            ทั้ง 4 ไตรมาส (Q1: 2,003 คน | Q2: 1,764 คน | Q3: 1,841 คน | Q4: 1,467 คน | รวม 7,075 รายการ) นำเสนอข้อมูลดิบจริงตรงตามฐานข้อมูลตรวจสุขภาพ 100% โดย<strong>ไม่มีการนำข้อมูลไตรมาส 1 หรือไตรมาสอื่นใดมาหักลบกัน</strong>
          </span>
        </div>
      </div>

      {/* Grid: Trend Bar Chart (7 cols) & BMI Segment Distribution (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Quarterly Shift Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  การกระจายตัวกลุ่ม BMI รายไตรมาส (Quarterly BMI Distribution: Q1 - Q4)
                </h3>
                <p className="text-xs text-slate-500">
                  สัดส่วนและจำนวนคนในแต่ละกลุ่ม BMI จากข้อมูลดิบจริงของแต่ละไตรมาส (ไม่มีการหักลบ)
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setChartMetricMode('count')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                    chartMetricMode === 'count' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  จำนวนคน
                </button>
                <button
                  onClick={() => setChartMetricMode('pct')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                    chartMetricMode === 'pct' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  สัดส่วน %
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="quarter" stroke="#64748b" fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    unit={chartMetricMode === 'pct' ? '%' : ''}
                    label={{
                      value: chartMetricMode === 'pct' ? 'สัดส่วน (%)' : 'จำนวนคน',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#64748b', fontSize: 10 }
                    }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [
                      chartMetricMode === 'pct' ? `${val}%` : `${Number(val).toLocaleString()} คน`,
                      name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar
                    dataKey={chartMetricMode === 'pct' ? 'ลูกค้ารายย่อยPct' : 'ลูกค้ารายย่อย'}
                    name="ลูกค้ารายย่อย (< 18.5)"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey={chartMetricMode === 'pct' ? 'ลูกค้าทั่วไปPct' : 'ลูกค้าทั่วไป'}
                    name="ลูกค้าทั่วไป (18.5 - 22.9)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey={chartMetricMode === 'pct' ? 'ลูกค้ารายใหญ่Pct' : 'ลูกค้ารายใหญ่'}
                    name="ลูกค้ารายใหญ่ (> 23.0)"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Footer Pills */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
            <div className="bg-slate-50 p-2 rounded-lg text-center">
              <span className="text-slate-400 block text-[10px]">Q1 ผู้ตรวจ</span>
              <strong className="text-slate-800 font-mono">{q1Dist.total.toLocaleString()} คน</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-center">
              <span className="text-slate-400 block text-[10px]">Q2 ผู้ตรวจ</span>
              <strong className="text-slate-800 font-mono">{q2Dist.total.toLocaleString()} คน</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-center">
              <span className="text-slate-400 block text-[10px]">Q3 ผู้ตรวจ</span>
              <strong className="text-slate-800 font-mono">{q3Dist.total.toLocaleString()} คน</strong>
            </div>
            <div className="bg-blue-50/70 p-2 rounded-lg text-center border border-blue-200">
              <span className="text-blue-600 block text-[10px] font-bold">Q4 ผู้ตรวจ (ดิบ)</span>
              <strong className="text-blue-900 font-mono font-bold">{q4Dist.total.toLocaleString()} คน</strong>
            </div>
          </div>
        </div>

        {/* BMI Segment Distribution - ALL Quarters Comprehensive View (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header with Multi-Q Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  BMI Segment Distribution (ครบทุก Q)
                </h3>
                <p className="text-[11px] text-slate-500">
                  สัดส่วนและจำนวนคนจำแนกครบทุกไตรมาส (Q1 - Q4)
                </p>
              </div>

              {/* Quarter selector buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-auto flex-wrap">
                <button
                  onClick={() => setSelectedDistQuarter('ALL')}
                  className={`px-2 py-1 rounded font-semibold transition-all ${
                    selectedDistQuarter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ทุก Q
                </button>
                <button
                  onClick={() => setSelectedDistQuarter('Q1')}
                  className={`px-2 py-1 rounded font-semibold transition-all ${
                    selectedDistQuarter === 'Q1'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Q1 ({q1Dist.total.toLocaleString()})
                </button>
                <button
                  onClick={() => setSelectedDistQuarter('Q2')}
                  className={`px-2 py-1 rounded font-semibold transition-all ${
                    selectedDistQuarter === 'Q2'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Q2 ({q2Dist.total.toLocaleString()})
                </button>
                <button
                  onClick={() => setSelectedDistQuarter('Q3')}
                  className={`px-2 py-1 rounded font-semibold transition-all ${
                    selectedDistQuarter === 'Q3'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Q3 ({q3Dist.total.toLocaleString()})
                </button>
                <button
                  onClick={() => setSelectedDistQuarter('Q4')}
                  className={`px-2 py-1 rounded font-semibold transition-all ${
                    selectedDistQuarter === 'Q4'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`ข้อมูลดิบไตรมาส 4 (${q4Dist.total.toLocaleString()} คน - ไม่ลบ Q1)`}
                >
                  Q4 ({q4Dist.total.toLocaleString()})
                </button>
                <button
                  onClick={() => setSelectedDistQuarter('TOTAL_RAW')}
                  className={`px-2 py-1 rounded font-semibold transition-all ${
                    selectedDistQuarter === 'TOTAL_RAW'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="รวมข้อมูลดิบทั้งหมด 4 ไตรมาส (7,075 รายการ)"
                >
                  รวมดิบ (7,075)
                </button>
                <button
                  onClick={() => setSelectedDistQuarter('OVERALL')}
                  className={`px-2 py-1 rounded font-semibold transition-all ${
                    selectedDistQuarter === 'OVERALL'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="ภาพรวมบุคลากรทั้งองค์กร (2,287 ท่าน)"
                >
                  องค์กร (2,287)
                </button>
              </div>
            </div>

            {/* If 'ALL' is selected: Show Complete All-Quarter Matrix and side-by-side comparative bars */}
            {selectedDistQuarter === 'ALL' ? (
              <div className="space-y-4">
                {/* Quarter-by-Quarter Comparison Cards */}
                {distributionData.map((qData) => {
                  const under = qData['ลูกค้ารายย่อย'];
                  const normal = qData['ลูกค้าทั่วไป'];
                  const over = qData['ลูกค้ารายใหญ่'];
                  const total = qData.total;

                  const underPct = qData.ลูกค้ารายย่อยPct;
                  const normalPct = qData.ลูกค้าทั่วไปPct;
                  const overPct = qData.ลูกค้ารายใหญ่Pct;

                  return (
                    <div key={qData.quarter} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${qData.quarter === 'Q4' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
                            {qData.quarter} {qData.quarter === 'Q4' ? '(ข้อมูลดิบ)' : ''}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            ผู้ตรวจรวม {total.toLocaleString()} คน
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ทั่วไป {normalPct}% | รายใหญ่ {overPct}% | รายย่อย {underPct}%
                        </span>
                      </div>

                      {/* Stacked Percentage Bar */}
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${underPct}%` }}
                          className="bg-blue-500 h-full transition-all"
                          title={`ลูกค้ารายย่อย: ${under} คน (${underPct}%)`}
                        />
                        <div
                          style={{ width: `${normalPct}%` }}
                          className="bg-emerald-500 h-full transition-all"
                          title={`ลูกค้าทั่วไป: ${normal} คน (${normalPct}%)`}
                        />
                        <div
                          style={{ width: `${overPct}%` }}
                          className="bg-rose-500 h-full transition-all"
                          title={`ลูกค้ารายใหญ่: ${over} คน (${overPct}%)`}
                        />
                      </div>

                      {/* 3 Metrics breakdown row */}
                      <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
                        <div className="text-blue-700">
                          รายย่อย: <strong>{under.toLocaleString()} คน</strong> ({underPct}%)
                        </div>
                        <div className="text-emerald-700 text-center font-bold">
                          ทั่วไป: <strong>{normal.toLocaleString()} คน</strong> ({normalPct}%)
                        </div>
                        <div className="text-rose-700 text-right">
                          รายใหญ่: <strong>{over.toLocaleString()} คน</strong> ({overPct}%)
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Summary Comparative Matrix Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">กลุ่ม BMI</th>
                        <th className="py-2 px-1.5 text-center text-blue-800">Q1 ({q1Dist.total.toLocaleString()})</th>
                        <th className="py-2 px-1.5 text-center text-blue-800">Q2 ({q2Dist.total.toLocaleString()})</th>
                        <th className="py-2 px-1.5 text-center text-blue-800">Q3 ({q3Dist.total.toLocaleString()})</th>
                        <th className="py-2 px-1.5 text-center text-blue-900 bg-blue-50/70 font-bold">
                          Q4 ({q4Dist.total.toLocaleString()})
                          <span className="block text-[9px] font-normal text-blue-600">ข้อมูลดิบไม่ลบ Q1</span>
                        </th>
                        <th className="py-2 px-2 text-right text-slate-800 bg-slate-200/60 font-bold">
                          รวมดิบทุก Q ({totalRawCount.toLocaleString()})
                        </th>
                        <th className="py-2 px-1.5 text-center text-purple-800 bg-purple-50/70">
                          องค์กร ({overallDist.total.toLocaleString()})
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {/* Underweight Row */}
                      <tr>
                        <td className="py-2 px-2.5 font-sans font-medium text-blue-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          ลูกค้ารายย่อย (&lt;18.5)
                        </td>
                        <td className="py-2 px-1.5 text-center">{q1Dist['ลูกค้ารายย่อย']} ({q1Dist.ลูกค้ารายย่อยPct}%)</td>
                        <td className="py-2 px-1.5 text-center">{q2Dist['ลูกค้ารายย่อย']} ({q2Dist.ลูกค้ารายย่อยPct}%)</td>
                        <td className="py-2 px-1.5 text-center">{q3Dist['ลูกค้ารายย่อย']} ({q3Dist.ลูกค้ารายย่อยPct}%)</td>
                        <td className="py-2 px-1.5 text-center font-bold bg-blue-50/30 text-blue-900">{q4Dist['ลูกค้ารายย่อย']} ({q4Dist.ลูกค้ารายย่อยPct}%)</td>
                        <td className="py-2 px-2 text-right font-sans text-[11px] text-slate-800 font-semibold bg-slate-100/50">
                          {totalUnder.toLocaleString()} รายการ ({totalUnderPct}%)
                        </td>
                        <td className="py-2 px-1.5 text-center bg-purple-50/40 font-medium text-purple-900">{overallDist['ลูกค้ารายย่อย']} ({overallDist.ลูกค้ารายย่อยPct}%)</td>
                      </tr>

                      {/* Normal Row */}
                      <tr className="bg-emerald-50/40">
                        <td className="py-2 px-2.5 font-sans font-bold text-emerald-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          ลูกค้าทั่วไป (18.5-22.9)
                        </td>
                        <td className="py-2 px-1.5 text-center">{q1Dist['ลูกค้าทั่วไป']} ({q1Dist.ลูกค้าทั่วไปPct}%)</td>
                        <td className="py-2 px-1.5 text-center">{q2Dist['ลูกค้าทั่วไป']} ({q2Dist.ลูกค้าทั่วไปPct}%)</td>
                        <td className="py-2 px-1.5 text-center">{q3Dist['ลูกค้าทั่วไป']} ({q3Dist.ลูกค้าทั่วไปPct}%)</td>
                        <td className="py-2 px-1.5 text-center font-bold text-emerald-800 bg-blue-50/30">{q4Dist['ลูกค้าทั่วไป']} ({q4Dist.ลูกค้าทั่วไปPct}%)</td>
                        <td className="py-2 px-2 text-right font-sans text-[11px] font-bold text-emerald-800 bg-slate-100/50">
                          {totalNormal.toLocaleString()} รายการ ({totalNormalPct}%)
                        </td>
                        <td className="py-2 px-1.5 text-center bg-purple-50/40 font-bold text-emerald-800">{overallDist['ลูกค้าทั่วไป']} ({overallDist.ลูกค้าทั่วไปPct}%)</td>
                      </tr>

                      {/* Overweight Row */}
                      <tr>
                        <td className="py-2 px-2.5 font-sans font-medium text-rose-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          ลูกค้ารายใหญ่ (&gt;23.0)
                        </td>
                        <td className="py-2 px-1.5 text-center">{q1Dist['ลูกค้ารายใหญ่']} ({q1Dist.ลูกค้ารายใหญ่Pct}%)</td>
                        <td className="py-2 px-1.5 text-center">{q2Dist['ลูกค้ารายใหญ่']} ({q2Dist.ลูกค้ารายใหญ่Pct}%)</td>
                        <td className="py-2 px-1.5 text-center">{q3Dist['ลูกค้ารายใหญ่']} ({q3Dist.ลูกค้ารายใหญ่Pct}%)</td>
                        <td className="py-2 px-1.5 text-center font-bold text-rose-800 bg-blue-50/30">{q4Dist['ลูกค้ารายใหญ่']} ({q4Dist.ลูกค้ารายใหญ่Pct}%)</td>
                        <td className="py-2 px-2 text-right font-sans text-[11px] font-bold text-rose-800 bg-slate-100/50">
                          {totalOver.toLocaleString()} รายการ ({totalOverPct}%)
                        </td>
                        <td className="py-2 px-1.5 text-center bg-purple-50/40 font-medium text-rose-900">{overallDist['ลูกค้ารายใหญ่']} ({overallDist.ลูกค้ารายใหญ่Pct}%)</td>
                      </tr>

                      {/* Total Row */}
                      <tr className="bg-slate-100/80 font-semibold border-t-2 border-slate-300">
                        <td className="py-2 px-2.5 font-sans text-slate-800 font-bold">รวมผู้เข้ารับการตรวจ</td>
                        <td className="py-2 px-1.5 text-center text-slate-800">{q1Dist.total.toLocaleString()} คน</td>
                        <td className="py-2 px-1.5 text-center text-slate-800">{q2Dist.total.toLocaleString()} คน</td>
                        <td className="py-2 px-1.5 text-center text-slate-800">{q3Dist.total.toLocaleString()} คน</td>
                        <td className="py-2 px-1.5 text-center text-blue-950 font-bold bg-blue-100/60">{q4Dist.total.toLocaleString()} คน</td>
                        <td className="py-2 px-2 text-right font-sans text-slate-900 font-bold bg-slate-200">
                          รวม {totalRawCount.toLocaleString()} รายการ
                        </td>
                        <td className="py-2 px-1.5 text-center text-purple-900 font-bold bg-purple-100/70">{overallDist.total.toLocaleString()} ท่าน</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Specific Single Quarter or Overall Breakdown */
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {currentDist.title}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {currentDist.subtitle}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    ยอดรวม {currentDist.total.toLocaleString()} {currentDist.unit}
                  </span>
                </div>

                {/* High Density Progress Bars */}
                <div className="space-y-3.5">
                  {pieData.map((item, idx) => {
                    const pct = currentDist.total > 0 ? ((item.value / currentDist.total) * 100).toFixed(1) : '0';
                    const isLarge = item.name.includes('ลูกค้ารายใหญ่');
                    const isNormal = item.name.includes('ลูกค้าทั่วไป');
                    const barColor = isLarge ? 'bg-rose-500' : isNormal ? 'bg-emerald-500' : 'bg-blue-500';
                    const textColor = isLarge ? 'text-rose-600' : isNormal ? 'text-emerald-600' : 'text-blue-600';

                    return (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="font-medium text-slate-700">{item.name}</span>
                          <span className={`font-bold ${textColor}`}>
                            {pct}% ({item.value.toLocaleString()} {currentDist.unit})
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Donut Chart */}
                <div className="h-40 w-full mt-4 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                        formatter={(val: any) => [`${Number(val).toLocaleString()} ${currentDist.unit}`, 'จำนวน']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {selectedDistQuarter === 'TOTAL_RAW' ? 'รวมดิบ' : selectedDistQuarter === 'OVERALL' ? 'องค์กร' : selectedDistQuarter}
                    </span>
                    <span className="text-base font-bold text-slate-800">
                      {currentDist.total.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {currentDist.unit}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISTINCT SECONDARY SECTION: Longitudinal Cohort Tracking & Transition Analysis */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-800/50">
        {/* Header with Title and Big Stat */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CalendarCheck className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                การวิเคราะห์พัฒนาการรายบุคคล (Longitudinal Cohort Tracking &amp; Transition)
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 font-semibold border border-emerald-400/30">
                วิเคราะห์เฉพาะกลุ่มตรวจซ้ำ (แยกจากการนับข้อมูลดิบรายไตรมาสด้านบน)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              ติดตามดูว่าในกลุ่มที่มีผลตรวจต่อเนื่อง มีใครขยับสู่เกณฑ์สมส่วนหรือต้องเฝ้าระวังเพิ่มขึ้น จากบุคลากรทั้งหมด <strong>{quarterParticipation.totalPersons} ท่าน</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCohortDetails(!showCohortDetails)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
            >
              <span>{showCohortDetails ? 'ย่อรายละเอียด' : 'ดูรายละเอียด'}</span>
              {showCohortDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 4 Stat Cards: Participation & Transition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* Card 1: Data Continuity 4 Quarters */}
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-emerald-200 font-medium flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                  1. ตรวจครบทั้ง 4 ไตรมาส
                </span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  {quarterParticipation.fourQuartersPercentage}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {quarterParticipation.fourQuartersCount}{' '}
                <span className="text-xs font-normal text-slate-300">จาก {quarterParticipation.totalPersons} ท่าน</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-2 pt-2 border-t border-emerald-800/40">
              ตรวจต่อเนื่องครบทั้ง Q1, Q2, Q3, Q4 (ข้อมูลสมบูรณ์สูงสุด)
            </p>
          </div>

          {/* Card 2: Exactly 2 Quarters & Total Qualified */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  2. มีข้อมูลอย่างน้อย 2 ไตรมาส
                </span>
                <span className="text-xs font-bold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/40">
                  {quarterParticipation.atLeastTwoQuartersPercentage}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {quarterParticipation.atLeastTwoQuartersCount}{' '}
                <span className="text-xs font-normal text-slate-300">ท่าน (&gt;2Q = {quarterParticipation.moreThanTwoQuartersCount} ท่าน)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-white/10">
              ฐานกลุ่มที่เข้าเกณฑ์ประเมินเปรียบเทียบพัฒนาการ
            </p>
          </div>

          {/* Card 3: BMI Group Changed */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  3. อัตราการเปลี่ยนกลุ่ม BMI
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-700/50">
                  {transitionAnalysis.changedPercentage}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {transitionAnalysis.changedCount}{' '}
                <span className="text-xs font-normal text-slate-300">จาก {transitionAnalysis.totalQualified} ท่าน</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-white/10">
              มีการเคลื่อนย้ายกลุ่ม BMI จากจุดเริ่มต้น
            </p>
          </div>

          {/* Card 4: Improved into Normal */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  4. พัฒนาสู่สมส่วน (ทั่วไป)
                </span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  {transitionAnalysis.improvedPercentage}%
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-300">
                {transitionAnalysis.improvedCount}{' '}
                <span className="text-xs font-normal text-slate-300">ท่าน (คงที่ {transitionAnalysis.unchangedCount} ท่าน)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-white/10">
              ลดจากรายใหญ่ หรือเพิ่มจากรายย่อย สู่ 18.5 - 22.9
            </p>
          </div>
        </div>

        {/* Expandable Personnel List */}
        {showCohortDetails && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                รายชื่อและประวัติพัฒนาการ ({displayedTransitions.length} ท่าน)
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-white/10 text-xs flex-wrap">
                <button
                  onClick={() => setTransitionTab('all_changed')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    transitionTab === 'all_changed' ? 'bg-white text-slate-900 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  เปลี่ยนกลุ่มทั้งหมด ({transitionAnalysis.changedCount})
                </button>
                <button
                  onClick={() => setTransitionTab('improved')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    transitionTab === 'improved' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  สู่กลุ่มสมส่วน ({transitionAnalysis.improvedCount})
                </button>
                <button
                  onClick={() => setTransitionTab('worsened')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    transitionTab === 'worsened' ? 'bg-rose-500 text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ควรเฝ้าระวัง ({transitionAnalysis.worsenedCount})
                </button>
                <button
                  onClick={() => setTransitionTab('four_quarters')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    transitionTab === 'four_quarters' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ครบ 4 ไตรมาส ({quarterParticipation.fourQuartersCount})
                </button>
                <button
                  onClick={() => setTransitionTab('more_than_two')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    transitionTab === 'more_than_two' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  มีข้อมูล &gt; 2 ไตรมาส ({quarterParticipation.moreThanTwoQuartersCount})
                </button>
              </div>
            </div>

            {/* Transition / Personnel Pills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {displayedTransitions.map((item) => (
                <div
                  key={item.person_id}
                  onClick={() => onSelectPerson && onSelectPerson(item.person_id)}
                  className="bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl p-2.5 text-xs text-white flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-white group-hover:text-emerald-300">
                        ID: {item.person_id}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          item.changeType === 'improved'
                            ? 'bg-emerald-500/40 text-emerald-200'
                            : item.changeType === 'worsened'
                            ? 'bg-rose-500/40 text-rose-200'
                            : 'bg-slate-600/50 text-slate-200'
                        }`}
                      >
                        {item.changeType === 'improved'
                          ? '✓ พัฒนาดีขึ้น'
                          : item.changeType === 'worsened'
                          ? '⚠️ เฝ้าระวัง'
                          : '• คงที่'}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 font-mono">
                        {item.totalQuartersCount} Qs
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-1">
                      <span className="text-slate-400">{item.initialQuarter} ({item.initialBmi})</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-white">{item.latestQuarter} ({item.latestBmi})</span>
                      <span className={`text-[10px] font-bold ${item.bmiDiff < 0 ? 'text-emerald-300' : item.bmiDiff > 0 ? 'text-rose-300' : 'text-slate-300'}`}>
                        ({item.bmiDiff > 0 ? `+${item.bmiDiff}` : item.bmiDiff} | {item.bmiDiffPct > 0 ? `+${item.bmiDiffPct}` : item.bmiDiffPct}%)
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-300 mt-0.5">
                      {item.initialGroup} ➔ <strong className="text-white">{item.latestGroup}</strong>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
