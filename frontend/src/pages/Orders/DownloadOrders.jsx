import { downloadOrdersExcel } from "../../contexts/api/orders";
import { styles } from "./Orders";

const downloadOrders = async () => {
  const blob = await downloadOrdersExcel({
      // optional filters
      // dateFrom: "2026-01-01",
      // dateTo: "2026-01-31"
    });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.xlsx";
  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
};

export default function DownloadOrdersButton() {
  return (
    <button
      onClick={downloadOrders}
      style={styles.DownloadButton}
    //   className="px-4 py-2 bg-green-600 text-white rounded"
    >
      Download Orders Excel
    </button>
  );
}
