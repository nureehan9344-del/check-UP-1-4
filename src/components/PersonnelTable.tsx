import React, { useState, useMemo } from 'react';
import {
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  X,
} from 'lucide-react';
import { BMIGroup, PersonSummary, Quarter } from '../types';
import { getBMIGroupColor } from '../data/dataset';

interface PersonnelTableProps {
  persons: PersonSummary[];
  activeQuarter?: Quarter | 'ALL';
  onSelectPerson: (personId: string) => void;
}

export const PersonnelTable: React.FC<PersonnelTableProps> = ({
  persons,
  onSelectPerson,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'any_missing' | 'missing_q4'>('all');
  const [sortField, setSortField] = useState<
    'person_id' | 'bmi' | 'muscle_mass' | 'body_fat_percentage' | 'fat_change_pct' | 'muscle_change_pct'
  >('person_id');
  const [sortAsc, setSortAsc] = useState(true);

  const pageSize = 15;

  // Counts for the simple select filter
  const counts = useMemo(() => {
    let complete = 0;
    let anyMissing = 0;
    let missingQ4 = 0;

    persons.forEach((p) => {
      const hasQ1 = !!p.quarters.Q1;
      const hasQ2 = !!p.quarters.Q2;
      const hasQ3 = !!p.quarters.Q3;
      const hasQ4 = !!p.quarters.Q4;

      if (p.completeness === 'complete') {
        complete++;
      } else {
        anyMissing++;
      }

      if (hasQ1 && hasQ2 && hasQ3 && !hasQ4) {
        missingQ4++;
      }
    });

    return { complete, anyMissing, missingQ4 };
  }, [persons]);

  // Filtered list based on search and simple dropdown
  const filteredPersons = useMemo(() => {
    return persons.filter((p) => {
      const hasQ1 = !!p.quarters.Q1;
      const hasQ2 = !!p.quarters.Q2;
      const hasQ3 = !!p.quarters.Q3;
      const hasQ4 = !!p.quarters.Q4;

      // Status filter
      if (statusFilter === 'complete' && p.completeness !== 'complete') return false;
      if (statusFilter === 'any_missing' && p.completeness === 'complete') return false;
      if (statusFilter === 'missing_q4' && !(hasQ1 && hasQ2 && hasQ3 && !hasQ4)) return false;

      // Search query filter (search by ID or status)
      if (tableSearch.trim()) {
        const query = tableSearch.trim().toLowerCase();
        const idMatch = p.person_id.toLowerCase().includes(query);
        const groupMatch = p.bmiGroup.toLowerCase().includes(query);
        const missingMatch = query.includes('ขาด') && p.completeness !== 'complete';
        const q4MissingMatch = (query.includes('q4') || query.includes('4')) && !hasQ4;

        if (!idMatch && !groupMatch && !missingMatch && !q4MissingMatch) {
          return false;
        }
      }

      return true;
    });
  }, [persons, statusFilter, tableSearch]);

  // Sorting
  const sortedPersons = useMemo(() => {
    return [...filteredPersons].sort((a, b) => {
      let valA: any = a.person_id;
      let valB: any = b.person_id;

      const qLatestA = a.quarters.Q4 || a.quarters.Q3 || a.quarters.Q2 || a.quarters.Q1;
      const qLatestB = b.quarters.Q4 || b.quarters.Q3 || b.quarters.Q2 || b.quarters.Q1;

      if (sortField === 'bmi') {
        valA = qLatestA?.bmi ?? 0;
        valB = qLatestB?.bmi ?? 0;
      } else if (sortField === 'muscle_mass') {
        valA = qLatestA?.muscle_mass ?? 0;
        valB = qLatestB?.muscle_mass ?? 0;
      } else if (sortField === 'body_fat_percentage') {
        valA = qLatestA?.body_fat_percentage ?? 0;
        valB = qLatestB?.body_fat_percentage ?? 0;
      } else if (sortField === 'fat_change_pct') {
        valA = a.fatPercentageChangePct ?? 999;
        valB = b.fatPercentageChangePct ?? 999;
      } else if (sortField === 'muscle_change_pct') {
        valA = a.muscleMassChangePct ?? -999;
        valB = b.muscleMassChangePct ?? -999;
      }

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredPersons, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedPersons.length / pageSize) || 1;
  const paginatedPersons = sortedPersons.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <section className="mb-6">
      {/* Header Bar: Clean & Minimal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            ทำเนียบบุคลากร (Personnel Directory)
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
            {sortedPersons.length.toLocaleString()} ท่าน
          </span>
        </div>

        {/* Clean Controls (No button rows) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหารหัส ID เช่น 47154..."
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-52 pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
            {tableSearch && (
              <button
                onClick={() => {
                  setTableSearch('');
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
          >
            <option value="all">ข้อมูลทั้งหมด ({persons.length.toLocaleString()})</option>
            <option value="missing_q4">ขาดไตรมาส 4 ({counts.missingQ4.toLocaleString()})</option>
            <option value="any_missing">ข้อมูลไม่ครบ #N/A ({counts.anyMissing.toLocaleString()})</option>
            <option value="complete">ครบ 4 ไตรมาส ({counts.complete.toLocaleString()})</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th
                  onClick={() => handleSort('person_id')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Person ID</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">กลุ่ม BMI</th>
                <th className="py-2.5 px-2 text-center">ส่วนสูง</th>
                <th className="py-2.5 px-2 text-center">Q1 BMI</th>
                <th className="py-2.5 px-2 text-center">Q2 BMI</th>
                <th className="py-2.5 px-2 text-center">Q3 BMI</th>
                <th
                  onClick={() => handleSort('bmi')}
                  className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Q4 BMI</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('muscle_mass')}
                  className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>มวลกล้ามเนื้อ</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-2 text-center">ไขมันช่องท้อง</th>
                <th
                  onClick={() => handleSort('fat_change_pct')}
                  className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>%Δ ไขมัน</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">สถานะการตรวจ</th>
                <th className="py-2.5 px-3 text-center">ดูข้อมูล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPersons.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลบุคลากรตามเงื่อนไขที่ระบุ
                  </td>
                </tr>
              ) : (
                paginatedPersons.map((p) => {
                  const q1 = p.quarters.Q1;
                  const q2 = p.quarters.Q2;
                  const q3 = p.quarters.Q3;
                  const q4 = p.quarters.Q4;

                  const isMissingQ4 = !!q1 && !!q2 && !!q3 && !q4;
                  const isMissingQ1 = !q1 && !!q2 && !!q3 && !!q4;
                  const isMissingQ2 = !!q1 && !q2 && !!q3 && !!q4;
                  const isMissingQ3 = !!q1 && !!q2 && !q3 && !!q4;

                  const isOnlyQ4 = !!q4 && !q1 && !q2 && !q3;
                  const isOnlyQ1 = !!q1 && !q2 && !q3 && !q4;
                  const isOnlyQ2 = !!q2 && !q1 && !q3 && !q4;
                  const isOnlyQ3 = !!q3 && !q1 && !q2 && !q4;

                  const qLatest = q4 || q3 || q2 || q1;

                  return (
                    <tr
                      key={p.person_id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onSelectPerson(p.person_id)}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {p.person_id}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getBMIGroupColor(
                            p.bmiGroup
                          )}`}
                        >
                          {p.bmiGroup}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-600">{p.height}</td>

                      {/* Q1 BMI */}
                      <td className="py-2.5 px-2 text-center font-mono text-xs">
                        {q1?.bmi ? (
                          <span>
                            {q1.bmi.toFixed(1)}{' '}
                            <span className="text-slate-400 text-[10px]">({q1.body_fat_percentage}%)</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">#N/A</span>
                        )}
                      </td>

                      {/* Q2 BMI */}
                      <td className="py-2.5 px-2 text-center font-mono text-xs">
                        {q2?.bmi ? (
                          <span>
                            {q2.bmi.toFixed(1)}{' '}
                            <span className="text-slate-400 text-[10px]">({q2.body_fat_percentage}%)</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">#N/A</span>
                        )}
                      </td>

                      {/* Q3 BMI */}
                      <td className="py-2.5 px-2 text-center font-mono text-xs">
                        {q3?.bmi ? (
                          <span>
                            {q3.bmi.toFixed(1)}{' '}
                            <span className="text-slate-400 text-[10px]">({q3.body_fat_percentage}%)</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">#N/A</span>
                        )}
                      </td>

                      {/* Q4 BMI */}
                      <td className="py-2.5 px-2 text-center font-mono text-xs">
                        {q4?.bmi ? (
                          <span>
                            {q4.bmi.toFixed(1)}{' '}
                            <span className="text-slate-400 text-[10px]">({q4.body_fat_percentage}%)</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium" title="ไม่มีข้อมูลในไตรมาส 4">#N/A</span>
                        )}
                      </td>

                      {/* Muscle Mass */}
                      <td className="py-2.5 px-2 text-center font-mono text-slate-800">
                        {qLatest?.muscle_mass ? `${qLatest.muscle_mass} kg` : <span className="text-slate-400 font-medium">#N/A</span>}
                      </td>

                      {/* Visceral Fat */}
                      <td className="py-2.5 px-2 text-center font-mono">
                        {qLatest?.visceral_fat ? (
                          <span
                            className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                              qLatest.visceral_fat >= 10
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {qLatest.visceral_fat} Lv
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">#N/A</span>
                        )}
                      </td>

                      {/* Fat Change % */}
                      <td className="py-2.5 px-2 text-center font-mono text-xs">
                        {p.fatPercentageChangePct !== null ? (
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium ${
                              p.fatPercentageChangePct <= 0
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-rose-700 bg-rose-50'
                            }`}
                          >
                            {p.fatPercentageChangePct <= 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            {p.fatPercentageChangePct > 0 ? `+${p.fatPercentageChangePct}` : p.fatPercentageChangePct}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>

                      {/* Status Column: Integrates quarter presence directly */}
                      <td className="py-2.5 px-3 text-center">
                        {isMissingQ4 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            ขาดไตรมาส 4 (ตรวจ 3 Q)
                          </span>
                        ) : isMissingQ1 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            ขาดไตรมาส 1 (ตรวจ 3 Q)
                          </span>
                        ) : isMissingQ2 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            ขาดไตรมาส 2 (ตรวจ 3 Q)
                          </span>
                        ) : isMissingQ3 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            ขาดไตรมาส 3 (ตรวจ 3 Q)
                          </span>
                        ) : isOnlyQ4 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            เข้าตรวจ Q4
                          </span>
                        ) : isOnlyQ1 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            เข้าตรวจ Q1
                          </span>
                        ) : isOnlyQ2 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            เข้าตรวจ Q2
                          </span>
                        ) : isOnlyQ3 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            เข้าตรวจ Q3
                          </span>
                        ) : p.completeness === 'complete' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ครบ 4 ไตรมาส
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            ตรวจ {p.quartersCount}/4 ไตรมาส
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPerson(p.person_id);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="ดูรายละเอียดข้อมูลรายบุคคล"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Pagination Bar */}
        <div className="bg-slate-50/70 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            หน้า <strong>{currentPage}</strong> จาก <strong>{totalPages}</strong> (ทั้งหมด {sortedPersons.length.toLocaleString()} ท่าน)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>ก่อนหน้า</span>
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <span>ถัดไป</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
