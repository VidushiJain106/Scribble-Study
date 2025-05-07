
import { create } from 'zustand';
import { CategoryItem } from '@/types';
import * as categoryService from '@/services/categoryService';

interface CategoryState {
  categories: string[];
  categoryItems: CategoryItem[];
  isLoading: boolean;
  
  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (category: string, parent?: string) => void;
  deleteCategory: (category: string) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: ['Math', 'Physics', 'Chemistry', 'English'],
  categoryItems: [
    { name: 'Math', subCategories: ['Algebra', 'Geometry', 'Calculus'] },
    { name: 'Physics', subCategories: ['Mechanics', 'Electromagnetism'] },
    { name: 'Chemistry', subCategories: ['Organic', 'Inorganic'] },
    { name: 'English', subCategories: ['Literature', 'Grammar', 'Vocabulary'] },
    { name: 'Algebra', parent: 'Math' },
    { name: 'Geometry', parent: 'Math' },
    { name: 'Calculus', parent: 'Math' },
    { name: 'Mechanics', parent: 'Physics' },
    { name: 'Electromagnetism', parent: 'Physics' },
    { name: 'Organic', parent: 'Chemistry' },
    { name: 'Inorganic', parent: 'Chemistry' },
    { name: 'Literature', parent: 'English' },
    { name: 'Grammar', parent: 'English' },
    { name: 'Vocabulary', parent: 'English' }
  ],
  isLoading: false,
  
  fetchCategories: async () => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await categoryService.getCategories();
      
      if (error) {
        console.error("Error fetching categories:", error);
        set({ isLoading: false });
        return;
      }
      
      if (data) {
        // Extract category names
        const categoryNames = data.map(cat => cat.name);
        
        // Convert to categoryItems format
        const categoryItems = categoryService.convertDbCategoriesToCategoryItems(data);
        
        set({ 
          categories: categoryNames,
          categoryItems: categoryItems,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error("Error in fetchCategories:", error);
      set({ isLoading: false });
    }
  },
  
  createCategory: (category: string, parent?: string) => {
    // Optimistic update
    set(state => {
      // Check if category already exists (case insensitive)
      const categoryExists = state.categories.some(
        cat => cat.toLowerCase() === category.toLowerCase()
      );
      
      if (categoryExists) return state;
      
      // Add category to the list of categories
      const newCategories = [...state.categories, category];
      
      // Create the category item
      let newCategoryItems = [...state.categoryItems];
      const newCategory: CategoryItem = { name: category };
      
      // If parent is provided, set parent and add this category as subcategory to parent
      if (parent) {
        newCategory.parent = parent;
        
        // Find parent category item and update its subCategories
        const parentIndex = newCategoryItems.findIndex(item => item.name === parent);
        if (parentIndex !== -1) {
          const parentItem = {...newCategoryItems[parentIndex]};
          parentItem.subCategories = parentItem.subCategories 
            ? [...parentItem.subCategories, category]
            : [category];
          
          newCategoryItems[parentIndex] = parentItem;
        }
      }
      
      // Add the new category item
      newCategoryItems.push(newCategory);
      
      return {
        categories: newCategories,
        categoryItems: newCategoryItems
      };
    });
    
    // Save to Supabase in background
    categoryService.createCategory(category, parent).then(({ error }) => {
      if (error) {
        console.error("Error creating category in Supabase:", error);
        // Toast notification would be added here
      }
    });
  },
  
  deleteCategory: (category: string) => {
    // Optimistic update
    set(state => {
      // Get the category item
      const categoryItem = state.categoryItems.find(item => item.name === category);
      if (!categoryItem) return state;
      
      let categoriesToRemove = [category];
      
      // If it has subcategories, add them to the removal list
      if (categoryItem.subCategories && categoryItem.subCategories.length > 0) {
        categoriesToRemove = [...categoriesToRemove, ...categoryItem.subCategories];
      }
      
      // Remove from categories array
      const newCategories = state.categories.filter(cat => !categoriesToRemove.includes(cat));
      
      // Remove from categoryItems array
      const newCategoryItems = state.categoryItems.filter(item => !categoriesToRemove.includes(item.name));
      
      // If it has a parent, update the parent's subCategories
      if (categoryItem.parent) {
        const parentIndex = newCategoryItems.findIndex(item => item.name === categoryItem.parent);
        if (parentIndex !== -1) {
          const parentItem = {...newCategoryItems[parentIndex]};
          parentItem.subCategories = parentItem.subCategories?.filter(sub => sub !== category);
          newCategoryItems[parentIndex] = parentItem;
        }
      }
      
      return {
        categories: newCategories,
        categoryItems: newCategoryItems
      };
    });
    
    // Delete from Supabase in background
    categoryService.deleteCategory(category).then(({ error }) => {
      if (error) {
        console.error("Error deleting category from Supabase:", error);
        // Toast notification would be added here
      }
    });
  }
}));
