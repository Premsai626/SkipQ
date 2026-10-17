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
        <div className="w-10 h-10 rounded-xl bg-[#FB7185]/10 text-[#FB7185] flex items-center justify-center shrink-0 border border-[#FB7185]/20">
          <FileText className="w-5 h-5" />
        </div>
      );
    }
    if (name.endsWith('.docx') || name.endsWith('.doc')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] flex items-center justify-center shrink-0 border border-[#00D4FF]/20">
          <FileCode className="w-5 h-5" />
        </div>
      );
    }
    if (name.endsWith('.pptx') || name.endsWith('.ppt')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24] flex items-center justify-center shrink-0 border border-[#FBBF24]/20">
          <Presentation className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-[#34D399]/10 text-[#34D399] flex items-center justify-center shrink-0 border border-[#34D399]/20">
        <ImageIcon className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-black text-[#F9FAFB] tracking-tight">Upload Your Documents</h2>
        <p className="text-sm text-[#9CA3AF] mt-1 font-normal">
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
            ? 'border-[#00D4FF] bg-[#00D4FF]/10 scale-[1.01]'
            : 'border-[#273244] hover:border-[#00D4FF]/40 bg-[#0D111B] hover:bg-[#1A2232]'
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

        <div className="w-16 h-16 rounded-2xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#00D4FF]/20 transition-all duration-200 shadow-xs">
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#F9FAFB] mb-1">
          {isUploading ? (
            'Uploading & encrypting documents...'
          ) : (
            <>
              Drag & drop files here, or{' '}
              <span className="text-[#00D4FF] underline underline-offset-2">browse files</span>
            </>
          )}
        </h3>
        <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-sm font-normal">
          Supports <span className="font-semibold text-[#F9FAFB]">PDF, DOCX, PPTX, JPG, PNG</span> up to 50MB. Secure backend processing.
        </p>
      </div>

      {/* Error Banner */}
      {uploadError && (
        <div className="p-3.5 rounded-2xl bg-[#FB7185]/10 border border-[#FB7185]/20 text-xs text-[#FB7185] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#FB7185] shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-[#FB7185] hover:underline font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Uploaded Files List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#F9FAFB]">
              Uploaded Documents ({documents.length})
            </h4>
            <span className="text-xs font-bold text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/25 px-3 py-1 rounded-full font-mono">
              Total {totalPages} page{totalPages !== 1 ? 's' : ''} to print
            </span>
          </div>

          <div className="space-y-2.5">
            {documents.map((doc) => {
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-[#0D111B] border border-[#273244] rounded-2xl hover:border-[#273244] transition-all backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {getDocIcon(doc)}

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#F9FAFB] truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {formatBytes(doc.size)} • {doc.type ? doc.type.split('/')[1]?.toUpperCase() : 'DOCUMENT'}
                        {doc.url && (
                          <span className="text-[#34D399] font-semibold ml-2">
                            • Upload Stored
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {/* Page counter */}
                    <div className="flex items-center gap-1.5 bg-[#080B12] border border-[#273244] px-3 py-1 rounded-xl">
                      <span className="text-xs text-[#6B7280] font-medium">Pages:</span>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={doc.pages}
                        onChange={(e) => updatePages(doc.id, parseInt(e.target.value, 10))}
                        className="w-12 text-center text-xs font-bold text-[#F9FAFB] font-mono bg-transparent focus:outline-none focus:ring-1 focus:ring-[#00D4FF] rounded"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="p-2 text-[#6B7280] hover:text-[#FB7185] hover:bg-[#FB7185]/10 rounded-xl transition-colors cursor-pointer"
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
      <div className="flex items-center justify-end pt-4 border-t border-[#273244]">
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
export default StepUpload;
