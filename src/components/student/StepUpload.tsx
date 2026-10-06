import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, Loader2, FileCode, Presentation } from 'lucide-react';
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

  const getDocIcon = (doc: DocumentItem) => {
    const name = (doc.name || doc.filename || '').toLowerCase();
    if (name.endsWith('.pdf')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
          <FileText className="w-5 h-5" />
        </div>
      );
    }
    if (name.endsWith('.docx') || name.endsWith('.doc')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
          <FileCode className="w-5 h-5" />
        </div>
      );
    }
    if (name.endsWith('.pptx') || name.endsWith('.ppt')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
          <Presentation className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
        <ImageIcon className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Upload Your Documents</h2>
        <p className="text-sm text-white/50 mt-1 font-normal">
          Upload PDF lecture notes, lab manuals, DOCX reports, PPTX presentations, or image scans to print.
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
            ? 'border-[#CCFF00] bg-[#CCFF00]/10 scale-[1.01]'
            : 'border-white/15 hover:border-[#CCFF00]/40 bg-white/5 hover:bg-white/[0.08]'
        } ${isUploading ? 'opacity-75 cursor-wait' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.pptx,.ppt,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <div className="w-16 h-16 rounded-2xl bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#CCFF00]/20 transition-all duration-200 shadow-xs">
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#CCFF00]" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white mb-1">
          {isUploading ? (
            'Uploading & encrypting documents...'
          ) : (
            <>
              Drag & drop files here, or{' '}
              <span className="text-[#CCFF00] underline underline-offset-2">browse files</span>
            </>
          )}
        </h3>
        <p className="text-xs sm:text-sm text-white/50 max-w-sm font-normal">
          Supports <span className="font-semibold text-white/80">PDF, DOCX, PPTX, JPG, PNG</span> up to 50MB. Secure backend processing.
        </p>
      </div>

      {/* Error Banner */}
      {uploadError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-rose-300 font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Uploaded Files List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">
              Uploaded Documents ({documents.length})
            </h4>
            <span className="text-xs font-bold text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-3 py-1 rounded-full font-mono">
              Total {totalPages} page{totalPages !== 1 ? 's' : ''} to print
            </span>
          </div>

          <div className="space-y-2.5">
            {documents.map((doc) => {
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {getDocIcon(doc)}

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {formatBytes(doc.size)} • {doc.type ? doc.type.split('/')[1]?.toUpperCase() : 'DOCUMENT'}
                        {doc.url && (
                          <span className="text-emerald-400 font-semibold ml-2">
                            • Upload Stored
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {/* Page counter */}
                    <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-3 py-1 rounded-xl">
                      <span className="text-xs text-white/40 font-medium">Pages:</span>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={doc.pages}
                        onChange={(e) => updatePages(doc.id, parseInt(e.target.value, 10))}
                        className="w-12 text-center text-xs font-bold text-white font-mono bg-transparent focus:outline-none focus:ring-1 focus:ring-[#CCFF00] rounded"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
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
      <div className="flex items-center justify-end pt-4 border-t border-white/10">
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
