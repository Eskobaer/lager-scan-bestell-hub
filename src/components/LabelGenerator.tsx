import React, { useState, useRef } from 'react';
import { QrCode, Printer, Download, Tag, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

interface LabelData {
  articleNumber: string;
  articleName: string;
  manufacturer: string;
  location: string;
  minStock: string;
  size: 'small' | 'medium' | 'large';
}

const LabelGenerator = () => {
  const [labelData, setLabelData] = useState<LabelData>({
    articleNumber: '',
    articleName: '',
    manufacturer: '',
    location: '',
    minStock: '',
    size: 'medium'
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sampleArticles = [
    { 
      number: 'SCR-M8-20', 
      name: 'Schrauben M8x20', 
      manufacturer: 'Würth',
      location: 'Regal A-12',
      minStock: '20'
    },
    { 
      number: 'DIC-STD-01', 
      name: 'Dichtungsringe Standard', 
      manufacturer: 'Elring',
      location: 'Regal B-05',
      minStock: '10'
    },
    { 
      number: 'KAB-200-SW', 
      name: 'Kabelbinder 200mm schwarz', 
      manufacturer: 'HellermannTyton',
      location: 'Regal C-08',
      minStock: '25'
    }
  ];

  const handleInputChange = (field: keyof LabelData, value: string) => {
    setLabelData(prev => ({ ...prev, [field]: value }));
  };

  const generateQRCode = async () => {
    if (!labelData.articleNumber) return;
    
    try {
      const qrData = JSON.stringify({
        articleNumber: labelData.articleNumber,
        name: labelData.articleName,
        manufacturer: labelData.manufacturer
      });
      
      const url = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(url);
      return url;
    } catch (error) {
      console.error('QR-Code Generation Error:', error);
      toast({
        title: "QR-Code Fehler",
        description: "QR-Code konnte nicht generiert werden",
        variant: "destructive",
      });
      return null;
    }
  };

  const generateLabel = async () => {
    if (!labelData.articleNumber || !labelData.articleName) {
      toast({
        title: "Unvollständige Daten",
        description: "Artikelnummer und -name sind erforderlich",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const qrUrl = await generateQRCode();
    
    if (qrUrl) {
      toast({
        title: "Lagerschild generiert",
        description: `QR-Code für ${labelData.articleName} erstellt`,
      });
    }
    
    setIsGenerating(false);
  };

  const printLabel = () => {
    if (!qrCodeUrl) {
      toast({
        title: "Kein QR-Code",
        description: "Bitte zuerst Lagerschild generieren",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const { size } = labelData;
      const dimensions = {
        small: { width: '5cm', height: '3cm', fontSize: '8px' },
        medium: { width: '8cm', height: '5cm', fontSize: '10px' },
        large: { width: '10cm', height: '7cm', fontSize: '12px' }
      };

      printWindow.document.write(`
        <html>
          <head>
            <title>Lagerschild - ${labelData.articleNumber}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif; 
              }
              .label { 
                width: ${dimensions[size].width}; 
                height: ${dimensions[size].height}; 
                border: 2px solid #000; 
                padding: 8px; 
                display: flex; 
                align-items: center; 
                gap: 8px;
                font-size: ${dimensions[size].fontSize};
              }
              .qr-code { 
                width: 60px; 
                height: 60px; 
                flex-shrink: 0; 
              }
              .info { 
                flex: 1; 
                min-width: 0; 
              }
              .article-name { 
                font-weight: bold; 
                margin-bottom: 2px; 
              }
              .details { 
                font-size: 0.8em; 
                color: #666; 
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="label">
              <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
              <div class="info">
                <div class="article-name">${labelData.articleName}</div>
                <div class="details">Art.-Nr.: ${labelData.articleNumber}</div>
                <div class="details">Hersteller: ${labelData.manufacturer}</div>
                <div class="details">Ort: ${labelData.location}</div>
                <div class="details">Min-Bestand: ${labelData.minStock}</div>
              </div>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadPDF = async () => {
    if (!qrCodeUrl) {
      toast({
        title: "Kein QR-Code",
        description: "Bitte zuerst Lagerschild generieren",
        variant: "destructive",
      });
      return;
    }

    try {
      const { size } = labelData;
      const dimensions = {
        small: { width: 50, height: 30 },
        medium: { width: 80, height: 50 },
        large: { width: 100, height: 70 }
      };

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [dimensions[size].width, dimensions[size].height]
      });

      // QR-Code hinzufügen
      pdf.addImage(qrCodeUrl, 'PNG', 2, 2, 20, 20);

      // Text hinzufügen
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(labelData.articleName, 25, 6);

      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Art.-Nr.: ${labelData.articleNumber}`, 25, 10);
      pdf.text(`Hersteller: ${labelData.manufacturer}`, 25, 14);
      pdf.text(`Ort: ${labelData.location}`, 25, 18);
      pdf.text(`Min-Bestand: ${labelData.minStock}`, 25, 22);

      // PDF speichern
      pdf.save(`Lagerschild_${labelData.articleNumber}.pdf`);
      
      toast({
        title: "PDF erstellt",
        description: `Lagerschild für ${labelData.articleNumber} heruntergeladen`,
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast({
        title: "PDF-Fehler",
        description: "PDF konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (labelData.articleNumber) {
      generateQRCode();
    }
  }, [labelData.articleNumber]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Lagerschilder Generator</h1>
        <p className="text-muted-foreground">Erstellen Sie QR-Code Lagerschilder für Ihre Artikel</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Eingabeformular */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Schild-Konfiguration
            </CardTitle>
            <CardDescription>
              Geben Sie die Artikeldaten für das Lagerschild ein
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="articleNumber">Artikelnummer *</Label>
              <Input
                id="articleNumber"
                placeholder="z.B. SCR-M8-20"
                value={labelData.articleNumber}
                onChange={(e) => handleInputChange('articleNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="articleName">Artikelbezeichnung *</Label>
              <Input
                id="articleName"
                placeholder="z.B. Schrauben M8x20"
                value={labelData.articleName}
                onChange={(e) => handleInputChange('articleName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Hersteller</Label>
              <Input
                id="manufacturer"
                placeholder="z.B. Würth"
                value={labelData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lagerort</Label>
              <Input
                id="location"
                placeholder="z.B. Regal A-12"
                value={labelData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Mindestbestand</Label>
              <Input
                id="minStock"
                placeholder="z.B. 20"
                value={labelData.minStock}
                onChange={(e) => handleInputChange('minStock', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Schildgröße</Label>
              <Select value={labelData.size} onValueChange={(value: 'small' | 'medium' | 'large') => handleInputChange('size', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Klein (5x3 cm)</SelectItem>
                  <SelectItem value="medium">Mittel (8x5 cm)</SelectItem>
                  <SelectItem value="large">Groß (10x7 cm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Schnellauswahl:</p>
              <div className="space-y-2">
                {sampleArticles.map((article, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setLabelData({
                      articleNumber: article.number,
                      articleName: article.name,
                      manufacturer: article.manufacturer,
                      location: article.location,
                      minStock: article.minStock,
                      size: labelData.size
                    })}
                  >
                    {article.name} ({article.number})
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vorschau */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Lagerschild Vorschau
            </CardTitle>
            <CardDescription>
              So wird Ihr Lagerschild aussehen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Lagerschild Vorschau */}
            <div className={`bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg print:shadow-none ${
              labelData.size === 'small' ? 'max-w-48' :
              labelData.size === 'large' ? 'max-w-80' : 'max-w-64'
            } mx-auto`}>
              <div className="flex items-start gap-4">
                {/* QR-Code */}
                <div className="flex-shrink-0">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                      <QrCode className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Artikel-Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                    {labelData.articleName || 'Artikelbezeichnung'}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">
                    Art.-Nr.: {labelData.articleNumber || 'XXXXXX'}
                  </p>
                  <p className="text-xs text-gray-600 mb-1">
                    Hersteller: {labelData.manufacturer || 'Hersteller'}
                  </p>
                  <p className="text-xs text-gray-600 mb-1">
                    Ort: {labelData.location || 'Lagerort'}
                  </p>
                  <p className="text-xs text-gray-600">
                    Min: {labelData.minStock || '0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Aktions-Buttons */}
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={generateLabel} 
                className="flex-1" 
                disabled={isGenerating}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generiere...' : 'Generieren'}
              </Button>
              <Button 
                onClick={printLabel} 
                variant="outline" 
                className="flex-1"
                disabled={!qrCodeUrl}
              >
                <Printer className="h-4 w-4 mr-2" />
                Drucken
              </Button>
              <Button 
                onClick={downloadPDF} 
                variant="outline" 
                className="flex-1"
                disabled={!qrCodeUrl}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden canvas for QR code generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default LabelGenerator;