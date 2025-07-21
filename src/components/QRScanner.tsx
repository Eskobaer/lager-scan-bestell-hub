import React, { useState, useRef, useEffect } from 'react';
import { Camera, Flashlight, RotateCcw, CheckCircle, Package, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import QrScanner from 'qr-scanner';

interface ScannedArticle {
  articleNumber: string;
  name: string;
  manufacturer: string;
  currentStock: number;
  minStock: number;
  timestamp: string;
}

interface StockMovement {
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  user: string;
}

const QRScanner = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedArticle, setScannedArticle] = useState<ScannedArticle | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [stockMovement, setStockMovement] = useState<StockMovement>({
    type: 'out',
    quantity: 1,
    reason: '',
    user: user?.username || 'System'
  });
  const [flashlight, setFlashlight] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  // Mock-Daten für Artikel
  const mockArticles: Record<string, ScannedArticle> = {
    'SCR-M8-20': {
      articleNumber: 'SCR-M8-20',
      name: 'Schrauben M8x20',
      manufacturer: 'Würth',
      currentStock: 150,
      minStock: 20,
      timestamp: new Date().toLocaleString('de-DE')
    },
    'DIC-STD-01': {
      articleNumber: 'DIC-STD-01',
      name: 'Dichtungsringe Standard',
      manufacturer: 'Elring',
      currentStock: 5,
      minStock: 10,
      timestamp: new Date().toLocaleString('de-DE')
    },
    'KAB-200-SW': {
      articleNumber: 'KAB-200-SW',
      name: 'Kabelbinder 200mm schwarz',
      manufacturer: 'HellermannTyton',
      currentStock: 75,
      minStock: 25,
      timestamp: new Date().toLocaleString('de-DE')
    }
  };

  const startScanning = async () => {
    try {
      if (!videoRef.current) return;

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanResult(result.data);
        },
        {
          onDecodeError: (err) => {
            console.log('Scan error:', err);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scannerRef.current = qrScanner;
      await qrScanner.start();
      setIsScanning(true);

      toast({
        title: "Scanner gestartet",
        description: "Richten Sie die Kamera auf den QR-Code",
      });
    } catch (error) {
      console.error('QR Scanner Fehler:', error);
      toast({
        title: "Scanner-Fehler",
        description: "QR-Scanner konnte nicht gestartet werden",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
    setFlashlight(false);
  };

  const toggleFlashlight = async () => {
    if (scannerRef.current) {
      try {
        if (flashlight) {
          await scannerRef.current.turnFlashOff();
        } else {
          await scannerRef.current.turnFlashOn();
        }
        setFlashlight(!flashlight);
      } catch (error) {
        toast({
          title: "Taschenlampe",
          description: "Taschenlampe wird nicht unterstützt",
          variant: "destructive",
        });
      }
    }
  };

  const handleScanResult = (code: string) => {
    const article = mockArticles[code];
    if (article) {
      setScannedArticle(article);
      toast({
        title: "Artikel gescannt!",
        description: `${article.name} erfolgreich erkannt`,
      });
    } else {
      toast({
        title: "Artikel nicht gefunden",
        description: `Code: ${code}`,
        variant: "destructive",
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim());
      setManualInput('');
    }
  };

  const processStockMovement = () => {
    if (!scannedArticle) return;

    // Hier würde die echte Lagerbuchung stattfinden
    const newStock = stockMovement.type === 'in' 
      ? scannedArticle.currentStock + stockMovement.quantity
      : scannedArticle.currentStock - stockMovement.quantity;

    // Mock: Artikel aktualisieren
    const updatedArticle = {
      ...scannedArticle,
      currentStock: Math.max(0, newStock),
      timestamp: new Date().toLocaleString('de-DE')
    };

    // Mock-Daten aktualisieren
    mockArticles[scannedArticle.articleNumber] = updatedArticle;
    setScannedArticle(updatedArticle);

    // Aktivitätsprotokoll hinzufügen
    const activity = {
      type: stockMovement.type,
      articleNumber: scannedArticle.articleNumber,
      articleName: scannedArticle.name,
      quantity: stockMovement.quantity,
      reason: stockMovement.reason,
      user: stockMovement.user,
      timestamp: new Date().toLocaleString('de-DE'),
      newStock: updatedArticle.currentStock
    };

    // Aktivität zu localStorage hinzufügen
    const activities = JSON.parse(localStorage.getItem('stockActivities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('stockActivities', JSON.stringify(activities.slice(0, 100))); // Nur letzte 100 behalten

    toast({
      title: `${stockMovement.type === 'in' ? 'Zugang' : 'Abgang'} erfasst`,
      description: `${stockMovement.quantity}x ${scannedArticle.name} - Neuer Bestand: ${updatedArticle.currentStock}`,
    });

    // Prüfung auf Mindestbestand
    if (updatedArticle.currentStock <= updatedArticle.minStock) {
      toast({
        title: "⚠️ Mindestbestand unterschritten",
        description: `${scannedArticle.name}: ${updatedArticle.currentStock}/${updatedArticle.minStock}`,
        variant: "destructive",
      });
    }

    // Form zurücksetzen
    setStockMovement(prev => ({ ...prev, quantity: 1, reason: '' }));
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">QR-Code Scanner</h1>
        <p className="text-muted-foreground">Scannen Sie Artikel für Lagerbewegungen</p>
      </div>

      {/* Scanner-Interface */}
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Live Scanner
          </CardTitle>
          <CardDescription>
            Verwenden Sie die Kamera zum Scannen von QR-Codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Kamera-Vorschau */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ display: isScanning ? 'block' : 'none' }}
            />
            {!isScanning && (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Kamera nicht aktiv</p>
                </div>
              </div>
            )}
          </div>

          {/* Scanner-Steuerung */}
          <div className="flex gap-2">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Scanner starten
              </Button>
            ) : (
              <>
                <Button onClick={stopScanning} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Stoppen
                </Button>
                <Button 
                  onClick={toggleFlashlight} 
                  variant="outline" 
                  size="icon"
                  className={flashlight ? 'bg-yellow-500 text-white' : ''}
                >
                  <Flashlight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Manuelle Eingabe */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Manuelle Eingabe</CardTitle>
          <CardDescription>
            Artikelnummer direkt eingeben
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

      {/* Gescannter Artikel */}
      {scannedArticle && (
        <Card className="max-w-2xl mx-auto border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Package className="h-6 w-6 text-green-600" />
              Artikel erkannt
              {scannedArticle.currentStock <= scannedArticle.minStock && (
                <Badge variant="destructive">Mindestbestand!</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Artikel-Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Artikelnummer</Label>
                <p className="font-medium">{scannedArticle.articleNumber}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bezeichnung</Label>
                <p className="font-medium">{scannedArticle.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Hersteller</Label>
                <p className="font-medium">{scannedArticle.manufacturer}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Aktueller Bestand</Label>
                <p className="font-medium text-lg">
                  {scannedArticle.currentStock}
                  <span className="text-sm text-muted-foreground ml-1">
                    (Min: {scannedArticle.minStock})
                  </span>
                </p>
              </div>
            </div>

            {/* Lagerbewegung */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Lagerbewegung erfassen</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bewegungstyp</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={stockMovement.type === 'in' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStockMovement(prev => ({ ...prev, type: 'in' }))}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Zugang
                    </Button>
                    <Button
                      variant={stockMovement.type === 'out' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStockMovement(prev => ({ ...prev, type: 'out' }))}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Abgang
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="quantity">Menge</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={stockMovement.quantity}
                    onChange={(e) => setStockMovement(prev => ({ 
                      ...prev, 
                      quantity: parseInt(e.target.value) || 1 
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Grund (optional)</Label>
                <Input
                  id="reason"
                  placeholder="z.B. Produktion, Reparatur, Lieferung..."
                  value={stockMovement.reason}
                  onChange={(e) => setStockMovement(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <Button onClick={processStockMovement} className="w-full" size="lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                Buchung durchführen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRScanner;