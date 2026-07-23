import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useMonetization } from '../contexts/MonetizationContext';

interface LikeButtonProps {
  itemId?: string;
  itemType?: 'route' | 'app' | 'feature';
}

export function LikeButton({ itemId, itemType = 'app' }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const { trackLike } = useMonetization();

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      trackLike();

      // Animation
      const button = document.getElementById(`like-${itemId || 'default'}`);
      if (button) {
        button.classList.add('animate-bounce');
        setTimeout(() => {
          button.classList.remove('animate-bounce');
        }, 500);
      }
    } else {
      setLiked(false);
    }
  };

  return (
    <Button
      id={`like-${itemId || 'default'}`}
      variant={liked ? 'default' : 'outline'}
      size="sm"
      onClick={handleLike}
      className={`gap-2 ${
        liked
          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
          : 'hover:bg-red-50'
      }`}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
      {liked ? 'Aimé' : 'Aimer'}
    </Button>
  );
}
