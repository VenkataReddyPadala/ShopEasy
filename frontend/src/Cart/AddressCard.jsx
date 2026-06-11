import "../CartStyles/AddressCard.css";
function AddressCard({
  addr,
  isSelected,
  onSelect,
  onEdit,
  deleteAddress,
  isDefault,
  setDefault,
  setSelectedAddressId,
}) {
  return (
    <div
      className={`address-card ${isSelected ? "active" : ""}`}
      onClick={onSelect}
    >
      <div className="card-content">
        <div className="radio-container">
          <input type="radio" checked={isSelected} readOnly />
        </div>
        <div className="address-info">
          <p className="name">
            <strong>{addr.name}</strong>
          </p>
          <p>{addr.address}</p>
          <p>
            {addr.city}, {addr.state} {addr.pincode}
          </p>
          <p>{addr.country}</p>
          <p className="phone">Phone: {addr.phoneNo}</p>

          <div className="address-actions-links">
            <button
              type="button"
              className="link"
              onClick={(e) => {
                e.stopPropagation();

                onEdit(addr);
              }}
            >
              Edit
            </button>
            <span className="pipe">|</span>
            <button
              type="button"
              className="link"
              onClick={() => deleteAddress(addr._id)}
            >
              Remove
            </button>
            {!isDefault && (
              <>
                <span className="pipe">|</span>
                <button
                  type="button"
                  className="link"
                  onClick={(e) => {
                    e.stopPropagation(); /* Delete Logic */
                    setSelectedAddressId(null);
                    setDefault(addr._id);
                  }}
                >
                  Make it as default
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* {isSelected && (
        <button className="ship-to-this-btn">Deliver to this address</button>
      )} */}
    </div>
  );
}

export default AddressCard;
