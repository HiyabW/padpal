import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import UserCard from "../feed/components/UserCard";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import './styles.css'
import { apiFetch } from "../../api/client";

const ViewProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = React.useState(null);
  const [images, setImages] = React.useState(null);
  const [users, setUsers] = React.useState({});

  const id = searchParams.get("id");

  useEffect(() => {
    if (id === "undefined" || !id) {
      navigate("/", { replace: true });
      return;
    }

    console.log(id);
    apiFetch("/feed/getUser", {
      method: "POST",
      body: JSON.stringify({ id }),
    })
      .then((response) => response.json())
      .then((data) => {
        const fetchedUser = data["user"];
        setUser(fetchedUser);
        setUsers({ [fetchedUser.email]: fetchedUser });
        setImages(data["images"]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id, navigate]);


  return (
    <div className="feed gradient-background">
      <>
        {user && (
          <Box className="centeredDiv" sx={{ color: 'black', flexDirection: 'column' }}>
            <UserCard
              user={user}
              users={users}
              setUsers={setUsers}
              images={images}
              feedOrViewProfile="view profile"
            />
          </Box>
        )}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ textAlign: "center" }}
          >
            <CircularProgress
              size="10rem"
              style={{ color: "white", marginBottom: "2rem" }}
              sx={{
                "--CircularProgress-thickness": "24px",
              }}
            />
            <h1>Gathering user data...</h1>
          </motion.div>
        )}
      </>
    </div>
  );
};

export default ViewProfile;
