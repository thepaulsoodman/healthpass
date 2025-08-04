'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { demoTaceoService, DemoProofResult } from '@/lib/demo-taceo-service';
import { verificationService, VerificationResult } from '@/lib/verification-service';
import { qrService, QRCodeData } from '@/lib/qr-service';
import Modal from '@/components/Modal';

const demoUsers = [
  {
    id: 'alice',
    name: 'Alice',
    age: 25,
    vaccinated: true,
    healthStatus: 'excellent',
    description: 'Fully vaccinated, excellent health'
  },
  {
    id: 'bob',
    name: 'Bob',
    age: 17,
    vaccinated: false,
    healthStatus: 'good',
    description: 'Partially vaccinated, minor health issues'
  },
  {
    id: 'carol',
    name: 'Carol',
    age: 45,
    vaccinated: true,
    healthStatus: 'excellent',
    description: 'Fully vaccinated, excellent health'
  }
];

const proofTypes = [
  { id: 'vaccination', name: 'Vaccination Status', description: 'TACEO CoSNARK proof for vaccination verification' },
  { id: 'age', name: 'Age Verification', description: 'TACEO CoSNARK proof for age requirement verification' },
  { id: 'health', name: 'Health Requirements', description: 'TACEO CoSNARK proof for health status verification' }
];

export default function HealthPassDemo() {
  const [selectedUser, setSelectedUser] = useState(demoUsers[0]);
  const [selectedProofType, setSelectedProofType] = useState(proofTypes[0]);
  const [proofResult, setProofResult] = useState<DemoProofResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  const handleGenerateProof = async () => {
    setIsGenerating(true);
    setIsAnimating(true);
    setProofResult(null);
    setVerificationResult(null);
    setQrCodeData(null);
    setQrCodeImage(null);
    setShowVerificationModal(false);
    setShowQRModal(false);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const result = await demoTaceoService.generateProof(
        selectedUser,
        selectedProofType.id as 'vaccination' | 'age' | 'health'
      );

      setProofResult(result);
    } catch (error) {
      setProofResult({
        success: false,
        message: `Error: ${error}`,
        details: {
          privateDataHidden: [],
          publicVerification: [],
          circuitInfo: { name: '', constraints: 0, provingTime: 0, description: '' },
          networkInfo: { infrastructureStatus: 'Operational', processingTime: 0, networkFee: '' },
          taceoFeatures: []
        }
      });
    } finally {
      setIsGenerating(false);
      setIsAnimating(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!proofResult?.success || !proofResult.proof) return;

    setIsVerifying(true);
    setVerificationResult(null);
    setShowVerificationModal(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const result = await verificationService.verifyProof(
        proofResult.proof.proofId,
        proofResult.proof.verificationKey
      );

      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({
        success: false,
        verified: false,
        verificationTime: 0,
        message: `Error: ${error}`,
        details: {
          proofId: proofResult.proof.proofId,
          verificationKey: proofResult.proof.verificationKey,
          verificationStatus: 'FAILED',
          systemStatus: 'ERROR'
        }
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!proofResult?.success || !proofResult.proof) return;

    setIsGeneratingQR(true);
    setQrCodeData(null);
    setQrCodeImage(null);
    setShowQRModal(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const qrData = qrService.generateQRData(
        proofResult.proof.proofId,
        proofResult.proof.verificationKey,
        proofResult.proof.proofData,
        proofResult.details.networkInfo
      );

      const qrImage = await qrService.generateQRCodeImage(qrData);

      setQrCodeData(qrData);
      setQrCodeImage(qrImage);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const formatVerificationResult = (result: VerificationResult) => {
    return `${result.message}\n\n` +
           `⏱️ Verification time: ${result.verificationTime}ms\n` +
           `🔍 Verification status: ${result.details.verificationStatus}\n` +
           `⚡ System status: ${result.details.systemStatus}`;
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black py-8 px-4 font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.h1 
            className="text-4xl font-bold text-white mb-4 font-mono"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileTap={{ scale: 0.95 }}
          >
            HealthPass Demo
          </motion.h1>
          <motion.button
            onClick={() => setShowHowItWorksModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg font-mono text-sm"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            How it works?
          </motion.button>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div 
            className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-2xl p-6"
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)" }}
            transition={{ duration: 0.3 }}
            drag
            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
            dragElastic={0.1}
            whileDrag={{ scale: 1.05, boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.9)" }}
          >
            <motion.h2 
              className="text-2xl font-semibold mb-6 text-white font-mono"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              Demo Controls
            </motion.h2>

            <div className="mb-6">
              <motion.h3 
                className="text-lg font-medium mb-3 text-slate-300 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                Select Demo User:
              </motion.h3>
              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence>
                  {demoUsers.map((user, index) => (
                    <motion.button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 font-mono ${
                        selectedUser.id === user.id
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-slate-700 hover:border-blue-400 bg-black/40 text-slate-300 hover:text-white'
                      }`}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      layout
                    >
                      <div className="text-left">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm opacity-80">{user.description}</div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="mb-6">
              <motion.h3 
                className="text-lg font-medium mb-3 text-slate-300 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.8 }}
              >
                Generate TACEO CoSNARK Proof:
              </motion.h3>
              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence>
                  {proofTypes.map((proofType, index) => (
                    <motion.button
                      key={proofType.id}
                      onClick={() => setSelectedProofType(proofType)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 font-mono ${
                        selectedProofType.id === proofType.id
                          ? 'border-emerald-500 bg-emerald-500/20 text-white'
                          : 'border-slate-500 hover:border-emerald-400 bg-black/40 text-slate-300 hover:text-white'
                      }`}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 2 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      layout
                    >
                      <div className="text-left">
                        <div className="font-medium">{proofType.name}</div>
                        <div className="text-sm opacity-80">{proofType.description}</div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <motion.button
              onClick={handleGenerateProof}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg font-mono relative overflow-hidden"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.4 }}
            >
              {isGenerating ? (
                <motion.div 
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  ></motion.div>
                  <span>Generating TACEO Proof...</span>
                </motion.div>
              ) : (
                'Generate Proof'
              )}
            </motion.button>
          </motion.div>

          <motion.div 
            className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-2xl p-6"
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)" }}
            transition={{ duration: 0.3 }}
            drag
            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
            dragElastic={0.1}
            whileDrag={{ scale: 1.05, boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.9)" }}
          >
            <motion.h2 
              className="text-2xl font-semibold mb-6 text-white font-mono"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              TACEO Proof Results
            </motion.h2>

            <AnimatePresence mode="wait">
              {proofResult ? (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="space-y-4">
                    {proofResult.success && proofResult.proof ? (
                      <>
                        <motion.div 
                          className="text-sm text-slate-200 font-mono"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          ✅ {proofResult.message}
                        </motion.div>
                        
                        <motion.div 
                          className="bg-gradient-to-r from-black via-gray-900 to-black rounded-lg p-4 border-2 border-red-800/50 shadow-lg group cursor-pointer transition-all duration-500 hover:bg-gradient-to-r hover:from-black/20 hover:via-gray-900/20 hover:to-black/20 hover:backdrop-blur-sm"
                          whileHover={{ rotateY: 5 }}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                        >
                          <div className="flex items-center mb-3">
                            <motion.span 
                              className="text-yellow-400 mr-2"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                            >
                              🔒
                            </motion.span>
                            <h4 className="text-yellow-400 font-semibold font-mono">Private Data Hidden:</h4>
                          </div>
                          <div className="space-y-1 transition-all duration-500 group-hover:blur-sm group-hover:opacity-50">
                            {proofResult.details.privateDataHidden.map((item, index) => (
                              <motion.div 
                                key={index} 
                                className="text-slate-300 font-mono text-sm ml-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                              >
                                - {item}
                              </motion.div>
                            ))}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                            <motion.div 
                              className="text-center text-yellow-400 font-mono text-sm bg-yellow-500/90 backdrop-blur-md rounded-lg p-4 border border-yellow-400/50 shadow-lg"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.4, delay: 0.2 }}
                            >
                              <div className="text-black font-bold mb-2">🔐 BACKEND PRIVACY</div>
                              <div className="text-black font-medium">100% Data Protection</div>
                              <div className="text-black/80 text-xs mt-1">Zero-Knowledge Proofs</div>
                              <div className="text-black/80 text-xs">Multi-Party Computation</div>
                            </motion.div>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="bg-black/40 rounded-lg p-4 border border-slate-700/50"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                        >
                          <div className="flex items-center mb-3">
                            <span className="text-blue-400 mr-2">📋</span>
                            <h4 className="text-blue-400 font-semibold font-mono">Public Verification:</h4>
                          </div>
                          <div className="space-y-1">
                            {proofResult.details.publicVerification.map((item, index) => (
                              <motion.div 
                                key={index} 
                                className="text-slate-200 font-mono text-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                              >
                                {item}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="bg-black/40 rounded-lg p-4 border border-slate-700/50"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.2 }}
                        >
                          <div className="space-y-2 text-sm font-mono">
                            <motion.div 
                              className={`text-slate-200 transition-all duration-2000 ease-in-out ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                              animate={isAnimating ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                              transition={{ duration: 2, delay: 0.3 }}
                            >
                              <span className="text-emerald-400">Proof ID:</span> {proofResult.proof.proofId}
                            </motion.div>
                            <motion.div 
                              className={`text-slate-200 transition-all duration-2000 ease-in-out delay-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                              animate={isAnimating ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                              transition={{ duration: 2, delay: 0.6 }}
                            >
                              <span className="text-emerald-400">🔐 Verification Key:</span> {proofResult.proof.verificationKey}
                            </motion.div>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="bg-black/40 rounded-lg p-4 border border-slate-700/50"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.4 }}
                        >
                          <div className="flex items-center mb-3">
                            <motion.span 
                              className="text-purple-400 mr-2"
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                              ⚡
                            </motion.span>
                            <h4 className="text-purple-400 font-semibold font-mono">Circuit Info:</h4>
                          </div>
                          <div className="space-y-1 text-sm font-mono">
                            <div className="text-slate-200">- Circuit: {proofResult.details.circuitInfo.name}</div>
                            <div className="text-slate-200">- Description: {proofResult.details.circuitInfo.description}</div>
                            <div className="text-slate-200">- Constraints: {proofResult.details.circuitInfo.constraints}</div>
                            <div className="text-slate-200">- Proving time: {proofResult.details.circuitInfo.provingTime}ms</div>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="bg-black/40 rounded-lg p-4 border border-slate-700/50"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.6 }}
                        >
                          <div className="flex items-center mb-3">
                            <span className="text-orange-400 mr-2">🔬</span>
                            <h4 className="text-orange-400 font-semibold font-mono">TACEO Features Used:</h4>
                          </div>
                          <div className="space-y-1">
                            {proofResult.details.taceoFeatures.map((feature, index) => (
                              <motion.div 
                                key={index} 
                                className="text-slate-200 font-mono text-sm ml-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 1.8 + index * 0.1 }}
                              >
                                - {feature}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    ) : (
                      <motion.div 
                        className="text-red-400 font-mono"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        ❌ {proofResult.message}
                      </motion.div>
                    )}
                  </div>
                  
                  {proofResult.success && (
                    <motion.div 
                      className="flex space-x-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 2 }}
                    >
                      <motion.button 
                        onClick={handleVerifyProof}
                        disabled={isVerifying}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg font-mono relative overflow-hidden"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isVerifying ? (
                          <div className="flex items-center justify-center">
                            <span>Verifying...</span>
                          </div>
                        ) : (
                          'Verify Proof'
                        )}
                      </motion.button>
                      <motion.button 
                        onClick={handleGenerateQR}
                        disabled={isGeneratingQR}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg font-mono relative overflow-hidden"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isGeneratingQR ? (
                          <div className="flex items-center justify-center">
                            <span>Generating...</span>
                          </div>
                        ) : (
                          'Generate QR Code'
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center text-slate-400 py-12 font-mono"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 border-2 border-slate-700 rounded-full flex items-center justify-center"
                    animate={{ 
                      rotate: [0, 360],
                      borderColor: ["#475569", "#3b82f6", "#475569"]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      borderColor: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                    whileHover={{ rotate: 180 }}
                  >
                    <motion.svg 
                      className="w-8 h-8 text-slate-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ 
                        stroke: ["#64748b", "#3b82f6", "#64748b"]
                      }}
                      transition={{ 
                        stroke: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </motion.svg>
                  </motion.div>
                  <motion.p
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Select a user and proof type, then generate a TACEO CoSNARK proof
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-8 text-center text-sm text-slate-400 font-mono"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.p 
            whileHover={{ color: "#60a5fa" }}
            transition={{ duration: 0.3 }}
          >
            This demo showcases TACEO:Proof network integration with CoSNARK
          </motion.p>
          <motion.p 
            whileHover={{ color: "#a78bfa" }}
            transition={{ duration: 0.3 }}
          >
            Powered by Zero-Knowledge Proofs and Multi-Party Computation
          </motion.p>
        </motion.div>
      </div>

      <AnimatePresence>
        {showVerificationModal && (
          <Modal
            isOpen={showVerificationModal}
            onClose={() => setShowVerificationModal(false)}
            title="Proof Verification"
          >
            {verificationResult ? (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="bg-black/40 rounded-lg p-4 border border-slate-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <pre className="whitespace-pre-wrap text-sm text-emerald-200 font-mono">
                    {formatVerificationResult(verificationResult)}
                  </pre>
                </motion.div>
                <div className="text-center">
                                  <motion.button
                  onClick={() => setShowVerificationModal(false)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg font-mono"
                  whileTap={{ scale: 0.95 }}
                >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-slate-300 font-mono">Verifying proof on TACEO network...</p>
              </motion.div>
            )}
          </Modal>
        )}

        {showQRModal && (
          <Modal
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            title="QR Code"
          >
            {qrCodeData && qrCodeImage ? (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.img 
                    src={qrCodeImage} 
                    alt="TACEO Proof QR Code" 
                    className="border-2 border-violet-400 rounded-lg"
                    whileHover={{ rotate: 2 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                
                <motion.div 
                  className="bg-black/40 p-3 rounded border border-slate-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h4 className="text-sm font-medium text-slate-200 mb-2 font-mono">QR Code Data:</h4>
                  <div className="bg-black/60 p-2 rounded border border-slate-700/50">
                    <pre className="text-xs text-slate-300 font-mono break-all whitespace-pre-wrap">
                      {qrService.generateQRCodeText(qrCodeData)}
                    </pre>
                  </div>
                </motion.div>
                
                <p className="text-sm text-slate-300 text-center font-mono">
                  Scan this QR code to verify the TACEO proof
                </p>
                
                <div className="text-center">
                  <motion.button
                    onClick={() => setShowQRModal(false)}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg font-mono"
                    whileTap={{ scale: 0.95 }}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-slate-300 font-mono">Generating QR code...</p>
              </motion.div>
            )}
          </Modal>
        )}

        {showHowItWorksModal && (
          <Modal
            isOpen={showHowItWorksModal}
            onClose={() => setShowHowItWorksModal(false)}
            title="How TACEO CoSNARK Works"
          >
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="bg-black/40 rounded-lg p-4 border border-slate-700/50"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h4 className="text-lg font-semibold text-blue-400 mb-3 font-mono">TACEO CoSNARK Technology</h4>
                <div className="space-y-3 text-sm text-slate-200 font-mono">
                  <p>This demo shows how TACEO&apos;s collaborative zero-knowledge proof system works in real-world health verification scenarios.</p>
                  
                  <div className="space-y-2">
                    <p>The demo showcases CoSNARK technology enabling collaborative SNARK proof generation across multiple parties.</p>
                    
                    <p>It demonstrates Multi-Party Computation for privacy-preserving data processing where sensitive health information remains protected.</p>
                    
                    <p>The system uses Zero-Knowledge Proofs to prove statements without revealing underlying data, ensuring Privacy Protection where private data stays hidden while only proof verification becomes visible.</p>
                    
                    <p>Finally, it demonstrates proof verification through TACEO&apos;s collaborative network infrastructure.</p>
                  </div>
                  
                  <p className="text-xs text-slate-400 mt-2">Note: This demo simulates TACEO&apos;s concepts without using actual coCircom or Noir implementations.</p>
                </div>
              </motion.div>

              <motion.div 
                className="bg-black/40 rounded-lg p-4 border border-slate-700/50"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h4 className="text-lg font-semibold text-emerald-400 mb-3 font-mono">Data Flow</h4>
                <div className="space-y-3 text-sm text-slate-200 font-mono">
                  {[
                    'User selects a demo scenario and proof type',
                    'System generates TACEO proof with privacy protection',
                    'Proof details are displayed with private data hidden',
                    'User can verify proof or generate QR code for sharing',
                    'Proof verification confirms validity through TACEO&apos;s verification system'
                  ].map((step, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    >
                      <motion.div 
                        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white min-w-[2rem] min-h-[2rem]"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        {index + 1}
                      </motion.div>
                      <span>{step}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <div className="text-center">
                <motion.button
                  onClick={() => setShowHowItWorksModal(false)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg font-mono"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Got it!
                </motion.button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}