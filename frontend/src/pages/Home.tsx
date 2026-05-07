import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Upload, Search, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { appStorage } from "@/lib/storage";

interface RecentVerification {
  id: string;
  fileName: string;
  timestamp: string;
  status: 'authentic' | 'suspicious' | 'fake' | 'error';
  detectionType: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("User");
  const [recentVerifications, setRecentVerifications] = useState<RecentVerification[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedName = await appStorage.getItem("biovault_userName");
        if (savedName) {
          setUserName(savedName);
        } else {
          const localName = localStorage.getItem("biovault_userName");
          if (localName) {
            setUserName(localName);
          }
        }
      } catch (e) {
        console.error("Error loading user name:", e);
      }
    };

    const loadRecentVerifications = async () => {
      try {
        const stored = localStorage.getItem("recentVerifications");
        if (stored) {
          const verifications = JSON.parse(stored);
          setRecentVerifications(verifications.slice(0, 3)); // Show only last 3
        }
      } catch (e) {
        console.error("Error loading recent verifications:", e);
      }
    };

    loadUserData();
    loadRecentVerifications();
  }, []);

  const handleLogout = async () => {
    try {
      await appStorage.removeItem("biovault_token");
      await appStorage.removeItem("biovault_refresh_token");
      await appStorage.removeItem("biovault_userId");
    } catch (e) {
      console.error("Error clearing appStorage:", e);
    }
    
    localStorage.removeItem("biovault_token");
    localStorage.removeItem("biovault_refresh_token");
    localStorage.removeItem("biovault_userId");
    
    navigate("/login", { replace: true });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authentic':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'suspicious':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'fake':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-gradient-to-r from-slate-950/95 via-purple-950/95 to-slate-950/95 backdrop-blur-xl border-b border-purple-500/30 px-4 py-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/50">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Welcome, {userName}</p>
              <p className="text-xs text-purple-300">PINIT Verification Platform</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-all hover:shadow-lg hover:shadow-red-500/50"
          >
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-700 to-indigo-700 shadow-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            PINIT Verification Platform
          </h1>
          
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Secure image encryption and advanced watermark verification for authentic content protection
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/encrypt")}
            className="group relative overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-600 p-8 rounded-2xl border border-cyan-500/30 transition-all duration-300"
          >
            <div className="relative z-10">
              <Upload className="w-12 h-12 mb-4 text-cyan-100" />
              <h3 className="text-2xl font-bold mb-2 text-white">Encrypt Image</h3>
              <p className="text-cyan-100 text-sm">
                Apply advanced watermarking and encryption to protect your images
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/verify-proof")}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-2xl border border-purple-500/30 transition-all duration-300"
          >
            <div className="relative z-10">
              <Search className="w-12 h-12 mb-4 text-purple-100" />
              <h3 className="text-2xl font-bold mb-2 text-white">Verify Proof</h3>
              <p className="text-purple-100 text-sm">
                Analyze and verify watermarks to detect authenticity and manipulation
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>
        </motion.div>

        {/* Recent Verifications */}
        {recentVerifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Recent Verifications</h2>
            </div>
            
            <div className="space-y-3">
              {recentVerifications.map((verification) => (
                <motion.div
                  key={verification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(verification.status)}
                    <div>
                      <p className="text-white font-medium">{verification.fileName}</p>
                      <p className="text-gray-400 text-sm">{verification.detectionType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(verification.status)}`}>
                      {verification.status.toUpperCase()}
                    </span>
                    <p className="text-gray-500 text-xs mt-1">{verification.timestamp}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button
              onClick={() => navigate("/detection-result")}
              className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              View All Results →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;
