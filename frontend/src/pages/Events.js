import React, { useState, useContext, useEffect } from "react";

import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import "./Events.css";
import AuthContext from "../context/auth-context";

const Events = () => {
  const context = useContext(AuthContext);

  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [eventsData, setEventsData] = useState([]);

  const getAllEvents = () => {
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
        setEventsData(resData.data.events);
      })
      .catch((err) => {
        console.log("Errors: ", err);
      });
  };

  useEffect(() => {
    getAllEvents();
  }, []);

  const eventList = eventsData.map((event) => {
    return (
      <li key={event._id} className="events__list-item">
        {event.title}
      </li>
    );
  });

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

    const event = { title, price, date, description };
    console.log(event);

    const reqBody = {
      query: `
          mutation {
            createEvent(eventInput: {title: "${title}", price: ${price}, date: "${date}", description: "${description}"}) {
              _id
              title
              description
              date
              price
              creator {
                _id
                email
              }
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
        getAllEvents();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const modalCancelHandler = () => {
    setCreating(false);
  };

  return (
    <React.Fragment>
      {creating && <Backdrop />}
      {creating && (
        <Modal
          title="Add Event"
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={modalConfirmHandler}
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
      {context.token && (
        <div className="events-control">
          <p>Share your own Events!</p>
          <button className="btn" onClick={startCreateEventHandler}>
            Create Event
          </button>
        </div>
      )}
      <ul className="events__list">{eventList}</ul>
    </React.Fragment>
  );
};

export default Events;
