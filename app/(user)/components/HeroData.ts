// HeroData.ts
// Array of 5 places with name, rating, and simple description


export interface Place {
  name: string;
  rating: number;
  description: string;
  image: string;
}

export const places: Place[] = [
  {
    name: "Sunset Beach",
    rating: 4.8,
    description: "A beautiful sandy beach perfect for relaxing and swimming.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Mountain View Park",
    rating: 4.7,
    description: "A scenic park with hiking trails and panoramic mountain views.",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "City Art Museum",
    rating: 4.6,
    description: "A modern museum showcasing local and international art.",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Green Valley Gardens",
    rating: 4.9,
    description: "Lush botanical gardens with a variety of exotic plants.",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Historic Old Town",
    rating: 4.5,
    description: "A charming district with cobblestone streets and historic buildings.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
  }
];
