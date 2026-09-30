import { CategoryForm, CategoryList } from '@/components/categories/Categories';
import { ScrollScreen } from '@/components/layout/Screen';

export default function CategoriesScreen() {
  return (
    <ScrollScreen>
      <CategoryForm />
      <CategoryList />
    </ScrollScreen>
  );
}
