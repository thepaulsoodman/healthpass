# HealthPass TACEO Demo

A demonstration of TACEO's collaborative zero-knowledge proof system for health verification scenarios.

## 🏥 Overview

This demo showcases how TACEO's CoSNARK technology works in real-world health verification use cases, including:
- Vaccination status verification
- Age requirement verification  
- Health status verification

## 🚀 Features

- **CoSNARK Integration**: Demonstrates collaborative SNARK proof generation
- **Multi-Party Computation**: Privacy-preserving data processing
- **Zero-Knowledge Proofs**: Prove statements without revealing underlying data
- **Professional UI**: Ultra-dark theme with modern design
- **Interactive Demo**: Generate, verify, and share proofs
- **QR Code Integration**: Shareable proof verification

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Fonts**: Geist Sans & Geist Mono
- **QR Codes**: qrcode library
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Geist fonts
│   ├── page.tsx           # Main demo interface
│   └── globals.css        # Global styles and scrollbar
├── components/
│   └── Modal.tsx          # Reusable modal component
├── lib/
│   ├── demo-data.ts       # Mock data structures
│   ├── demo-taceo-service.ts  # Proof generation service
│   ├── verification-service.ts # Proof verification service
│   └── qr-service.ts      # QR code generation service
```

## 🎯 Key Concepts Demonstrated

### TACEO CoSNARK Technology
- **Collaborative SNARK**: Multiple parties work together to generate proofs
- **Multi-Party Computation**: Privacy-preserving data processing
- **Zero-Knowledge Proofs**: Prove statements without revealing data
- **Privacy Protection**: Private data hidden, only proof verification visible
- **Network Infrastructure**: Proof verification through TACEO's collaborative system

### Data Flow
1. User selects demo scenario and proof type
2. System generates TACEO proof with privacy protection
3. Proof details displayed with private data hidden
4. User can verify proof or generate QR code for sharing
5. Proof verification confirms validity through TACEO's verification system

## 🎨 UI/UX Features

- **Ultra-Dark Theme**: Professional dark design with glass morphism
- **Smooth Animations**: 2-second proof detail animations, 1.5-second loaders
- **Modal System**: Clean popup interactions with backdrop blur
- **Privacy Visualization**: Hover effects showing data protection
- **Responsive Design**: Works on all screen sizes
- **Professional Typography**: Geist Mono font throughout

## 🔒 Privacy & Security

This demo simulates TACEO's concepts without using actual coCircom or Noir implementations. It demonstrates:
- Private data protection
- Zero-knowledge proof concepts
- Collaborative verification processes
- Secure proof generation and verification

## 📝 License

This project is for demonstration purposes only.

---

**Note**: This demo simulates TACEO's collaborative zero-knowledge proof system for educational and demonstration purposes. 