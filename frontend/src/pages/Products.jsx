import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import Product from "../components/Product";
import ProductSkeleton from "../components/ProductSkeliton";
import {
  useGetProductCategoriesQuery,
  useGetProductsQuery,
} from "../services/productsApi";
import Loader from "../ui/Loader";
import NoData from "../components/NoData";
import "../pageStyles/Products.css";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [limit, setLimit] = useState(8);
  // const [category, setCategory] = useState(null);
  const currentCategory = searchParams.get("category");

  const queryParams = {
    ...Object.fromEntries([...searchParams]),
    limit: limit,
  };

  const { isLoading, isFetching, data } = useGetProductsQuery(queryParams);
  const products = data?.data || [];
  const { data: categoriesData } = useGetProductCategoriesQuery();
  const categories = categoriesData?.data?.categories || [];

  const totalResults = data?.totalResults || 0;
  const search = searchParams.get("search");

  const handleCategoryClick = (category) => {
    const newParams = new URLSearchParams(searchParams);
    const isSameCategory =
      currentCategory?.toLowerCase() === category?.toLowerCase();
    if (isSameCategory) {
      newParams.delete("category");
    } else {
      newParams.set("category", category);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("category");
    setSearchParams(newParams);
  };

  const handleViewMore = () => {
    setLimit((prev) => prev + 8);
  };

  return (
    <>
      <PageTitle title="All Products" />
      <div className="products-layout">
        <div className="filter-section">
          <h3 className="filter-heading">CATEGORIES</h3>
          {currentCategory && (
            <button className="clear-btn" onClick={clearFilters}>
              Clear
            </button>
          )}
          <ul className="category-list">
            {categories.map((cat) => (
              <li
                key={cat}
                className={`category-item ${
                  currentCategory === cat ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>
        <div className="products-section">
          <div className="products-product-container">
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}

            {!isLoading &&
              products.length > 0 &&
              products.map((product) => (
                <Product product={product} key={product.id} />
              ))}

            {!isLoading && products.length === 0 && (
              <NoData search={search} data={"Products"} />
            )}
          </div>

          {!isLoading &&
            products.length > 0 &&
            products.length < totalResults && (
              <div
                className="view-more-container"
                style={{ textAlign: "center", marginTop: "2rem" }}
              >
                {isFetching ? (
                  <Loader />
                ) : (
                  <button className="view-more-btn" onClick={handleViewMore}>
                    View More
                  </button>
                )}
              </div>
            )}
        </div>
      </div>
    </>
  );
}

export default Products;
