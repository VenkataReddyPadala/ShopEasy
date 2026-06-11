// import { useState, useRef, useEffect } from "react";
// import { toast } from "react-toastify";
// import ImagePreviewItem from "./ImagePreview";

// function ProductForm({
//   initialData,
//   initialImages = [],
//   onSubmit,
//   isLoading,
//   buttonText = "Submit",
// }) {
//   const fileInputRef = useRef(null);
//   const categories = ["glass", "shirt", "mobile", "dress"];

//   // 1. Maintain form fields states locally
//   const [productData, setProductData] = useState({
//     name: initialData?.name || "",
//     price: initialData?.price || "",
//     description: initialData?.description || "",
//     category: initialData?.category || "",
//     stock: initialData?.stock || "",
//   });

//   const [images, setImages] = useState(initialImages);
//   const [draggedIndex, setDraggedIndex] = useState(null);

//   // 2. Synchronize states dynamically ONLY when switching actual product contexts (Edit Mode)
//   // We use initialData?._id to track unique products and avoid reference loop issues
//   const editProductId = initialData?._id;

//   useEffect(() => {
//     if (editProductId) {
//       // eslint-disable-next-line react-hooks/set-state-in-effect
//       setProductData({
//         name: initialData.name || "",
//         price: initialData.price || "",
//         description: initialData.description || "",
//         category: initialData.category || "",
//         stock: initialData.stock || "",
//       });
//       setImages(initialImages || []);
//     }
//   }, [editProductId, initialData, initialImages]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setProductData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageChange = (e) => {
//     if (e.target.files) {
//       const filesArray = Array.from(e.target.files);

//       const uniqueNewFiles = filesArray.filter((newFile) => {
//         return !images.some((existingFile) => {
//           if (existingFile instanceof File) {
//             return (
//               existingFile.name === newFile.name &&
//               existingFile.size === newFile.size &&
//               existingFile.lastModified === newFile.lastModified
//             );
//           }

//           if (
//             existingFile &&
//             typeof existingFile === "object" &&
//             existingFile.public_id
//           ) {
//             const newFileNameWithoutExt = newFile.name
//               .split(".")
//               .slice(0, -1)
//               .join(".");
//             const cleanNewName = newFileNameWithoutExt.replace(/\s+/g, "-");
//             const cloudinaryFolderAndName = existingFile.public_id;
//             return cloudinaryFolderAndName.includes(`${cleanNewName}-`);
//           }

//           return false;
//         });
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

//   const handleSubmitInternal = (e) => {
//     e.preventDefault();

//     if (images.length === 0) {
//       toast.error("Please upload at least one image.");
//       return;
//     }
//     if (images.length > 5) {
//       toast.error("You can upload a maximum of 5 images.");
//       return;
//     }

//     onSubmit(productData, images, () => {
//       setProductData({
//         name: "",
//         price: "",
//         description: "",
//         category: "",
//         stock: "",
//       });
//       setImages([]);
//     });
//   };

//   const handleDragStart = (index) => {
//     setDraggedIndex(index);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault(); // Crucial to allow dropping items!
//   };

//   const handleDrop = (targetIndex) => {
//     if (draggedIndex === null || draggedIndex === targetIndex) return;

//     setImages((prevImages) => {
//       const updatedImages = [...prevImages];
//       const [movedItem] = updatedImages.splice(draggedIndex, 1);
//       updatedImages.splice(targetIndex, 0, movedItem);
//       return updatedImages;
//     });

//     setDraggedIndex(null);
//   };

//   return (
//     <form className="product-form" onSubmit={handleSubmitInternal}>
//       <input
//         type="text"
//         className="form-input"
//         placeholder="Enter Product Name"
//         name="name"
//         value={productData.name}
//         onChange={handleInputChange}
//         required
//         disabled={isLoading}
//       />
//       <input
//         type="number"
//         className="form-input"
//         placeholder="Enter Product Price"
//         name="price"
//         value={productData.price}
//         onChange={handleInputChange}
//         required
//         disabled={isLoading}
//       />
//       <input
//         type="text"
//         className="form-input"
//         placeholder="Enter Product Description"
//         name="description"
//         value={productData.description}
//         onChange={handleInputChange}
//         required
//         disabled={isLoading}
//       />
//       <select
//         className="form-select"
//         name="category"
//         value={productData.category}
//         onChange={handleInputChange}
//         required
//         disabled={isLoading}
//       >
//         <option value="">Select a Category</option>
//         {categories.map((category) => (
//           <option value={category} key={category}>
//             {category}
//           </option>
//         ))}
//       </select>
//       <input
//         type="number"
//         className="form-input"
//         placeholder="Enter Product Stock"
//         name="stock"
//         value={productData.stock}
//         onChange={handleInputChange}
//         required
//         disabled={isLoading}
//       />

//       <div className="file-input-container">
//         <input
//           type="file"
//           className="form-input-file"
//           accept="image/*"
//           multiple
//           ref={fileInputRef}
//           onChange={handleImageChange}
//           style={{ display: "none" }}
//           disabled={isLoading}
//         />

//         <div
//           onClick={() => !isLoading && fileInputRef.current.click()}
//           className="input-file-container"
//         >
//           <span className="choose-img">Choose Images</span>
//           <span style={{ fontSize: "14px" }}>
//             {images.length === 0
//               ? "No files chosen"
//               : `${images.length} ${
//                   images.length === 1 ? "image" : "images"
//                 } selected`}
//           </span>
//         </div>
//       </div>

//       {/* <div className="image-preview-container">
//         {images.map((file, index) => {
//           const safeKey =
//             file instanceof File
//               ? `${file.name}-${file.lastModified}-${index}`
//               : `${file.public_id || index}`;

//           return (
//             <ImagePreviewItem
//               key={safeKey}
//               file={file}
//               onRemove={() => handleRemoveImage(index)}
//             />
//           );
//         })}
//       </div> */}
//       <div className="image-preview-container">
//         {images.map((file, index) => {
//           const safeKey =
//             file instanceof File
//               ? `${file.name}-${file.lastModified}-${index}`
//               : `${file.public_id || index}`;

//           return (
//             <div
//               key={safeKey}
//               className={`preview-wrapper ${
//                 index === 0 ? "main-thumbnail" : "not-thumbnail"
//               }`}
//               draggable={!isLoading}
//               onDragStart={() => handleDragStart(index)}
//               onDragOver={handleDragOver}
//               onDrop={() => handleDrop(index)}
//               style={{
//                 cursor: isLoading ? "not-allowed" : "move",
//                 position: "relative",
//                 marginTop: "10px",
//               }}
//             >
//               <ImagePreviewItem
//                 file={file}
//                 onRemove={() => handleRemoveImage(index)}
//               />
//             </div>
//           );
//         })}
//       </div>

//       <button className="submit-btn" disabled={isLoading}>
//         {isLoading ? "Processing..." : buttonText}
//       </button>
//     </form>
//   );
// }

// export default ProductForm;

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import ImagePreviewItem from "./ImagePreview";
// 1. Import your actual RTK API Mutation Hooks here
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../services/productsApi";

function ProductForm({
  initialData,
  initialImages = [],
  onClose, // Replaces onSubmit. Triggers parent state cleanups
  buttonText = "Submit",
}) {
  const fileInputRef = useRef(null);
  const categories = [
    "shirt",
    "mobile",
    "dress",
    "electronics",
    "laptops",
    "audio",
    "headphones",
    "smartwatches",
    "accessories",
    "footwear",
    "eyewear",
    "jewelry",
    "watches",
    "furniture",
    "homedecor",
    "glass",
    "appliances",
    "cookware",
    "skincare",
    "cosmetics",
    "fragrances",
    "activewear",
    "fitness",
    "groceries",
  ];
  // 2. Initialize RTK mutation endpoints directly within the child component
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const isLoading = isCreating || isUpdating;

  const [productData, setProductData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    stock: initialData?.stock || "",
  });

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [images, setImages] = useState(initialImages);
  const editProductId = initialData?._id;

  useEffect(() => {
    if (editProductId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProductData({
        name: initialData.name || "",
        price: initialData.price || "",
        description: initialData.description || "",
        category: initialData.category || "",
        stock: initialData.stock || "",
      });
      setImages(initialImages || []);
    }
  }, [editProductId, initialData, initialImages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      const uniqueNewFiles = filesArray.filter((newFile) => {
        return !images.some((existingFile) => {
          if (existingFile instanceof File) {
            return (
              existingFile.name === newFile.name &&
              existingFile.size === newFile.size &&
              existingFile.lastModified === newFile.lastModified
            );
          }

          if (
            existingFile &&
            typeof existingFile === "object" &&
            existingFile.public_id
          ) {
            const newFileNameWithoutExt = newFile.name
              .split(".")
              .slice(0, -1)
              .join(".");
            const cleanNewName = newFileNameWithoutExt.replace(/\s+/g, "-");
            const cloudinaryFolderAndName = existingFile.public_id;
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

      setImages((prevImages) => [...prevImages, ...uniqueNewFiles]);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  };

  //   const handleSubmitInternal = async (e) => {
  //     e.preventDefault();

  //     if (images.length === 0) {
  //       toast.error("Please upload at least one image.");
  //       return;
  //     }
  //     if (images.length > 5) {
  //       toast.error("You can upload a maximum of 5 images.");
  //       return;
  //     }

  //     // Process array data formats into explicit multi-part form payloads
  //     const formData = new FormData();
  //     formData.append("name", productData.name);
  //     formData.append("description", productData.description);
  //     formData.append("price", Number(productData.price));
  //     formData.append("category", productData.category);
  //     formData.append("stock", Number(productData.stock));

  //     images.forEach((file) => {
  //       if (file instanceof File) {
  //         formData.append("images", file);
  //       } else {
  //         formData.append("existingImages", JSON.stringify(file));
  //       }
  //     });

  //     try {
  //       if (initialData) {
  //         // Edit Mode path execution
  //         await updateProduct({ id: initialData._id, body: formData }).unwrap();
  //         toast.success("Product updated successfully!");
  //       } else {
  //         // Creation Mode path execution
  //         await createProduct(formData).unwrap();
  //         toast.success("Product created successfully!");
  //       }

  //       // Close the modal upon a successful dispatch resolving
  //       onClose();
  //     } catch (err) {
  //       toast.error(
  //         err?.data?.message ||
  //           "Something went wrong processing product metadata."
  //       );
  //     }
  //   };

  const handleSubmitInternal = async (e) => {
    e.preventDefault();

    if (images.length === 0)
      return toast.error("Please upload at least one image.");
    if (images.length > 5) return toast.error("Maximum of 5 images allowed.");

    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", Number(productData.price));
    formData.append("category", productData.category);
    formData.append("stock", Number(productData.stock));

    // 1. Maintain a layout array to capture the exact drag-and-drop sequence
    const orderTrackingArray = [];

    images.forEach((file) => {
      if (file instanceof File) {
        // Send binary files to Multer
        formData.append("images", file);
        // Track that a new file belongs at this specific index placeholder
        orderTrackingArray.push(`new-file-${file.name}`);
      } else {
        // Send the identifier string of the existing image (e.g., public_id or URL)
        orderTrackingArray.push(file.public_id || file.url || file);
      }
    });

    // 2. Pass the sequence list as a stringified array
    formData.append("imagesOrder", JSON.stringify(orderTrackingArray));

    try {
      if (initialData) {
        // FIX: Pass body as a separate key so your query configurations can read it natively!
        await updateProduct({ id: initialData._id, body: formData }).unwrap();
        toast.success("Product updated successfully!");
      } else {
        await createProduct(formData).unwrap();
        toast.success("Product created successfully!");
        resetForm();
      }
      onClose?.();
    } catch (err) {
      if (err?.data?.message || err?.status) {
        toast.error(err?.data?.message || "Something went wrong.");
      }
    }
  };
  const resetForm = () => {
    setProductData({
      name: "",
      price: "",
      description: "",
      category: "",
      stock: "",
    });
    setImages([]);
  };
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Crucial to allow dropping items!
  };

  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      const [movedItem] = updatedImages.splice(draggedIndex, 1);
      updatedImages.splice(targetIndex, 0, movedItem);
      return updatedImages;
    });

    setDraggedIndex(null);
  };

  return (
    <form className="product-form" onSubmit={handleSubmitInternal}>
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
        onWheel={(e) => e.target.blur()}
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
            {category.charAt(0).toUpperCase() + category.slice(1)}
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
        onWheel={(e) => e.target.blur()}
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
          onClick={() => !isLoading && fileInputRef.current.click()}
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
        {images.map((file, index) => {
          const safeKey =
            file instanceof File
              ? `${file.name}-${file.lastModified}-${index}`
              : `${file.public_id || index}`;
          return (
            <div
              key={safeKey}
              className={`preview-wrapper ${
                index === 0 ? "main-thumbnail" : "not-thumbnail"
              }`}
              draggable={!isLoading}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              style={{
                cursor: isLoading ? "not-allowed" : "move",
                position: "relative",
                marginTop: "10px",
              }}
            >
              <ImagePreviewItem
                file={file}
                onRemove={() => handleRemoveImage(index)}
              />
            </div>
          );
        })}
      </div>
      <button className="submit-btn" disabled={isLoading}>
        {isLoading ? "Processing..." : buttonText}
      </button>
    </form>
  );
}

export default ProductForm;
