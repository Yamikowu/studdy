export const CATEGORY_CARD_CLASSES = {
  quiz: 'category-card category-card--quiz',
  hw: 'category-card category-card--hw',
  '未分類': 'category-card category-card--uncategorized',
  none: 'category-card category-card--uncategorized',
};

export const getCategoryClass = (category) => {
  const key = category ?? '未分類';
  return CATEGORY_CARD_CLASSES[key] || CATEGORY_CARD_CLASSES['未分類'];
};
