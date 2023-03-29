import React, { useState, useEffect, useContext } from "react";

import Spinner from "../components/Spinner/Spinner";
import AuthContext from "../context/auth-context";
import BookingList from "../components/Bookings/BookingList/BookingList";

const Bookings = () => {
  const context = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  const getAllBookings = () => {
    setIsLoading(true);
    const requestBody = {
      query: `query{
                bookings{                  
                  _id
                  createdAt
                  event {
                    _id
                    title
                    date
                  }
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
        console.log("successufully get all bookings", resData);
        setIsLoading(false);
        setBookings(resData.data.bookings);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("Errors: ", err);
      });
  };

  useEffect(() => {
    getAllBookings();
  }, []);

  const deleteBookingHandler = (bookingId) => {
    const requestBody = {
      query: `mutation CancelBooking($id: ID!) {
                cancelBooking(bookingId: $id){                  
                  _id
                  title
                }
              }`,
      variables: {
        id: bookingId,
      },
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
        setBookings((prevState) => {
          return prevState.filter((booking) => booking._id !== bookingId);
        });
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("Errors: ", err);
      });
  };

  return (
    <React.Fragment>
      {isLoading ? (
        <Spinner />
      ) : (
        <BookingList bookings={bookings} onDelete={deleteBookingHandler} />
      )}
    </React.Fragment>
  );
};

export default Bookings;
