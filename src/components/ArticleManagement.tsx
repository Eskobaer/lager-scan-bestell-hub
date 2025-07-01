
import React, { useState } from 'react';
import { Plus, Edit, Search, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Article {
  id: string;
  articleNumber: string;
  name: string;
  description: string;
  currentStock: number;
  minimumStock: number;
  location: string;
  lastUpdated: string;
}

const ArticleManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const articles: Article[] = [
    {
      id: '1',
      articleNumber: 'SCR-M8-20',
      name: 'Schrauben M8x20',
      description: 'Edelstahl Innensechskant Schrauben',
      currentStock: 5,
      minimumStock: 50,
      location: 'Regal A-12',
      lastUpdated: '2025-01-03'
    },
    {
      id: '2',
      articleNumber: 'DIC-STD-01',
      name: 'Dichtungsringe',
      description: 'Standard O-Ring Set',
      currentStock: 12,
      minimumStock: 100,
      location: 'Regal B-05',
      lastUpdated: '2025-01-02'
    },
    {
      id: '3',
      articleNumber: 'KAB-200-SW',
      name: 'Kabelbinder 200mm',
      description: 'Schwarz, UV-beständig',
      currentStock: 150,
      minimumStock: 200,
      location: 'Regal C-08',
      lastUpdated: '2025-01-01'
    }
  ];

  const filteredArticles = articles.filter(article =>
    article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.articleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= minimum * 0.2) return { status: 'critical', color: 'bg-red-500' };
    if (current <= minimum) return { status: 'low', color: 'bg-yellow-500' };
    return { status: 'good', color: 'bg-green-500' };
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Artikelverwaltung</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Lagerartikel und Mindestbestände</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Neuer Artikel
        </Button>
      </div>

      {/* Suchleiste */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Artikel suchen (Name oder Artikelnummer)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Artikel-Liste */}
      <div className="grid gap-6">
        {filteredArticles.map((article) => {
          const stockStatus = getStockStatus(article.currentStock, article.minimumStock);
          return (
            <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      {article.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Art.-Nr.: {article.articleNumber} | {article.description}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Aktueller Bestand</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{article.currentStock}</span>
                      <div className={`w-3 h-3 rounded-full ${stockStatus.color}`}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Mindestbestand</p>
                    <span className="text-2xl font-bold text-orange-600">{article.minimumStock}</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Lagerort</p>
                    <Badge variant="outline">{article.location}</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge 
                      className={`${
                        stockStatus.status === 'critical' ? 'bg-red-100 text-red-800' :
                        stockStatus.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {stockStatus.status === 'critical' ? 'Kritisch' :
                       stockStatus.status === 'low' ? 'Niedrig' : 'Gut'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ArticleManagement;
