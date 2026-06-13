import { useState } from "react";
import { toast } from "react-toastify";
import {
  useGetCountriesQuery,
  useGetStatesQuery,
  useGetCitiesQuery,
} from "../services/geoApi"; // Adjust this path to match your store layout

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

  // RTK Query fetches lightweight data dynamically. Caching avoids duplicate requests.
  const { data: countries = [], isLoading: loadingCountries } =
    useGetCountriesQuery();

  const { data: states = [], isLoading: loadingStates } = useGetStatesQuery(
    formData.country,
    {
      skip: !formData.country,
    }
  );

  const { data: cities = [], isLoading: loadingCities } = useGetCitiesQuery(
    { country: formData.country, state: formData.state },
    { skip: !formData.country || !formData.state }
  );

  const handleChange = (e) => {
    if (e.target.name === "isDefault") {
      return setFormData({ ...formData, isDefault: e.target.checked });
    }

    const { name, value } = e.target;

    // Reset downstream selections cleanly when a parent location changes
    if (name === "country") {
      setFormData({ ...formData, country: value, state: "", city: "" });
    } else if (name === "state") {
      setFormData({ ...formData, state: value, city: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
          {/* NATIVE COUNTRY DROPDOWN */}
          <div className="shipping-form-group">
            <label htmlFor="country">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            >
              <option value="">
                {loadingCountries ? "Loading countries..." : "Select a country"}
              </option>
              {countries.map((country) => (
                <option value={country} key={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-flex">
            {/* NATIVE STATE DROPDOWN */}
            <div className="shipping-form-group">
              <label htmlFor="state">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!formData.country || loadingStates}
                required
              >
                <option value="">
                  {loadingStates ? "Loading states..." : "Select a state"}
                </option>
                {states.map((state) => (
                  <option value={state} key={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* NATIVE CITY DROPDOWN */}
            <div className="shipping-form-group">
              <label htmlFor="city">City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.state || loadingCities}
                required
              >
                <option value="">
                  {loadingCities ? "Loading cities..." : "Select a city"}
                </option>
                {cities.map((city) => (
                  <option value={city} key={city}>
                    {city}
                  </option>
                ))}
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
