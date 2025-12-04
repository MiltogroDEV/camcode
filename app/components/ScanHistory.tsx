'use client';

import { useState } from 'react';

export interface ScanRecord {
    id: string;
    content: string;
    timestamp: Date;
}

interface ScanHistoryProps {
    scans: ScanRecord[];
    onClear: () => void;
}

export default function ScanHistory({ scans, onClear }: ScanHistoryProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = async (content: string, id: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatTimestamp = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
        }).format(date);
    };

    const isUrl = (text: string) => {
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    };

    if (scans.length === 0) {
        return (
            <div className="history-empty">
                <span className="empty-icon">📋</span>
                <p>Nenhum QR code escaneado ainda</p>
            </div>
        );
    }

    return (
        <div className="scan-history">
            <div className="history-header">
                <h2>
                    <span className="icon">📜</span>
                    Histórico ({scans.length})
                </h2>
                <button onClick={onClear} className="clear-button">
                    <span className="icon">🗑️</span>
                    Limpar
                </button>
            </div>

            <div className="history-list">
                {scans.map((scan) => (
                    <div key={scan.id} className="history-item">
                        <div className="item-header">
                            <span className="timestamp">{formatTimestamp(scan.timestamp)}</span>
                            <button
                                onClick={() => copyToClipboard(scan.content, scan.id)}
                                className="copy-button"
                                title="Copiar"
                            >
                                {copiedId === scan.id ? (
                                    <span className="icon">✓</span>
                                ) : (
                                    <span className="icon">📋</span>
                                )}
                            </button>
                        </div>
                        <div className="item-content">
                            {isUrl(scan.content) ? (
                                <a
                                    href={scan.content}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="content-link"
                                >
                                    {scan.content}
                                </a>
                            ) : (
                                <span className="content-text">{scan.content}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
