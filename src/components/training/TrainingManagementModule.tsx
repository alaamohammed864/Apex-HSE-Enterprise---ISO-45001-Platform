import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrainingCourseModel,
  EmployeeTrainingRecordModel,
  TrainingRecordStatus,
} from '../../types/phase7';
import { phase7Service } from '../../services/phase7Service';

export const TrainingManagementModule: React.FC = () => {
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'MATRIX' | 'RECORDS' | 'COURSES'>('MATRIX');
  const [courses, setCourses] = useState<TrainingCourseModel[]>([]);
  const [records, setRecords] = useState<EmployeeTrainingRecordModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');

  // Modals
  const [selectedRecord, setSelectedRecord] = useState<EmployeeTrainingRecordModel | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourseModel | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState<EmployeeTrainingRecordModel | null>(null);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [crsList, recList] = await Promise.all([
        phase7Service.getTrainingCourses(),
        phase7Service.getEmployeeTrainingRecords(),
      ]);
      setCourses(crsList);
      setRecords(recList);
    } catch (err) {
      console.error('Failed to load training data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        searchTerm === '' ||
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeBadge.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.certificateNumber && r.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchCourse = courseFilter === 'ALL' || r.courseId === courseFilter;
      return matchSearch && matchStatus && matchCourse;
    });
  }, [records, searchTerm, statusFilter, courseFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = records.length;
    const valid = records.filter((r) => r.status === 'VALID').length;
    const expiring = records.filter((r) => r.status === 'EXPIRING').length;
    const expired = records.filter((r) => r.status === 'EXPIRED').length;
    const notCompleted = records.filter((r) => r.status === 'NOT COMPLETED').length;
    const complianceRate = total > 0 ? Math.round((valid / total) * 100) : 0;
    return { total, valid, expiring, expired, notCompleted, complianceRate };
  }, [records]);

  // Distinct employees for the matrix view
  const matrixEmployees = useMemo(() => {
    const map = new Map<string, { employeeId: string; name: string; badge: string; contractor: string; trade: string }>();
    records.forEach((r) => {
      if (!map.has(r.employeeId)) {
        map.set(r.employeeId, {
          employeeId: r.employeeId,
          name: r.employeeName,
          badge: r.employeeBadge,
          contractor: r.contractor,
          trade: r.tradeRole,
        });
      }
    });
    return Array.from(map.values());
  }, [records]);

  // Create or edit record
  const handleOpenNewRecord = () => {
    const now = new Date();
    const newRec: EmployeeTrainingRecordModel = {
      id: `TR-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      employeeName: '',
      employeeBadge: `QA-${Math.floor(1000 + Math.random() * 9000)}`,
      contractor: 'CCC Consortium',
      department: 'Construction',
      tradeRole: 'Technician',
      courseId: courses[0]?.id || 'CRS-IND-01',
      courseTitle: courses[0]?.title || 'HSE General Site Induction',
      trainingDate: now.toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      certificateNumber: `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
      trainer: 'Dr. Tariq Al-Mansoor',
      trainingProvider: 'Apex HSE Academy',
      scoreAchievedPercent: 95,
      status: 'VALID',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    setSelectedRecord(newRec);
    setIsRecordModalOpen(true);
  };

  const handleSaveRecord = async () => {
    if (!selectedRecord) return;
    try {
      await phase7Service.saveTrainingRecord(selectedRecord);
      showToast(`Training record for ${selectedRecord.employeeName} saved.`);
      setIsRecordModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Error saving training record.');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (confirm(`Delete training record ${id}?`)) {
      await phase7Service.deleteTrainingRecord(id);
      showToast('Record deleted.');
      loadData();
    }
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
              ISO 45001:2018 §7.2 Competence
            </span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">
              Worker Training &amp; Competency Passport
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
            Training Management &amp; Expiry Tracking
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Full compliance passport for 13 technical courses, live matrix grid, certificate issuance, and automated 30-day renewal alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenNewRecord}
            className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            <span>+ Log Training Record</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#45464d] uppercase font-mono">Compliance Rate</div>
          <div className="text-2xl font-bold font-mono text-[#006c4a] mt-0.5">
            {stats.complianceRate}%
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Target: &gt;= 92%</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#15803d] uppercase font-mono">Valid Certs</div>
          <div className="text-2xl font-bold text-[#15803d] mt-0.5">{stats.valid}</div>
          <div className="text-[10px] text-[#15803d] mt-0.5">Active &amp; verified</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#a16207] uppercase font-mono">Expiring (&lt; 30d)</div>
          <div className="text-2xl font-bold text-[#a16207] mt-0.5">{stats.expiring}</div>
          <div className="text-[10px] text-[#a16207] mt-0.5">Refresher required</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-[#ba1a1a] uppercase font-mono">Expired</div>
          <div className="text-2xl font-bold text-[#ba1a1a] mt-0.5">{stats.expired}</div>
          <div className="text-[10px] text-[#ba1a1a] mt-0.5">Site access suspended</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs">
          <div className="text-[11px] text-gray-500 uppercase font-mono">Total Recorded</div>
          <div className="text-2xl font-bold text-gray-900 mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Across {courses.length} courses</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#c6c6cd]/30 gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('MATRIX')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'MATRIX'
              ? 'border-[#006c4a] text-[#006c4a] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">grid_on</span>
          <span>1. Training Matrix Grid</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RECORDS')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'RECORDS'
              ? 'border-[#006c4a] text-[#006c4a] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">badge</span>
          <span>2. Employee Records &amp; Expiry Tracker ({records.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COURSES')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'COURSES'
              ? 'border-[#006c4a] text-[#006c4a] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">school</span>
          <span>3. Training Course Catalogue ({courses.length} Standards)</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE TRAINING MATRIX GRID */}
      {activeTab === 'MATRIX' && (
        <div className="bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs overflow-hidden">
          <div className="p-4 bg-[#eff4ff] border-b border-[#c6c6cd]/20 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#0b1c30]">
                Live Worker vs Course Competency Matrix
              </h3>
              <p className="text-xs text-[#45464d] mt-0.5">
                Displays valid, expiring, and expired certifications across all active site technicians.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span>VALID</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span>EXPIRING (&lt;30d)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>EXPIRED</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                <span>NOT COMPLETED</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9ff] text-gray-600 font-mono text-[10px] uppercase border-b">
                <tr>
                  <th className="py-2.5 px-3 sticky left-0 bg-[#f8f9ff] z-10">Worker &amp; Badge</th>
                  <th className="py-2.5 px-3">Contractor / Trade</th>
                  {courses.map((crs) => (
                    <th key={crs.id} className="py-2.5 px-2 text-center min-w-[80px]" title={crs.title}>
                      <span className="truncate block max-w-[90px]">{crs.code}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {matrixEmployees.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-[#eff4ff]/40">
                    <td className="py-2.5 px-3 font-medium sticky left-0 bg-white z-10 shadow-xs">
                      <div className="font-bold text-gray-900">{emp.name}</div>
                      <div className="text-[10px] font-mono text-gray-500">{emp.badge}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-gray-700">{emp.contractor}</div>
                      <div className="text-[10px] text-gray-400">{emp.trade}</div>
                    </td>

                    {courses.map((crs) => {
                      const rec = records.find(
                        (r) => r.employeeId === emp.employeeId && r.courseId === crs.id
                      );
                      const status: TrainingRecordStatus = rec ? rec.status : 'NOT COMPLETED';
                      return (
                        <td key={crs.id} className="py-2.5 px-2 text-center">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                              status === 'VALID'
                                ? 'bg-green-100 text-green-800'
                                : status === 'EXPIRING'
                                ? 'bg-yellow-100 text-yellow-800 animate-pulse'
                                : status === 'EXPIRED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                            title={rec ? `Expiry: ${rec.expiryDate}` : 'Not taken'}
                          >
                            {status === 'NOT COMPLETED' ? '—' : status}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE RECORDS & EXPIRY TRACKER */}
      {activeTab === 'RECORDS' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search worker, badge, contractor, course, certificate..."
                className="w-full text-xs bg-transparent border-0 focus:ring-0 outline-hidden text-[#0b1c30]"
              />
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-mono text-[11px]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#eff4ff] border border-gray-300 rounded px-2 py-1 font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="VALID">VALID</option>
                  <option value="EXPIRING">EXPIRING</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="NOT COMPLETED">NOT COMPLETED</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-mono text-[11px]">Course:</span>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="bg-[#eff4ff] border border-gray-300 rounded px-2 py-1 font-medium max-w-[200px] truncate"
                >
                  <option value="ALL">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eff4ff] text-gray-600 font-mono text-[11px] uppercase border-b">
                  <tr>
                    <th className="py-3 px-4">Worker &amp; Badge</th>
                    <th className="py-3 px-4">Contractor &amp; Trade</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Training Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Certificate #</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500 font-mono">
                        Loading records...
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        No training records match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{r.employeeName}</div>
                          <div className="text-[11px] font-mono text-gray-500">{r.employeeBadge}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-700">{r.contractor}</div>
                          <div className="text-[11px] text-gray-400">{r.tradeRole}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">
                          <div className="font-semibold text-gray-900 truncate">{r.courseTitle}</div>
                          <div className="text-[10px] text-gray-400">Trainer: {r.trainer}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">{r.trainingDate || '—'}</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span
                            className={
                              r.status === 'EXPIRED'
                                ? 'text-red-600'
                                : r.status === 'EXPIRING'
                                ? 'text-yellow-600'
                                : 'text-gray-900'
                            }
                          >
                            {r.expiryDate || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#006c4a] font-bold">
                          {r.certificateNumber || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold ${
                              r.status === 'VALID'
                                ? 'bg-green-100 text-green-800'
                                : r.status === 'EXPIRING'
                                ? 'bg-yellow-100 text-yellow-800 animate-pulse'
                                : r.status === 'EXPIRED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingCertificate(r)}
                              className="p-1 rounded text-gray-600 hover:text-black"
                              title="View Certificate"
                            >
                              <span className="material-symbols-outlined text-[16px]">verified</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRecord(JSON.parse(JSON.stringify(r)));
                                setIsRecordModalOpen(true);
                              }}
                              className="p-1 rounded text-gray-600 hover:text-black"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRecord(r.id)}
                              className="p-1 rounded text-red-400 hover:text-red-600"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COURSE CATALOGUE */}
      {activeTab === 'COURSES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((crs) => (
            <div
              key={crs.id}
              className="bg-white rounded-xl border border-[#c6c6cd]/30 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#e2f1ff] text-[#004f80]">
                    {crs.code}
                  </span>
                  <span className="font-mono text-[10px] text-gray-500 font-bold">
                    Validity: {crs.validityMonths} Mo
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#0b1c30] mt-2">{crs.title}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-3">{crs.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-[#006c4a] font-bold">
                  Passing: {crs.passingScorePercent}%
                </span>
                {crs.mandatoryBeforeSiteEntry && (
                  <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] font-mono text-[9px] font-bold">
                    MANDATORY
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log / Edit Training Record Modal */}
      {isRecordModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#c6c6cd]/30 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#006c4a]">{selectedRecord.id}</span>
                <h2 className="text-lg font-bold text-[#0b1c30]">Employee Training Record</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#0b1c30]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Employee Full Name</label>
                  <input
                    type="text"
                    value={selectedRecord.employeeName}
                    onChange={(e) =>
                      setSelectedRecord({ ...selectedRecord, employeeName: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Badge ID</label>
                  <input
                    type="text"
                    value={selectedRecord.employeeBadge}
                    onChange={(e) =>
                      setSelectedRecord({ ...selectedRecord, employeeBadge: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Contractor</label>
                  <input
                    type="text"
                    value={selectedRecord.contractor}
                    onChange={(e) =>
                      setSelectedRecord({ ...selectedRecord, contractor: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Trade Role</label>
                  <input
                    type="text"
                    value={selectedRecord.tradeRole}
                    onChange={(e) =>
                      setSelectedRecord({ ...selectedRecord, tradeRole: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Course</label>
                <select
                  value={selectedRecord.courseId}
                  onChange={(e) => {
                    const c = courses.find((item) => item.id === e.target.value);
                    setSelectedRecord({
                      ...selectedRecord,
                      courseId: e.target.value,
                      courseTitle: c?.title || '',
                    });
                  }}
                  className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-medium"
                >
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>
                      {crs.code} - {crs.title} ({crs.validityMonths} Mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Training Date</label>
                  <input
                    type="date"
                    value={selectedRecord.trainingDate || ''}
                    onChange={(e) => {
                      const tDate = e.target.value;
                      const crs = courses.find((c) => c.id === selectedRecord.courseId);
                      const validity = crs?.validityMonths || 12;
                      const d = new Date(tDate);
                      d.setMonth(d.getMonth() + validity);
                      const exp = d.toISOString().split('T')[0];
                      setSelectedRecord({
                        ...selectedRecord,
                        trainingDate: tDate,
                        expiryDate: exp,
                      });
                    }}
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={selectedRecord.expiryDate || ''}
                    onChange={(e) =>
                      setSelectedRecord({ ...selectedRecord, expiryDate: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Certificate #</label>
                  <input
                    type="text"
                    value={selectedRecord.certificateNumber || ''}
                    onChange={(e) =>
                      setSelectedRecord({ ...selectedRecord, certificateNumber: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Score %</label>
                  <input
                    type="number"
                    value={selectedRecord.scoreAchievedPercent || 90}
                    onChange={(e) =>
                      setSelectedRecord({
                        ...selectedRecord,
                        scoreAchievedPercent: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Trainer</label>
                  <input
                    type="text"
                    value={selectedRecord.trainer}
                    onChange={(e) =>
                      setSelectedRecord({ ...selectedRecord, trainer: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRecord}
                className="px-5 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e]"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {viewingCertificate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border-4 border-[#006c4a] space-y-5 text-center font-sans animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-mono text-xs text-[#006c4a] font-bold">
                ISO 45001 Competency Passport
              </span>
              <button
                type="button"
                onClick={() => setViewingCertificate(null)}
                className="text-gray-400 hover:text-black"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="w-16 h-16 rounded-full bg-[#006c4a] text-white mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">workspace_premium</span>
            </div>

            <div>
              <div className="font-mono text-[11px] text-gray-400 uppercase tracking-widest">
                Certificate of Competence
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                {viewingCertificate.employeeName}
              </h2>
              <div className="text-xs font-mono text-gray-500">
                Badge: {viewingCertificate.employeeBadge} • {viewingCertificate.contractor}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border text-xs space-y-1">
              <div className="text-gray-500 font-mono">Has successfully qualified in:</div>
              <div className="font-bold text-base text-[#006c4a]">
                {viewingCertificate.courseTitle}
              </div>
              <div className="text-[11px] text-gray-500 mt-2 font-mono">
                Certificate #{viewingCertificate.certificateNumber}
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                Issued: {viewingCertificate.trainingDate} | Valid Until: {viewingCertificate.expiryDate}
              </div>
            </div>

            <div className="text-[10px] text-gray-400 font-mono">
              Authorized Trainer: {viewingCertificate.trainer} • Apex HSE Academy
            </div>

            <button
              type="button"
              onClick={() => {
                showToast('Certificate passport card sent to printer.');
                setViewingCertificate(null);
              }}
              className="px-6 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e]"
            >
              Print Competency Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
