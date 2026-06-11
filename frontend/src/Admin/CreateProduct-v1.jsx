import { useState, useRef } from "react";
import PageTitle from "../components/PageTitle";
import "../AdminStyles/CreateProduct.css";
import { toast } from "react-toastify";
import { useCreateProductMutation } from "../services/productsApi";
import ImagePreviewItem from "./ImagePreview";

function CreateProduct() {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Form states managed locally to send as clean JSON package
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "", // 💡 Notice this matches 'stock' in your Mongoose schema!
  });
  const categories = ["glass", "shirt", "mobile", "dress"];

  const [createProduct, { isLoading }] = useCreateProductMutation();

  // Handle standard text/select inputs mapping to state keys
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  //with using Base64 url format and without multer

  //   const handleImageChange = (e) => {
  //     if (e.target.files) {
  //       const filesArray = Array.from(e.target.files);

  //       const uniqueNewFiles = filesArray.filter((newFile) => {
  //         return !images.some(
  //           (existingFile) =>
  //             existingFile.name === newFile.name &&
  //             existingFile.size === newFile.size &&
  //             existingFile.lastModified === newFile.lastModified
  //         );
  //       });

  //       const duplicatesCount = filesArray.length - uniqueNewFiles.length;
  //       if (duplicatesCount > 0) {
  //         toast.info(
  //           `${duplicatesCount} duplicate ${
  //             duplicatesCount === 1 ? "image was" : "images were"
  //           } filtered out.`
  //         );
  //       }
  //       setImages((prevImages) => [...prevImages, ...uniqueNewFiles]);
  //       e.target.value = "";
  //     }
  //   };

  //   const handleRemoveImage = (indexToRemove) => {
  //     setImages((prevImages) =>
  //       prevImages.filter((_, index) => index !== indexToRemove)
  //     );
  //   };

  // Helper utility function to translate a single file object into a Base64 string promise
  //   const convertToBase64 = (file) => {
  //     return new Promise((resolve, reject) => {
  //       const fileReader = new FileReader();
  //       fileReader.readAsDataURL(file);
  //       fileReader.onload = () => {
  //         if (fileReader.readyState === 2) resolve(fileReader.result);
  //       };
  //       fileReader.onerror = (error) => reject(error);
  //     });
  //   };

  // Handle Form Submission
  //   const handleSubmit = async (e) => {
  //     e.preventDefault();

  //     if (images.length === 0) {
  //       toast.error("Please upload at least one image.");
  //       return;
  //     }

  //     try {
  //       // 1. Process all selected images concurrently into Base64 strings
  //       const base64ImagesArrayWithNulls = await Promise.all(
  //         images.map((file) =>
  //           convertToBase64(file).catch((error) => {
  //             console.log(error);
  //             toast.error(`Failed to add ${file.name}`);
  //             return null;
  //           })
  //         )
  //       );

  //       // Passing 'Boolean' automatically filters out null, undefined, false, etc.
  //       const base64ImagesArray = base64ImagesArrayWithNulls.filter(Boolean);

  //       // 2. Assemble the exact layout your backend and schema require
  //       const newProductPayload = {
  //         name: productData.name,
  //         description: productData.description,
  //         price: Number(productData.price),
  //         category: productData.category,
  //         stock: Number(productData.stock),
  //         images: base64ImagesArray, // Send the full array of strings directly in JSON body
  //       };

  //       // 3. Dispatch payload out via RTK mutation
  //       await createProduct(newProductPayload).unwrap();
  //       toast.success("New product created!");
  //       // Reset component states upon success
  //       setProductData({
  //         name: "",
  //         price: "",
  //         description: "",
  //         category: "",
  //         stock: "",
  //       });
  //       setImages([]);
  //     } catch (err) {
  //       // Caught gracefully inside mutation onQueryStarted, but terminates pipeline here safely
  //       toast.error(err.error?.data.message || "Failed to create product.");
  //     }
  //   };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      const uniqueNewFiles = filesArray.filter((newFile) => {
        return !images.some((existingFile) => {
          // Scenario 1: Comparing against an existing raw File object (for new uploads)
          if (existingFile instanceof File) {
            return (
              existingFile.name === newFile.name &&
              existingFile.size === newFile.size &&
              existingFile.lastModified === newFile.lastModified
            );
          }

          // Scenario 2: Comparing against an existing database image object (during Product Edit)
          if (
            existingFile &&
            typeof existingFile === "object" &&
            existingFile.public_id
          ) {
            // 1. Get the clean name without extension (e.g., "nike-shoes.png" -> "nike-shoes")
            const newFileNameWithoutExt = newFile.name
              .split(".")
              .slice(0, -1)
              .join(".");

            // 2. Clean up spaces to match how it was saved (e.g., "nike shoes" -> "nike-shoes")
            const cleanNewName = newFileNameWithoutExt.replace(/\s+/g, "-");

            // 3. Extract just the file name part from Cloudinary's public_id
            // (e.g., "products/nike-shoes-1718304921000" -> "nike-shoes-1718304921000")
            const cloudinaryFolderAndName = existingFile.public_id;

            // 4. Check if the Cloudinary string contains your clean file name followed by a hyphen
            return cloudinaryFolderAndName.includes(`${cleanNewName}-`);
          }

          return false;
        });
      });

      const duplicatesCount = filesArray.length - uniqueNewFiles.length;
      if (duplicatesCount > 0) {
        toast.info(
          `${duplicatesCount} duplicate ${
            duplicatesCount === 1 ? "image was" : "images were"
          } filtered out.`
        );
      }

      // Safely append the new native File objects to your state
      setImages((prevImages) => [...prevImages, ...uniqueNewFiles]);

      // Clear the input value so the user can select the same file again if they delete it
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }
    if (images.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", productData.name);
      formData.append("description", productData.description);
      formData.append("price", Number(productData.price));
      formData.append("category", productData.category);
      formData.append("stock", Number(productData.stock));

      // 3. Append files from your 'images' state array.
      // Multer will pick these up on the backend under the field name "images"
      images.forEach((file) => {
        // NOTE: For updating, if 'file' is already a URL string from your database,
        // you can handle that logic here or pass it along accordingly.
        formData.append("images", file);
      });

      const result = await createProduct(formData).unwrap();
      toast.success("New product created!");

      setProductData({
        name: "",
        price: "",
        description: "",
        category: "",
        stock: "",
      });
      setImages([]);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create product.");
    }
  };

  return (
    <>
      <PageTitle title="Create Product" />
      <div className="create-product-container">
        <h1 className="form-title">Create Product</h1>
        <form className="product-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter Product Name"
            name="name"
            value={productData.name}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <input
            type="number"
            className="form-input"
            placeholder="Enter Product Price"
            name="price"
            value={productData.price}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Enter Product Description"
            name="description"
            value={productData.description}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <select
            className="form-select"
            name="category"
            value={productData.category}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="form-input"
            placeholder="Enter Product Stock"
            name="stock"
            value={productData.stock}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />

          <div className="file-input-container">
            <input
              type="file"
              className="form-input-file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
              disabled={isLoading}
            />

            <div
              onClick={() => fileInputRef.current.click()}
              className="input-file-container"
            >
              <span className="choose-img">Choose Images</span>

              <span style={{ fontSize: "14px" }}>
                {images.length === 0
                  ? "No files chosen"
                  : `${images.length} ${
                      images.length === 1 ? "image" : "images"
                    } selected`}
              </span>
            </div>
          </div>

          <div className="image-preview-container">
            {images.map((file, index) => (
              <ImagePreviewItem
                key={`${file.name}-${file.lastModified}-${index}`}
                file={file}
                onRemove={() => handleRemoveImage(index)}
              />
            ))}
          </div>

          <button className="submit-btn" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </>
  );
}

export default CreateProduct;
