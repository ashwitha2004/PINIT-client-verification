import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, AlertCircle, Clock, Filter, Search, Download, Trash2 } from "lucide-react";

interface VerificationRecord {
  id: string;
  fileName: string;
  timestamp: string;
  status: 'authentic' | 'suspicious' | 'fake' | 'error';
  detectionType: string;
  confidence?: number;
  issues: string[];
}

const DetectionResult = () => {
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<VerificationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'authentic' | 'suspicious' | 'fake' | 'error'>('all');

  useEffect(() => {
    loadVerifications();
  }, []);

  useEffect(() => {
    filterVerifications();
  }, [verifications, searchTerm, statusFilter]);

  const loadVerifications = () => {
    try {
      const stored = localStorage.getItem('recentVerifications');
      if (stored) {
        const records = JSON.parse(stored);
        setVerifications(records);
      }
    } catch (error) {
      console.error('Error loading verifications:', error);
    }
  };

  const filterVerifications = () => {
    let filtered = verifications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.detectionType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    setFilteredVerifications(filtered);
  };

  const clearAllVerifications = () => {
    if (window.confirm('Are you sure you want to clear all verification history?')) {
      localStorage.removeItem('recentVerifications');
      setVerifications([]);
      setFilteredVerifications([]);
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(filteredVerifications, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `verification_results_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authentic':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'suspicious':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'fake':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authentic':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'suspicious':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'fake':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: verifications.length,
      authentic: verifications.filter(v => v.status === 'authentic').length,
      suspicious: verifications.filter(v => v.status === 'suspicious').length,
      fake: verifications.filter(v => v.status === 'fake').length,
      error: verifications.filter(v => v.status === 'error').length
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-gradient-to-r from-slate-950/95 via-indigo-950/95 to-slate-950/95 backdrop-blur-xl border-b border-indigo-500/30 px-4 py-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/home")}
              className="p-2 hover:bg-indigo-500/20 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-indigo-400" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">Detection Results</h1>
              <p className="text-xs text-indigo-300">Verification history and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportResults}
              className="p-2 hover:bg-indigo-500/20 rounded-lg transition-all"
              title="Export Results"
            >
              <Download className="w-5 h-5 text-indigo-400" />
            </button>
            <button
              onClick={clearAllVerifications}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
              title="Clear All"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.authentic}</div>
            <div className="text-xs text-green-400">Authentic</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.suspicious}</div>
            <div className="text-xs text-yellow-400">Suspicious</div>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.fake}</div>
            <div className="text-xs text-red-400">Fake</div>
          </div>
          <div className="bg-gray-900/20 border border-gray-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">{stats.error}</div>
            <div className="text-xs text-gray-400">Error</div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by filename or detection type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="all">All Status</option>
                <option value="authentic">Authentic</option>
                <option value="suspicious">Suspicious</option>
                <option value="fake">Fake</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredVerifications.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center">
              <Clock className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Verification Results</h3>
              <p className="text-slate-400 mb-6">
                {verifications.length === 0 
                  ? "Start verifying images to see results here"
                  : "No results match your current filters"
                }
              </p>
              {verifications.length === 0 && (
                <button
                  onClick={() => navigate("/verify-proof")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Start Verifying
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVerifications.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800/70 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="text-white font-medium">{record.fileName}</p>
                        <p className="text-slate-400 text-sm">{record.detectionType}</p>
                        {record.confidence && (
                          <p className="text-slate-500 text-xs">
                            Confidence: {(record.confidence * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                        {record.status.toUpperCase()}
                      </span>
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {record.issues && record.issues.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-1">Issues:</p>
                      <div className="flex flex-wrap gap-1">
                        {record.issues.map((issue, idx) => (
                          <span key={idx} className="text-xs bg-slate-900/50 px-2 py-1 rounded text-slate-300">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DetectionResult;
