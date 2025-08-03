export interface DemoProof {
    proofId: string;
    proofData: string;
    verificationKey: string;
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
    verification: {
      status: 'valid' | 'invalid';
      verificationTime: number;
    };
  }
  
  export interface DemoCircuit {
    name: string;
    description: string;
    constraints: number;
    inputs: Record<string, string>;
    outputs: Record<string, string>;
  }

  export interface DemoUserData {
    vaccinated?: boolean;
    age?: number;
    healthStatus?: string;
  }
  
  export const demoCircuits = {
    vaccination: {
      name: 'health_vaccination_v1',
      description: 'Vaccination status verification using CoSNARK',
      constraints: 1024,
      inputs: {
        vaccinated: 'Private input: User vaccination status',
        required: 'Public input: Vaccination requirement'
      },
      outputs: {
        valid: 'Public output: Whether user meets vaccination requirements'
      }
    },
    age: {
      name: 'health_age_v1',
      description: 'Age requirement verification using CoSNARK',
      constraints: 512,
      inputs: {
        age: 'Private input: User age',
        minimumAge: 'Public input: Minimum age requirement'
      },
      outputs: {
        valid: 'Public output: Whether user meets age requirements'
      }
    },
    health: {
      name: 'health_status_v1',
      description: 'Health status verification using CoSNARK',
      constraints: 2048,
      inputs: {
        healthScore: 'Private input: User health score',
        minimumScore: 'Public input: Minimum health score requirement'
      },
      outputs: {
        valid: 'Public output: Whether user meets health requirements'
      }
    }
  };
  
  export const generateDemoProof = (
    userData: DemoUserData,
    proofType: 'vaccination' | 'age' | 'health'
  ): DemoProof => {
    const circuit = demoCircuits[proofType];
    const proofId = `taceo_proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let isValid = false;
    let processingTime = 0;
    
    switch (proofType) {
      case 'vaccination':
        isValid = userData.vaccinated ?? false;
        processingTime = 1200;
        break;
      case 'age':
        isValid = (userData.age ?? 0) >= 18;
        processingTime = 800;
        break;
      case 'health':
        isValid = userData.healthStatus === 'excellent';
        processingTime = 1800;
        break;
    }
  
    return {
      proofId,
      proofData: `zkp://taceo.network/proof/${proofId}`,
      verificationKey: `vk_${proofId}`,
      circuitInfo: {
        name: circuit.name,
        constraints: circuit.constraints,
        provingTime: processingTime,
        description: circuit.description
      },
      networkInfo: {
        infrastructureStatus: 'Operational',
        processingTime,
        networkFee: '0.001 ETH'
      },
      verification: {
        status: isValid ? 'valid' : 'invalid',
        verificationTime: 50
      }
    };
  };