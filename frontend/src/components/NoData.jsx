import { useNavigate } from "react-router-dom";
import "../componentStyles/NoData.css";
function NoData({ search, data }) {
  const navigate = useNavigate();
  return (
    <div>
      <div className="no-products-content">
        <div className="no-products-icon">⚠️</div>
        <h3 className="no-products-title">No {data} Found</h3>
        <p className="no-products-message">
          {search
            ? `We couldn't find any ${data} matching "${search}". Try using different keyword.`
            : `No ${data} available. Please check back later`}
        </p>
        <button className="explore-more" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    </div>
  );
}

export default NoData;
