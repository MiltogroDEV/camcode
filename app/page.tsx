'use client';

import { useState } from 'react';
import QRScanner from './components/QRScanner';
import ScanHistory, { ScanRecord } from './components/ScanHistory';

export default function Home() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pendingValidation, setPendingValidation] = useState<string | null>(null);

  const handleScanSuccess = (decodedText: string) => {
    // Avoid duplicate consecutive scans
    if (decodedText === lastScan || isPaused) {
      return;
    }

    // Pause scanner and set pending validation
    setIsPaused(true);
    setPendingValidation(decodedText);
    setLastScan(decodedText);

    // Vibrate on scan
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const handleValidate = () => {
    if (!pendingValidation) return;

    // TODO: Future - validate against database
    // For now, just add to history as validated
    const newScan: ScanRecord = {
      id: `${Date.now()}-${Math.random()}`,
      content: pendingValidation,
      timestamp: new Date(),
    };

    setScans((prev) => [newScan, ...prev]);

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    // Resume scanner
    setPendingValidation(null);
    setIsPaused(false);
  };

  const handleDeny = () => {
    if (!pendingValidation) return;

    // TODO: Future - log denied QR code if needed

    // Simply resume scanner without adding to history
    setPendingValidation(null);
    setIsPaused(false);
    setLastScan(null); // Allow re-scanning the same code
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
        <QRScanner onScanSuccess={handleScanSuccess} isPaused={isPaused} />

        {pendingValidation && (
          <div className="validation-prompt">
            <div className="validation-content">
              <div className="validation-header">
                <span className="validation-icon">🔍</span>
                <h3>QR Code Detectado</h3>
              </div>
              <div className="validation-qr-value">{pendingValidation}</div>
              <div className="validation-actions">
                <button className="btn-validate" onClick={handleValidate}>
                  <span className="btn-icon">✅</span>
                  Validar
                </button>
                <button className="btn-deny" onClick={handleDeny}>
                  <span className="btn-icon">❌</span>
                  Negar
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccess && !pendingValidation && (
          <div className="success-message">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <div className="success-text">
                <div className="success-label">QR Code Validado com Sucesso!</div>
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
