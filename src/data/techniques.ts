import type { Technique, DailyPrompt } from '../types';

export const TECHNIQUES_DATA: Technique[] = [
  {
    id: 'gesture-sketching',
    title: 'Gesture & Dynamic Line Sketching',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    duration: '5 - 10 mins',
    description: 'Capture the rhythm, movement, and overall energy of a subject with quick, expressive strokes without getting bogged down by tiny details.',
    steps: [
      {
        number: 1,
        title: 'Find the Line of Action',
        description: 'Draw a single sweeping curved line through the subject representing its primary flow of motion or gravitational spine.'
      },
      {
        number: 2,
        title: 'Loose Geometric Masses',
        description: 'Block in head, torso, and pelvis with light, continuous circles or teardrop shapes, keeping the pencil moving.'
      },
      {
        number: 3,
        title: 'Tapering Limb Rhythm',
        description: 'Connect joints with rapid sweeping arcs. Avoid straight rigid lines; embrace asymmetry and tension.'
      },
      {
        number: 4,
        title: 'Accentuate Gravity & Weight',
        description: 'Add selective darker accents where weight lands or folds compress.'
      }
    ],
    tips: [
      'Draw from the shoulder, not just your wrist or fingers.',
      'Set a timer for 60 seconds per pose to break the perfectionism habit.',
      'Use the Sketch brush on the Paper surface for realistic pencil drag.'
    ],
    recommendedTool: 'sketch',
    recommendedSurface: 'paper',
    recommendedColor: '#E2E8F0',
    recommendedWidth: 4,
    tags: ['Anatomy', 'Speed Drawing', 'Gesture', 'Basics'],
    illustrationType: 'gesture'
  },
  {
    id: 'cross-hatching',
    title: 'Cross-Hatching & Volumetric Contour',
    category: 'Shading & Texture',
    difficulty: 'Intermediate',
    duration: '15 - 20 mins',
    description: 'Build tonal depth, form, and cast shadows by layering intersecting sets of parallel strokes, curving them around cylindrical volumes.',
    steps: [
      {
        number: 1,
        title: 'Define the Light Source',
        description: 'Mark the origin of light. Identify the highlight, midtones, terminator line, and deep cast shadow.'
      },
      {
        number: 2,
        title: 'Base Parallel Hatching',
        description: 'Lay down single-direction angled lines at 45° across the shaded zones with consistent spacing.'
      },
      {
        number: 3,
        title: 'Cross the Angles',
        description: 'Layer a second set of diagonal strokes over darker areas, varying the density to smooth transitions.'
      },
      {
        number: 4,
        title: 'Contour Follow-Through',
        description: 'Curve the outer hatching strokes around the 3D surface to enhance the tactile curvature of the subject.'
      }
    ],
    tips: [
      'Lift your pen between strokes to avoid hooked "eyebrow" ends.',
      'Vary the line proximity rather than pushing harder on your screen.',
      'Cross at subtle 30° to 60° angles instead of rigid 90° gridlines for an organic look.'
    ],
    recommendedTool: 'pen',
    recommendedSurface: 'paper',
    recommendedColor: '#38BDF8',
    recommendedWidth: 2,
    tags: ['Inking', 'Shading', 'Texture', 'Manga', 'Classic'],
    illustrationType: 'hatching'
  },
  {
    id: 'stippling-pointillism',
    title: 'Stippling & Dot Gradient Density',
    category: 'Shading & Texture',
    difficulty: 'Intermediate',
    duration: '20 - 30 mins',
    description: 'Create smooth velvety gradients and intricate textures entirely using dots. High dot density creates dark values; sparse dots create bright highlights.',
    steps: [
      {
        number: 1,
        title: 'Pencil Underdrawing',
        description: 'Lay down ultra-faint boundary outlines showing value borders (highlight, midtone, core shadow).'
      },
      {
        number: 2,
        title: 'Sparse Base Pattern',
        description: 'Distribute dots evenly across all shaded regions to establish baseline tone.'
      },
      {
        number: 3,
        title: 'Concentrated Shading',
        description: 'Cluster dots closer together in crevices, occlusion shadows, and ambient corners.'
      },
      {
        number: 4,
        title: 'Feather the Edge',
        description: 'Gradually space out dots toward the highlights for a photographic gradient effect.'
      }
    ],
    tips: [
      'Keep your dot size consistent so value depends solely on spacing.',
      'Tap gently without dragging to prevent unintentional comma marks.',
      'Excellent for rendering stone, skin pores, leather, and vintage botanical art.'
    ],
    recommendedTool: 'pen',
    recommendedSurface: 'sketch',
    recommendedColor: '#F43F5E',
    recommendedWidth: 3,
    tags: ['Pointillism', 'Patience', 'Inking', 'Fine Art'],
    illustrationType: 'stippling'
  },
  {
    id: 'color-blending-layering',
    title: 'Digital Marker Glazing & Color Blending',
    category: 'Color & Inking',
    difficulty: 'Intermediate',
    duration: '15 - 25 mins',
    description: 'Emulate alcohol marker layering and watercolor wash transitions using semi-translucent overlapping strokes with realistic paper bleed physics.',
    steps: [
      {
        number: 1,
        title: 'Base Light Wash',
        description: 'Lay down your lightest tone across the entire shape with broad marker strokes.'
      },
      {
        number: 2,
        title: 'First Shadow Pass',
        description: 'Introduce a midtone with 40-60% opacity. Overlap slightly over the base while wet.'
      },
      {
        number: 3,
        title: 'Deep Core Accents',
        description: 'Use a saturated complementary hue for shadows (e.g. deep violet over warm amber).'
      },
      {
        number: 4,
        title: 'Paper Texture Integration',
        description: 'Let the paper tooth show through to simulate genuine gouache or Copic bleed.'
      }
    ],
    tips: [
      'Work light-to-dark. In digital marker art, building dark over light preserves saturation.',
      'Use unexpected shadow colors (violet, teal, warm magenta) instead of muddy black.',
      'Switch between Marker and Pencil tools to combine soft fills with crisp edges.'
    ],
    recommendedTool: 'marker',
    recommendedSurface: 'paper',
    recommendedColor: '#A855F7',
    recommendedWidth: 16,
    tags: ['Coloring', 'Alcohol Marker', 'Blending', 'Illustration'],
    illustrationType: 'blending'
  },
  {
    id: 'two-point-perspective',
    title: '2-Point Perspective & Architectural Depth',
    category: 'Fundamentals',
    difficulty: 'Advanced',
    duration: '25 - 40 mins',
    description: 'Construct believable three-dimensional spaces, buildings, and sci-fi scenes using horizontal eye lines and dual vanishing points.',
    steps: [
      {
        number: 1,
        title: 'Horizon Line & Vanishing Points',
        description: 'Draw a horizontal eye-level line across your canvas and place point Left (VP1) and Right (VP2).'
      },
      {
        number: 2,
        title: 'True Vertical Corner',
        description: 'Draw the nearest vertical corner of your structure perpendicular to the horizon.'
      },
      {
        number: 3,
        title: 'Converging Orthogonals',
        description: 'Connect top and bottom endpoints to both VP1 and VP2 to form the building planes.'
      },
      {
        number: 4,
        title: 'Cut Off Depth Verticals',
        description: 'Add trailing vertical edges to seal the boxes, then sketch windows and architectural details.'
      }
    ],
    tips: [
      'Keep vanishing points far apart to avoid fish-eye distortion.',
      'All vertical lines remain strictly 90° straight in 2-point perspective.',
      'Use the Line & Shape tools in The Pad for rapid perspective guide layout.'
    ],
    recommendedTool: 'pencil',
    recommendedSurface: 'whiteboard',
    recommendedColor: '#10B981',
    recommendedWidth: 2,
    tags: ['Architecture', 'Backgrounds', 'Perspective', 'Environment'],
    illustrationType: 'perspective'
  },
  {
    id: 'chiaroscuro-lighting',
    title: 'Dramatic Chiaroscuro & Cinematic Lighting',
    category: 'Shading & Texture',
    difficulty: 'Advanced',
    duration: '20 - 30 mins',
    description: 'Master extreme contrast between dark backgrounds and sharp spotlight illumination, made famous by Caravaggio and Rembrandt.',
    steps: [
      {
        number: 1,
        title: 'Toned Canvas Base',
        description: 'Start with a dark slate or charcoal background so highlights immediately emerge.'
      },
      {
        number: 2,
        title: 'Carve the Key Light',
        description: 'Identify the exact angle of the primary light beam and carve the lighted facets with high brightness.'
      },
      {
        number: 3,
        title: 'Lost and Found Edges',
        description: 'Allow shadowed contours to completely dissolve into the surrounding darkness.'
      },
      {
        number: 4,
        title: 'Subtle Bounce Reflection',
        description: 'Add a whisper of colored ambient bounce into the shadows to define hidden silhouette forms.'
      }
    ],
    tips: [
      'Less is more: restricting highlights to 20% of the canvas heightens cinematic tension.',
      'Warm highlights paired with cool shadows create rich visual warmth.',
      'Use the Sketch tool on the Sketch surface for rough, smoky chiaroscuro transitions.'
    ],
    recommendedTool: 'sketch',
    recommendedSurface: 'sketch',
    recommendedColor: '#F59E0B',
    recommendedWidth: 8,
    tags: ['Lighting', 'Cinematic', 'Rembrandt', 'Portraiture'],
    illustrationType: 'lighting'
  },
  {
    id: 'clean-lineart-hierarchy',
    title: 'Line Weight Hierarchy & Comic Inking',
    category: 'Color & Inking',
    difficulty: 'Beginner',
    duration: '10 - 15 mins',
    description: 'Transform messy rough sketches into crisp, high-impact vector-style comic line art through calculated line weight variations.',
    steps: [
      {
        number: 1,
        title: 'Rough Silhouette Guide',
        description: 'Sketch the main silhouette in low opacity or light colored pencil.'
      },
      {
        number: 2,
        title: 'Heavy Outer Contour',
        description: 'Ink the exterior outline with a bold, authoritative stroke (6-8px width).'
      },
      {
        number: 3,
        title: 'Medium Interior Anatomy',
        description: 'Ink major interior features, clothing folds, and muscle breaks with medium weight (3-4px).'
      },
      {
        number: 4,
        title: 'Delicate Micro Details',
        description: 'Use a feather-light 1px pen for wrinkles, hair strands, fabric textures, and eye pupils.'
      }
    ],
    tips: [
      'Thicker lines naturally convey shadow, proximity, and heavy mass.',
      'Thinner lines convey bright illumination, distance, and fragile delicacy.',
      'Taper your strokes at junctions to give a professional calligraphy pen finish.'
    ],
    recommendedTool: 'pen',
    recommendedSurface: 'whiteboard',
    recommendedColor: '#EC4899',
    recommendedWidth: 3,
    tags: ['Inking', 'Comics', 'Anime', 'Line Art'],
    illustrationType: 'lineart'
  },
  {
    id: 'material-textures',
    title: 'Rendering Organic Textures (Wood, Fur, Metal)',
    category: 'Styles',
    difficulty: 'Intermediate',
    duration: '15 - 25 mins',
    description: 'Learn how to render diverse physical materials by altering stroke direction, edge sharpness, and specular reflection highlights.',
    steps: [
      {
        number: 1,
        title: 'Wood Grain Flow',
        description: 'Draw undulating wavy contour striations with occasional knot loop ovals using the Pencil tool.'
      },
      {
        number: 2,
        title: 'Fur Clump Shingling',
        description: 'Group fur into overlapping teardrop clumps rather than drawing individual hairs. Vary clump sizes.'
      },
      {
        number: 3,
        title: 'Metal Specular Hardness',
        description: 'Metal requires razor-sharp contrast between pure black tones and blinding white specular highlights.'
      },
      {
        number: 4,
        title: 'Surface Grit & Imperfection',
        description: 'Sprinkle tiny scratches, nicks, or surface dust with fine stippling dots.'
      }
    ],
    tips: [
      'Matte surfaces have diffuse, fuzzy shadow transitions; glossy materials have crisp edges.',
      'Observe real objects around your desk to understand how materials reflect surrounding room light.',
      'Paper surface physics gives organic materials authentic paper-bite tooth.'
    ],
    recommendedTool: 'pencil',
    recommendedSurface: 'paper',
    recommendedColor: '#D97706',
    recommendedWidth: 3,
    tags: ['Textures', 'Materials', 'Wood', 'Metal', 'Creatures'],
    illustrationType: 'textures'
  }
];

export const DAILY_PROMPTS_POOL: DailyPrompt[] = [
  {
    id: 'prompt-1',
    date: '2026-11-23',
    title: 'Neon Cyberpunk Creature',
    theme: 'Sci-Fi & Cyberpunk',
    description: 'Design a robotic familiar or neon-glowing animal creature resting on a rainy futuristic rooftop.',
    suggestedTools: ['pen', 'marker', 'sketch'],
    difficulty: 'Intermediate'
  },
  {
    id: 'prompt-2',
    date: '2026-11-24',
    title: 'Vintage Botanical Teacup',
    theme: 'Cozy & Nature',
    description: 'Draw an ornate porcelain teacup overgrown with delicate wild mushrooms, ferns, and morning dew.',
    suggestedTools: ['pencil', 'pen'],
    difficulty: 'Beginner'
  },
  {
    id: 'prompt-3',
    date: '2026-11-25',
    title: 'Crystal Cavern Shrine',
    theme: 'Fantasy & Environment',
    description: 'Sketch a glowing crystal monolith deep inside an echoing cavern with high-contrast chiaroscuro lighting.',
    suggestedTools: ['sketch', 'marker'],
    difficulty: 'Advanced'
  },
  {
    id: 'prompt-4',
    date: '2026-11-26',
    title: 'Dynamic Action Silhouette',
    theme: 'Anatomy & Motion',
    description: '30-second to 2-minute gesture drawing of a martial artist mid-air roundhouse kick or acrobatic leap.',
    suggestedTools: ['sketch', 'pen'],
    difficulty: 'Intermediate'
  }
];

export const INITIAL_LEADERBOARD = {
  allTime: [
    { rank: 1, id: 'u-1', name: 'Aria Vance', avatar: 'AV', streak: 142, totalDrawings: 388, badge: 'Grandmaster' },
    { rank: 2, id: 'u-2', name: 'Kai Takahashi', avatar: 'KT', streak: 118, totalDrawings: 295, badge: 'Ink Sorcerer' },
    { rank: 3, id: 'u-3', name: 'Elena Rostova', avatar: 'ER', streak: 94, totalDrawings: 210, badge: 'Color Alchemist' },
    { rank: 4, id: 'u-4', name: 'Marcus Chen', avatar: 'MC', streak: 87, totalDrawings: 194, badge: 'Gesture Titan' },
    { rank: 5, id: 'u-5', name: 'Sora Kim', avatar: 'SK', streak: 76, totalDrawings: 152, badge: 'Night Inker' },
    { rank: 6, id: 'u-6', name: 'Devon Reed', avatar: 'DR', streak: 63, totalDrawings: 140, badge: 'Daily Flame' },
    { rank: 7, id: 'u-7', name: 'Zara Patel', avatar: 'ZP', streak: 51, totalDrawings: 112, badge: 'Sketch Pioneer' },
  ],
  thisMonth: [
    { rank: 1, id: 'u-2', name: 'Kai Takahashi', avatar: 'KT', streak: 23, totalDrawings: 47, badge: 'Monthly Champion' },
    { rank: 2, id: 'u-1', name: 'Aria Vance', avatar: 'AV', streak: 23, totalDrawings: 42, badge: 'Top Contender' },
    { rank: 3, id: 'u-6', name: 'Devon Reed', avatar: 'DR', streak: 22, totalDrawings: 35, badge: 'Rising Star' },
    { rank: 4, id: 'u-3', name: 'Elena Rostova', avatar: 'ER', streak: 20, totalDrawings: 31, badge: 'Colorist' },
    { rank: 5, id: 'u-5', name: 'Sora Kim', avatar: 'SK', streak: 19, totalDrawings: 28, badge: 'Night Inker' },
  ]
};
