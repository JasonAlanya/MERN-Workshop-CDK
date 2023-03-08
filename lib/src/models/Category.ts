export type Category = {
  id: number;
  categoryName: string;
  photoType: string;
  categoryParent_id: number;
};

export type CategoryItem = {
  pk: string;
  sk: string;
  categoryName: string;
  photoType: string;
  categoryParent_id: number;
};
