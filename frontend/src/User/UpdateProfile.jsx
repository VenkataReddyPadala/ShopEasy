import { useRef, useState } from "react";
import "../UserStyles/Form.css";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUpdateMeMutation } from "../services/userApi";
import PageTitle from "../components/PageTitle";
function UpdateProfile() {
  const { user, isLoading } = useAuth();
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user.avatar?.url || "/images/default-avatar.jpg"
  );
  //   const hasAvatar = user.avatar && user.avatar.url;
  const [newUser, setNewUser] = useState({
    name: user.name,
    email: user.email,
  });
  const [avatar, setAvatar] = useState(user.avatar?.url || "");
  const navigate = useNavigate();
  const [updateProfile, { isLoading: isUpdating, error }] =
    useUpdateMeMutation();
  const { name, email } = newUser;
  if (isLoading) return <Loader fullPage={true} />;

  const handleIconClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeAvatar = (e) => {
    e.stopPropagation();
    setAvatarPreview("/images/default-avatar.jpg");
    setAvatar("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  function registerDataChange(e) {
    if (e.target.name === "avatar") {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setAvatar(reader.result);
        }
      };
      reader.onerror = (error) => {
        console.log(error);
        toast.error("Error reading file");
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setNewUser({ ...newUser, [e.target.name]: e.target.value });
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const data = { ...newUser, avatar };
    try {
      await updateProfile(data).unwrap();
      toast.success("Profile updated!");
      navigate("/account");
    } catch (err) {
      const isValidationError = err?.data?.errors;
      if (!isValidationError) {
        const message = err?.data?.message || "Update failed";
        toast.error(message);
      }
    }
  }
  return (
    <div className="container update-container">
      <PageTitle title={"Update-Profile"} />
      <div className="form-content">
        <form
          className="form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <h2>Update Profile</h2>
          <div className="input-group avatar-group">
            <input
              type="file"
              ref={fileInputRef}
              name="avatar"
              accept="image/*"
              onChange={registerDataChange}
              style={{ display: "none" }}
              disabled={isLoading}
            />

            <div
              className="avatar-wrapper"
              onClick={
                avatarPreview === "/images/default-avatar.jpg"
                  ? handleIconClick
                  : undefined
              }
            >
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="avatar"
              />

              <button
                type="button"
                className={`avatar-action-btn-form ${
                  avatarPreview === "/images/default-avatar.jpg"
                    ? "add-btn"
                    : "remove-btn"
                }`}
                onClick={
                  avatarPreview === "/images/default-avatar.jpg"
                    ? handleIconClick
                    : removeAvatar
                }
                aria-label={
                  avatarPreview === "/images/default-avatar.jpg"
                    ? "Add avatar"
                    : "Remove avatar"
                }
                disabled={isUpdating}
              />
            </div>
          </div>
          <div className="input-group">
            <input
              type="text"
              name="name"
              defaultValue={name}
              onChange={registerDataChange}
              disabled={isUpdating}
              autoComplete="username"
            />
            {error?.data?.errors?.name && (
              <span className="error-text">{error.data.errors.name}</span>
            )}
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              defaultValue={email}
              onChange={registerDataChange}
              disabled={isUpdating}
              autoComplete="email"
            />
            {error?.data?.errors?.email && (
              <span className="error-text">{error.data.errors.email}</span>
            )}
          </div>
          <button className="authBtn" disabled={isUpdating}>
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfile;
