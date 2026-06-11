import Product from "../models/productModel.js";
import { deleteOne, getAll, getOne, updateOne } from "./handlerFactory.js";
import { v2 as cloudinary } from "cloudinary";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const getAllProducts = getAll(Product);

export const getProduct = getOne(Product, [
  {
    path: "reviews",
    select: "review rating user -product",
    options: {
      limit: 5,
      sort: { createdAt: -1 },
    },
    populate: {
      path: "user",
      select: "name avatar",
    },
  },
  {
    path: "user",
    select: "name avatar",
  },
]);

export const getProductCategories = catchAsync(async (req, res, next) => {
  // .distinct('category') automatically finds all unique categories in the collection
  const categories = await Product.distinct("category");

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      categories,
    },
  });
});

export const setProductUserIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

//with using Base64 url format and without multer
// export const createProduct = catchAsync(async (req, res, next) => {
//   // 1. Attach the current logged-in admin's ID to the product payload
//   // req.body.user = req.user._id;

//   const { name, description, price, category, stock, images } = req.body;

//   // Track successfully uploaded assets for potential rollback
//   let uploadedImages = [];

//   try {
//     // 2. Check if images were actually provided
//     if (images && Array.isArray(images) && images.length > 0) {
//       // Use standard loop or Promise.all to convert and upload Base64 images
//       for (const imgBase64 of images) {
//         if (imgBase64.startsWith("data:image")) {
//           const result = await cloudinary.uploader.upload(imgBase64, {
//             folder: "products", // Saved in your explicit products folder
//           });

//           // Push the formatted object directly matching your productSchema
//           uploadedImages.push({
//             public_id: result.public_id,
//             url: result.secure_url,
//           });
//         }
//       }
//     }

//     // 3. Create the product document with the uploaded image links
//     const newProduct = await Product.create({
//       name,
//       description,
//       price,
//       category,
//       stock,
//       user: req.body.user,
//       images: uploadedImages, // Assign our structural cloud data array
//     });

//     // 4. Send successful response
//     res.status(201).json({
//       status: "success",
//       data: {
//         product: newProduct,
//       },
//     });
//   } catch (err) {
//     // ROLLBACK LOGIC: If the database save or any parsing step fails,
//     // immediately purge all uploaded assets from Cloudinary
//     if (uploadedImages.length > 0) {
//       const deletePromises = uploadedImages.map((img) =>
//         cloudinary.uploader
//           .destroy(img.public_id)
//           .catch((cloudErr) =>
//             console.error(
//               `Rollback cleanup failed for ${img.public_id}:`,
//               cloudErr
//             )
//           )
//       );
//       await Promise.all(deletePromises);
//     }

//     // Pass the error onward to your global error handling middleware
//     return next(new AppError("Error creating the product", 500));
//   }
// });

export const createProduct = catchAsync(async (req, res, next) => {
  // 1. Check if files were successfully uploaded by Multer

  if (!req.files || req.files.length === 0) {
    return next(new AppError("Please upload at least one image.", 400));
  }

  // 2. Destructure fields from req.body (parsed out automatically by Multer)

  const { name, description, price, category, stock, user } = req.body;

  try {
    // 3. Map the files array provided by Multer into your schema's format
    const uploadedImages = req.files.map((file) => ({
      public_id: file.filename, // This holds the Cloudinary public_id (e.g., 'products/filename-12345')
      url: file.path, // This holds the permanent Cloudinary secure_url
    }));
    const newProduct = await Product.create({
      name,
      description,
      price: Number(price), // FormData converts numbers to strings, so cast it back
      stock: Number(stock),
      category,
      user: user || req.user._id, // Fallback safety layer
      images: uploadedImages,
    });

    res.status(201).json({
      status: "success",
      data: {
        product: newProduct,
      },
    });
  } catch (err) {
    // 💥 ROLLBACK LOGIC: If DB save crashes, purge the already uploaded assets from Cloudinary
    if (req.files && req.files.length > 0) {
      const deletePromises = req.files.map((file) =>
        cloudinary.uploader
          .destroy(file.filename) // Multer maps Cloudinary public_id to 'filename'
          .catch((cloudErr) =>
            console.error(
              `Rollback cleanup failed for ${file.filename}:`,
              cloudErr
            )
          )
      );

      await Promise.all(deletePromises);
    }
    return next(new AppError(err.message || "Error creating the product", 400));
  }
});

// export const updateProduct = catchAsync(async (req, res, next) => {
//   // 1. Fetch the targeted product document context
//   const currentProduct = await Product.findById(req.params.id);
//   if (!currentProduct) {
//     if (req.files && req.files.length > 0) {
//       await Promise.all(
//         req.files.map((file) =>
//           cloudinary.uploader.destroy(file.filename).catch(() => {})
//         )
//       );
//     }
//     return next(new AppError("No product found with that ID", 404));
//   }

//   const { name, description, price, category, stock, imagesOrder } = req.body;
//   const parsedOrder = imagesOrder ? JSON.parse(imagesOrder) : [];

//   // ─── STEP 1: PRE-EMPTIVE CLEANUP OF UNWANTED NEW UPLOADS ───
//   // Filter through what Multer uploaded. If the user discarded it from the drag-and-drop view,
//   // its originalname won't be matched in the `new-file-${file.originalname}` strings!
//   const acceptedFiles = [];
//   const rejectedFiles = [];

//   if (req.files && req.files.length > 0) {
//     req.files.forEach((file) => {
//       const structuralPlaceholder = `new-file-${file.originalname}`;
//       if (parsedOrder.includes(structuralPlaceholder)) {
//         acceptedFiles.push(file);
//       } else {
//         rejectedFiles.push(file);
//       }
//     });
//   }

//   // Immediately purge those discarded files from Cloudinary right now
//   if (rejectedFiles.length > 0) {
//     const purgePromises = rejectedFiles.map((file) =>
//       cloudinary.uploader
//         .destroy(file.filename)
//         .catch((err) =>
//           console.error(
//             `Failed to purge unwanted upload: ${file.filename}`,
//             err
//           )
//         )
//     );
//     await Promise.all(purgePromises);
//   }

//   // ─── STEP 2: MAP ONLY THE ACCEPTED NEW IMAGES ───
//   const newlyUploadedImages = acceptedFiles.map((file) => ({
//     public_id: file.filename,
//     url: file.path,
//     originalName: file.originalname, // Keep track of this to map correctly next
//   }));

//   try {
//     // ─── STEP 3: RECONSTRUCT TRIPLE ARRAY PAIRS IN ORDER ───
//     const finalSortedImages = parsedOrder
//       .map((identifier) => {
//         // Is it a pre-existing image asset?
//         const existingMatch = currentProduct.images.find(
//           (img) => img.public_id === identifier
//         );
//         if (existingMatch) return existingMatch;

//         // Is it a placeholder for an accepted fresh file upload?
//         if (identifier.startsWith("new-file-")) {
//           const originalNameExtract = identifier.replace("new-file-", "");
//           const fileMatch = newlyUploadedImages.find(
//             (img) => img.originalName === originalNameExtract
//           );
//           return fileMatch
//             ? { public_id: fileMatch.public_id, url: fileMatch.url }
//             : null;
//         }

//         return null;
//       })
//       .filter(Boolean);

//     // 4. Update the database document
//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       {
//         name,
//         description,
//         price: price ? Number(price) : undefined,
//         stock: stock ? Number(stock) : undefined,
//         category,
//         images: finalSortedImages,
//       },
//       {
//         returnDocument: "after",
//         runValidators: true,
//       }
//     );

//     // 5. SUCCESS PATH CLEANUP: Clear out old assets dropped from the layout
//     const imagesToDelete = currentProduct.images.filter(
//       (oldImg) =>
//         !finalSortedImages.some(
//           (keptImg) => keptImg.public_id === oldImg.public_id
//         )
//     );

//     if (imagesToDelete.length > 0) {
//       const deletePromises = imagesToDelete.map((img) =>
//         cloudinary.uploader
//           .destroy(img.public_id)
//           .catch((cloudErr) =>
//             console.error(`Cleanup failed for ${img.public_id}:`, cloudErr)
//           )
//       );
//       await Promise.all(deletePromises);
//     }

//     res.status(200).json({
//       status: "success",
//       data: { product: updatedProduct },
//     });
//   } catch (err) {
//     // 💥 ROLLBACK PATH CLEANUP: DB Save/Validation Failed!
//     // Wipe out ONLY the newly accepted files to return to square one safely.
//     if (acceptedFiles.length > 0) {
//       const rollbackPromises = acceptedFiles.map((file) =>
//         cloudinary.uploader
//           .destroy(file.filename)
//           .catch((cloudErr) =>
//             console.error(`Rollback failed for ${file.filename}:`, cloudErr)
//           )
//       );
//       await Promise.all(rollbackPromises);
//     }

//     return next(
//       new AppError(err.message || "Error updating the product details", 400)
//     );
//   }
// });

export const updateProduct = catchAsync(async (req, res, next) => {
  // 1. Fetch the targeted product document context

  const currentProduct = await Product.findById(req.params.id);
  if (!currentProduct) {
    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.destroy(file.filename).catch(() => {})
        )
      );
    }
    return next(new AppError("No product found with that ID", 404));
  }

  const { name, description, price, category, stock, imagesOrder } = req.body;
  const parsedOrder = imagesOrder ? JSON.parse(imagesOrder) : [];

  // ─── STEP 1: PRE-EMPTIVE CLEANUP OF UNWANTED NEW UPLOADS ───
  const acceptedFiles = [];
  const rejectedFiles = [];

  if (req.files && req.files.length > 0) {
    req.files.forEach((file) => {
      const structuralPlaceholder = `new-file-${file.originalname}`;
      if (parsedOrder.includes(structuralPlaceholder)) {
        acceptedFiles.push(file);
      } else {
        rejectedFiles.push(file);
      }
    });
  }

  // Immediately purge discarded files using your valid cloudinary namespace
  if (rejectedFiles.length > 0) {
    const purgePromises = rejectedFiles.map((file) =>
      cloudinary.uploader
        .destroy(file.filename)
        .catch((err) =>
          console.error(
            `Failed to purge unwanted upload: ${file.filename}`,
            err
          )
        )
    );
    await Promise.all(purgePromises);
  }

  // ─── STEP 2: MAP ONLY THE ACCEPTED NEW IMAGES ───
  const newlyUploadedImages = acceptedFiles.map((file) => ({
    public_id: file.filename,
    url: file.path,
    originalName: file.originalname,
  }));

  // Create a tracking variable outside the try block scope to use for cleanup safety
  let finalSortedImages = [];

  try {
    // ─── STEP 3: RECONSTRUCT ARRAY IN ORDER ───
    finalSortedImages = parsedOrder
      .map((identifier) => {
        const existingMatch = currentProduct.images.find(
          (img) => img.public_id === identifier
        );
        if (existingMatch) return existingMatch;

        if (identifier.startsWith("new-file-")) {
          const originalNameExtract = identifier.replace("new-file-", "");
          const fileMatch = newlyUploadedImages.find(
            (img) => img.originalName === originalNameExtract
          );
          return fileMatch
            ? { public_id: fileMatch.public_id, url: fileMatch.url }
            : null;
        }

        return null;
      })
      .filter(Boolean);

    // 4. Update the database document
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price: price ? Number(price) : undefined,
        stock: stock ? Number(stock) : undefined,
        category,
        images: finalSortedImages,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    // If we successfully reach this line, send the response immediately!
    res.status(200).json({
      status: "success",
      data: { product: updatedProduct },
    });
  } catch (err) {
    // 💥 TRUE ROLLBACK: Runs only if validation or the DB save fails
    if (acceptedFiles.length > 0) {
      const rollbackPromises = acceptedFiles.map((file) =>
        cloudinary.uploader
          .destroy(file.filename)
          .catch((cloudErr) =>
            console.error(`Rollback failed for ${file.filename}:`, cloudErr)
          )
      );
      await Promise.all(rollbackPromises);
    }

    return next(
      new AppError(err.message || "Error updating the product details", 400)
    );
  }

  // ─── STEP 5: POST-SUCCESS BACKGROUND CLEANUP ───
  // This runs completely outside the try/catch block.
  // The user already has their 200 OK response, and old images are cleared safely.
  const imagesToDelete = currentProduct.images.filter(
    (oldImg) =>
      !finalSortedImages.some(
        (keptImg) => keptImg.public_id === oldImg.public_id
      )
  );

  if (imagesToDelete.length > 0) {
    const deletePromises = imagesToDelete.map((img) =>
      cloudinary.uploader
        .destroy(img.public_id)
        .catch((cloudErr) =>
          console.error(
            `Post-success asset cleanup failed for ${img.public_id}:`,
            cloudErr
          )
        )
    );
    await Promise.all(deletePromises);
  }
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  // 1. Fetch target product context to extract Cloudinary image records
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  // Preserve the image array snapshot before dropping the database record
  const imagesToDelete = product.images || [];

  // 2. Perform the database deletion execution
  // (If this throws an error, catchAsync interceptor kicks in automatically)
  await Product.findByIdAndDelete(req.params.id);

  // 3. IMMEDIATE SUCCESS RESPONSE
  // The client receives a fast interface update; Cloudinary overhead won't delay the user.
  res.status(200).json({
    status: "success",
    message: "Product and associated records permanently deleted.",
  });

  // ─── POST-SUCCESS BACKGROUND CLEANUP ───
  // This executes securely out of the main client-response cycle.
  if (imagesToDelete.length > 0) {
    const deletePromises = imagesToDelete.map((img) =>
      cloudinary.uploader
        .destroy(img.public_id)
        .catch((cloudErr) =>
          console.error(
            `Post-success asset cleanup failed during product deletion for ${img.public_id}:`,
            cloudErr
          )
        )
    );

    await Promise.all(deletePromises);
  }
});
