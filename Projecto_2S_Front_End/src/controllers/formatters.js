import { API_URL } from "../models/apiClient";

export const PLACEHOLDER_IMAGE = "/placeholder.png";

const priceFormatter = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

/**
 * Devolve sempre um URL de imagem utilizável:
 * - sem imagem -> placeholder da pasta public
 * - URL absoluto (http/https) -> inalterado
 * - "/uploads/..." -> prefixado com a API
 * - outro caminho absoluto ("/placeholder.png") -> inalterado (ficheiro do front end)
 * - nome de ficheiro devolvido pela API ("iphone.jpg") -> "<API>/uploads/iphone.jpg"
 */
export function imageUrl(image) {
  if (!image) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("/uploads/")) return `${API_URL}${image}`;
  if (image.startsWith("/")) return image;
  return `${API_URL}/uploads/${image}`;
}

/** Formato de preço único em toda a aplicação (ex.: "12,50 €"). */
export const formatPrice = (value) => priceFormatter.format(Number(value) || 0);

/**
 * O SQLite devolve datas como "YYYY-MM-DD HH:MM:SS" (UTC, sem fuso).
 * Esse formato não é lido de forma fiável por todos os browsers, por isso normaliza-se para ISO.
 */
export function parseDate(value) {
  if (!value) return null;
  const text = String(value);
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(text) ? `${text.replace(" ", "T")}Z` : text;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const formatDate = (value) => parseDate(value)?.toLocaleDateString("pt-PT") ?? "";
export const toTimestamp = (value) => parseDate(value)?.getTime() ?? 0;
