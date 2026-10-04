import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { DocumentItem } from '../../types';
import { formatBytes } from '../../utils/formatting';
import { Button } from '../ui/Button';
import { documentsApi } from '../../services/api';

interface StepUploadProps {
  documents: DocumentItem[];
  onChange: (docs: DocumentItem[]) => void;
  onNext: () => void;
}

export const StepUpload: React.FC<StepUploadProps> = ({ documents, onChange, onNext }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const uploadedDocs: DocumentItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate client size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        setUploadError(`File ${file.name} exceeds the 50MB campus limit.`);
        continue;
      }

      try {
        const doc = await documentsApi.upload(file);
        uploadedDocs.push(doc);
      } catch (err) {
        setUploadError((err as Error).message || `Failed to upload ${file.name}`);
      }
    }

    if (uploadedDocs.length > 0) {
      onChange([...documents, ...uploadedDocs]);
    }
    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeDocument = (id: string) => {
    onChange(documents.filter((d) => d.id !== id));
  };

  const updatePages = (id: string, pages: number) => {
    const safePages = Math.max(1, Math.min(500, pages || 1));
    onChange(
      documents.map((d) => (d.id === id ? { ...d, pages: safePages } : d))
    );
  };

  const totalPages = documents.reduce((sum, d) => sum + d.pages, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Upload Your Documents</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload PDF lecture notes, lab manuals, assignments, or image scans to print.
        </p>
      </div>

      {/* Drag & drop upload box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center group ${
          isDragging
            ? 'border-brand-500 bg-brand-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-brand-50/20'
        } ${isUploading ? 'opacity-75 cursor-wait' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-100 transition-all duration-200 shadow-xs">
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
          {isUploading ? (
            'Uploading documents to campus server...'
          ) : (
            <>
              Drag & drop files here, or{' '}
              <span className="text-brand-600 underline underline-offset-2">browse</span>
            </>
          )}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
          Supports <span className="font-semibold text-slate-700">PDF, JPG, PNG</span> up to 50MB. Secure backend processing.
        </p>
      </div>

      {/* Error Banner */}
      {uploadError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Uploaded Files List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">
              Uploaded Documents ({documents.length})
            </h4>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              Total {totalPages} page{totalPages !== 1 ? 's' : ''} to print
            </span>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => {
              const isPdf = doc.type.includes('pdf') || doc.name.endsWith('.pdf');
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPdf ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(doc.size)} • {doc.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
                        {doc.url && (
                          <span className="text-emerald-600 font-medium ml-2">
                            • Server Verified
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {/* Page counter */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                      <span className="text-xs text-slate-500 font-medium">Pages:</span>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={doc.pages}
                        onChange={(e) => updatePages(doc.id, parseInt(e.target.value, 10))}
                        className="w-12 text-center text-xs font-bold text-slate-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-brand-500 rounded"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation CTA */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-200">
        <Button
          onClick={onNext}
          disabled={documents.length === 0 || isUploading}
          isLoading={isUploading}
          size="lg"
          rightIcon={<CheckCircle2 className="w-5 h-5" />}
        >
          Proceed to Configuration ({documents.length} File{documents.length !== 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  );
};
