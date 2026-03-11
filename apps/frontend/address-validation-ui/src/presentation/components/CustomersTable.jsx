import { StatusBadge } from "./StatusBadge";

export function CustomersTable({ rows, onSelect, selectedId }) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            <th>Index</th>
            <th>Name</th>
            <th>Address</th>
            <th>City</th>
            <th>PLZ</th>
            <th>Status</th>
            <th>Tour Type</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={selectedId === row.id ? "selected" : ""}
              onClick={() => onSelect?.(row)}
            >
              <td>{row.companyIndex}</td>
              <td>{row.name}</td>
              <td>{row.fullAddressRaw}</td>
              <td>{row.city}</td>
              <td>{row.postalCode}</td>
              <td><StatusBadge status={row.validationStatus} /></td>
              <td>{row.tourType || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
