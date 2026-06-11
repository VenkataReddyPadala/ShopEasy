import { useEffect, useState } from "react";

const ImagePreviewItem = ({ file, onRemove }) => {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    // Generate a secure pointer URL once when mounted
    // const url = URL.createObjectURL(file);
    const url = file instanceof File ? URL.createObjectURL(file) : file.url;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(url);

    // ✨ CLEANUP: Revokes the object URL cleanly whenever an item is removed
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!previewUrl) return null;

  return (
    <div>
      <img src={previewUrl} alt="Product Preview" className="image-preview" />
      <button
        type="button"
        className="product-action-btn remove-btn"
        onClick={onRemove}
        aria-label="Remove image"
      />
    </div>
  );
};

export default ImagePreviewItem;
