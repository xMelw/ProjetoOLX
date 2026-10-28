import { useEffect, useState } from "react";
import { getCategories } from "../models/categoryModel";

export default function useCategoriesController() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    let active = true;
    getCategories().then((items) => active && setCategories(items)).catch((error) => console.error("Erro ao carregar categorias:", error));
    return () => { active = false; };
  }, []);
  return { categories };
}