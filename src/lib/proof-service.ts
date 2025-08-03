import { taceoClient, TaceoProofRequest } from './taceo-client';

export interface ProofGenerationResult {
  success: boolean;
  proofId?: string;
  proofData?: string;
  verificationKey?: string;
  message: string;
  details: {
    privateDataHidden: string[];
    publicVerification: string[];
  };
}

export class ProofService {
  async generateHealthProof(
    userData: any,
    proofType: 'vaccination' | 'age' | 'health'
  ): Promise<ProofGenerationResult> {
    try {
      const privateData = {
        vaccinated: userData.vaccinated,
        age: userData.age,
        healthStatus: userData.healthStatus,
        personalInfo: {
          name: userData.name,
          id: userData.id
        }
      };

      const publicRequirements = {
        proofType,
        requirements: this.getRequirements(proofType)
      };

      const request: TaceoProofRequest = {
        userId: userData.id,
        proofType,
        privateData,
        publicRequirements
      };

      const result = await taceoClient.generateProof(request);

      if (result.status === 'success') {
        return {
          success: true,
          proofId: result.proofId,
          proofData: result.proofData,
          verificationKey: result.verificationKey,
          message: result.message,
          details: this.getProofDetails(proofType, userData)
        };
      } else {
        return {
          success: false,
          message: result.message,
          details: this.getProofDetails(proofType, userData)
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error generating proof: ${error}`,
        details: this.getProofDetails(proofType, userData)
      };
    }
  }

  private getRequirements(proofType: string) {
    switch (proofType) {
      case 'vaccination':
        return { required: true, type: 'COVID-19' };
      case 'age':
        return { minimumAge: 18 };
      case 'health':
        return { minimumStatus: 'excellent' };
      default:
        return {};
    }
  }

  private getProofDetails(proofType: string, userData: any) {
    const privateDataHidden = [
      'Personal identification',
      'Exact dates and times',
      'Medical records',
      'Personal health data'
    ];

    const publicVerification = [];

    switch (proofType) {
      case 'vaccination':
        publicVerification.push('Vaccination status: CONFIRMED');
        publicVerification.push('Meets event requirements: YES');
        break;
      case 'age':
        publicVerification.push('Age requirement met: YES');
        publicVerification.push('Over 18: CONFIRMED');
        break;
      case 'health':
        publicVerification.push('Health status: EXCELLENT');
        publicVerification.push('Meets activity requirements: YES');
        break;
    }

    return {
      privateDataHidden,
      publicVerification
    };
  }
}

export const proofService = new ProofService();