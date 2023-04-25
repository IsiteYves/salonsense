import { memo, useEffect, useState } from "react";
import { Route, Link, Routes, Navigate, useNavigate } from "react-router-dom";
import NotFound from "../../components/Notfound";
import DashboardStyled from "./DashboardStyled";
import Modal from "react-modal";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spacer,
  Switch,
} from "@chakra-ui/react";
import { SearchIcon, SmallCloseIcon } from "@chakra-ui/icons";
import io from "socket.io-client";
import usePageVisibility from "../../customHooks/usePageVisibility";

const socket = io(`${process.env.REACT_APP_PASSAGE}`);

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

const getStdDate = (dt) => {
  const date = new Date(dt); // create a new Date object from provided date as parameter
  // date.setDate(date.getDate());
  return date;
};

const removeDuplicateData = (data) => {
  const idSet = new Set();
  const result = [];

  for (const obj of data) {
    if (!idSet.has(obj._id)) {
      result.push(obj);
      idSet.add(obj._id);
    }
  }

  return result;
};

let percentage = 0;
const notAdmin = () => {
  const token = localStorage.getItem("token");
  const decoded = jwt_decode(token);
  return decoded?.user?.role !== "BLBR_ADMIN";
};

const getUsrId = () => {
  const token = localStorage.getItem("token");
  const decoded = jwt_decode(token);
  return decoded?.user?._id;
};

const getCreators = async () => {
  const res = await axios.get("admin");
  return res.data;
};

const getCreator = (mc) => {
  const all = getCreators();
  const c = all.find((cr) => cr?._id === mc);
  return `${c?.role === "BLBR_ADMIN" ? "ADMIN" : "CASHIER"} - ${c?.names}`;
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
    zIndex: 99,
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 15px #cacaca",
  },
};
const addForm = {};

const Abogoshi = () => {
  document.title = "Penter Saloon | Abogoshi";
  const isVisible = usePageVisibility();
  const [abakozi, setAbakozi] = useState([]);

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
        socket.emit("deletedBarbers", barberId);
        alert("Successfully deleted.");
        const n = abakozi.filter((umwogoshi) => umwogoshi._id !== barberId);
        setAbakozi(n);
      }
    } catch (e) {
      alert(`Failed to delete data: ${e.message}.Please try again.`);
    }
  };
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nid, setNid] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editUsr, setEditUsr] = useState(null);
  const [barbLoading, setBarbLoading] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Create a new barber object with the form data
    const newBarber = {
      name,
      phone,
      address,
      nid,
      balance: editUsr?.balance,
      creator: "",
    };
    try {
      if (phone.length !== 10 || isNaN(parseInt(phone))) {
        alert("Please provide a valid phone number.");
        return;
      }
      if (nid && (nid.length !== 16 || isNaN(parseInt(nid)))) {
        alert("Please provide a valid NID number.");
        return;
      }
      setCreateLoading(true);
      let numberTaken = false;
      if (editMode)
        numberTaken = abakozi.find(
          (barber) => barber?.phone === phone && barber?._id === editUsr?._id
        );
      else
        numberTaken = abakozi.find(
          (barber) => barber?.phone === phone && barber?._id === editUsr?._id
        );
      if (numberTaken) {
        alert("Hari undi MWOGOSHI usanzwe afite iyo nimero ya telephone.");
        return;
      }
      if (editMode) {
        await axios.put(`barbers/${editUsr?._id}`, newBarber);
        const n = abakozi.map((umukozi) => {
          if (umukozi?._id === editUsr?._id) {
            return { _id: editUsr?._id, date: editUsr?.date, ...newBarber };
          }
          return umukozi;
        });
        socket.emit("newBalances", {});
        setAbakozi(n);
      } else {
        const res = await axios.post("barbers", newBarber);
        const n = [...abakozi];
        n.push(res.data);
        setAbakozi(n);
        socket.emit("newBarbers", res.data);
      }
      alert(`Successfully ${editMode ? "updated" : "created"}!`);
      setCreateLoading(false);
      setIsOpen(false);
      setName("");
      setPhone("");
      setAddress("");
      setNid("");
    } catch (e) {
      setCreateLoading(false);
      const { message } = e.response?.data;
      if (message.toLowerCase() === "User already exists") {
        alert("Hari undi MWOGOSHI usanzwe afite iyo nimero ya telephone.");
        return;
      }
      alert(
        `Network error: ${e.message}.You can refresh the page and try again.`
      );
    }
  };

  const fetchDt = async () => {
    try {
      setBarbLoading(true);
      const res = await axios.get("barbers");
      setAbakozi(res.data);
      setBarbLoading(false);
    } catch (e) {
      const { response } = e;
      if (response.status === 400) {
        alert(`${e?.message}.Try refreshing the page to try again.`);
      } else {
        alert("Please refresh the page.");
      }
      setBarbLoading(false);
    }
  };

  socket.on("newBarbers", (data) => {
    if (isVisible === false) {
      if (
        !abakozi.find((barber) => {
          return barber._id === data._id;
        })
      ) {
        setAbakozi((prev) => removeDuplicateData([...prev, data]));
        return;
      }
    }
  });

  socket.on("deletedBarbers", (data) => {
    if (isVisible === false) {
      const n = abakozi.filter((barber) => barber._id !== data);
      setAbakozi(n);
    }
  });

  useEffect(() => {
    if (notAdmin()) navigate("/");
    fetchDt();
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
                    {getStdDate(barber?.date).toISOString().split("T")[0]}
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
        )}
        {abakozi.length < 1 && !barbLoading ? (
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
};

const Kogosha = memo(() => {
  document.title = "Penter Saloon | Amafaranga yavuye mu kogosha";
  const isVisible = usePageVisibility();
  const [abogoshi, setAbogoshi] = useState([]);
  const [shownAbogoshi, setShownAbogoshi] = useState([]);
  const [filtered, setFiltered] = useState(false);
  const [barbLoading, setBarbLoading] = useState(false);
  const [barber, setBarber] = useState("");
  const [amount, setAmount] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [dtFilter, setDtFilter] = useState(false);
  const [searchKey, setSearchKey] = useState("");

  const onSearch = (value) => {
    if (value !== searchKey) setSearchKey(value);
    const results = [];
    for (let row of abogoshi) {
      if (
        `${options.find((brb) => brb?._id === row?.barber)?.name}`
          .toLowerCase()
          .includes(value.toLowerCase())
      ) {
        if (!results.find((result) => result === row)) results.push(row);
      }
    }

    setShownAbogoshi(results);
  };

  const handleSelect = (range) => {
    try {
      const { startDate, endDate } = range?.selection;
      const mills1 = new Date(startDate).getTime();
      const mills2 = new Date(endDate).getTime() + 86400000;
      const newRows = [];
      const dtSet = searchKey ? shownAbogoshi : abogoshi;
      for (let i = 0; i < dtSet.length; i++) {
        const currDateMills = new Date(dtSet[i]?.date).getTime();
        if (currDateMills >= mills1 && currDateMills <= mills2) {
          newRows.push(dtSet[i]);
        }
      }
      setFiltered(true);
      setShownAbogoshi(newRows);
    } catch (e) {
      alert(`${e?.message}.Try refreshing the page to try again.`);
    }
  };

  const [options, setOptions] = useState([]);

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
      setShownAbogoshi(response.data);
      const res = await axios.get("barbers");
      setOptions(res.data);
      setBarbLoading(false);
    } catch (e) {
      const { response } = e;
      if (response.status === 400) {
        alert(`${e?.message}.Try refreshing the page to try again.`);
      } else {
        alert(`${e?.message}.Try refreshing the page to try again.`);
      }
      setBarbLoading(false);
    }
  };

  useEffect(() => {
    let tot = 0;
    for (let dt of shownAbogoshi) {
      tot += dt?.amountPaid;
    }
    setTotal(tot);
  }, [shownAbogoshi]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Create a new barber object with the form data
    try {
      if (isNaN(parseInt(amount)) || parseInt(amount) < 0) {
        alert("Please provide a valid amount of money.");
        return;
      }
      const token = localStorage.getItem("token");
      if (!window.confirm("Confirm?")) return;
      const barberUpd = {
        ...barber,
        creator: getUsrId(),
        balance: barber.balance + parseInt(amount),
      };
      setLoading(true);
      await axios.put(`barbers/${barber._id}`, barberUpd);
      socket.emit("newBalances", {});
      setLoading(false);
      alert("Successfully created!");
      setIsOpen(false);
      const m = [...options];
      m.map((brb) => {
        if (brb._id === barber._id) {
          brb.balance = barberUpd.balance;
        }
        return brb;
      });
      setOptions(m);
      const n = [...abogoshi];
      n.push({
        barber: barber._id,
        amountPaid: parseInt(amount),
        date: new Date(),
      });
      setAbogoshi(n);
      setShownAbogoshi(n);
      setTotal(total + parseInt(amount));
      setBarber(null);
      setAmount(null);
    } catch (e) {
      setLoading(false);
      alert(
        `Network error: ${e.message}.You can refresh the page and try again.`
      );
    }
  };

  socket.on("newBarbers", (data) => {
    if (isVisible === false) {
      if (!options.find((brb) => brb._id === data._id)) {
        setOptions((prev) => removeDuplicateData([...prev, data]));
        return;
      }
    }
  });

  socket.on("deletedBarbers", (data) => {
    if (isVisible === false) {
      if (options.find((brb) => brb._id === data)) {
        const newOptions = options.filter((brb) => brb._id !== data);
        setOptions(newOptions);
      }
    }
  });

  socket.on("newBalances", () => {
    if (isVisible === false) window.location.reload();
  });

  useEffect(() => {
    fetchAbogoshi();
  }, []);
  return (
    <div>
      <h2>Ayavuye mu kogosha</h2>
      {!barbLoading && (
        <>
          {abogoshi.length > 0 && (
            <>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="email-alerts" mb="0">
                  Toggle Date Filter
                </FormLabel>
                <Switch
                  id="email-alerts"
                  onChange={() => {
                    setDtFilter(!dtFilter);
                  }}
                />
              </FormControl>
              {dtFilter && (
                <DateRangePicker
                  ranges={[selectionRange]}
                  onChange={handleSelect}
                />
              )}
            </>
          )}
          <h3>
            Total yavuye mu kogosha:{" "}
            <span style={{ fontWeight: 700 }}>{formatPrice(total)}</span>
          </h3>
          <h3>
            Net amount ya saloon (ukuyemo ayo abogoshi bahembwa/bazahembwa):{" "}
            <span style={{ fontWeight: 700 }}>
              {formatPrice((total * (100 - percentage)) / 100)}
            </span>
          </h3>
          <Flex>
            <button
              onClick={async () => {
                setIsOpen(true);
              }}
            >
              Hogoshwe Umuntu +
            </button>
            <Spacer />
            <InputGroup width={300}>
              <InputLeftElement
                pointerEvents="none"
                children={<SearchIcon color="gray.300" />}
              />
              <Input
                type="text"
                value={searchKey}
                onChange={(e) => onSearch(e?.target?.value)}
                placeholder="Search..."
              />
              <InputRightElement
                pointerEvents="all"
                children={
                  <SmallCloseIcon
                    color="gray.500"
                    onClick={() => {
                      setSearchKey("");
                      setShownAbogoshi(abogoshi);
                    }}
                  />
                }
              />
            </InputGroup>
          </Flex>
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
                <th>Creator</th>
              </tr>
            </thead>
            <tbody>
              {shownAbogoshi.map((barber) => (
                <tr key={barber._id}>
                  <td>
                    {options.find((brb) => brb?._id === barber.barber)?.name ? (
                      options.find((brb) => brb?._id === barber.barber)?.name
                    ) : (
                      <span style={{ color: "orange" }}>
                        [Uyu mwogoshi mwamusibye muri system]
                      </span>
                    )}
                  </td>
                  <td>{formatPrice(barber?.amountPaid)}</td>
                  <td>
                    {getStdDate(barber?.date).toISOString().split("T")[0]}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {formatTime(new Date(barber?.date).toISOString())}
                  </td>
                  <td>
                    {barber?.creator ? (
                      getCreator(barber?.creator)
                    ) : (
                      <span style={{ color: "orange" }}>
                        [Umu user mwamusibye muri system]
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {shownAbogoshi.length < 1 && !barbLoading ? (
          <p style={{ padding: "1rem 2rem", backgroundColor: "orange" }}>
            {filtered
              ? "Nta bakiriya bogoshwe hagati y'ayo matariki uhisemo."
              : "Nta bakiriya barogoshwa."}
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
});

const AmafarangaAbagoshiBabikuje = memo(() => {
  document.title = "Penter Saloon | Amafaranga Abagoshi Bahawe";
  const isVisible = usePageVisibility();
  const [abogoshi, setAbogoshi] = useState([]);
  const [barbLoading, setBarbLoading] = useState(false);
  const [barber, setBarber] = useState("");
  const [amount, setAmount] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const fetchAbogoshi = async () => {
    try {
      setBarbLoading(true);
      const response = await axios.get("withdrawals");
      setAbogoshi(response.data);
      const res = await axios.get("barbers");
      setOptions(res.data);
      setBarbLoading(false);
    } catch (e) {
      const { response } = e;
      if (response.status === 400) {
        alert(`${e?.message}.Try refreshing the page to try again.`);
      } else {
        alert(`${e?.message}.Try refreshing the page to try again.`);
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
      if (!window.confirm("Confirm withdrawal?")) return;

      const barberUpd = {
        ...barber,
        creator: getUsrId(),
        balance: barber.balance - (100 * parseInt(amount)) / percentage,
      };
      setLoading(true);
      await axios.put(`barbers/${barber._id}`, barberUpd);
      socket.emit("newBalances", {});
      setLoading(false);
      alert("Successfully created!");
      setIsOpen(false);
      const m = [...options];
      m.map((brb) => {
        if (brb._id === barber._id) {
          brb.balance = barberUpd.balance;
        }
        return brb;
      });
      setOptions(m);
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
      alert(
        `Network error: ${e.message}.You can refresh the page and try again.`
      );
    }
  };

  socket.on("newBalances", () => {
    if (isVisible === false) window.location.reload();
  });

  socket.on("newBarbers", (data) => {
    if (isVisible === false) {
      if (!options.find((brb) => brb._id === data._id)) {
        setOptions((prev) => removeDuplicateData([...prev, data]));
        return;
      }
    }
  });

  socket.on("deletedBarbers", (data) => {
    if (isVisible === false) {
      if (options.find((brb) => brb._id === data)) {
        const newOptions = options.filter((brb) => brb._id !== data);
        setOptions(newOptions);
      }
    }
  });

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
                <th>Creator</th>
              </tr>
            </thead>
            <tbody>
              {abogoshi.map((barber) => (
                <tr key={barber._id}>
                  <td>
                    {options.find((brb) => brb?._id === barber.barber)?.name ? (
                      options.find((brb) => brb?._id === barber.barber)?.name
                    ) : (
                      <span style={{ color: "orange" }}>
                        [Uyu mwogoshi mwamusibye muri system]
                      </span>
                    )}
                  </td>
                  <td>{formatPrice(barber?.amount)}</td>
                  <td>
                    {getStdDate(barber?.date).toISOString().split("T")[0]}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {formatTime(new Date(barber?.date).toISOString())}
                  </td>
                  <td>
                    {barber?.creator ? (
                      getCreator(barber?.creator)
                    ) : (
                      <span style={{ color: "orange" }}>
                        [Umu user mwamusibye muri system]
                      </span>
                    )}
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
});

const Cashiers = memo(() => {
  document.title = "Penter Saloon | Aba Cashier";
  const isVisible = usePageVisibility();
  const [abakozi, setAbakozi] = useState([]);
  const [editMode1, setEditMode1] = useState(false);

  const handleEdit = (barber) => {
    setEditMode(true);
    const { names, phone, address, nid } = barber;
    setEditUsr(barber);
    setName(names);
    setPhone(phone);
    setAddress(address);
    setNid(nid);
    setIsOpen(true);
  };

  const handleEditPs = (barber) => {
    setEditMode1(true);
    setEditUsr(barber);
    setIsOpen(true);
  };

  const handleDelete = async (barberId) => {
    // Handle delete action for the barber with the given ID
    try {
      if (window.confirm("Are you sure you want to delete this cashier?")) {
        await axios.delete(`admin/${barberId}`);
        socket.emit("deletedCashier", barberId);
        alert("Successfully deleted.");
        const n = abakozi.filter((umwogoshi) => umwogoshi._id !== barberId);
        setAbakozi(n);
      }
    } catch (e) {
      alert(`Failed to delete cashier: ${e.message}.Please try again.`);
    }
  };
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nid, setNid] = useState("");
  const [password, setPassword] = useState("");
  const [passwordc, setPasswordc] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editUsr, setEditUsr] = useState(null);
  const [barbLoading, setBarbLoading] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Create a new barber object with the form data
    const newBarber = {
      names: name,
      phone,
      address,
      nid,
      password,
      passwordc,
      role: "BLBR_CASHIER",
    };
    try {
      if (!editMode1) {
        if (phone.length !== 10 || isNaN(parseInt(phone))) {
          alert("Please provide a valid phone number.");
          return;
        }

        if (nid && (nid.length !== 16 || isNaN(parseInt(nid)))) {
          alert("Please provide a valid NID number.");
          return;
        }
      }

      if (!editMode || editMode1) {
        if (password.length < 5) {
          alert("Password must be at least 5 characters in length");
          return;
        }

        if (password !== passwordc) {
          alert("Please confirm password correctly");
          return;
        }
      }

      setCreateLoading(true);
      if (editMode) {
        await axios.put(`admin/${editUsr?._id}`, newBarber);
        const n = abakozi.map((umukozi) => {
          if (umukozi?._id === editUsr?._id) {
            return { _id: editUsr?._id, date: editUsr?.date, ...newBarber };
          }
          return umukozi;
        });
        socket.emit("newCashier", {});
        setAbakozi(n);
      } else if (editMode1) {
        await axios.put(`admin/update-password/${editUsr?._id}`, {
          newPassword: password,
          pswdConfirm: passwordc,
        });
        alert(
          `Password updated successfully for Cashier '${
            abakozi.find((umukozi) => umukozi?._id === editUsr?._id)?.names
          }'`
        );
      } else {
        const res = await axios.post("admin", newBarber);
        const n = [...abakozi];
        n.push(res.data);
        setAbakozi(n);
        socket.emit("newCashier", res.data);
      }
      if (!editMode1)
        alert(`Successfully ${editMode ? "updated" : "created"}!`);
      setCreateLoading(false);
      setIsOpen(false);
      setName("");
      setPhone("");
      setAddress("");
      setNid("");
    } catch (e) {
      setCreateLoading(false);
      const { message } = e.response?.data;
      if (message.toLowerCase() === "User already exists") {
        alert("Hari undi mu CASHIER usanzwe afite iyo nimero ya telephone.");
        return;
      }
      alert(
        `Network error: ${e.message}.You can refresh the page and try again.`
      );
    }
  };

  const fetchDt = async () => {
    try {
      setBarbLoading(true);
      const res = await axios.get("admin");
      setAbakozi(res.data);
      setBarbLoading(false);
    } catch (e) {
      const { response } = e;
      if (response.status === 400) {
        alert(`${e?.message}.Try refreshing the page to try again.`);
      } else {
        alert("Please refresh the page.");
      }
      setBarbLoading(false);
    }
  };

  socket.on("newCashier", (data) => {
    if (isVisible === false) {
      if (
        !abakozi.find((barber) => {
          return barber._id === data._id;
        })
      ) {
        setAbakozi((prev) => removeDuplicateData([...prev, data]));
        return;
      }
    }
  });

  socket.on("deletedCashier", (data) => {
    if (isVisible === false) {
      const n = abakozi.filter((barber) => barber._id !== data);
      setAbakozi(n);
    }
  });

  useEffect(() => {
    if (notAdmin()) navigate("/");
    fetchDt();
  }, []);
  return (
    <div>
      <h2>Aba Cashiers</h2>
      <button onClick={() => setIsOpen(true)}>Umu Cashier Mushya +</button>
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
                <th>Registered on</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {abakozi.map((barber, i) => (
                <tr key={barber._id}>
                  <td>{i + 1}</td>
                  <td>{barber.names}</td>
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
                  <td>
                    {getStdDate(barber?.date).toISOString().split("T")[0]}
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
                    </button>{" "}
                    |{" "}
                    <button
                      onClick={() => handleEditPs(barber)}
                      style={{
                        padding: "6px 14px",
                        background: "dodgerblue",
                        color: "#fff",
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      Change Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {abakozi.length < 1 && !barbLoading ? (
          <p style={{ padding: "1rem 2rem", backgroundColor: "orange" }}>
            Nta ba cashiers bahari ubu.
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
            setEditMode1(false);
            setName("");
            setPhone("");
            setAddress("");
            setNid("");
            setPassword("");
            setPasswordc("");
            setEditUsr(null);
          }}
          style={{
            positin: "relative",
            top: "3rem",
            marginTop: "2rem",
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
          {!editMode1 && (
            <>
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
            </>
          )}
          {!editMode && (
            <>
              <div>
                <label htmlFor="password">
                  {editMode1 ? "New " : ""}Password *
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder={`Password for this ${
                    editMode1 ? "" : "new "
                  }cashier...`}
                  maxLength={10}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="passwordc">
                  Confirm {editMode1 ? "new " : ""}password *
                </label>
                <input
                  type="password"
                  id="passwordc"
                  placeholder="Confirm password..."
                  maxLength={10}
                  value={passwordc}
                  onChange={(event) => setPasswordc(event.target.value)}
                  required
                />
              </div>
            </>
          )}
          <button type="submit">
            {createLoading
              ? editMode || editMode1
                ? editMode
                  ? "Updating cashier..."
                  : "Updating cashier password..."
                : "Creating cashier..."
              : editMode || editMode1
              ? editMode
                ? "Update Cashier"
                : "Update Cashier password"
              : "Create Cashier"}
          </button>
        </form>
      </Modal>
    </div>
  );
});

const Settings = memo(() => {
  const presets = [
    { name: "Percentage umwogoshi atwara (%)", prop: "percentage" },
    {
      name: "Nimero za Admin (Enter the numbers, seperating them with commas)",
      prop: "adminNumbers",
    },
  ];
  const [loading, setLoading] = useState(false);
  const [updLoading, setUpdLoading] = useState(false);

  const [settings, setSettings] = useState({
    percentage: 40,
    adminNumbers: "",
  });
  const [initSets, setInitSets] = useState({
    percentage: 40,
    adminNumbers: "",
  });

  const fetchSetttings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("settings");
      if (res.data?.percentage && !res.data?.adminNumbers) {
        const { percentage, adminNumbers } = res.data;
        setSettings({
          percentage,
          adminNumbers: adminNumbers.join(","),
        });
        setInitSets({
          percentage,
          adminNumbers: adminNumbers.join(","),
        });
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert(`Failed to fetch settings: ${e.message}`);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (notAdmin()) navigate("/");
    fetchSetttings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (
        settings.percentage === initSets.percentage &&
        settings.adminNumbers === initSets.adminNumbers
      ) {
        alert("No changes made");
        return;
      }
      setUpdLoading(true);
      if (settings.adminNumbers.replace(/,/g, "").length % 10 !== 0) {
        alert("All phone numbers must be correct");
        return;
      }
      const ns = {
        percentage: parseInt(settings.percentage),
        adminNumbers: settings.adminNumbers.split(","),
      };
      await axios.put("settings", ns);
      socket.emit("newSettings", {});
      setUpdLoading(false);
      percentage = ns.percentage;
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
            {presets.map((preset, ind) => (
              <div key={ind}>
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
                  required={preset.prop !== "adminNumbers"}
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
});

const Dashboard = memo(() => {
  const isVisible = usePageVisibility();
  const [barbLoading, setBarbLoading] = useState(true);
  const calc = async () => {
    try {
      setBarbLoading(true);
      const res2 = await axios.get("settings");
      percentage = res2.data?.percentage;
      setBarbLoading(false);
    } catch (e) {
      const { response } = e;
      if (response.status === 400) {
        alert(`${e?.message}.Try refreshing the page to try again.`);
      } else {
        alert(`${e?.message}.Try refreshing the page to try again.`);
      }
      setBarbLoading(false);
    }
  };
  const navigate = useNavigate();
  const [usr, setUsr] = useState("");
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
      else setUsr(decoded?.user);
    }
    document.body.style.backgroundColor = "#fff";
    calc();
  }, []);

  socket.on("logdout", (id) => {
    if (id === usr?._id) {
      localStorage.removeItem("token");
      window.location.reload();
    }
  });

  socket.on("newSettings", () => {
    window.location.reload();
  });
  return (
    <DashboardStyled>
      <div className="sidebar">
        <h2>Penter Saloon</h2>
        <h2 style={{ textTransform: "capitalize", padding: "0.7rem 2rem" }}>
          {usr?.names}&nbsp;&nbsp;
          <span style={{ fontSize: "14px", color: "green" }}>
            (
            {usr?.role === "BLBR_ADMIN"
              ? "Admin"
              : usr?.role === "BLBR_CASHIER"
              ? "Cashier"
              : ""}
            )
          </span>
          <p style={{ dislay: "block", fontSize: "17px" }}>
            Login Phone: <span style={{ color: "green" }}>{usr?.phone}</span>
          </p>
        </h2>
        <ul>
          {usr?.role === "BLBR_ADMIN" && (
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
          {usr?.role === "BLBR_ADMIN" && (
            <li>
              <Link to="/settings">Settings</Link>
            </li>
          )}
          {usr?.role === "BLBR_ADMIN" && (
            <li>
              <Link to="/cashiers">Aba Cashier</Link>
            </li>
          )}
          <li
            onClick={() => {
              localStorage.removeItem("token");
              socket.emit("logdout", usr?._id);
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
                  to={
                    usr?.role && usr?.role === "BLBR_ADMIN"
                      ? "/abogoshi"
                      : "/kogosha"
                  }
                />
              }
            />
            <Route path="/abogoshi" exact element={<Abogoshi />} />
            <Route path="/kogosha" exact element={<Kogosha />} />
            <Route path="/cashiers" exact element={<Cashiers />} />
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
});

export default Dashboard;
