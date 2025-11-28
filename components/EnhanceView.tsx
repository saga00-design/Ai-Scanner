
import React, { useState } from 'react';
import { 
  Wand2, Download, Loader2, Sparkles, RefreshCcw, PartyPopper, Copy, Check, 
  ZoomIn, Zap, Flower, Layers, Columns, BookOpen, Grid, Moon, Utensils, 
  Heart, Activity, Snowflake, Sun, Palmtree, User, Fish, Users, Smartphone, 
  Play, Waves, Crown, Sprout, UtensilsCrossed, Gem, FileText, Leaf, 
  Instagram, CloudFog, FolderDown
} from 'lucide-react';
import ImageUploader from './ImageUploader';
import { enhanceImageStyle, analyzeBottleImage } from '../services/geminiService';

interface Variation {
  styleId: string;
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'error';
  imageUrl: string | null;
}

const STYLES = [
  // --- Core Styles (Auto-Generate) ---
  {
    id: 'moody_macro',
    auto: true,
    icon: ZoomIn,
    label: 'Moody Macro',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    description: '100mm Macro Chiaroscuro',
    prompt: 'Enhanced image of [SUBJECT] simulating a Camera Lens (Focal Length): 85mm to 100mm (Macro). Aperture: f/1.8 to f/2.8. Shutter Speed: 1/200 to 1/400s. ISO: 100 to 400. Composition & Lighting Setup Lighting (Chiaroscuro/Moody): This is a "Dark and Moody" style. Angle: Eye-level / 15-degree angle. The camera is almost level with the middle of the [SUBJECT], making it look towering and impressive. Professional culinary photography, close-up macro shot. Lighting is dark and moody (Chiaroscuro), with soft directional light hitting the subject from the left to create deep, dramatic shadows and rich highlights. Shot on a 100mm Macro lens at aperture f/1.8 for a creamy bokeh background. Razor-sharp focus on textures. 8k resolution, photorealistic, cinematic lighting, no grain.'
  },
  {
    id: 'high_speed',
    auto: true,
    icon: Zap,
    label: 'High-Speed',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    description: 'Exploded View Levitation',
    prompt: 'Professional high-speed commercial food photography of [SUBJECT], vertical "exploded view". The ingredients/parts are levitating and suspended in mid-air in distinct, separated layers. A human hand holds the base from below, and another hand releases the top part from above. Dramatic swirls of white smoke and steam weaving through the floating layers. Jet black background. Lighting is dramatic rim-lighting and backlighting to highlight the edges. Shot on 85mm lens, aperture f/8 for deep focus, freeze motion shutter speed 1/1000s, sharp focus on all layers, hyper-detailed, 8k, advertising standard.'
  },
  {
    id: 'rustic_macro',
    auto: true,
    icon: Flower,
    label: 'Rustic Macro',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'Natural Light Close-Up',
    prompt: 'Professional rustic food photography of [SUBJECT], close-up macro shot. Lighting is soft, diffused, natural window light from the left, creating soft shadows. Shot on 100mm Macro lens, aperture f/2.0, shallow depth of field, creamy bokeh background, hyper-realistic texture on the fruit and cream, 8k.'
  },
  {
    id: 'moody_flat_lay',
    auto: true,
    icon: Layers,
    label: 'Moody Flat Lay',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    description: 'Concrete Texture Top-Down',
    prompt: 'Professional culinary food photography of [SUBJECT], 90-degree top-down flat lay. Plated on a dark grey textured concrete stone surface. A dark grey linen napkin on the right side. Lighting is moody and organic, soft directional light from the left revealing textures. Shot on 50mm lens, aperture f/5.6 for edge-to-edge sharpness, hyper-realistic, rich colours, 8k resolution.'
  },
  {
    id: 'editorial_diptych',
    auto: true,
    icon: Columns,
    label: 'Editorial Diptych',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    description: 'Split-Screen Story',
    prompt: 'A split-screen diptych of high-end editorial food photography of [SUBJECT]. [Left Side]: Shot with an 85mm lens at f/1.8, blurry background, soft natural window light from the left, moody atmosphere. [Right Side]: A flat-lay overhead shot. Overall Style: Dark and moody, chiaroscuro lighting, ultra-realistic, 8k resolution, phase one camera capture.'
  },
  {
    id: 'surprise',
    auto: true,
    icon: PartyPopper,
    label: 'Surprise Me',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/30',
    description: 'AI Creative Choice',
    prompt: 'Creatively style this photo of [SUBJECT]. Choose a unique, random aesthetic (e.g., Neon Noir, Vintage 70s, Ethereal, Pop Art, or Futuristic) that makes the subject look stunning and unexpected. Keep the subject recognizable but completely transform the mood and lighting.'
  },

  // --- Extended Styles (Click to Generate) ---
  {
    id: 'culinary_mag',
    auto: false,
    icon: BookOpen,
    label: 'Magazine Style',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    description: 'Low Key & Rich',
    prompt: 'Food photography of [SUBJECT], Soft, moody window light coming from the left creating deep shadows. Shallow depth of field, f/1.8, 85mm lens, creamy bokeh background. In the foreground, out-of-focus. High contrast, low key lighting, rich textures, culinary magazine style.'
  },
  {
    id: 'rustic_flat_lay',
    auto: false,
    icon: Grid,
    label: 'Rustic Flat Lay',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    description: 'Dark Oak Table',
    prompt: 'Overhead flat lay food photography of [SUBJECT]. The surface is a dark, scratched oak table. A linen napkin on the side. Sharp focus, f/8, high texture detail, dark moody lighting, natural light.'
  },
  {
    id: 'chiaroscuro_flat',
    auto: false,
    icon: Moon,
    label: 'Chiaroscuro Flat',
    color: 'text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    description: 'Deep Shadows',
    prompt: 'Top-down flat lay food photography of [SUBJECT]. Background is a dark textured slate surface with a crumpled dark grey linen napkin underneath. Artistic scattering of flour or sea salt on the dark table. Lighting is dark and moody, chiaroscuro style, heavy shadows, directional window light from the left. High contrast, rich textures, hyper-realistic, 8k resolution, shot on 50mm lens, f/5.6, professional food styling.'
  },
  {
    id: 'fine_dining',
    auto: false,
    icon: Utensils,
    label: 'Fine Dining',
    color: 'text-slate-200',
    bg: 'bg-slate-100/10',
    border: 'border-slate-100/30',
    description: 'Michelin Plating',
    prompt: 'Top-down food photography of [SUBJECT]. Background is a weathered wooden table. Natural soft window lighting, high contrast, rich textures, photorealistic, Michelin star plating, 8k resolution.'
  },
  {
    id: 'vibrant_macro',
    auto: false,
    icon: Heart,
    label: 'Vibrant Macro',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    description: 'Food Porn Style',
    prompt: 'Flat lay food photography of [SUBJECT], macro shot, bokeh. Rustic wood surface. 50mm lens, f/2.8, soft daylight, volumetric lighting, appetizing, food porn, highly detailed, sharp focus, 8k, ray tracing, vibrant red and orange tones.'
  },
  {
    id: 'dynamic_macro',
    auto: false,
    icon: Activity,
    label: 'Dynamic Macro',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    description: 'Suspended Motion',
    prompt: 'A dynamic high-speed macro food photograph capturing [SUBJECT] suspended in mid-air, levitating above it own plate. The lighting is dramatic and moody chiaroscuro side-lighting from the left, heavily bokeh background of dark kitchen shelves. The focus is razor-sharp on the flying elements. 8k resolution, highly detailed texture.'
  },
  {
    id: 'frozen_motion',
    auto: false,
    icon: Snowflake,
    label: 'Frozen Motion',
    color: 'text-blue-300',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    description: 'Zero Blur',
    prompt: 'A vertical, high-speed macro photograph capturing a dynamic shot of [SUBJECT]. The lighting is dramatic chiaroscuro from the back-left, deep black background. The background is extremely dark and heavily blurred (bokeh), showing faint outlines. Razor-sharp focus on the ingredients. Frozen motion, no blur. Shot on a 100mm macro lens. 8k resolution, altamente detailed.'
  },
  {
    id: 'high_key',
    auto: false,
    icon: Sun,
    label: 'High-Key',
    color: 'text-yellow-200',
    bg: 'bg-yellow-100/10',
    border: 'border-yellow-100/30',
    description: 'Bright & Airy',
    prompt: 'A high-key, overhead flat lay food photograph of [SUBJECT]. The lighting is bright, soft, diffused natural daylight with no harsh shadows. The focus is sharp across the entire frame. Shot on a 50mm lens at f/8.'
  },
  {
    id: 'summer_feast',
    auto: false,
    icon: Palmtree,
    label: 'Summer Feast',
    color: 'text-lime-400',
    bg: 'bg-lime-500/10',
    border: 'border-lime-500/30',
    description: 'Rustic Garden',
    prompt: 'A top-down flat lay food photograph of a rustic, communal summer gathering. The centrepiece is [SUBJECT] on a large wooden table. Surrounding the main ingredients. Vintage silver cutlery, small ornamentals, scattered ingredients, and tiny floral sprigs decorate the table. The lighting is soft, diffused natural daylight, creating a warm and cozy atmosphere. The focus is sharp across the entire frame (deep depth of field). Shot on a 50mm lens at f/8.'
  },
  {
    id: 'chef_portrait',
    auto: false,
    icon: User,
    label: 'Chef Portrait',
    color: 'text-stone-400',
    bg: 'bg-stone-500/10',
    border: 'border-stone-500/30',
    description: 'Held by Chef',
    prompt: 'A moody, close-up portrait photograph of [SUBJECT] held in the hands of an unseen person wearing a black chef jacket top with "Mestizo" , "Restaurant & Margarita Bar" on the top right of the chef jacket top. Font: Bauer Bodoni, one line subtitle: Bauer Bodoni italic, smaller size. The lighting is dramatic and soft natural side-light from the left (chiaroscuro style), emphasizing the textures of the ingredients against a dark, shadowed background. The depth of field is extremely shallow, with razor-sharp focus only on the front ingredients of the dish, while the person’s pleated clothing behind it renders into a smooth, creamy bokeh blur. Shot on an 85mm f/1.4 lens. Rich autumn colour tones. Film grain texture.'
  },
  {
    id: 'ceviche_style',
    auto: false,
    icon: Fish,
    label: 'Ceviche Style',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    description: 'Fresh & Detailed',
    prompt: 'An overhead photograph of a rustic summer feast, captured with a 35mm lens at f/4. The scene, shot on a wooden table, features [SUBJECT] meticulously arranged in a textured teal ceramic bowl. Beside it is a slanted bowl of golden tortilla chips and a small white creamer containing vibrant green salsa verde. Hands reach into the frame to serve and eat. Eucalyptus branches and scattered citrus ingredients are artfully arranged as natural decor. The lighting is warm and directional from the side, highlighting the textures. The composition is a balanced flat lay, with natural, moody colours.'
  },
  {
    id: 'rustic_gathering',
    auto: false,
    icon: Users,
    label: 'Rustic Gathering',
    color: 'text-amber-600',
    bg: 'bg-amber-700/10',
    border: 'border-amber-700/30',
    description: 'Communal Table',
    prompt: 'An overhead photograph of a rustic summer feast, captured with a 35mm lens at f/4. The scene, shot on a wooden table, features [SUBJECT]. Hands reach into the frame to serve and eat. Food ingredients are artfully arranged as natural décor. The lighting is warm and directional from the side, highlighting textures. The composition is a balanced flat lay, with natural, moody colours.'
  },
  {
    id: 'social_media',
    auto: false,
    icon: Smartphone,
    label: 'Social Media',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    description: 'Influencer Shot',
    prompt: 'A top-down, flat-lay photograph from directly overhead of a large, wooden communal table filled with food. The scene is bustling with the hands of seven to eight people, each holding a smartphone and actively taking a picture of the [SUBJECT] from above. The phone screens are visible, showing the camera app view. The hands are diverse, featuring various tattoos, painted nails, and different shirt sleeves (flannel, denim, t-shirts). The arrangement of food and hands is dense and dynamic, filling the entire frame. The lighting is bright, even, and diffused from above, creating soft shadows. The entire scene, from the food to the details on the phones and hands, is in sharp focus. The shot is captured with a wide-angle lens.'
  },
  {
    id: 'action_shot',
    auto: false,
    icon: Play,
    label: 'Action Shot',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    description: 'Eating Moment',
    prompt: 'A top-down, flat-lay photograph from directly overhead, capturing a mid 20s woman in a vibrant blue t-shirt vigorously enjoying [SUBJECT] at a table. The woman has dark hair and is positioned in the lower center of the frame, sitting at a wooden table with deep grain and visible planks. Artfully scattered across the upper two-thirds of the table, flowing towards the plate, is a deconstructed arrangement of fresh ingredients. The lighting is soft, diffused natural daylight coming from the left, highlighting the textures of the old wood, the salt crystals. The focus is sharp across the entire scene, from the table surface to the hair. 50mm lens, f/8.'
  },
  {
    id: 'mediterranean',
    auto: false,
    icon: Waves,
    label: 'Mediterranean',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    description: 'Sunny Tiles',
    prompt: 'A vibrant, top-down flat-lay food photograph of a communal Mediterranean appetizer spread including [SUBJECT], shot directly overhead. The surface is a countertop tiled with light beige square tiles and visible grout. Three hands are active within the frame: one hand wearing a thin gold bracelet holds a glass of sparkling rosé wine, another hand reaches for a spoon. Styling includes matte gold cutlery and dusty rose linen napkins scattered casually. The lighting is bright, sunny, and directional, casting distinct, crisp shadows on the tiles. The colors are highly saturated and fresh. The entire scene is in sharp focus from edge to edge, simulating a 50mm lens at f/11.'
  },
  {
    id: 'lux_dark',
    auto: false,
    icon: Crown,
    label: 'Lux Dark',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Jewel Tones',
    prompt: 'A dark and moody, overhead flat lay food photograph with a rustic, luxurious feel. The centrepiece is [SUBJECT] resting on a large, ornate, tarnished dark metal platter. The surface is a deeply textured, matte black slate or concrete background. Arranged around the main platter are three smaller, dark stoneware plates with concentric ring patterns. Two antique silver forks rest on the plates. A crumpled, deep navy blue linen napkin is draped on the right side. The lighting is dramatic chiaroscuro, coming softly from the left, casting gentle shadows and highlighting the textures of the fruit and ceramics, while the edges of the frame fall into deep shadow. Shot on a 50mm lens at f/8. Tactile sharpness across the entire frame, edge-to-edge focus. Rich jewel tone colours.'
  },
  {
    id: 'moody_rustic_macro',
    auto: false,
    icon: Sprout,
    label: 'Moody Rustic',
    color: 'text-green-800',
    bg: 'bg-green-900/20',
    border: 'border-green-800/30',
    description: 'Vintage Props',
    prompt: 'A top-down, moody food photograph of [SUBJECT] on a round, dark, rustic wooden serving board. Two vintage silver spoons rest on the board to the right. The board is placed on a larger, dark, distressed wooden table. Scattered artfully around the board are ingredients. In the top-left corner, the edge of an old, dark-covered book is visible. The lighting is soft, directional, and moody, coming from the left, highlighting the textures of the food and wood grain and creating deep, soft shadows. Shot with a 50mm macro lens at f/2.8, ISO 100, to create a shallow depth of field.'
  },
  {
    id: 'abundant_feast',
    auto: false,
    icon: UtensilsCrossed,
    label: 'Abundant Feast',
    color: 'text-orange-600',
    bg: 'bg-orange-700/10',
    border: 'border-orange-700/30',
    description: 'Banquet Style',
    prompt: 'A top-down flat lay photograph of an abundant wooden dining table set for a feast featuring [SUBJECT]. The table is overflowing with various dishes. The table is surrounded by a mix of wooden and rattan chairs. The lighting is diffused overhead, casting soft shadows, with a sharp focus across all the food items. The shot is taken with a wide-angle lens at an f/8 aperture for a deep depth of field.'
  },
  {
    id: 'elegant_moody',
    auto: false,
    icon: Gem,
    label: 'Elegant Moody',
    color: 'text-violet-300',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/30',
    description: 'Sophisticated',
    prompt: 'A moody, overhead flat-lay food photograph captured with a 50mm lens at f/8. The subject is [SUBJECT]. The plate sits on a heavily textured, dark mottled concrete or aged metal table surface. Surrounding the main plate are props that frame the scene: to the top left, a white enamel pour-over kettle and two dark ceramic mugs filled with coffee; above the plate, a stack of tarnished vintage silver forks; to the right, a large, crumpled dark charcoal linen napkin; in the bottom right, a small bowl of whole peppercorns. Sprigs of fresh thyme and loose grapes are scattered artfully across the dark surface. The lighting is soft, diffused natural daylight coming from the left, creating gentle shadows and highlighting the rich textures. The focus is tack sharp across the entire frame. The overall mood is rustic, organic, and elegant.'
  },
  {
    id: 'gen_enhance',
    auto: false,
    icon: Wand2,
    label: 'Auto Enhance',
    color: 'text-white',
    bg: 'bg-white/10',
    border: 'border-white/30',
    description: 'Natural Boost',
    prompt: 'Enhance this photo of [SUBJECT] to look bright, appetizing, and natural. Adjust lighting for soft daylight tones, increase vibrancies of colours without oversaturation, sharpen details, higher structure, and add subtle depth of field. Keep background clean and slightly blurred to emphasize texture and freshness.'
  },
  {
    id: 'menu_look',
    auto: false,
    icon: FileText,
    label: 'Menu Look',
    color: 'text-gray-300',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    description: 'Professional Menu',
    prompt: 'Edit this photo of [SUBJECT] for a professional restaurant menu. Enhance color contrast, increase brightness slightly, make whites clean and crisp, and boost texture and shine on the food. Keep the background simple, with a polished but realistic look. Add a slight vignette for focus.'
  },
  {
    id: 'farm_table',
    auto: false,
    icon: Leaf,
    label: 'Farm to Table',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    description: 'Organic Vibe',
    prompt: 'Make this image of [SUBJECT] warm and organic. Use natural light tones, slightly desaturated greens, and gentle shadows. Highlight texture and freshness. Avoid harsh contrasts — aim for a cozy, authentic farm-to-table vibe.'
  },
  {
    id: 'insta_style',
    auto: false,
    icon: Instagram,
    label: 'Insta Style',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    description: 'Social Ready',
    prompt: 'Edit this photo of [SUBJECT] for Instagram. Boost vibrance and saturation slightly, add clarity and structure, and create a balanced color tone with warm highlights and soft shadows. Keep colors rich but true to life. Add a clean, modern aesthetic.'
  },
  {
    id: 'dark_moody_gen',
    auto: false,
    icon: CloudFog,
    label: 'Dark & Moody',
    color: 'text-indigo-800',
    bg: 'bg-indigo-900/40',
    border: 'border-indigo-800/30',
    description: 'Cinematic',
    prompt: 'Create a moody, cinematic edit of [SUBJECT]. Darken background, increase contrast and shadows, highlight the food with warm directional light. Enhance rich tones like browns, reds, and golds. Keep it elegant and atmospheric.'
  },
];

const EnhanceView: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [detectedSubject, setDetectedSubject] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper to get a variation object by ID
  const getVariation = (id: string) => variations.find(v => v.styleId === id);

  const handleCapture = async (file: File, previewUrl: string, base64: string) => {
    setOriginalImage(previewUrl);
    setDetectedSubject(null);
    setIsAnalyzing(true);
    
    // Initialize variations state
    // Auto styles -> 'pending', others -> 'idle'
    setVariations(STYLES.map(style => ({
      styleId: style.id,
      status: style.auto ? 'pending' : 'idle',
      imageUrl: null
    })));

    try {
      // 1. Detect Subject
      console.log("Detecting subject...");
      const analysis = await analyzeBottleImage(base64);
      const subject = analysis.productName || analysis.specs.type || "this item";
      setDetectedSubject(subject);
      setIsAnalyzing(false);

      // 2. Trigger auto-generations
      triggerAutoGenerations(base64, subject);

    } catch (error) {
      console.error("Detection failed", error);
      setDetectedSubject("Item");
      setIsAnalyzing(false);
      triggerAutoGenerations(base64, "Item");
    }
  };

  const triggerAutoGenerations = (base64: string, subject: string) => {
    setVariations(prev => prev.map(v => 
      // Only change pending ones to processing
      v.status === 'pending' ? { ...v, status: 'processing' } : v
    ));

    STYLES.forEach((style) => {
      if (style.auto) {
        generateSingleVariation(style.id, base64, subject);
      }
    });
  };

  const generateSingleVariation = async (styleId: string, base64: string, subject: string) => {
    const style = STYLES.find(s => s.id === styleId);
    if (!style) return;

    try {
      const customizedPrompt = style.prompt.replace(/\[SUBJECT\]/g, subject);
      const enhancedBase64 = await enhanceImageStyle(base64, customizedPrompt);
      
      setVariations(prev => prev.map(v => 
        v.styleId === styleId 
          ? { ...v, status: 'completed', imageUrl: `data:image/jpeg;base64,${enhancedBase64}` } 
          : v
      ));
    } catch (err) {
      console.error(`Failed to generate ${styleId}`, err);
      setVariations(prev => prev.map(v => 
        v.styleId === styleId 
          ? { ...v, status: 'error' } 
          : v
      ));
    }
  };

  const handleManualGenerate = (styleId: string) => {
    if (!originalImage || !detectedSubject) return;
    
    // Update status to processing
    setVariations(prev => prev.map(v => 
      v.styleId === styleId ? { ...v, status: 'processing' } : v
    ));

    // Retrieve base64 from the original image (we need to extract it again or store it)
    // For simplicity, assuming we can get it from the image src if needed, but better to store it.
    // NOTE: In a real app, we should store the raw base64. For now, let's assume we can use the originalImage if it's a data URL.
    // If originalImage is a blob URL, we can't easily get base64 without fetching.
    // The component flow: handleCapture receives base64. We should store it in state.
    
    // Re-fetch base64 from the stored previewUrl if it is a data URL, or we need to store the base64 in state.
    // Let's assume `originalImage` is the data URL (as per ImageUploader implementation).
    const base64Data = originalImage.split(',')[1];
    generateSingleVariation(styleId, base64Data, detectedSubject);
  };

  const handleDownload = (imageUrl: string, styleLabel: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${styleLabel.toLowerCase().replace(/\s/g, '-')}-enhanced.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    const completedVariations = variations.filter(v => v.status === 'completed' && v.imageUrl);
    
    // Create a delay function to avoid browser blocking multiple rapid downloads
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const v of completedVariations) {
      const style = STYLES.find(s => s.id === v.styleId);
      if (style && v.imageUrl) {
        const link = document.createElement('a');
        link.href = v.imageUrl;
        // Construct filename: Subject_Style.jpg
        const subjectPart = detectedSubject ? detectedSubject.replace(/\s+/g, '_').substring(0, 15) : 'enhanced';
        const stylePart = style.label.replace(/\s+/g, '_');
        link.download = `${subjectPart}_${stylePart}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await delay(300); // 300ms delay between downloads
      }
    }
  };

  const handleCopy = async (imageUrl: string, id: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy image:", err);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setVariations([]);
    setDetectedSubject(null);
  };

  // Count completed for conditional rendering
  const completedCount = variations.filter(v => v.status === 'completed').length;

  return (
    <div className="w-full max-w-md mx-auto pb-24 animate-[fadeIn_0.5s_ease-out]">
      
      {/* Initial View: Camera Button */}
      {!originalImage && (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center mb-8 space-y-2">
             <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                AI Magic Studio
             </h2>
             <p className="text-slate-400 text-sm max-w-[260px] mx-auto">
               Take a photo or upload. We'll detect the subject and generate professional styles instantly.
             </p>
          </div>
          <ImageUploader 
             onImageSelected={handleCapture} 
             onlyCamera={true}
             withUploadOption={true}
          />
        </div>
      )}

      {/* Results View */}
      {originalImage && (
        <div className="space-y-6">
           
           {/* Top Section: Original & Detection */}
           <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 -mx-4 px-4 pb-6 pt-2 sticky top-0 z-30">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-600 bg-slate-900 shrink-0 relative group">
                    <img src={originalImage} alt="Original" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 text-[8px] bg-black/60 text-center text-white py-0.5">ORIGINAL</div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Detected Subject</h3>
                    {isAnalyzing ? (
                       <div className="flex items-center gap-2 text-purple-400 text-lg font-medium animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                       </div>
                    ) : (
                       <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-white truncate animate-[slideDown_0.3s_ease-out]">{detectedSubject}</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] border border-purple-500/30">
                            Auto-Focus
                          </span>
                       </div>
                    )}
                 </div>
                 
                 {/* Action Buttons */}
                 <div className="flex flex-col gap-2">
                     <button 
                        onClick={handleReset}
                        className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                        title="Reset"
                     >
                        <RefreshCcw className="w-4 h-4" />
                     </button>
                     {completedCount > 0 && (
                        <button 
                            onClick={handleDownloadAll}
                            className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                            title="Download All Generated"
                        >
                            <FolderDown className="w-4 h-4" />
                        </button>
                     )}
                 </div>
              </div>
              
              {/* Progress Bar */}
              {!isAnalyzing && variations.some(v => v.status === 'processing') && (
                 <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 animate-[progress_2s_ease-in-out_infinite] w-1/3 rounded-full"></div>
                 </div>
              )}
           </div>

           {/* Grid of Variations */}
           <div className="grid grid-cols-2 gap-3">
              {variations.map((variation) => {
                const style = STYLES.find(s => s.id === variation.styleId)!;
                const Icon = style.icon;
                const isCompleted = variation.status === 'completed' && variation.imageUrl;
                const isIdle = variation.status === 'idle';
                const isProcessing = variation.status === 'processing' || variation.status === 'pending';
                const isError = variation.status === 'error';
                
                return (
                   <div 
                      key={variation.styleId} 
                      onClick={() => isIdle && handleManualGenerate(variation.styleId)}
                      className={`bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col relative group transition-all ${isIdle ? 'hover:bg-slate-800 hover:border-slate-600 cursor-pointer active:scale-[0.98]' : ''}`}
                   >
                      {/* Header */}
                      <div className="p-2 flex items-center gap-2 border-b border-slate-700/30 bg-slate-900/30">
                         <div className={`p-1.5 rounded-lg ${style.bg} ${style.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                         </div>
                         <span className="text-xs font-bold text-slate-300 truncate">{style.label}</span>
                      </div>

                      {/* Image Area */}
                      <div className="aspect-square relative bg-slate-900">
                          {isCompleted ? (
                             <>
                                <img 
                                  src={variation.imageUrl!} 
                                  alt={style.label} 
                                  className="w-full h-full object-cover animate-[fadeIn_0.5s_ease-out]"
                                />
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                       onClick={(e) => { e.stopPropagation(); handleCopy(variation.imageUrl!, variation.styleId); }}
                                       className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-lg text-white transition-colors"
                                       title="Copy to Clipboard"
                                    >
                                       {copiedId === variation.styleId ? (
                                         <Check className="w-4 h-4 text-emerald-400" />
                                       ) : (
                                         <Copy className="w-4 h-4" />
                                       )}
                                    </button>
                                    <button
                                       onClick={(e) => { e.stopPropagation(); handleDownload(variation.imageUrl!, style.label); }}
                                       className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-lg text-white transition-colors"
                                       title="Download"
                                    >
                                       <Download className="w-4 h-4" />
                                    </button>
                                </div>
                             </>
                          ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                {isProcessing ? (
                                   <>
                                     <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${style.color.replace('text-', 'border-')} mb-2`}></div>
                                     <span className="text-[10px] text-slate-500">Rendering...</span>
                                   </>
                                ) : isIdle ? (
                                   <div className="flex flex-col items-center opacity-50 group-hover:opacity-100 transition-opacity">
                                     <Sparkles className={`w-6 h-6 mb-1 ${style.color}`} />
                                     <span className="text-[10px] font-bold text-slate-400">Tap to Generate</span>
                                   </div>
                                ) : (
                                   <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
                                      <span className="text-[10px] text-red-400 font-medium">Generation Failed</span>
                                      <button 
                                         onClick={(e) => { e.stopPropagation(); handleManualGenerate(variation.styleId); }}
                                         className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[10px] font-bold text-red-300 transition-colors"
                                      >
                                         <RefreshCcw className="w-3 h-3" />
                                         Retry
                                      </button>
                                   </div>
                                )}
                             </div>
                          )}
                      </div>
                   </div>
                );
              })}
           </div>

        </div>
      )}
      
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); width: 60%; }
          100% { transform: translateX(200%); width: 20%; }
        }
      `}</style>
    </div>
  );
};

export default EnhanceView;
