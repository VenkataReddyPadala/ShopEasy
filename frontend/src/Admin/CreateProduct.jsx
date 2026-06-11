import PageTitle from "../components/PageTitle";
import ProductForm from "./ProductForm";
import "../AdminStyles/CreateProduct.css";

function CreateProduct() {
  return (
    <>
      <PageTitle title="Create Product" />
      <div className="create-product-container">
        <h1 className="form-title">Create Product</h1>
        <ProductForm buttonText="Create" />
      </div>
    </>
  );
}

export default CreateProduct;
