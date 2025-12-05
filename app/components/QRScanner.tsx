'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (error: string) => void;
    isPaused?: boolean;
}

export default function QRScanner({ onScanSuccess, onScanError, isPaused = false }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [error, setError] = useState<string>('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const qrCodeRegionId = 'qr-reader';

    // Get available cameras
    useEffect(() => {
        // Check if we're on HTTPS or localhost
        const isSecureContext = window.isSecureContext;
        if (!isSecureContext) {
            setError('⚠️ Câmera requer HTTPS. Faça deploy ou acesse via localhost.');
            return;
        }

        Html5Qrcode.getCameras()
            .then((devices) => {
                if (devices && devices.length > 0) {
                    const cameraList = devices.map((device) => ({
                        id: device.id,
                        label: device.label || `Camera ${device.id}`,
                    }));
                    setCameras(cameraList);
                    // Prefer back camera (environment) for mobile
                    const backCamera = devices.find((device) =>
                        device.label.toLowerCase().includes('back') ||
                        device.label.toLowerCase().includes('environment')
                    );
                    setSelectedCamera(backCamera?.id || devices[0].id);
                } else {
                    setError('📷 Nenhuma câmera encontrada no dispositivo');
                }
            })
            .catch((err) => {
                console.error('Error getting cameras:', err);
                if (err.name === 'NotAllowedError') {
                    setError('❌ Permissão de câmera negada. Verifique as configurações do navegador.');
                } else if (err.name === 'NotFoundError') {
                    setError('📷 Nenhuma câmera encontrada no dispositivo.');
                } else if (err.name === 'NotReadableError') {
                    setError('⚠️ Câmera em uso por outro aplicativo.');
                } else {
                    setError('Erro ao acessar câmeras. Verifique as permissões.');
                }
            });
    }, []);

    const startScanning = async () => {
        if (!selectedCamera) {
            setError('Selecione uma câmera');
            return;
        }

        try {
            setError('');
            const html5QrCode = new Html5Qrcode(qrCodeRegionId);
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                selectedCamera,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    // Success callback
                    onScanSuccess(decodedText);
                    // Optional: vibrate on success
                    if (navigator.vibrate) {
                        navigator.vibrate(200);
                    }
                },
                (errorMessage) => {
                    // Error callback (called frequently, so we don't show all errors)
                    // Only log critical errors
                    if (onScanError && errorMessage.includes('NotFoundException') === false) {
                        onScanError(errorMessage);
                    }
                }
            );

            setIsScanning(true);
        } catch (err) {
            console.error('Error starting scanner:', err);
            setError('Erro ao iniciar scanner. Verifique as permissões da câmera.');
            setIsScanning(false);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
                setIsScanning(false);
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    };

    const handleCameraChange = async (cameraId: string) => {
        if (isScanning) {
            await stopScanning();
        }
        setSelectedCamera(cameraId);
    };

    // Handle pause/resume based on isPaused prop
    useEffect(() => {
        if (!scannerRef.current || !isScanning) return;

        if (isPaused) {
            // Pause scanning
            scannerRef.current.pause(true);
        } else {
            // Resume scanning
            scannerRef.current.resume();
        }
    }, [isPaused, isScanning]);

    useEffect(() => {
        return () => {
            if (scannerRef.current && isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [isScanning]);

    return (
        <div className="qr-scanner-container">
            <div className="scanner-controls">
                {cameras.length > 1 && (
                    <div className="camera-selector">
                        <label htmlFor="camera-select">Câmera:</label>
                        <select
                            id="camera-select"
                            value={selectedCamera}
                            onChange={(e) => handleCameraChange(e.target.value)}
                            disabled={isScanning}
                        >
                            {cameras.map((camera) => (
                                <option key={camera.id} value={camera.id}>
                                    {camera.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <button
                    onClick={isScanning ? stopScanning : startScanning}
                    className={`scan-button ${isScanning ? 'scanning' : ''}`}
                    disabled={!selectedCamera}
                >
                    {isScanning ? (
                        <>
                            <span className="icon">⏸</span>
                            Parar Scanner
                        </>
                    ) : (
                        <>
                            <span className="icon">📷</span>
                            Iniciar Scanner
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <span className="icon">⚠️</span>
                    {error}
                </div>
            )}

            <div className="scanner-wrapper">
                <div id={qrCodeRegionId} className="qr-reader" />
                {!isScanning && (
                    <div className="scanner-placeholder">
                        <div className="placeholder-content">
                            <span className="placeholder-icon">📱</span>
                            <p>Clique em "Iniciar Scanner" para começar</p>
                        </div>
                    </div>
                )}
                {isScanning && isPaused && (
                    <div className="scanner-paused-overlay">
                        <div className="paused-content">
                            <span className="paused-icon">⏸️</span>
                            <p>Scanner Pausado</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
