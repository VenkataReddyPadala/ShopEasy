import { useState } from "react";
import ShippingForm from "./ShippingForm";
import "../CartStyles/Shipping.css";
import Modal from "../ui/Modal";
import AddressCard from "./AddressCard";
import {
  useAddAddressMutation,
  useDeleteAddressMutation,
  useGetMeQuery,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from "../services/userApi";
import Loader from "../ui/Loader";
import CheckoutPath from "./CheckoutPath";
import PageTitle from "../components/PageTitle";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAddress } from "../features/checkout/checkoutSlice";

function Shipping() {
  const { data, isFetching: isQueryFetching } = useGetMeQuery();
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefault, { isLoading: isUpdatingDefault }] =
    useSetDefaultAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

  const addresses = data?.data?.addresses || [];
  const defaultAddress = addresses.find((add) => add.isDefault === true);

  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?._id || null
  );

  //   const activeId = selectedAddressId || defaultAddress?._id;
  const isSelectionValid = addresses.some(
    (addr) => addr._id === selectedAddressId
  );
  const activeId = isSelectionValid ? selectedAddressId : defaultAddress?._id;

  const [showAll, setShowAll] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const openModal = (addr = null) => {
    setEditData(addr); // If addr is null, it's "Add Mode". If addr exists, it's "Edit Mode".
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  async function handleDeleteAddress(id) {
    if (selectedAddressId === id) {
      setSelectedAddressId(null);
    }

    try {
      await deleteAddress(id).unwrap();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }
  async function handleSetDefault(id) {
    try {
      await setDefault(id).unwrap();
    } catch (err) {
      console.error("Failed to make address default:", err);
    }
  }
  function handleSelectedAddress() {
    dispatch(setAddress(activeId));
    navigate("/order/confirm", { replace: true });
  }

  const otherAddresses = addresses.filter(
    (addr) => addr._id !== defaultAddress?._id
  );

  if (
    isAdding ||
    isDeleting ||
    isQueryFetching ||
    isUpdatingDefault ||
    isUpdating
  )
    return <Loader fullPage={true} />;
  return (
    <>
      <PageTitle title="Shipping" />
      <CheckoutPath activePath={0} />
      <div className="shipping-page">
        <h1 className="shipping-title">Select a delivery address</h1>
        <p className="shipping-subtitle">
          Is the address you'd like to use displayed below? If so, click the
          corresponding "Deliver to this address" button.
        </p>
        <hr className="divider" />

        <div className="address-section">
          <h3 className="section-label">
            {addresses.length > 0 ? "Your addresses" : "Add Address"}
          </h3>
          <div className="address-grid">
            {/* Selected Address Card */}
            {defaultAddress && (
              <AddressCard
                addr={defaultAddress}
                isSelected={activeId === defaultAddress._id}
                onSelect={() => setSelectedAddressId(defaultAddress._id)}
                onEdit={() => openModal(defaultAddress)}
                deleteAddress={handleDeleteAddress}
                isDefault={true}
              />
            )}

            {/* More Addresses */}
            {showAll &&
              otherAddresses.map((addr) => (
                <AddressCard
                  key={addr._id}
                  addr={addr}
                  isSelected={activeId === addr._id} // This now uses our robust activeId
                  onSelect={() => setSelectedAddressId(addr._id)}
                  onEdit={() => openModal(addr)}
                  deleteAddress={handleDeleteAddress}
                  isDefault={false} // By definition, these are 'other' addresses
                  setDefault={handleSetDefault}
                  setSelectedAddressId={setSelectedAddressId}
                />
              ))}

            {/* Add New Box */}
            <div
              className="address-card add-new-box"
              onClick={() => openModal()}
            >
              <div className="add-plus">+</div>
              <p>Add Address</p>
            </div>
          </div>
        </div>

        {!showAll && addresses.length > 1 && (
          <div className="expand-link" onClick={() => setShowAll(true)}>
            <span className="arrow">▼</span> Show {addresses.length - 1} more
            addresses
          </div>
        )}

        {/* React Portal Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Enter a shipping address"
        >
          <ShippingForm
            initialData={editData}
            onClose={closeModal}
            addAddress={addAddress}
            updateAddress={updateAddress}
          />
        </Modal>

        <div className="footer-action">
          <button className="continue-btn" onClick={handleSelectedAddress}>
            Use this address
          </button>
        </div>
      </div>
    </>
  );
}

export default Shipping;
