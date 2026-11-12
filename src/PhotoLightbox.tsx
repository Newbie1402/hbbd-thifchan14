import { useMemo } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import type { MemoryPhoto } from '@/types/memories';

export default function PhotoLightbox({ photos,index,onClose,onStep }:{photos:MemoryPhoto[];index:number;onClose:()=>void;onStep:(index:number)=>void}){
  const slides=useMemo(()=>photos.map(photo=>({src:photo.src,alt:photo.alt,title:photo.caption||`Memory #${photo.order}`,width:photo.width||1200,height:photo.height||900})),[photos]);
  return <Lightbox open index={index} slides={slides} close={onClose} on={{view:({index:next})=>onStep(next)}} carousel={{imageFit:'contain',finite:true,preload:1}} plugins={[Zoom,Thumbnails,Slideshow,Fullscreen,Captions]} thumbnails={{position:'bottom',width:88,height:58,border:2,borderRadius:8,padding:2,gap:8}} captions={{descriptionTextAlign:'center'}} />;
}
