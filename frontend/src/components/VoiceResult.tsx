import axios from 'axios';

type Item = {
  product_name: string;
  quantity: number;
};

export default function VoiceResult({ items }: { items: Item[] }) {
  const confirmOrder = async () => {
    const token = localStorage.getItem('token');

    await axios.post(
      'http://localhost:3001/orders',
      {
        items,
        status: 'pending',
        payment_method: null,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert('Order sent to kitchen!');
  };

  return (
    <div
      style={{
        marginTop: 40,
        background: '#1e1e1e',
        padding: 20,
        borderRadius: 12,
        textAlign: 'left',
      }}
    >
      <h3>🧾 Detected Order</h3>
      <ul>
        {items.map((i, idx) => (
          <li key={idx}>
            {i.quantity} × {i.product_name}
          </li>
        ))}
      </ul>

      <button
        onClick={confirmOrder}
        style={{
          marginTop: 20,
          width: '100%',
          background: '#3b82f6',
          padding: 12,
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Confirm & Send to Kitchen
      </button>
    </div>
  );
}
