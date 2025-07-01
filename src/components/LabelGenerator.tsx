
import React, { useState } from 'react';
import { QrCode, Printer, Download, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LabelGenerator = () => {
  const [labelData, setLabelData] = useState({
    articleNumber: '',
    articleName: '',
    location: '',
    size: 'medium'
  });

  const generateQRCode = (data: string) => {
    // Vereinfachte QR-Code Darstellung (in der echten App würde hier eine QR-Code Bibliothek verwendet)
    return (
      <div className="w-24 h-24 bg-gray-900 flex items-center justify-center rounded">
        <div className="grid grid-cols-8 gap-0.5 w-20 h-20">
          {Array.from({ length: 64 }, (_, i) => (
            <div
              key={i}
              className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-900'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setLabelData(prev => ({ ...prev, [field]: value }));
  };

  const generateLabel = () => {
    console.log('Lagerschild generiert:', labelData);
  };

  const printLabel = () => {
    console.log('Lagerschild wird gedruckt:', labelData);
    window.print();
  };

  const downloadLabel = () => {
    console.log('Lagerschild wird heruntergeladen:', labelData);
  };

  const sampleArticles = [
    { number: 'SCR-M8-20', name: 'Schrauben M8x20', location: 'Regal A-12' },
    { number: 'DIC-STD-01', name: 'Dichtungsringe', location: 'Regal B-05' },
    { number: 'KAB-200-SW', name: 'Kabelbinder 200mm', location: 'Regal C-08' }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lagerschilder Generator</h1>
        <p className="text-gray-600">Erstellen Sie QR-Code Lagerschilder für Ihre Artikel</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Eingabeformular */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              Schild-Konfiguration
            </CardTitle>
            <CardDescription>
              Geben Sie die Artikeldaten für das Lagerschild ein
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="articleNumber">Artikelnummer</Label>
              <Input
                id="articleNumber"
                placeholder="z.B. SCR-M8-20"
                value={labelData.articleNumber}
                onChange={(e) => handleInputChange('articleNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="articleName">Artikelbezeichnung</Label>
              <Input
                id="articleName"
                placeholder="z.B. Schrauben M8x20"
                value={labelData.articleName}
                onChange={(e) => handleInputChange('articleName', e.target.value)}
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
              <Label htmlFor="size">Schildgröße</Label>
              <Select value={labelData.size} onValueChange={(value) => handleInputChange('size', value)}>
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
              <p className="text-sm text-gray-600 mb-2">Schnellauswahl:</p>
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
                      location: article.location,
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
              <QrCode className="h-5 w-5 text-blue-600" />
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
                  {generateQRCode(labelData.articleNumber)}
                </div>
                
                {/* Artikel-Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                    {labelData.articleName || 'Artikelbezeichnung'}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">
                    Art.-Nr.: {labelData.articleNumber || 'XXXXXX'}
                  </p>
                  <p className="text-xs text-gray-600">
                    Ort: {labelData.location || 'Lagerort'}
                  </p>
                </div>
              </div>
              
              {/* Barcode-Simulation */}
              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="flex justify-center">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div
                        key={i}
                        className={`bg-gray-900 ${Math.random() > 0.5 ? 'w-0.5' : 'w-px'} h-4`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-center text-xs text-gray-600 mt-1">
                  {labelData.articleNumber || 'BARCODE'}
                </p>
              </div>
            </div>

            {/* Aktions-Buttons */}
            <div className="flex gap-2 mt-6">
              <Button onClick={generateLabel} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <QrCode className="h-4 w-4 mr-2" />
                Generieren
              </Button>
              <Button onClick={printLabel} variant="outline" className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Drucken
              </Button>
              <Button onClick={downloadLabel} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabelGenerator;
