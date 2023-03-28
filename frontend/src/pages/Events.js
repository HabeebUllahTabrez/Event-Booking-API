import React, { useState, useContext, useEffect } from "react";

import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import "./Events.css";
import AuthContext from "../context/auth-context";
import EventList from "../components/Events/EventList/EventList";
import Spinner from "../components/Spinner/Spinner";

const Events = () => {
  const context = useContext(AuthContext);

  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [eventsData, setEventsData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getAllEvents = () => {
    setLoading(true);
    const requestBody = {
      query: `query{
              events{                  
                _id
                date
                title
                price 
                description
                creator{
                  email
                  _id
                } 
              }
            }`,
    };
    fetch("http://localhost:4000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log("successufully get all events", resData);
        setLoading(false);
        setEventsData(resData.data.events);
      })
      .catch((err) => {
        setLoading(false);
        console.log("Errors: ", err);
      });
  };

  useEffect(() => {
    getAllEvents();
  }, []);

  const startCreateEventHandler = () => {
    setCreating(true);
  };

  const modalConfirmHandler = () => {
    setCreating(false);

    if (
      title.length === 0 ||
      price <= 0 ||
      description.length === 0 ||
      date.length === 0
    ) {
      return;
    }

    const reqBody = {
      query: `
          mutation {
            createEvent(eventInput: {title: "${title}", price: ${price}, date: "${date}", description: "${description}"}) {
              _id
              title
              description
              date
              price
            }
          }
        `,
    };

    const token = context.token;

    fetch("http://localhost:4000/graphql", {
      method: "POST",
      body: JSON.stringify(reqBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        // console.log(resData);
        setEventsData((prevState) => {
          const updatedEvents = [...prevState];
          updatedEvents.push({
            _id: resData.data.createEvent._id,
            date: resData.data.createEvent.date,
            title: resData.data.createEvent.title,
            price: resData.data.createEvent.price,
            description: resData.data.createEvent.description,
            creator: {
              email: "",
              _id: context.userId,
            },
          });
          return updatedEvents;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const modalCancelHandler = () => {
    setCreating(false);
    setSelectedEvent(null);
  };

  const showDetailHandler = (eventId) => {
    const selectedEvt = eventsData.find((e) => e._id === eventId);
    setSelectedEvent(selectedEvt);
  };

  const bookEventHandler = () => {
    if (!context.token) {
      setSelectedEvent(null);
      return;
    }
    const requestBody = {
      query: `mutation{
                bookEvent(eventId: "${selectedEvent._id}"){                  
                  _id
                  createdAt
                  updatedAt
                }
              }`,
    };
    fetch("http://localhost:4000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + context.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log("successufully booked event", resData);
        setSelectedEvent(null);
      })
      .catch((err) => {
        setLoading(false);
        console.log("Errors: ", err);
      });
  };

  return (
    <React.Fragment>
      {(creating || selectedEvent) && <Backdrop />}
      {creating && (
        <Modal
          title="Add Event"
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={modalConfirmHandler}
          confirmText="Confirm"
        >
          <form>
            <div className="form-control">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                onChange={(e) => setTitle(e.target.value)}
              ></input>
            </div>
            <div className="form-control">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                onChange={(e) => setPrice(+e.target.value)}
              ></input>
            </div>
            <div className="form-control">
              <label htmlFor="date">Date</label>
              <input
                type="datetime-local"
                id="date"
                onChange={(e) => setDate(e.target.value)}
              ></input>
            </div>
            <div className="form-control">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows="4"
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </form>
        </Modal>
      )}
      {selectedEvent && (
        <Modal
          title={selectedEvent.title}
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={bookEventHandler}
          confirmText={context.token ? "Book" : "Confirm"}
        >
          <h1>{selectedEvent.title}</h1>
          <h2>
            ${selectedEvent.price} -{" "}
            {new Date(selectedEvent.date).toLocaleDateString()}
          </h2>
          <p>{selectedEvent.description}</p>
        </Modal>
      )}
      {context.token && (
        <div className="events-control">
          <p>Share your own Events!</p>
          <button className="btn" onClick={startCreateEventHandler}>
            Create Event
          </button>
        </div>
      )}
      {loading ? (
        <Spinner />
      ) : (
        <EventList
          events={eventsData}
          authUserId={context.userId}
          onViewDetail={showDetailHandler}
        />
      )}
    </React.Fragment>
  );
};

export default Events;
