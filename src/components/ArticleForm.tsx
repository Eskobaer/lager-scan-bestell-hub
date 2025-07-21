import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface Article {
  id: string;
  articleNumber: string;
  name: string;
  description: string;
  manufacturer: string;
  currentStock: number;
  minimumStock: number;
  location: string;
  lastUpdated: string;
  qrCode?: string;
}

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: Omit<Article, 'id' | 'lastUpdated' | 'qrCode'>) => void;
  onCancel: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: article ? {
      articleNumber: article.articleNumber,
      name: article.name,
      description: article.description,
      manufacturer: article.manufacturer,
      currentStock: article.currentStock,
      minimumStock: article.minimumStock,
      location: article.location,
    } : {
      articleNumber: '',
      name: '',
      description: '',
      manufacturer: '',
      currentStock: 0,
      minimumStock: 0,
      location: '',
    }
  });

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      currentStock: Number(data.currentStock),
      minimumStock: Number(data.minimumStock),
    });
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>
          {article ? 'Artikel bearbeiten' : 'Neuen Artikel hinzufügen'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="articleNumber">Artikelnummer*</Label>
            <Input
              id="articleNumber"
              {...register('articleNumber', { required: 'Artikelnummer ist erforderlich' })}
              placeholder="z.B. SCR-M8-20"
            />
            {errors.articleNumber && (
              <p className="text-sm text-destructive">{errors.articleNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Artikelname*</Label>
            <Input
              id="name"
              {...register('name', { required: 'Artikelname ist erforderlich' })}
              placeholder="z.B. Schrauben M8x20"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Detaillierte Beschreibung des Artikels..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manufacturer">Hersteller</Label>
          <Input
            id="manufacturer"
            {...register('manufacturer')}
            placeholder="z.B. Würth, Fischer, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentStock">Aktueller Bestand*</Label>
            <Input
              id="currentStock"
              type="number"
              {...register('currentStock', { 
                required: 'Aktueller Bestand ist erforderlich',
                min: { value: 0, message: 'Bestand muss positiv sein' }
              })}
              placeholder="0"
            />
            {errors.currentStock && (
              <p className="text-sm text-destructive">{errors.currentStock.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumStock">Mindestbestand*</Label>
            <Input
              id="minimumStock"
              type="number"
              {...register('minimumStock', { 
                required: 'Mindestbestand ist erforderlich',
                min: { value: 1, message: 'Mindestbestand muss mindestens 1 sein' }
              })}
              placeholder="10"
            />
            {errors.minimumStock && (
              <p className="text-sm text-destructive">{errors.minimumStock.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lagerort*</Label>
            <Input
              id="location"
              {...register('location', { required: 'Lagerort ist erforderlich' })}
              placeholder="z.B. Regal A-12"
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit">
            {article ? 'Artikel aktualisieren' : 'Artikel hinzufügen'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;