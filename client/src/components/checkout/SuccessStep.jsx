import { Link } from 'react-router-dom';
import { FiCheckCircle, FiPrinter } from 'react-icons/fi';
import OrderReceipt from '../account/OrderReceipt';

// Shown right after placing an order - the bill itself, front and center,
// matching exactly what the customer will see again later from My Orders.
const SuccessStep = ({ order }) => (
  <div className="max-w-3xl mx-auto">
    <div className="no-print text-center mb-6">
      <FiCheckCircle size={48} className="text-brand mx-auto mb-3" />
      <h2 className="font-serif text-2xl text-ink mb-1">Order Placed Successfully!</h2>
      <p className="text-sm text-muted">
        Thank you for shopping with AL SA'I. We have received your order and will process it soon.
      </p>
    </div>

    <div className="no-print flex justify-end mb-3">
      <button
        type="button"
        onClick={() => window.print()}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-brand"
      >
        <FiPrinter size={13} /> Print Receipt
      </button>
    </div>

    <div id="order-receipt-print">
      <OrderReceipt order={order} />
    </div>

    <div className="no-print flex flex-col sm:flex-row gap-3 mt-6">
      <Link
        to={`/orders/${order._id}`}
        className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest text-center py-3 rounded-md transition-colors"
      >
        VIEW IN MY ORDERS
      </Link>
      <Link
        to="/shop"
        className="flex-1 border border-ink/20 text-ink text-xs tracking-widest text-center py-3 hover:border-ink transition-colors"
      >
        CONTINUE SHOPPING
      </Link>
    </div>
  </div>
);

export default SuccessStep;
