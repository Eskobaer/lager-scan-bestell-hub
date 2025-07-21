
import React, { useState } from 'react';
import { Plus, Edit, Search, Package, Trash2, QrCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import ArticleForm, { Article } from './ArticleForm';

const ArticleManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const { toast } = useToast();
  
  const [articles, setArticles] = useState<Article[]>([
    {
      id: '1',
      articleNumber: 'SCR-M8-20',
      name: 'Schrauben M8x20',
      description: 'Edelstahl Innensechskant Schrauben',
      manufacturer: 'Würth',
      currentStock: 5,
      minimumStock: 50,
      location: 'Regal A-12',
      lastUpdated: '2025-01-03',
      qrCode: 'QR_SCR-M8-20'
    },
    {
      id: '2',
      articleNumber: 'DIC-STD-01',
      name: 'Dichtungsringe',
      description: 'Standard O-Ring Set',
      manufacturer: 'Fischer',
      currentStock: 12,
      minimumStock: 100,
      location: 'Regal B-05',
      lastUpdated: '2025-01-02',
      qrCode: 'QR_DIC-STD-01'
    },
    {
      id: '3',
      articleNumber: 'KAB-200-SW',
      name: 'Kabelbinder 200mm',
      description: 'Schwarz, UV-beständig',
      manufacturer: 'Hellermann Tyton',
      currentStock: 150,
      minimumStock: 200,
      location: 'Regal C-08',
      lastUpdated: '2025-01-01',
      qrCode: 'QR_KAB-200-SW'
    }
  ]);

  const filteredArticles = articles.filter(article =>
    article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.articleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= minimum * 0.2) return { status: 'critical', color: 'bg-destructive' };
    if (current <= minimum) return { status: 'low', color: 'bg-warning' };
    return { status: 'good', color: 'bg-success' };
  };

  const generateQRCode = (articleNumber: string) => {
    return `QR_${articleNumber}`;
  };

  const handleAddArticle = (articleData: Omit<Article, 'id' | 'lastUpdated' | 'qrCode'>) => {
    const newArticle: Article = {
      ...articleData,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0],
      qrCode: generateQRCode(articleData.articleNumber)
    };
    
    setArticles(prev => [...prev, newArticle]);
    setIsDialogOpen(false);
    
    toast({
      title: "Artikel hinzugefügt",
      description: `${newArticle.name} wurde erfolgreich hinzugefügt.`,
    });
  };

  const handleEditArticle = (articleData: Omit<Article, 'id' | 'lastUpdated' | 'qrCode'>) => {
    if (!editingArticle) return;
    
    const updatedArticle: Article = {
      ...articleData,
      id: editingArticle.id,
      lastUpdated: new Date().toISOString().split('T')[0],
      qrCode: editingArticle.qrCode || generateQRCode(articleData.articleNumber)
    };
    
    setArticles(prev => prev.map(article => 
      article.id === editingArticle.id ? updatedArticle : article
    ));
    setIsDialogOpen(false);
    setEditingArticle(null);
    
    toast({
      title: "Artikel aktualisiert",
      description: `${updatedArticle.name} wurde erfolgreich aktualisiert.`,
    });
  };

  const handleDeleteArticle = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    setArticles(prev => prev.filter(a => a.id !== articleId));
    
    toast({
      title: "Artikel gelöscht",
      description: `${article?.name} wurde erfolgreich gelöscht.`,
    });
  };

  const openAddDialog = () => {
    setEditingArticle(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (article: Article) => {
    setEditingArticle(article);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingArticle(null);
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Artikelverwaltung</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Lagerartikel und Mindestbestände</p>
        </div>
        <Button onClick={openAddDialog} className="animate-fade-in">
          <Plus className="h-4 w-4 mr-2" />
          Neuer Artikel
        </Button>
      </div>

      {/* Suchleiste */}
      <Card className="animate-fade-in">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
        {filteredArticles.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Keine Artikel gefunden.' : 'Noch keine Artikel hinzugefügt.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredArticles.map((article, index) => {
            const stockStatus = getStockStatus(article.currentStock, article.minimumStock);
            return (
              <Card 
                key={article.id} 
                className="hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        {article.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Art.-Nr.: {article.articleNumber} | {article.description}
                      </CardDescription>
                      {article.manufacturer && (
                        <CardDescription className="mt-1">
                          Hersteller: {article.manufacturer}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(article)}
                        className="hover-scale"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="hover-scale text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Artikel löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sind Sie sicher, dass Sie den Artikel "{article.name}" löschen möchten? 
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteArticle(article.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Aktueller Bestand</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{article.currentStock}</span>
                        <div className={`w-3 h-3 rounded-full ${stockStatus.color}`}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Mindestbestand</p>
                      <span className="text-2xl font-bold text-warning">{article.minimumStock}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Lagerort</p>
                      <Badge variant="outline">{article.location}</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge 
                        className={`${
                          stockStatus.status === 'critical' ? 'bg-destructive/10 text-destructive' :
                          stockStatus.status === 'low' ? 'bg-warning/10 text-warning' :
                          'bg-success/10 text-success'
                        }`}
                      >
                        {stockStatus.status === 'critical' ? 'Kritisch' :
                         stockStatus.status === 'low' ? 'Niedrig' : 'Gut'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">QR-Code</p>
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{article.qrCode}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog für Artikel hinzufügen/bearbeiten */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ArticleForm
            article={editingArticle || undefined}
            onSubmit={editingArticle ? handleEditArticle : handleAddArticle}
            onCancel={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticleManagement;
