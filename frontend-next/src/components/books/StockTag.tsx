import { formatNumber } from "@/utils/format";

const LOW_STOCK_LIMIT = 5;

/** Coloured stock badge: out of stock / low / in stock. */
export function StockTag({ stock }: { stock: number }) {
  if (stock === 0) return <span className="stock-tag is-out">Out of stock</span>;
  if (stock <= LOW_STOCK_LIMIT) return <span className="stock-tag is-low">Low · {formatNumber(stock)}</span>;
  return <span className="stock-tag is-in">{formatNumber(stock)}</span>;
}
