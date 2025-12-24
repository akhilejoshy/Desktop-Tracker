export interface PlaceHolderImage {
  id: string;
  imageUrl: string;
  description: string;
  imageHint?: string;
}

export const PlaceHolderImages: PlaceHolderImage[] = [
  {
    id: 'ss-1',
    imageUrl: 'https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=612x612&w=0&k=20&c=A63koPKaCyIwQWOTFBRWXj_PwCrR4cEoOw2S9Q7yVl8=',
    description: 'Screenshot 1',
    imageHint: 'Main window screenshot',
  },
  {
    id: 'sub-9',
    imageUrl: 'https://via.placeholder.com/500x300?text=Screenshot+2',
    description: 'Screenshot 2',
    imageHint: 'Secondary window screenshot',
  },
  // add more mock screenshots as needed
];
