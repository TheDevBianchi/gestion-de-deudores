'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDollarPrice } from '@/hooks/dollar/useDollarPrice';
import { toast } from 'sonner';

const DollarPriceInput = () => {
  const { price, isLoading, fetchDollarPrice, updateDollarPrice } = useDollarPrice();
  const [inputPrice, setInputPrice] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchDollarPrice();
  }, [fetchDollarPrice]);

  useEffect(() => {
    if (price) {
      setInputPrice(price.toString());
    }
  }, [price]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newPrice = parseFloat(inputPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Por favor ingrese un precio válido');
      return;
    }

    setIsUpdating(true);
    try {
      await updateDollarPrice(newPrice);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dollarPrice">Precio del Dólar (Bs.)</Label>
          <div className="flex gap-2">
            <Input
              id="dollarPrice"
              type="number"
              step="0.01"
              min="0"
              value={inputPrice}
              onChange={(e) => setInputPrice(e.target.value)}
              placeholder="Ingrese el precio del dólar"
              disabled={isLoading || isUpdating}
            />
            <Button 
              type="submit"
              disabled={isLoading || isUpdating}
            >
              {isUpdating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
                />
              ) : (
                'Actualizar'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default DollarPriceInput; 