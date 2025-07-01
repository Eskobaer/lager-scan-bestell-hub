
import React, { useState, useRef } from 'react';
import { Camera, Flashlight, RotateCcw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [lastScan, setLastScan] = useState<{code: string, timestamp: string} | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Rückkamera verwenden
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        
        toast({
          title: "Scanner gestartet",
          description: "Richten Sie die Kamera auf den QR-Code oder Barcode",
        });
      }
    } catch (error) {
      console.error('Kamera-Zugriff fehlgeschlagen:', error);
      toast({
        title: "Kamera-Fehler",
        description: "Kamera-Zugriff nicht möglich. Bitte Berechtigung erteilen.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const simulateScan = (code: string) => {
    const timestamp = new Date().toLocaleString('de-DE');
    setLastScan({ code, timestamp });
    setScannedData(code);
    
    toast({
      title: "Code erfasst!",
      description: `Artikel ${code} wurde gescannt`,
    });
    
    // Hier würde die echte Verarbeitung stattfinden
    console.log('Gescannter Code:', code);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      simulateScan(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR-Code Scanner</h1>
        <p className="text-gray-600">Scannen Sie Artikel für Lagerbewegungen</p>
      </div>

      {/* Scanner-Interface */}
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Live Scanner
          </CardTitle>
          <CardDescription>
            Verwenden Sie die Kamera zum Scannen von QR-Codes oder Barcodes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Kamera-Vorschau */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            {isScanning ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Kamera nicht aktiv</p>
                </div>
              </div>
            )}
            
            {/* Scanner-Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Scanner-Steuerung */}
          <div className="flex gap-2">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Scanner starten
              </Button>
            ) : (
              <>
                <Button onClick={stopScanning} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Stoppen
                </Button>
                <Button variant="outline" size="icon">
                  <Flashlight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Demo-Buttons */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Demo - Klicken zum Testen:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => simulateScan('SCR-M8-20')}
              >
                Schrauben scannen
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => simulateScan('DIC-STD-01')}
              >
                Dichtungen scannen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manuelle Eingabe */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Manuelle Eingabe</CardTitle>
          <CardDescription>
            Artikelnummer direkt eingeben, falls Scannen nicht möglich ist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <Input
              placeholder="Artikelnummer eingeben..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Artikel erfassen
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Letzter Scan */}
      {lastScan && (
        <Card className="max-w-md mx-auto border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Erfolgreich gescannt</p>
                <p className="text-sm text-green-700">Code: {lastScan.code}</p>
                <p className="text-xs text-green-600">{lastScan.timestamp}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRScanner;
