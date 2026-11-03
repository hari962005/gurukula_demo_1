import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Child, DocumentItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Files, Upload, Download, Clock, Lock, FileText, CheckCircle, X } from 'lucide-react';

const DOC_TYPES = [
  'Child Photograph',
  'Birth Certificate',
  'Prior Academic Record',
  'Achievement Certificate',
  'General Well-being Note',
  'Guardian Identity Document',
  'Other Document',
];

export const DocumentsPage: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload Modal
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [accessLevel, setAccessLevel] = useState<'public_staff' | 'coordinator_only' | 'restricted'>('public_staff');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchDocuments(selectedChildId);
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

  const fetchDocuments = async (cId: string) => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/documents/child/${cId}`);
      if (res?.success) setDocuments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId || !file || !title.trim()) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('childId', selectedChildId);
      formData.append('title', title.trim());
      formData.append('documentType', docType);
      formData.append('accessLevel', accessLevel);

      await api.upload('/documents/upload', formData);
      setShowModal(false);
      setFile(null);
      setTitle('');
      fetchDocuments(selectedChildId);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <Files className="w-5 h-5 text-amber-600" />
            <span>Child Document Vault & Certificates</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Server-managed private document storage with role-based access control.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1 shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
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

        <div className="text-[11px] text-stone-500">
          Documents: <strong>{documents.length}</strong>
        </div>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-400 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#1B4332]" />
          <span>Loading document records...</span>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE4D7] text-stone-500">
          No documents uploaded for this child yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((d) => (
            <div
              key={d._id}
              className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="font-bold text-stone-900 text-sm truncate" title={d.title}>
                    {d.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-600 font-medium">
                    {d.documentType}
                  </span>
                </div>

                <div className="text-[10px] text-stone-500 space-y-0.5 mt-2">
                  <div>Type: {d.mimeType}</div>
                  <div>Size: {Math.round(d.fileSizeBytes / 1024)} KB</div>
                  <div>Access: <strong className="text-stone-700">{d.accessLevel}</strong></div>
                  <div>Uploaded by: {d.uploadedByName}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] text-stone-400">
                  {new Date(d.createdAt).toLocaleDateString()}
                </span>
                <a
                  href={`/api/v1/documents/download/${d._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] text-[10px] flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download / View</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <h3 className="font-serif font-bold text-sm text-[#1B4332]">Upload Child Document</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Birth Certificate / Gita Chanting Certificate"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Document Category</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Access Level</label>
                  <select
                    value={accessLevel}
                    onChange={(e: any) => setAccessLevel(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="public_staff">All Staff</option>
                    <option value="coordinator_only">Coordinators & Admin</option>
                    <option value="restricted">Admin Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select File (PDF, Image, Doc) *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-700"
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
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F]"
                >
                  {isUploading ? 'Uploading...' : 'Upload & Encrypt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
