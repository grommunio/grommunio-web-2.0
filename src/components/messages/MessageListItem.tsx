import Hover from "../Hover";
import { withStyles } from "@mui/styles";
import { Avatar, Checkbox, IconButton, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { FlagOutlined, MailOutlineOutlined, PriorityHigh, PushPinOutlined } from "@mui/icons-material";
import { Message } from "microsoft-graph";
import { parseISODate } from "../../utils";
import CategoryChip from "./CategoryChip";
import { useTypeDispatch } from "../../store";
import { patchMessageData } from "../../actions/messages";
import { useAppContext } from "../../azure/AppContext";

const styles: any = {
  mailSender: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 220,
  },
  mailPreview: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 312,
  },
  mailSubjectContainer: {
    display: 'flex',
  },
  mailSubject: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 256,
  },
  mailDate: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  mailListItemTitle: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 30,
    justifyContent: 'space-between'
  },
}

type MessageListItemProps = {
  classes: any;
  message: Message;
  checkedMessages: Array<Message>;
  selectedMsg: Message | null;
  handleContextMenu: (a: Message) => (b: React.MouseEvent<HTMLElement>) => void;
  handleMailClick: (a: Message) => () => void;
  handleMailCheckbox: (a: Message) => (b: React.ChangeEvent<HTMLInputElement>) => void;
  pinnedMessages: Array<string>;
}

const MesssageListItem = ({ classes, checkedMessages, message, selectedMsg, handleContextMenu,
  handleMailClick, handleMailCheckbox, pinnedMessages }: MessageListItemProps) => {
  const app = useAppContext();
  const names = message.sender?.emailAddress?.name?.split(" ") || [" ", " "];
  const checked = checkedMessages.includes(message);
  const dispatch = useTypeDispatch();
  const isPinned = pinnedMessages.includes(message.id || ""); // useMemo doesn't work here

  const handleFlag = () => {
    dispatch(patchMessageData({
      app,
      message,
      specificProps: {
        flag: {
          // TODO: Add full followupFlag resource type
          flagStatus: message.flag?.flagStatus === "flagged" ? "notFlagged" : "flagged",
        }
      },
    }));
  };

  const handleSetUnread = () => {
    dispatch(patchMessageData({app, message, specificProps: { isRead: false }}));
  }

  const handlePin = () => {
    const copy = [...pinnedMessages];
    if(isPinned) {
      copy.splice(copy.findIndex((id: string) => id === message.id), 1);
    } else {
      copy.push(message.id || "")
    }
    localStorage.setItem("pinnedMsgs", JSON.stringify(copy));
  }
  
  return <Hover>
    {(hover: boolean) => <ListItemButton
      onContextMenu={handleContextMenu(message)}
      selected={checked || selectedMsg?.id === message.id}
      onClick={handleMailClick(message)}
    >
      {hover || checkedMessages.length > 0 ? <ListItemIcon>
        <Checkbox
          sx={{ p: 0.5 }}
          checked={checked}
          onChange={handleMailCheckbox(message)}
        />
      </ListItemIcon> : <ListItemAvatar>
        <Avatar sx={{ width: 32, height: 32 }}>
          <Typography variant='body2'>{names[0][0]}{names[names.length - 1][0]}</Typography>
        </Avatar>
      </ListItemAvatar>}
      <ListItemText
        primary={<>
          <div className={classes.mailSender}>
            {message.sender?.emailAddress?.name || message.sender?.emailAddress?.address || "Unknown sender"}
          </div>
          <div>
            <IconButton
              style={{ visibility: hover ? "visible" : "hidden" }}
              onClick={handleSetUnread}
              size='small'
              title="Mark as unread"
            >
              <MailOutlineOutlined fontSize='small'/>
            </IconButton>
            <IconButton
              style={{ visibility: (hover || message.flag?.flagStatus === "flagged") ? "visible" : "hidden" }}
              onClick={handleFlag}
              size='small'
              title="Flag this message"
            >
              <FlagOutlined fontSize='small' color={message.flag?.flagStatus === "flagged" ? "error" : "inherit"}/>
            </IconButton>
            <IconButton
              style={{ visibility: hover || isPinned ? "visible" : "hidden" }}
              onClick={handlePin}
              size='small'
              title="Pin this message"
            >
              <PushPinOutlined fontSize='small' color={isPinned ? "error" : "inherit"}/>
            </IconButton>
            {message.importance === "high" && <PriorityHigh color="error" fontSize='small' />}
          </div> 
        </>}
        secondary={<>
          <div className={classes.mailSubjectContainer}>
            <div className={classes.mailSubject}>
              <Typography style={{ fontWeight: message.isRead ? "normal" : "bold"}} variant='body2' color={message.isRead ? "white" : "primary"}>
              &gt; {message.subject}
              </Typography>
            </div>
            <div className={classes.mailDate}>
              <Typography variant='body2' color={message.isRead ? "white" : "primary"}>
                {parseISODate(message.receivedDateTime || "")}
              </Typography>
            </div>
          </div>
          <div className={classes.mailPreview}>{message.bodyPreview}</div>
          {message.categories?.map((cat: string, key: number) => <CategoryChip key={key} color={cat} />)}
        </>}
        primaryTypographyProps={{
          className: classes.mailListItemTitle,
        }}
        secondaryTypographyProps={{
          component: 'span',
        }}
      />
    </ListItemButton>}
  </Hover>;
}

export default withStyles(styles)(MesssageListItem);