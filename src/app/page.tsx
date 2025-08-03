'use client';

import { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black py-8 px-4 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 font-mono">
            HealthPass Demo
          </h1>
          <button
            onClick={() => setShowHowItWorksModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg font-mono text-sm"
          >
            How it works?
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-2xl p-6">
            <h2 className="text-2xl font-semibold mb-6 text-white font-mono">
              Demo Controls
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-slate-300 font-mono">
                Select Demo User:
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {demoUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 font-mono ${
                      selectedUser.id === user.id
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-slate-700 hover:border-blue-400 bg-black/40 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm opacity-80">{user.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-slate-300 font-mono">
                Generate TACEO CoSNARK Proof:
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {proofTypes.map((proofType) => (
                  <button
                    key={proofType.id}
                    onClick={() => setSelectedProofType(proofType)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 font-mono ${
                      selectedProofType.id === proofType.id
                        ? 'border-emerald-500 bg-emerald-500/20 text-white'
                        : 'border-slate-700 hover:border-emerald-400 bg-black/40 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{proofType.name}</div>
                      <div className="text-sm opacity-80">{proofType.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateProof}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg font-mono relative overflow-hidden"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Generating TACEO Proof...</span>
                </div>
              ) : (
                'Generate Proof'
              )}
            </button>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-2xl p-6">
            <h2 className="text-2xl font-semibold mb-6 text-white font-mono">
              TACEO Proof Results
            </h2>

            {proofResult ? (
              <div className="space-y-4">
                <div className="space-y-4">
                  {proofResult.success && proofResult.proof ? (
                    <>
                      <div className="text-sm text-slate-200 font-mono">
                        ✅ {proofResult.message}
                      </div>
                      
                      <div className="bg-gradient-to-r from-black via-gray-900 to-black rounded-lg p-4 border-2 border-red-800/50 shadow-lg group cursor-pointer transition-all duration-500 hover:bg-gradient-to-r hover:from-black/20 hover:via-gray-900/20 hover:to-black/20 hover:backdrop-blur-sm">
                        <div className="flex items-center mb-3">
                          <span className="text-yellow-400 mr-2">🔒</span>
                          <h4 className="text-yellow-400 font-semibold font-mono">Private Data Hidden:</h4>
                        </div>
                        <div className="space-y-1 transition-all duration-500 group-hover:blur-sm group-hover:opacity-50">
                          {proofResult.details.privateDataHidden.map((item, index) => (
                            <div key={index} className="text-slate-300 font-mono text-sm ml-4">
                              - {item}
                            </div>
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                          <div className="text-center text-yellow-400 font-mono text-sm bg-black/80 backdrop-blur-md rounded-lg p-4 border border-yellow-500/30">
                            <div className="text-yellow-300 font-bold mb-2">🔐 BACKEND PRIVACY</div>
                            <div className="text-yellow-200">100% Data Protection</div>
                            <div className="text-yellow-100 text-xs mt-1">Zero-Knowledge Proofs</div>
                            <div className="text-yellow-100 text-xs">Multi-Party Computation</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-4 border border-slate-700/50">
                        <div className="flex items-center mb-3">
                          <span className="text-blue-400 mr-2">📋</span>
                          <h4 className="text-blue-400 font-semibold font-mono">Public Verification:</h4>
                        </div>
                        <div className="space-y-1">
                          {proofResult.details.publicVerification.map((item, index) => (
                            <div key={index} className="text-slate-200 font-mono text-sm">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-4 border border-slate-700/50">
                        <div className="space-y-2 text-sm font-mono">
                          <div className={`text-slate-200 transition-all duration-2000 ease-in-out ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                            <span className="text-emerald-400">Proof ID:</span> {proofResult.proof.proofId}
                          </div>
                          <div className={`text-slate-200 transition-all duration-2000 ease-in-out delay-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                            <span className="text-emerald-400">🔐 Verification Key:</span> {proofResult.proof.verificationKey}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-4 border border-slate-700/50">
                        <div className="flex items-center mb-3">
                          <span className="text-purple-400 mr-2">⚡</span>
                          <h4 className="text-purple-400 font-semibold font-mono">Circuit Info:</h4>
                        </div>
                        <div className="space-y-1 text-sm font-mono">
                          <div className="text-slate-200">- Circuit: {proofResult.details.circuitInfo.name}</div>
                          <div className="text-slate-200">- Description: {proofResult.details.circuitInfo.description}</div>
                          <div className="text-slate-200">- Constraints: {proofResult.details.circuitInfo.constraints}</div>
                          <div className="text-slate-200">- Proving time: {proofResult.details.circuitInfo.provingTime}ms</div>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-4 border border-slate-700/50">
                        <div className="flex items-center mb-3">
                          <span className="text-orange-400 mr-2">🔬</span>
                          <h4 className="text-orange-400 font-semibold font-mono">TACEO Features Used:</h4>
                        </div>
                        <div className="space-y-1">
                          {proofResult.details.taceoFeatures.map((feature, index) => (
                            <div key={index} className="text-slate-200 font-mono text-sm ml-4">
                              - {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-red-400 font-mono">
                      ❌ {proofResult.message}
                    </div>
                  )}
                </div>
                
                {proofResult.success && (
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleVerifyProof}
                      disabled={isVerifying}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg font-mono relative overflow-hidden"
                    >
                      {isVerifying ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        'Verify Proof'
                      )}
                    </button>
                    <button 
                      onClick={handleGenerateQR}
                      disabled={isGeneratingQR}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg font-mono relative overflow-hidden"
                    >
                      {isGeneratingQR ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span>Generating...</span>
                        </div>
                      ) : (
                        'Generate QR Code'
                      )}
                    </button>
                  </div>
                )}


              </div>
            ) : (
              <div className="text-center text-slate-400 py-12 font-mono">
                <div className="w-16 h-16 mx-auto mb-4 border-2 border-slate-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p>Select a user and proof type, then generate a TACEO CoSNARK proof</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-400 font-mono">
          <p>This demo showcases TACEO:Proof network integration with CoSNARK</p>
          <p>Powered by Zero-Knowledge Proofs and Multi-Party Computation</p>
        </div>
                      </div>

                <Modal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        title="Proof Verification"
      >
        {verificationResult ? (
          <div className="space-y-4">
            <div className="bg-black/40 rounded-lg p-4 border border-slate-700/50">
              <pre className="whitespace-pre-wrap text-sm text-emerald-200 font-mono">
                {formatVerificationResult(verificationResult)}
              </pre>
            </div>
            <div className="text-center">
                                      <button
                          onClick={() => setShowVerificationModal(false)}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg font-mono"
                        >
                          Close
                        </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-slate-300 font-mono">Verifying proof on TACEO network...</p>
          </div>
        )}
                      </Modal>

                <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="QR Code"
      >
        {qrCodeData && qrCodeImage ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={qrCodeImage} 
                alt="TACEO Proof QR Code" 
                className="border-2 border-violet-400 rounded-lg"
              />
            </div>
            
            <div className="bg-black/40 p-3 rounded border border-slate-700/50">
              <h4 className="text-sm font-medium text-slate-200 mb-2 font-mono">QR Code Data:</h4>
              <div className="bg-black/60 p-2 rounded border border-slate-700/50">
                <pre className="text-xs text-slate-300 font-mono break-all whitespace-pre-wrap">
                  {qrService.generateQRCodeText(qrCodeData)}
                </pre>
              </div>
            </div>
            
            <p className="text-sm text-slate-300 text-center font-mono">
              Scan this QR code to verify the TACEO proof
            </p>
            
            <div className="text-center">
                                      <button
                          onClick={() => setShowQRModal(false)}
                          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg font-mono"
                        >
                          Close
                        </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-slate-300 font-mono">Generating QR code...</p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showHowItWorksModal}
        onClose={() => setShowHowItWorksModal(false)}
        title="How TACEO CoSNARK Works"
      >
        <div className="space-y-6">
          <div className="bg-black/40 rounded-lg p-4 border border-slate-700/50">
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
          </div>

          <div className="bg-black/40 rounded-lg p-4 border border-slate-700/50">
            <h4 className="text-lg font-semibold text-emerald-400 mb-3 font-mono">Data Flow</h4>
            <div className="space-y-3 text-sm text-slate-200 font-mono">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">1</div>
                <span>User selects a demo scenario and proof type</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">2</div>
                <span>System generates TACEO proof with privacy protection</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">3</div>
                <span>Proof details are displayed with private data hidden</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">4</div>
                <span>User can verify proof or generate QR code for sharing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">5</div>
                <span>Proof verification confirms validity through TACEO&apos;s verification system</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowHowItWorksModal(false)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg font-mono"
            >
              Got it!
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}