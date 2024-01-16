import { useEffect, useRef, useState } from "react";
import {
  DialogContent,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import LocationOn from "@mui/icons-material/LocationOn";
import Notes from "@mui/icons-material/Notes";
import Create from "@mui/icons-material/Create";
import "react-quill/dist/quill.snow.css";
import { withStyles } from '@mui/styles';
import { AccessTime, AccountCircle, Close } from "@mui/icons-material";
import { purify, toReadableTimeInTimezone } from "../../utils";
import { convertHtmlMailToDarkmode } from "../../htmlUtils";


const styles = theme => ({
  content: {
    overflow: 'hidden',
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
    margin: "8px 0",
  },
  icon: {
    marginRight: 16,
  },
  body: {
    display: 'flex',
    marginTop: 16,
  },
  datesContainer: {
    display: 'flex',
    marginTop: 8,
    marginBottom: 8,
  },
  flexEnd: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
  },
  iframeContainer: {
    flex: 1,
  },
  attendees: {
    backgroundColor: theme.palette.background.default,
  }
});

const AttendeeAppointmentForm = ({ classes, event: storeEvent, onClose }) => {
  const [event, setEvent] = useState({});
  const iframeRef = useRef(null);
  const theme = useTheme();
  const [iframeContent, setIframeContent] = useState("");

  useEffect(() => {
    const { id, startDate, endDate, subject, location, body, isAllDay, attendees } = storeEvent;
    setEvent({
      id: id.value,
      start: startDate,
      end: endDate,
      subject: subject,
      location: location.displayName,
      isAllDay: Boolean(isAllDay),
      attendees: attendees,
    });

    // Content
    const cur = iframeRef.current;
    if(cur) {
      let htmlMail = document.createElement('html');
      htmlMail.innerHTML = purify(body.content || "");

      // Convert emails styling to be properly displayed in darkmode
      if(theme.palette.mode == "dark") {
        htmlMail = convertHtmlMailToDarkmode(htmlMail);
      }
      setIframeContent(htmlMail.outerHTML);
    }
  }, [storeEvent]);

  const { start, end, subject, location, attendees } = event;
  return <DialogContent className={classes.content}>
    <div className={classes.flexRow}>
      <div className={classes.flexEnd}>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </div>
    </div>
    <Grid container>
      <div className={classes.iframeContainer}>
        <Typography variant="h5">Event details</Typography>
        <div className={classes.content}>
          <div className={classes.flexRow}>
            <Create className={classes.icon} color="action" />
            <Typography variant="h6">{subject}</Typography>
          </div>
          <div className={classes.flexRow}>
            <AccessTime className={classes.icon}/>
            <Typography>
              {toReadableTimeInTimezone(start)} - {toReadableTimeInTimezone(end)}
            </Typography>
          </div>
          {location && <div className={classes.flexRow}>
            <LocationOn className={classes.icon} color="action" />
            <Typography>{location}</Typography>
          </div>}
          <div className={classes.body}>
            <Notes className={classes.icon} color="action" />
            <div className={classes.iframeContainer}>
              <iframe
                id="iframe"
                ref={iframeRef}
                width="100%"
                style={{ border: "none" }}
                srcDoc={iframeContent}
              />
            </div>
          </div>
        </div>
      </div>
      {/* TODO: Implement proper scrolling div */}
      {attendees && <div className={classes.attendees}>
        <Typography variant="h5">Attendees</Typography>
        <List>
          {attendees.map(({ emailAddress }, key) => <ListItem
            disablePadding
            key={key}
          >
            <ListItemIcon>
              <AccountCircle/>
            </ListItemIcon>
            <ListItemText
              primary={emailAddress.name}
              secondary={emailAddress.address}
            />
          </ListItem>)}
        </List>
      </div>}
    </Grid>
  </DialogContent>
}

export default withStyles(styles)(AttendeeAppointmentForm);