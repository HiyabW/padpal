import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function LearnMore({ open, handleClose }) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        onSubmit: (event) => {
          event.preventDefault();
          handleClose();
        },
      }}
    >
      <DialogTitle>A Statement On PadPal</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
      >
        <DialogContentText>
          <i>PadPal</i> is a webapp prototype by Hiyab Woldegebriel -- while
          majority of the components are complete, there are some parts that are
          not (yet) fully functional. Padpal is not for commercial use.
          <br></br>
          <br></br>
          <b>The purpose of PadPal is to help individuals find a like minded
          roommate using a carefully crafted matching algorithm.</b> Currently, the
          only ways to find roommates are through facebook group or third party
          ios apps -- both of which lack a sleek user interface, user
          verification, and advanced filters. PapPal is a modern solution that
          addresses these shortcomings.
          <br></br>
          <br></br>
          I, Hiyab Woldegebriel, helped design the pages of PadPal, coded the
          frontend using React, set up the database, and built each API on the
          backend. This project was created and published to showcase my
          capabilities. Hope you like it! {":-)"}
          <br></br>
          <br></br>
          For any questions or feedback (or bug reports -- hopefully you wont
          run into any!), feel free to email me at{" "}
          <a
            href="mailto:heyabw@gmail.com"
            style={{ color: "#5081c7", textDecoration: "underline" }}
          >
            heyabw@gmail.com
          </a>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>Got It!</Button>
      </DialogActions>
    </Dialog>
  );
}
