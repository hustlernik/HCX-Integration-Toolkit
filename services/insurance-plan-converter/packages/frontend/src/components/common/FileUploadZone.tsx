import { useCallback } from 'react';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  acceptedFormats?: string;
}

export const FileUploadZone = ({
  onFileSelect,
  selectedFile,
  acceptedFormats = '.xlsx,.xls,.pdf',
}: FileUploadZoneProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const clearFile = () => {
    onFileSelect(null as any);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            'border-2 border-dashed border-gray-300 rounded-xl p-8',
            'hover:border-blue-400 hover:bg-blue-50/50 transition-colors',
            'cursor-pointer group',
          )}
        >
          <input
            type="file"
            accept={acceptedFormats}
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop your file here, or click to browse
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Supports Excel (.xlsx, .xls) and PDF files up to 10MB
              </p>
              <div className="flex justify-center space-x-4 text-xs text-gray-400">
                <span className="px-2 py-1 bg-gray-100 rounded">XLSX</span>
                <span className="px-2 py-1 bg-gray-100 rounded">XLS</span>
                <span className="px-2 py-1 bg-gray-100 rounded">PDF</span>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="border-2 border-blue-200 bg-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <File className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{' '}
                  {selectedFile.type || 'Unknown type'}
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
