import { useState } from 'react';
import { ChevronDown, ChevronUp, Upload, Download, Trash2, FileText, Eye } from 'lucide-react';
import { FilePreviewModal } from './FilePreviewModal';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface FileItem {
  id: string;
  name: string;
  type: string;
  path: string;
  uploadedAt: string;
}

interface Course {
  id: string;
  name: string;
  files: FileItem[];
}

interface CourseSectionProps {
  course: Course;
  semesterId: string;
  onFileUpload: (semesterId: string, courseId: string, file: File) => void;
  onDeleteFile: (semesterId: string, courseId: string, fileId: string) => void;
  isAdmin: boolean;
}

export function CourseSection({
  course,
  semesterId,
  onFileUpload,
  onDeleteFile,
  isAdmin,
}: CourseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ file: FileItem; url: string } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onFileUpload(semesterId, course.id, file);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const getFileUrl = async (file: FileItem) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/files/${encodeURIComponent(file.path)}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  };

  const handlePreview = async (file: FileItem) => {
    const url = await getFileUrl(file);
    if (url) {
      setPreviewFile({ file, url });
    }
  };

  const handleDownload = async (file: FileItem) => {
    const url = await getFileUrl(file);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
    if (type.includes('excel') || type.includes('sheet')) return '📈';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="group border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
        <div
          className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold">{course.name}</h4>
                <p className="text-sm text-purple-400/60">{course.files.length} file tersimpan</p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-purple-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-300" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 bg-black/20 backdrop-blur-sm">
            {isAdmin && ( 
              <div className="mb-4">
                <label className="group/upload flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-indigo-500/30 rounded-xl cursor-pointer hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300">
                  <Upload className={`w-5 h-5 text-indigo-400 ${uploading ? 'animate-bounce' : ''}`} />
                  <span className="text-indigo-300 font-semibold">
                    {uploading ? 'Mengupload...' : 'Upload File Materi'}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.py,.js,.java,.cpp,.c,.html,.css"
                  />
                </label>
                <p className="text-xs text-purple-400/50 mt-2 text-center">
                  Mendukung: PDF, Word, PowerPoint, Excel, Gambar, Video, File Programming, dll.
                </p>
              </div>
            )} 

            {course.files.length === 0 ? (
              <p className="text-center py-8 text-purple-300/50">
                Belum ada file. Upload file materi untuk mata kuliah ini.
              </p>
            ) : (
              <div className="space-y-2">
                {course.files.map((file) => (
                  <div
                    key={file.id}
                    className="group/file flex items-center justify-between p-4 bg-black/30 backdrop-blur-sm rounded-xl hover:bg-black/40 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-3xl">{getFileIcon(file.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{file.name}</p>
                        <p className="text-xs text-purple-400/60">
                          Diupload {formatDate(file.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    
                    {/* DIV DI BAWAH INI SUDAH DIUBAH AGAR SELALU MUNCUL */}
                    <div className="flex items-center gap-2 transition-opacity">
                      <button
                        onClick={() => handlePreview(file)}
                        className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all hover:scale-110"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all hover:scale-110"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {isAdmin && ( 
                        <button
                          onClick={() => onDeleteFile(semesterId, course.id, file.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all hover:scale-110"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {previewFile && (
        <FilePreviewModal
          file={previewFile.file}
          fileUrl={previewFile.url}
          onClose={() => setPreviewFile(null)}
          onDownload={() => {
            handleDownload(previewFile.file);
            setPreviewFile(null);
          }}
        />
      )}
    </>
  );
}
