import { useEffect, useState } from "react";
import { Route, Link, Routes, Navigate, useNavigate } from "react-router-dom";
import NotFound from "../../components/Notfound";
import DashboardStyled from "./DashboardStyled";
import Modal from "react-modal";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { FormControl, FormLabel, Switch } from "@chakra-ui/react";

const formatPrice = (price) => {
  // Check if price is a valid number
  if (isNaN(price)) return "";

  // Insert commas every 3 digits in the dollars portion
  const formatted = `${price}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Combine the dollars and cents with a period
  return `${formatted} Rwf`;
};

const formatTime = (systemTime) => {
  const systemTimeUTC = Date.parse(systemTime);
  const localTime = new Date(systemTimeUTC);
  const hours = localTime.getHours();
  const minutes = localTime.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  return `${hours % 12}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
};

let percentage = 0;
let options = [];

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
  document.title = "Abogoshi";
  const [abakozi, setAbakozi] = useState([...options]);

  const handleEdit = (barber) => {
    setEditMode(true);
    const { name, phone, address, nid } = barber;
    setEditUsr(barber);
    setName(name);
    setPhone(phone);
    setAddress(address);
    setNid(nid);
    setIsOpen(true);
  };

  const handleDelete = async (barberId) => {
    // Handle delete action for the barber with the given ID
    try {
      if (window.confirm("Are you sure you want to delete this barber?")) {
        await axios.delete(`barbers/${barberId}`);
        alert("Successfully deleted.");
        const n = options.filter((umwogoshi) => umwogoshi._id !== barberId);
        setAbakozi(n);
        options = n;
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
  const [editMode, setEditMode] = useState(false);
  const [editUsr, setEditUsr] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Create a new barber object with the form data
    const newBarber = {
      name,
      phone,
      address,
      nid,
      balance: editUsr?.balance,
    };
    try {
      if (phone.length !== 10 || isNaN(parseInt(phone))) {
        alert("Please provide a valid phone number.");
        return;
      }
      setCreateLoading(true);
      if (editMode) {
        await axios.put(`barbers/${editUsr?._id}`, newBarber);
        const n = abakozi.map((umukozi) => {
          if (umukozi?._id === editUsr?._id) {
            return { _id: editUsr?._id, date: editUsr?.date, ...newBarber };
          }
          return umukozi;
        });
        options = n;
        setAbakozi(n);
      } else {
        const res = await axios.post("barbers", newBarber);
        const n = [...options];
        n.push(res.data);
        options = n;
        setAbakozi(n);
      }
      alert(`Successfully ${editMode ? "updated" : "created"}!`);
      setCreateLoading(false);
      setIsOpen(false);
      setName("");
      setPhone("");
      setAddress("");
      setNid("");
    } catch (e) {
      alert(`Failed to submit data: ${e.message}`);
    }
  };
  return (
    <div>
      <h2>Abogoshi</h2>
      <button onClick={() => setIsOpen(true)}>Umwogoshi Mushya +</button>
      <div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>NID</th>
              <th>Balance</th>
              <th>Registered on</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {abakozi.map((barber, i) => (
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
                <td>{formatPrice((percentage / 100) * barber.balance)}</td>
                <td>
                  {new Date(barber?.date).toISOString().split("T")[0]}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {formatTime(new Date(barber?.date).toISOString())}
                </td>
                <td>
                  <button
                    onClick={() => handleEdit(barber)}
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
        {options.length < 1 ? (
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
          onClick={() => {
            setIsOpen(false);
            setEditMode(false);
            setName("");
            setPhone("");
            setAddress("");
            setNid("");
            setEditUsr(null);
          }}
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
          <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>
            {editMode ? "Edit Barber Info" : "Umwogoshi Mushya"}
          </h2>
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
          <button type="submit">
            {createLoading
              ? editMode
                ? "Updating barber..."
                : "Creating barber..."
              : editMode
              ? "Update Barber"
              : "Create Barber"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function Kogosha() {
  document.title = "Amafaranga yavuye mu kogosha";
  const [abogoshi, setAbogoshi] = useState([]);
  const [barbLoading, setBarbLoading] = useState(false);
  const [barber, setBarber] = useState("");
  const [amount, setAmount] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [showFilter, setShowFilter] = useState(false);

  const handleSelect = (range) => {
    console.log(range);
  };

  const selectionRange = {
    startDate: new Date("2023-04-18"),
    endDate: new Date(),
    key: "selection",
  };

  const fetchAbogoshi = async () => {
    try {
      setBarbLoading(true);
      const response = await axios.get("shaves");
      setAbogoshi(response.data);
      let tot = 0;
      for (let dt of response.data) {
        tot += dt?.amountPaid;
      }
      setTotal(tot);
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
      setLoading(false);
      alert("Successfully created!");
      setIsOpen(false);
      const n = [...abogoshi];
      n.push({
        barber: barber._id,
        amountPaid: parseInt(amount),
        date: new Date(),
      });
      setAbogoshi(n);
      setTotal(total + parseInt(amount));
      setBarber(null);
      setAmount(null);
    } catch (e) {
      setLoading(false);
      alert(`Failed to submit data: ${e.message}`);
    }
  };

  useEffect(() => {
    fetchAbogoshi();
  }, []);
  return (
    <div>
      <h2>Ayavuye mu kogosha</h2>
      {!barbLoading && (
        <>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="email-alerts" mb="0">
              Enable email alerts?
            </FormLabel>
            <Switch id="email-alerts" />
          </FormControl>
          <DateRangePicker ranges={[selectionRange]} onChange={handleSelect} />
          <h3>
            <span style={{ fontWeight: 400 }}>Total yavuye mu kogosha:</span>{" "}
            {formatPrice(total)}
          </h3>
          <h3>
            <span style={{ fontWeight: 400 }}>
              Net amount ya saloon (ukuyemo ayo abogoshi bazahembwa):
            </span>{" "}
            {formatPrice((total * (100 - percentage)) / 100)}
          </h3>
          <button
            onClick={async () => {
              setIsOpen(true);
            }}
          >
            Hogoshwe Umuntu +
          </button>
        </>
      )}
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
                  <td>{formatPrice(barber?.amountPaid)}</td>
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
          <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>
            Hogoshwe Umuntu
          </h2>
          <div>
            <label htmlFor="barber">Uwamwogoshe</label>
            <select
              id="barber"
              required
              onChange={(event) =>
                setBarber(
                  options.find((option) => option._id === event.target.value)
                )
              }
            >
              <option value="">-- Choose --</option>
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
  document.title = "Amafaranga Abagoshi Bahawe";
  const [abogoshi, setAbogoshi] = useState([]);
  const [barbLoading, setBarbLoading] = useState(false);
  const [barber, setBarber] = useState("");
  const [amount, setAmount] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAbogoshi = async () => {
    try {
      setBarbLoading(true);
      const response = await axios.get("withdrawals");
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
    try {
      if (isNaN(parseInt(amount)) || parseInt(amount) < 0) {
        alert("Please provide a valid amount of money.");
        return;
      }
      if ((percentage / 100) * barber?.balance - parseInt(amount) < 0) {
        alert("Uyu mwogoshi ntabwo afitemo amafaranga ahagije");
        return;
      }
      const barberUpd = {
        ...barber,
        balance: barber.balance - parseInt(amount),
      };
      setLoading(true);
      await axios.put(`barbers/${barber._id}`, barberUpd);
      setLoading(false);
      alert("Successfully created!");
      setIsOpen(false);
      const n = [...abogoshi];
      n.push({
        barber: barber._id,
        amount: parseInt(amount),
        date: new Date(),
      });
      setAbogoshi(n);
      setBarber(null);
      setAmount(null);
    } catch (e) {
      setLoading(false);
      alert(`Failed to submit data: ${e.message}`);
    }
  };

  useEffect(() => {
    fetchAbogoshi();
  }, []);
  return (
    <div>
      <h2>Amafaranga Abogoshi Bahawe</h2>
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
                <th>Amafaranga yabikuje</th>
                <th>Itariki</th>
              </tr>
            </thead>
            <tbody>
              {abogoshi.map((barber) => (
                <tr key={barber._id}>
                  <td>
                    {options.find((brb) => brb?._id === barber.barber)?.name}
                  </td>
                  <td>{formatPrice(barber?.amountPaid)}</td>
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
            Nta bogoshi bari babikuza.
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
          <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>
            Kubikurira Umwogoshi
          </h2>
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
              <option value="">-- Choose --</option>
              {options.map((option) => (
                <option key={option._id} value={option._id}>
                  {option.name} (Balance:{" "}
                  {formatPrice((percentage / 100) * option.balance)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="phone">Amafaranga abikuje</label>
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

const Settings = () => {
  const [presets, setPresets] = useState([
    { name: "Percentage umwogoshi atwara (%)", prop: "percentage" },
    {
      name: "Nimero za Admin (Enter the numbers, seperating them with commas)",
      prop: "adminNumbers",
    },
    {
      name: "Nimero za Cashier (Enter the numbers, seperating them with commas)",
      prop: "cashierNumbers",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [updLoading, setUpdLoading] = useState(false);

  const [settings, setSettings] = useState({
    percentage: "40",
    adminNumbers: "",
    cashierNumbers: "",
  });

  const fetchSetttings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("settings");
      if (
        !res.data?.percentage ||
        !res.data?.adminNumbers ||
        !res.data?.cashierNumbers
      ) {
        setLoading(false);
        return;
      }
      const { percentage, adminNumbers, cashierNumbers } = res.data;
      setSettings({
        percentage,
        adminNumbers: adminNumbers.join(","),
        cashierNumbers: cashierNumbers.join(","),
      });
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert(`Failed to fetch settings: ${e.message}`);
    }
  };

  useState(() => {
    fetchSetttings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdLoading(true);
      if (
        settings.adminNumbers.replace(/,/g, "").length % 10 !== 0 ||
        settings.cashierNumbers.replace(/,/g, "").length % 10 !== 0
      ) {
        alert("All phone numbers must be correct");
        return;
      }
      const ns = {
        percentage: parseInt(settings.percentage),
        adminNumbers: settings.adminNumbers.split(","),
        cashierNumbers: settings.cashierNumbers.split(","),
      };
      await axios.put("settings", ns);
      setUpdLoading(false);
      alert("Successfully updated settings");
    } catch (e) {
      setUpdLoading(false);
      alert(`Failed to update settings: ${e.message}`);
    }
  };
  return (
    <div>
      <h2>Settings</h2>
      <button
        style={{
          background: "red",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          marginLeft: "4rem",
        }}
        onClick={async () => {
          try {
            if (
              !window.confirm(
                "Are you sure you want to delete all data? This action is irreversible"
              )
            )
              return;
            await axios.delete("admin");
            alert("Cleared all data successfully.");
          } catch (e) {
            alert(`Failed to delete all data: ${e.message}`);
          }
        }}
      >
        Gusiba data zose (Abogoshi, Abogoshwe, Ayabikujwe)
      </button>
      <form
        onSubmit={handleSubmit}
        style={addForm}
        id="addForm"
        className="addForm"
      >
        {loading && <p>Loading settings...</p>}
        {!loading && (
          <>
            {presets.map((preset) => (
              <div>
                <label htmlFor={preset.prop}>{preset.name}</label>
                <input
                  type="text"
                  id={preset.prop}
                  value={settings[preset.prop]}
                  placeholder="Type here..."
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      [preset.prop]: event.target.value.trim(),
                    })
                  }
                  required={
                    preset.prop !== "adminNumbers" &&
                    preset.prop !== "cashierNumbers"
                  }
                />
              </div>
            ))}
            <button type="submit">
              {updLoading ? "Updating Settings..." : "Update Settings"}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

function Dashboard() {
  const [barbLoading, setBarbLoading] = useState(true);
  const calc = async () => {
    try {
      setBarbLoading(true);
      const res2 = await axios.get("settings");
      percentage = res2.data?.percentage;
      const res = await axios.get("barbers");
      options = res.data;
      setBarbLoading(false);
    } catch (e) {
      const { response } = e;
      if (response.status === 400) {
        alert("Network Error");
      } else {
        alert("Please refresh the page.");
      }
      setBarbLoading(false);
    }
  };
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    } else {
      const token = localStorage.getItem("token");
      const decoded = jwt_decode(token);
      if (
        decoded?.user?.role !== "BLBR_ADMIN" &&
        decoded?.user?.role !== "BLBR_CASHIER"
      )
        navigate("/");
      else setRole(decoded?.user?.role);
    }
    document.body.style.backgroundColor = "#fff";
    calc();
  }, []);
  useEffect(() => {
    console.log("role..", role);
  }, [role]);
  return (
    <DashboardStyled>
      <div className="sidebar">
        <ul>
          {role === "BLBR_ADMIN" && (
            <li>
              <Link to="/abogoshi">Abogoshi</Link>
            </li>
          )}
          <li>
            <Link to="/kogosha">Ayavuye mu kogosha</Link>
          </li>
          <li>
            <Link to="/amafaranga-abagoshi-babikuje">
              Amafaranga abagoshi bahawe
            </Link>
          </li>
          {role === "BLBR_ADMIN" && (
            <li>
              <Link to="/settings">Settings</Link>
            </li>
          )}
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
      {barbLoading ? (
        <p style={{ margin: "3rem" }}>Loading data...</p>
      ) : (
        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <Navigate
                  to={role && role === "BLBR_ADMIN" ? "/abogoshi" : "/kogosha"}
                />
              }
            />
            <Route path="/abogoshi" exact element={<Abogoshi />} />
            <Route path="/kogosha" exact element={<Kogosha />} />
            <Route path="/settings" exact element={<Settings />} />
            <Route
              path="/amafaranga-abagoshi-babikuje"
              element={<AmafarangaAbagoshiBabikuje />}
            />
            <Route path="*" element={<NotFound />}></Route>
          </Routes>
        </div>
      )}
    </DashboardStyled>
  );
}

export default Dashboard;
