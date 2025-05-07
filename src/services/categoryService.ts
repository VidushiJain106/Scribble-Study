
import { supabase } from "@/integrations/supabase/client";
import { CategoryItem } from "@/types";

// Get all categories for the current user
export async function getCategories() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.user.id)
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getCategories:", error);
    return { data: null, error };
  }
}

// Create a new category
export async function createCategory(name: string, parent?: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: "Not authenticated" };
    }

    // Check if category already exists
    const { data: existingCategories } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("name", name);

    if (existingCategories && existingCategories.length > 0) {
      return { data: null, error: "Category already exists" };
    }

    // Create the new category
    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.user.id,
        name,
        parent,
        sub_categories: []
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return { data: null, error };
    }

    // If this category has a parent, update the parent's subcategories
    if (parent) {
      const { data: parentData } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("name", parent)
        .single();

      if (parentData) {
        const updatedSubCategories = [...(parentData.sub_categories || []), name];
        
        const { error: updateError } = await supabase
          .from("categories")
          .update({
            sub_categories: updatedSubCategories,
            updated_at: new Date().toISOString()
          })
          .eq("id", parentData.id);

        if (updateError) {
          console.error("Error updating parent category:", updateError);
        }
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in createCategory:", error);
    return { data: null, error };
  }
}

// Delete a category
export async function deleteCategory(name: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { error: "Not authenticated" };
    }

    // Get the category first to check if it has subcategories
    const { data: category } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("name", name)
      .single();

    if (!category) {
      return { error: "Category not found" };
    }

    // Get all subcategories to remove them too
    const categoriesToRemove = [name];
    if (category.sub_categories && category.sub_categories.length > 0) {
      categoriesToRemove.push(...category.sub_categories);
    }

    // Delete the categories
    const { error } = await supabase
      .from("categories")
      .delete()
      .in("name", categoriesToRemove)
      .eq("user_id", user.user.id);

    if (error) {
      console.error("Error deleting categories:", error);
      return { error };
    }

    // If it has a parent, update the parent's subcategories
    if (category.parent) {
      const { data: parentData } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("name", category.parent)
        .single();

      if (parentData) {
        const updatedSubCategories = (parentData.sub_categories || []).filter(sub => sub !== name);
        
        const { error: updateError } = await supabase
          .from("categories")
          .update({
            sub_categories: updatedSubCategories,
            updated_at: new Date().toISOString()
          })
          .eq("id", parentData.id);

        if (updateError) {
          console.error("Error updating parent category:", updateError);
        }
      }
    }

    return { error: null };
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return { error };
  }
}

// Convert the database categories to the app's CategoryItem format
export function convertDbCategoriesToCategoryItems(categories: any[]): CategoryItem[] {
  if (!categories) return [];
  
  const categoryItems: CategoryItem[] = [];
  
  // First pass: Create all category items
  categories.forEach(category => {
    categoryItems.push({
      name: category.name,
      parent: category.parent || undefined,
      subCategories: category.sub_categories || []
    });
  });
  
  return categoryItems;
}
