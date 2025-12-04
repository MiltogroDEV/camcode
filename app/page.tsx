'use client';

import { useState } from 'react';
import QRScanner from './components/QRScanner';
import ScanHistory, { ScanRecord } from './components/ScanHistory';

export default function Home() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleScanSuccess = (decodedText: string) => {
    // Avoid duplicate consecutive scans
    if (decodedText === lastScan) {
      return;
    }

    const newScan: ScanRecord = {
      id: `${Date.now()}-${Math.random()}`,
      content: decodedText,
      timestamp: new Date(),
    };

    setScans((prev) => [newScan, ...prev]);
    setLastScan(decodedText);

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleClearHistory = () => {
    if (confirm('Deseja limpar todo o histórico de leituras?')) {
      setScans([]);
      setLastScan(null);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">QR Code Scanner</h1>
        <p className="app-subtitle">Escaneie QR codes com sua câmera</p>
      </header>

      <main className="glass-card">
        <QRScanner onScanSuccess={handleScanSuccess} />

        {showSuccess && lastScan && (
          <div className="success-message">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <div className="success-text">
                <div className="success-label">QR Code Lido com Sucesso!</div>
                <div className="success-value">{lastScan}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {scans.length > 0 && (
        <div className="glass-card">
          <ScanHistory scans={scans} onClear={handleClearHistory} />
        </div>
      )}
    </div>
  );
}
