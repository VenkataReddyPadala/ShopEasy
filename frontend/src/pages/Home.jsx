import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "../pageStyles/Home.css";
import "../componentStyles/Footer.css";
import ImageSlider from "../components/ImageSlider";
import Product from "../components/Product";
import PageTitle from "../components/PageTitle";
import { Link } from "react-router-dom";
import { useGetProductsQuery } from "../services/productsApi";
// import store from "../app/store";
import Loader from "../ui/Loader";
import ProductSkeleton from "../components/ProductSkeliton";
import ErrorBlock from "../ui/ErrorBlock";

function Home() {
  // const { queryArgs } = useLoaderData();
  const queryArgs = {
    page: 1,
    limit: 8,
    sort: "-createdAt",
  };

  const { data, isLoading, isError, error, refetch } =
    useGetProductsQuery(queryArgs);

  const productsList = data?.data || [];

  return (
    <>
      <PageTitle title="Home" />
      <ImageSlider />

      <div className="home-container">
        <h2 className="home-heading">Trending Now</h2>

        {isError && !isLoading ? (
          <ErrorBlock
            message={error?.data?.message || error?.message}
            refetch={refetch}
          />
        ) : (
          <div className="home-product-container">
            <div className="product-grid">
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}

              {!isLoading &&
                productsList.length > 0 &&
                productsList.map((product) => (
                  <Product product={product} key={product.id} />
                ))}
            </div>

            {!isLoading && productsList.length === 0 && (
              <p style={{ textAlign: "center" }}>
                No products found at the moment.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// export async function loader() {
//   // We don't look at URL params here because Home is always "Trending"
//   const queryArgs = {
//     page: 1,
//     limit: 8, // Showing 8 items looks better in a grid than 10
//     sort: "-createdAt", // API convention for "newest first"
//   };

//   const promise = store.dispatch(
//     productsApi.endpoints.getProducts.initiate(queryArgs)
//   );

//   await promise;

//   return { queryArgs };
// }

export default Home;
