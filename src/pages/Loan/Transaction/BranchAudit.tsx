import React, { useState } from 'react';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Building, 
  User, 
  FileText
} from 'lucide-react';

export const BranchAuditPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          droppedFile.type === 'application/vnd.ms-excel' ||
          droppedFile.name.endsWith('.xlsx') || 
          droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
      } else {
        setError('Please upload an Excel file (.xlsx or .xls)');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.type === 'application/vnd.ms-excel' ||
          selectedFile.name.endsWith('.xlsx') || 
          selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
      } else {
        setError('Please upload an Excel file (.xlsx or .xls)');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setLoading(false);
      setSuccess('Branch audit file uploaded successfully!');
      setTimeout(() => {
        setSuccess('');
        setFile(null);
      }, 3000);
    }, 2000);
  };

  const downloadTemplate = () => {
    alert('Template download functionality will be implemented');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branch Audit</h1>
        <p className="text-gray-600 mt-1">Upload branch audit reports and track audit findings</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Branch Audit Uploader</h2>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Upload Instructions</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Upload Excel files only (.xlsx or .xls format)</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Use the template format for accurate processing</li>
                <li>• All required fields must be filled</li>
                <li>• Ensure branch codes match the system records</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Template Download */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-900">Download Template</h4>
              <p className="text-sm text-gray-500">Get the Excel template with required columns</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <span>Download Template</span>
          </button>
        </div>

        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : file
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {file ? (
            <div className="space-y-3">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <div>
                <p className="text-lg font-medium text-green-800">{file.name}</p>
                <p className="text-sm text-green-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="inline-flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
              >
                <XCircle className="w-4 h-4" />
                <span>Remove file</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your Excel file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports Excel files up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Audit Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audit Summary Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Audit Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <Building className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Branches Audited</p>
                <p className="text-xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Compliant Branches</p>
                <p className="text-xl font-bold text-gray-900">9</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Non-Compliant Branches</p>
                <p className="text-xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Last Audit Upload</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">January 15, 2024</span>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Uploaded by: Admin User</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};