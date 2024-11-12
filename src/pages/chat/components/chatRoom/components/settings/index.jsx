import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Modal from 'react-bootstrap/Modal';
import Cookies from 'js-cookie';

export default function Settings({user}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const [show, setShow] = React.useState(false);
  const handleCloseModal = () => setShow(false);
  const handleShowModal = () => {
    setAnchorEl(null);
    setShow(true);
  }

  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  function unmatch() {
    fetch("https://palpal-api.onrender.com/match/unmatch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${Cookies.get("id")}`,
        to: user.id
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
      })
      .catch((err) => {
        console.log(err);
      });

      window.location="/chat"
  }

  const viewProfile = () => {
    window.location=`/viewProfile?id=${user.id}`
  }

  return (
    <div>
      <Modal centered show={show} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Unmatch with {user.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to unmatch with {user.name}? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="outlined" sx={{marginRight: '0.5rem'}} onClick={handleCloseModal}>
            Nevermind
          </Button>
          <Button variant="contained" disableElevation onClick={unmatch}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>


      <Button
        color="white"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon fontSize="large" />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={viewProfile}>View Profile</MenuItem>
        <MenuItem onClick={handleShowModal}>Unmatch</MenuItem>
      </Menu>
    </div>
  );
}
