import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, X } from 'lucide-react';

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
  imageUrl?: string; // Neue Eigenschaft für Artikelbild
}

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: Omit<Article, 'id' | 'lastUpdated' | 'qrCode'>) => void;
  onCancel: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSubmit, onCancel }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(article?.imageUrl || '');
  
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const onFormSubmit = (data: any) => {
    const formData = {
      ...data,
      currentStock: Number(data.currentStock),
      minimumStock: Number(data.minimumStock),
      imageUrl: imagePreview || article?.imageUrl || ''
    };
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>
          {article ? 'Artikel bearbeiten' : 'Neuen Artikel hinzufügen'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Artikelbild Upload */}
        <div className="space-y-2">
          <Label htmlFor="image">Artikelbild</Label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Artikel Vorschau" 
                  className="w-20 h-20 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0"
                  onClick={removeImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-md flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG oder WEBP (max. 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Artikelnummer und Name */}
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

        {/* Beschreibung */}
        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Detaillierte Beschreibung des Artikels..."
            rows={3}
          />
        </div>

        {/* Hersteller */}
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Hersteller</Label>
          <Input
            id="manufacturer"
            {...register('manufacturer')}
            placeholder="z.B. Würth, Fischer, etc."
          />
        </div>

        {/* Bestandsdaten */}
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