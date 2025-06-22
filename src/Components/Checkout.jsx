import { useContext } from "react";
import { useEffect } from "react";
import { useActionState } from "react";
import Modal from "./UI/Modal";
import CartContext from "../Store/CartContext";
import { currencyFormatter } from "../util/formatting";
import Input from "./UI/Input";
import Button from "./UI/Button";
import UserProgressContext from "../Store/UserProgressContext";
import useHttp from "../Hooks/UseHttp";
import Error from "./Error";

const backendUrl = import.meta.env.VITE_BACKEND_URL

const requsetConfig = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};
export default function Checkout() {
  const cartCtx = useContext(CartContext);
  const userProgressCtx = useContext(UserProgressContext);

  const { data, error, sendRequest, clearData } = useHttp(
    `${backendUrl}/orders`,
    requsetConfig
  );

  const cartTotal = cartCtx.items.reduce(
    (totalPrice, item) => totalPrice + item.quantity * item.price,
    0
  );

  function handleClose() {
    userProgressCtx.hideCheckout();
  }

  function handleFinish() {
    userProgressCtx.hideCheckout();
    cartCtx.clearCart();
    clearData();
  }
  // Form: 
  async function checkoutAction(prevState, fd) {
    const customerData = Object.fromEntries(fd.entries());

    // Send the Customer or order details to backend:
    await sendRequest(
      JSON.stringify({
        order: {
          items: cartCtx.items,
          customer: customerData,
        },
      })
    );
  }

  const [formState, formAction, pending] = useActionState(checkoutAction, null);

  let actions = (
    <>
      <Button type="button" textOnly onClick={handleClose}>
        Close
      </Button>
      <Button>Submit Order</Button>
    </>
  );

  // Loading message when order are done.
  if (pending) {
    actions = <span>Sending order data....</span>;
  }

  // Success message when order was completed.
  if (data && !error) {
    return (
      <Modal
        open={userProgressCtx.progress === "checkout"}
        onClose={handleClose}
      >
        <h2>Success!</h2>
        <p>Your order was submitted successfully.</p>
        <p>
          We will get back to you with more details via email within the next
          few minutes.
        </p>
        <p className="modal-actions">
          <Button onClick={handleFinish}>Okay</Button>
        </p>
      </Modal>
    );
  }
  

  return (
    <Modal open={userProgressCtx.progress === "checkout"} onClose={handleClose}>
      <form action={formAction}>
        <h2>Checkout</h2>
        <p>Total Amount:{currencyFormatter.format(cartTotal)}</p>
        <Input label="Full Name" type="text" id="name" />
        <Input label="E-mail Address" type="email" id="email" />
        <Input label="Street" type="text" id="street" />
        <div>
          <Input label="Postal Code" type="text" id="postal-code" />
          <Input label="City" type="text" id="city" />
        </div>
        {error && <Error title="Failed to submit order" message={error} />}
        <p className="modal-actions">{actions}</p>
      </form>
    </Modal>
  );
}
