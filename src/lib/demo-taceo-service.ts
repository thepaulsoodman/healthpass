import { generateDemoProof, DemoProof, demoCircuits, DemoUserData } from './demo-data';

export interface DemoProofResult {
  success: boolean;
  proof?: DemoProof;
  message: string;
  details: {
    privateDataHidden: string[];
    publicVerification: string[];
    circuitInfo: {
      name: string;
      constraints: number;
      provingTime: number;
      description: string;
    };
    networkInfo: {
      infrastructureStatus: string;
      processingTime: number;
      networkFee: string;
    };
    taceoFeatures: string[];
  };
}

export class DemoTaceoService {
  async generateProof(
    userData: DemoUserData,
    proofType: 'vaccination' | 'age' | 'health'
  ): Promise<DemoProofResult> {
    try {
      console.log(`🏥 Generating TACEO demo proof for ${proofType}...`);
      
      const circuit = demoCircuits[proofType];
      
      const proof = generateDemoProof(userData, proofType);
      
      if (proof.verification.status === 'valid') {
        return {
          success: true,
          proof,
          message: `TACEO proof generated successfully`,
          details: {
            ...this.getProofDetails(proofType, userData),
            circuitInfo: {
              name: proof.circuitInfo.name,
              constraints: proof.circuitInfo.constraints,
              provingTime: proof.circuitInfo.provingTime,
              description: proof.circuitInfo.description
            },
            networkInfo: {
              infrastructureStatus: 'Operational',
              processingTime: proof.networkInfo.processingTime,
              networkFee: proof.networkInfo.networkFee
            },
            taceoFeatures: [
              'Multi-Party Computation (MPC)',
              'Collaborative SNARK (CoSNARK)',
              'Zero-Knowledge Proofs',
              'Privacy-preserving verification',
              'Distributed proof generation'
            ]
          }
        };
      } else {
        return {
          success: false,
          message: `❌ Proof generation failed: Requirements not met`,
          details: {
            privateDataHidden: [],
            publicVerification: [],
            circuitInfo: {
              name: circuit.name,
              constraints: circuit.constraints,
              provingTime: 0,
              description: circuit.description
            },
            networkInfo: {
              infrastructureStatus: 'Operational',
              processingTime: 0,
              networkFee: '0 ETH'
            },
            taceoFeatures: []
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ TACEO network error: ${error}`,
        details: {
          privateDataHidden: [],
          publicVerification: [],
          circuitInfo: {
            name: '',
            constraints: 0,
            provingTime: 0,
            description: ''
          },
          networkInfo: {
            infrastructureStatus: 'Operational',
            processingTime: 0,
            networkFee: '0 ETH'
          },
          taceoFeatures: []
        }
      };
    }
  }

  private getProofDetails(proofType: string, userData: DemoUserData) {
    const privateDataHidden = [
      'Personal identification',
      'Exact dates and times',
      'Medical records',
      'Personal health data',
      'Encrypted witness data',
      'CoSNARK intermediate values',
      'MPC secret shares'
    ];

    const publicVerification = [];

    switch (proofType) {
      case 'vaccination':
        publicVerification.push('Vaccination status: CONFIRMED');
        publicVerification.push('Meets event requirements: YES');
        publicVerification.push('TACEO network verified: YES');
        publicVerification.push('CoSNARK proof valid: YES');
        publicVerification.push('MPC consensus reached: YES');
        break;
      case 'age':
        publicVerification.push('Age requirement met: YES');
        publicVerification.push('Over minimum age: CONFIRMED');
        publicVerification.push('TACEO network verified: YES');
        publicVerification.push('CoSNARK proof valid: YES');
        publicVerification.push('MPC consensus reached: YES');
        break;
      case 'health':
        publicVerification.push('Health status: EXCELLENT');
        publicVerification.push('Meets health requirements: YES');
        publicVerification.push('TACEO network verified: YES');
        publicVerification.push('CoSNARK proof valid: YES');
        publicVerification.push('MPC consensus reached: YES');
        break;
    }

    return {
      privateDataHidden,
      publicVerification
    };
  }
}

export const demoTaceoService = new DemoTaceoService();
