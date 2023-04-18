import { useEffect, useState } from "react";
import { Route, Link, Routes, Navigate, useNavigate } from "react-router-dom";
import NotFound from "../../components/Notfound";
import DashboardStyled from "./DashboardStyled";
import Modal from "react-modal";
import axios from "axios";

const formatPrice = (price) => {
  // Check if price is a valid number
  if (isNaN(price)) {
    return "";
  }

  // Insert commas every 3 digits in the dollars portion
  const formatted = `${price}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Combine the dollars and cents with a period
  return formatted;
};

const formatTime = (systemTime) => {
  const systemTimeUTC = Date.parse(systemTime);
  const localTime = new Date(systemTimeUTC);
  const hours = localTime.getHours();
  const minutes = localTime.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  return `${hours % 12}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
};

Modal.setAppElement("#root");
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    width: "40vw",
    minWidth: "300px",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 15px #cacaca",
  },
};
const addForm = {};

function Abogoshi() {
  const [abogoshi, setAbogoshi] = useState([]);
  const [barbLoading, setBarbLoading] = useState(false);
  const handleEdit = (barberId) => {
    // Handle edit action for the barber with the given ID
    console.log(`Edit clicked for barber with ID ${barberId}`);
  };

  const handleDelete = async (barberId) => {
    // Handle delete action for the barber with the given ID
    try {
      if (window.confirm("Are you sure you want to delete this barber?")) {
        await axios.delete(`barbers/${barberId}`);
        alert("Successfully deleted.");
        const n = abogoshi.filter((umwogoshi) => umwogoshi._id !== barberId);
        setAbogoshi(n);
      }
    } catch (e) {
      alert(`Failed to delete data: ${e.message}.Please try again.`);
    }
    console.log(`Delete clicked for barber with ID ${barberId}`);
  };
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nid, setNid] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchAbogoshi = async () => {
    try {
      setBarbLoading(true);
      const response = await axios.get("barbers");
      setAbogoshi(response.data);
      setBarbLoading(false);
    } catch (e) {
      const { response } = e;
      if (response.status === 400) {
        alert("Network Error");
      } else {
        alert("Network Error.You can refresh the page.");
      }
      setBarbLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Create a new barber object with the form data
    const newBarber = {
      name,
      phone,
      address,
      nid,
      balance: 0,
    };
    try {
      if (phone.length !== 10 || isNaN(parseInt(phone))) {
        alert("Please provide a valid phone number.");
        return;
      }
      const res = await axios.post("barbers", newBarber);
      alert("Successfully created!");
      setIsOpen(false);
      const n = [...abogoshi];
      n.push(res.data);
      setAbogoshi(n);
      setName("");
      setPhone("");
      setAddress("");
      setNid("");
    } catch (e) {
      alert(`Failed to submit data: ${e.message}`);
    }
  };

  useEffect(() => {
    fetchAbogoshi();
  }, []);
  return (
    <div>
      <h2>Abogoshi</h2>
      <button onClick={() => setIsOpen(true)}>Umwogoshi Mushya +</button>
      <div>
        {barbLoading ? (
          <p>Loading data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>NID</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {abogoshi.map((barber, i) => (
                <tr key={barber._id}>
                  <td>{i + 1}</td>
                  <td>{barber.name}</td>
                  <td>{barber.phone}</td>
                  <td
                    style={{
                      textAlign: barber.address ? "left" : "center",
                    }}
                  >
                    {barber.address ? barber.address : "-"}
                  </td>
                  <td
                    style={{
                      textAlign: barber.nid ? "left" : "center",
                    }}
                  >
                    {barber.nid ? barber.nid : "-"}
                  </td>
                  <td>{formatPrice(barber.balance)} Rwf</td>
                  <td>
                    <button
                      onClick={() => handleEdit(barber._id)}
                      style={{
                        padding: "6px 14px",
                        background: "green",
                        color: "#fff",
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>{" "}
                    |{" "}
                    <button
                      onClick={() => handleDelete(barber._id)}
                      style={{
                        padding: "6px 14px",
                        background: "red",
                        color: "#fff",
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {abogoshi.length < 1 && !barbLoading ? (
          <p style={{ padding: "1rem 2rem", backgroundColor: "orange" }}>
            Nta bogoshi bahari ubu.
          </p>
        ) : (
          ""
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button
          onClick={() => setIsOpen(false)}
          style={{
            marginBottom: "1rem",
            background: "red",
            color: "#fff",
            border: "none",
            outline: "none",
            padding: "8px 14px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Close
        </button>
        <form onSubmit={handleSubmit} style={addForm} id="addForm">
          <div>
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              placeholder="07xxxxxxxx"
              maxLength={10}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="address">Address (Optional)</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="nid">National Identity Card (optional)</label>
            <input
              type="text"
              id="nid"
              value={nid}
              maxLength={16}
              onChange={(event) => setNid(event.target.value)}
            />
          </div>
          <button type="submit">Create Barber</button>
        </form>
      </Modal>
    </div>
  );
}

function Kogosha() {
  const [abogoshi, setAbogoshi] = useState([]);
  const [barbLoading, setBarbLoading] = useState(false);
  const [barber, setBarber] = useState("");
  const [amount, setAmount] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAbogoshi = async () => {
    try {
      setBarbLoading(true);
      const response = await axios.get("shaves");
      setAbogoshi(response.data);
      const res = await axios.get("barbers");
      setOptions(res.data);
      setBarbLoading(false);
    } catch (e) {
      const { response } = e;
      if (response.status === 400) {
        alert("Network Error");
      } else {
        alert("Network Error.You can refresh the page.");
      }
      setBarbLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Create a new barber object with the form data
    try {
      if (isNaN(parseInt(amount)) || parseInt(amount) < 0) {
        alert("Please provide a valid amount of money.");
        return;
      }
      const barberUpd = {
        ...barber,
        balance: barber.balance + parseInt(amount),
      };
      setLoading(true);
      await axios.put(`barbers/${barber._id}`, barberUpd);
      const res = await axios.post("shaves", {
        barber: barber._id,
        amountPaid: parseInt(amount),
      });
      setLoading(false);
      alert("Successfully created!");
      setIsOpen(false);
      const n = [...abogoshi];
      n.push(res.data);
      setAbogoshi(n);
      setBarber(null);
      setAmount(null);
    } catch (e) {
      setLoading(false);
      alert(`Failed to submit data: ${e.message}`);
    }
  };
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetchAbogoshi();
  }, []);
  return (
    <div>
      <h2>Abogoshwe</h2>
      <button
        onClick={async () => {
          setIsOpen(true);
        }}
      >
        Hogoshwe Umuntu +
      </button>
      <div>
        {barbLoading ? (
          <p>Loading data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Umwogoshi</th>
                <th>Amafaranga yamwogosheye</th>
                <th>Itariki</th>
              </tr>
            </thead>
            <tbody>
              {abogoshi.map((barber) => (
                <tr key={barber._id}>
                  <td>
                    {options.find((brb) => brb?._id === barber.barber)?.name}
                  </td>
                  <td>{formatPrice(barber?.amountPaid)} Rwf</td>
                  <td>
                    {new Date(barber?.date).toISOString().split("T")[0]}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {formatTime(new Date(barber?.date).toISOString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {abogoshi.length < 1 && !barbLoading ? (
          <p style={{ padding: "1rem 2rem", backgroundColor: "orange" }}>
            Nta bakiriya barogoshwa.
          </p>
        ) : (
          ""
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button
          onClick={() => setIsOpen(false)}
          style={{
            marginBottom: "1rem",
            background: "red",
            color: "#fff",
            border: "none",
            outline: "none",
            padding: "8px 14px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Close
        </button>
        <form onSubmit={handleSubmit} style={addForm} id="addForm">
          <div>
            <label htmlFor="barber">Umwogoshi</label>
            <select
              id="barber"
              required
              onChange={(event) =>
                setBarber(
                  options.find((option) => option._id === event.target.value)
                )
              }
            >
              <option value="">Choose barber</option>
              {options.map((option) => (
                <option key={option._id} value={option._id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="phone">Amafaranga amwogosheye</label>
            <input
              type="tel"
              id="phone"
              placeholder="Rwf"
              maxLength={5}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>
          <button type="submit">{loading ? "Creating..." : "Create"}</button>
        </form>
      </Modal>
    </div>
  );
}

function AmafarangaAbagoshiBabikuje() {
  const [abogoshi, setAbogoshi] = useState([]);
  const [barbLoading, setBarbLoading] = useState(false);
  const [barber, setBarber] = useState("");
  const [amount, setAmount] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAbogoshi = async () => {
    try {
      setBarbLoading(true);
      const response = await axios.get("shaves");
      setAbogoshi(response.data);
      const res = await axios.get("barbers");
      setOptions(res.data);
      setBarbLoading(false);
    } catch (e) {
      const { response } = e;
      if (response.status === 400) {
        alert("Network Error");
      } else {
        alert("Network Error.You can refresh the page.");
      }
      setBarbLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Create a new barber object with the form data
    try {
      if (isNaN(parseInt(amount)) || parseInt(amount) < 0) {
        alert("Please provide a valid amount of money.");
        return;
      }
      if (barber?.balance - parseInt(amount) < 0) {
        alert("Uyu mwogoshi ntabwo afitemo amafaranga ahagije");
        return;
      }
      const barberUpd = {
        ...barber,
        balance: barber.balance - parseInt(amount),
      };
      setLoading(true);
      await axios.put(`barbers/${barber._id}`, barberUpd);
      const res = await axios.post("withdrawals", {
        barber: barber._id,
        amount: parseInt(amount),
      });
      setLoading(false);
      alert("Successfully created!");
      setIsOpen(false);
      const n = [...abogoshi];
      n.push(res.data);
      setAbogoshi(n);
      setBarber(null);
      setAmount(null);
    } catch (e) {
      setLoading(false);
      alert(`Failed to submit data: ${e.message}`);
    }
  };
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetchAbogoshi();
  }, []);
  return (
    <div>
      <h2>Abogoshwe</h2>
      <button
        onClick={async () => {
          setIsOpen(true);
        }}
      >
        Kubikura +
      </button>
      <div>
        {barbLoading ? (
          <p>Loading data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Umwogoshi</th>
                <th>Amafaranga yamwogosheye</th>
                <th>Itariki</th>
              </tr>
            </thead>
            <tbody>
              {abogoshi.map((barber) => (
                <tr key={barber._id}>
                  <td>
                    {options.find((brb) => brb?._id === barber.barber)?.name}
                  </td>
                  <td>{formatPrice(barber?.amountPaid)} Rwf</td>
                  <td>
                    {new Date(barber?.date).toISOString().split("T")[0]}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {formatTime(new Date(barber?.date).toISOString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {abogoshi.length < 1 && !barbLoading ? (
          <p style={{ padding: "1rem 2rem", backgroundColor: "orange" }}>
            Nta bakiriya barogoshwa.
          </p>
        ) : (
          ""
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button
          onClick={() => setIsOpen(false)}
          style={{
            marginBottom: "1rem",
            background: "red",
            color: "#fff",
            border: "none",
            outline: "none",
            padding: "8px 14px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Close
        </button>
        <form onSubmit={handleSubmit} style={addForm} id="addForm">
          <div>
            <label htmlFor="barber">Umwogoshi</label>
            <select
              id="barber"
              required
              onChange={(event) =>
                setBarber(
                  options.find((option) => option._id === event.target.value)
                )
              }
            >
              <option value="">Choose barber</option>
              {options.map((option) => (
                <option key={option._id} value={option._id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="phone">Amafaranga amwogosheye</label>
            <input
              type="tel"
              id="phone"
              placeholder="Rwf"
              maxLength={5}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>
          <button type="submit">{loading ? "Creating..." : "Create"}</button>
        </form>
      </Modal>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
    document.body.style.backgroundColor = "#fff";
  }, []);
  return (
    <DashboardStyled>
      <div className="sidebar">
        <ul>
          <li>
            <Link to="/abogoshi">Abogoshi</Link>
          </li>
          <li>
            <Link to="/kogosha">Abagoshwe</Link>
          </li>
          <li>
            <Link to="/amafaranga-abagoshi-babikuje">
              Amafaranga abagoshi babikuje
            </Link>
          </li>
          <li
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
          >
            Logout
          </li>
        </ul>
      </div>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="abogoshi" />} />
          <Route path="/abogoshi" exact element={<Abogoshi />} />
          <Route path="/kogosha" exact element={<Kogosha />} />
          <Route
            path="/amafaranga-abagoshi-babikuje"
            element={<AmafarangaAbagoshiBabikuje />}
          />
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </div>
    </DashboardStyled>
  );
}

export default Dashboard;
