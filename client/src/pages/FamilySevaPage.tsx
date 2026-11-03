import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Child, Guardian, FamilySevaItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Home, Plus, Clock, HeartHandshake, Phone, Mail, X } from 'lucide-react';

const SEVA_ACTIVITIES = [
  'Vedic Chanting / Teaching Workshop',
  'Organic Farming & Harvest Seva',
  'Campus Maintenance & Shramadaan',
  'Festival & Utsav Organization',
  'Healthcare & Traditional Medicine Support',
  'Library & Books / Translation Contribution',
  'Culinary & Kitchen Support during Gatherings',
  'Material & Resource Contribution',
  'Other Seva',
];

export const FamilySevaPage: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [sevaRecords, setSevaRecords] = useState<FamilySevaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [contributorName, setContributorName] = useState('');
  const [relationship, setRelationship] = useState('Mother');
  const [activityType, setActivityType] = useState(SEVA_ACTIVITIES[0]);
  const [description, setDescription] = useState('');
  const [hoursOrContribution, setHoursOrContribution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchFamilyData(selectedChildId);
    }
  }, [selectedChildId]);

  const fetchChildren = async () => {
    try {
      const res: any = await api.get('/children?status=active');
      if (res?.success) {
        setChildren(res.data || []);
        if (res.data.length > 0) setSelectedChildId(res.data[0]._id);
      }
    } catch (e) {}
    finally { setIsLoading(false); }
  };

  const fetchFamilyData = async (cId: string) => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/family/${cId}`);
      if (res?.success) {
        setGuardians(res.data?.guardians || []);
        setSevaRecords(res.data?.sevaRecords || []);
        if (res.data?.guardians?.length > 0) {
          setContributorName(res.data.guardians[0].fullName);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSeva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId || !contributorName.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/family/seva', {
        childId: selectedChildId,
        contributorName: contributorName.trim(),
        relationship,
        activityType,
        description: description.trim(),
        hoursOrContribution: hoursOrContribution.trim() || undefined,
      });
      setShowModal(false);
      setDescription('');
      setHoursOrContribution('');
      fetchFamilyData(selectedChildId);
    } catch (err: any) {
      alert(err.message || 'Failed to save seva record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-600" />
            <span>Family & Gurukula Seva Involvement</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Recording parent partnerships, skills, and active volunteer service to the Gurukula ecosystem.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Family Seva</span>
        </button>
      </div>

      {/* Child Selector */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-stone-700">Select Child:</label>
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-[#FDFBF7] text-stone-900 font-bold focus:outline-none"
          >
            {children.map((c) => (
              <option key={c._id} value={c._id}>
                {c.fullName} ({c.studentId}) — {c.currentGradeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-stone-400 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#1B4332]" />
          <span>Loading family data...</span>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Section 1: Guardians */}
          <div>
            <h3 className="font-serif font-bold text-sm text-stone-900 mb-2.5">
              Registered Parents & Guardians
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guardians.map((g) => (
                <div key={g._id} className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-sm">{g.fullName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4EFE6] text-stone-700">
                      {g.relationship}
                    </span>
                  </div>

                  <div className="text-stone-600">Primary Phone: <strong>{g.primaryPhone}</strong></div>
                  {g.email && <div className="text-stone-600">Email: {g.email}</div>}
                  <div className="text-stone-600">Occupation: {g.occupation || '—'}</div>

                  {g.skillsAndInterests && g.skillsAndInterests.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] text-stone-400 block mb-1">Talents & Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {g.skillsAndInterests.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-900 border border-amber-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {g.canContributeSeva && (
                    <div className="text-[10px] text-emerald-800 font-semibold pt-1">
                      ✓ Registered for Gurukula Seva Shramadaan
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Seva Involvement History */}
          <div>
            <h3 className="font-serif font-bold text-sm text-stone-900 mb-2.5 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-emerald-700" />
              <span>Family Seva Contributions & Service Log</span>
            </h3>

            {sevaRecords.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-[#EAE4D7] text-stone-500">
                No Seva participation records logged yet for this family.
              </div>
            ) : (
              <div className="space-y-3">
                {sevaRecords.map((s) => (
                  <div
                    key={s._id}
                    className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">
                        {s.contributorName} ({s.relationship})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {s.activityType}
                      </span>
                    </div>

                    <p className="text-stone-700 text-xs bg-[#FDFBF7] p-2.5 rounded-xl border border-stone-100">
                      "{s.description}"
                    </p>

                    {s.hoursOrContribution && (
                      <div className="text-[11px] text-amber-900 font-medium">
                        Contribution: {s.hoursOrContribution}
                      </div>
                    )}

                    <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100 flex items-center justify-between">
                      <span>Date: {new Date(s.date).toLocaleDateString()}</span>
                      <span>Recorded by: {s.recordedByName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <h3 className="font-serif font-bold text-sm text-[#1B4332]">Record Family Seva Contribution</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSeva} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Contributor Name *</label>
                <input
                  type="text"
                  required
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Seva Activity Domain</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                >
                  {SEVA_ACTIVITIES.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description of Seva & Contribution *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe workshop taught, organic farming guidance, festival preparation, material contribution..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Hours / Scope</label>
                <input
                  type="text"
                  value={hoursOrContribution}
                  onChange={(e) => setHoursOrContribution(e.target.value)}
                  placeholder="e.g. 10 Hours or Indigenous Seed Donation"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F]"
                >
                  {isSubmitting ? 'Saving...' : 'Save Seva Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
