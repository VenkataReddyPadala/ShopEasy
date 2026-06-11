import { useState } from "react";
import { Country, State, City } from "country-state-city";
import { toast } from "react-toastify";

function ShippingForm({ initialData, onClose, addAddress, updateAddress }) {
  // Initialize state with initialData if it exists (Edit mode)

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    address: initialData?.address || "",
    pincode: initialData?.pincode || "",
    phoneNo: initialData?.phoneNo || "",
    country: initialData?.country || "",
    state: initialData?.state || "",
    city: initialData?.city || "",
    isDefault: initialData?.isDefault || false,
  });
  const inintialIsDefault = initialData?.isDefault || false;

  const handleChange = (e) => {
    if (e.target.name === "isDefault") {
      return setFormData({ ...formData, isDefault: e.target.checked });
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialData) {
        await updateAddress({
          addressId: initialData._id,
          updatedAddress: formData,
        }).unwrap();
      } else await addAddress(formData).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
    onClose();
  };

  return (
    <div className="shipping-form-container-modal">
      <form className="shipping-form" onSubmit={handleSubmit}>
        <div className="shipping-section">
          <div className="shipping-form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="shipping-form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Flat, House no., Building, Company, Apartment"
              required
            />
          </div>

          <div className="form-row-flex">
            <div className="shipping-form-group">
              <label htmlFor="pincode">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6 digits [0-9] PIN code"
                required
              />
            </div>
            <div className="shipping-form-group">
              <label htmlFor="phoneNo">Phone Number</label>
              <input
                type="tel"
                name="phoneNo"
                value={formData.phoneNo}
                pattern="[0-9]{10}"
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
                maxLength={10}
              />
            </div>
          </div>
        </div>

        <div className="shipping-section">
          <div className="shipping-form-group">
            <label htmlFor="country">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            >
              <option value="">Select a country</option>
              {Country.getAllCountries().map((c) => (
                <option value={c.isoCode} key={c.isoCode}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-flex">
            <div className="shipping-form-group">
              <label htmlFor="state">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select a state</option>
                {State.getStatesOfCountry(formData.country).map((s) => (
                  <option value={s.isoCode} key={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="shipping-form-group">
              <label htmlFor="city">City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              >
                <option value="">Select a city</option>
                {City.getCitiesOfState(formData.country, formData.state).map(
                  (c) => (
                    <option value={c.name} key={c.name}>
                      {c.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {!inintialIsDefault && (
          <div style={{ marginTop: "10px" }}>
            <input
              type="checkbox"
              name="isDefault"
              id="checkbox"
              onChange={handleChange}
            />
            <label htmlFor="checkbox" style={{ marginLeft: "10px" }}>
              Set as default address
            </label>
          </div>
        )}
        <div className="modal-footer">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="shipping-submit-btn">
            {initialData ? "Save changes" : "Add address"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShippingForm;
