import QRCode from 'qrcode';

export interface QRCodeData {
  proofId: string;
  verificationKey: string;
  proofData: string;
  timestamp: number;
  networkInfo: {
    infrastructureStatus: string;
    processingTime: number;
    networkFee: string;
  };
}

export interface NetworkInfo {
  infrastructureStatus: string;
  processingTime: number;
  networkFee: string;
}

export class QRService {
  generateQRData(proofId: string, verificationKey: string, proofData: string, networkInfo: NetworkInfo): QRCodeData {
    return {
      proofId,
      verificationKey,
      proofData,
      timestamp: Date.now(),
      networkInfo: {
        infrastructureStatus: networkInfo.infrastructureStatus,
        processingTime: networkInfo.processingTime,
        networkFee: networkInfo.networkFee
      }
    };
  }

  generateQRCodeText(qrData: QRCodeData): string {
    return `TACEO_PROOF:${qrData.proofId}:${qrData.verificationKey}:${qrData.timestamp}`;
  }

  async generateQRCodeImage(qrData: QRCodeData): Promise<string> {
    const qrText = this.generateQRCodeText(qrData);
    try {
      const qrImageDataUrl = await QRCode.toDataURL(qrText, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrImageDataUrl;
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw error;
    }
  }
}

export const qrService = new QRService(); 