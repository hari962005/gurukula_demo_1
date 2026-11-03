import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Child } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  FileBarChart2,
  Download,
  FileText,
  Users,
  CheckSquare,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const res: any = await api.get('/children?status=all');
      if (res?.success) {
        setChildren(res.data || []);
        if (res.data.length > 0) setSelectedChildId(res.data[0]._id);
      }
    } catch (e) {
      // ignore
    }
  };

  const downloadChildPdf = () => {
    if (!selectedChildId) return;
    window.open(`/api/v1/reports/child-journey/${selectedChildId}/pdf`, '_blank');
  };

  const downloadFollowupsCsv = () => {
    window.open('/api/v1/reports/followups/csv', '_blank');
  };

  const downloadAdmissionsCsv = () => {
    window.open('/api/v1/reports/admissions/csv', '_blank');
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      <div className="pb-3 border-b border-[#EAE4D7]">
        <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
          <FileBarChart2 className="w-5 h-5 text-amber-600" />
          <span>Gurukula Reports & Institutional Data Exports</span>
        </h2>
        <p className="text-stone-500 text-[11px]">
          Downloadable holistic journey PDF reports, academic summaries, and privacy-protected tabular exports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Report 1: Individual Child Journey PDF */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B4332] flex items-center justify-center mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-stone-900">
              Individual Child Holistic Journey & Profile (PDF)
            </h3>
            <p className="text-stone-600 text-xs mt-1 leading-relaxed">
              Printable formal document detailing child identification, multi-year grade progression, qualitative rubric achievements, Vedic talents, responsibilities held, and honors. General health notes are automatically excluded to preserve child confidentiality.
            </p>

            <div className="mt-3">
              <label className="block font-semibold text-stone-700 mb-1">Select Student:</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-[#FDFBF7] text-stone-900 font-bold focus:outline-none"
              >
                {children.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.fullName} ({c.studentId}) — {c.currentGradeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={downloadChildPdf}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Download Journey PDF</span>
          </button>
        </div>

        {/* Report 2: Support Actions & Follow-ups CSV */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-stone-900">
              Support Actions & Corrective Follow-ups (CSV)
            </h3>
            <p className="text-stone-600 text-xs mt-1 leading-relaxed">
              Export comprehensive tracking table of all support actions across children, including concern or improvement goal, action taken, owner, due date, status, and outcome.
            </p>
          </div>

          <button
            onClick={downloadFollowupsCsv}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-stone-500" />
            <span>Export Follow-ups (CSV)</span>
          </button>
        </div>

        {/* Report 3: Admissions Pipeline CSV */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-stone-900">
              Admissions Enquiry & Candidates Pipeline (CSV)
            </h3>
            <p className="text-stone-600 text-xs mt-1 leading-relaxed">
              Tabular breakdown of applicant pool across all 8 exact admission statuses, interview dates, guardian contact numbers, next actions, and enrollment outcomes.
            </p>
          </div>

          <button
            onClick={downloadAdmissionsCsv}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-stone-500" />
            <span>Export Admissions Pipeline (CSV)</span>
          </button>
        </div>

        {/* Report 4: Privacy & Governance Statement */}
        <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#EAE4D7] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center mb-2">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-sm text-stone-900">
            Privacy & Access Protection Standards
          </h3>
          <p className="text-stone-600 text-xs leading-relaxed">
            In compliance with Gurukula institutional ethics and applicable privacy principles, sensitive well-being logs, guardian contact details, and private documents are protected by server-side permission gates and omitted from general public export streams.
          </p>
        </div>
      </div>
    </div>
  );
};
