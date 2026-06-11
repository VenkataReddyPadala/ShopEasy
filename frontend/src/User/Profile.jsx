import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../UserStyles/Profile.css";
import Loader from "../ui/Loader";
import PageTitle from "../components/PageTitle";
function Profile() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loader fullPage={true} />;
  return (
    <div className="profile-container">
      <PageTitle title={`${user.name}-Profile`} />
      <div className="profile-image">
        <h1 className="profile-heading">My Profile</h1>
        <img
          src={user.avatar?.url || "/images/default-avatar.jpg"}
          alt="User Profile"
          className="profile-image"
        />
        <Link to="/profile/update">Edit Profile</Link>
      </div>
      <div className="proflie-detail-container">
        <div className="profile-details">
          <div className="profile-detail ">
            <h2>Username:</h2>
            <p className="word-wrap">{user.name}</p>
          </div>
          <div className="profile-detail">
            <h2>Email:</h2>
            <p className="word-wrap">{user.email}</p>
          </div>
          <div className="profile-detail">
            <h2>Joined On:</h2>
            <p>
              {new Date(user.createdAt)
                .toLocaleDateString("en-US", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                })
                .replace(",", "")}
            </p>
          </div>
        </div>
        <div className="profile-buttons">
          <Link to="/orders">My Orders</Link>
          <Link to="/updateMyPassword">Change Password</Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;
