import ConfirmActionDialog from "./ConfirmActionDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import type { message } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import * as React from "react";

interface MessageCardProps {
  deleteAllowed: boolean;
  message: message;
}

export default function MessageCard({
  deleteAllowed,
  message,
}: MessageCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const fetcher = useFetcher();

  const onConfirmDelete = () => {
    fetcher.submit(
      { _action: "delete", messageId: message.message_id.toString() },
      { method: "post" }
    );
    setIsOpen(false);
  };

  return (
    <fetcher.Form>
      <Card className="MessageCard" variant="elevation">
        {message.image_url ? (
          <CardMedia
            component="img"
            src={message.image_url}
            alt="message image"
          />
        ) : null}
        <CardContent className="MessageCard__content">
          <Typography color={message.color} fontFamily={message.font}>
            {message.text}
          </Typography>
        </CardContent>
        <CardActions className="MessageCard__actions">
          <Typography
            color={message.color}
            fontFamily={message.font}
            variant="caption"
          >
            <strong>{message.from}</strong>
          </Typography>
          {deleteAllowed ? (
            <IconButton size="small" onClick={() => setIsOpen(true)}>
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          ) : null}
        </CardActions>
        <ConfirmActionDialog
          actionName="Yes, delete this message"
          actionColorTheme="error"
          isOpen={isOpen}
          message={`Are you sure you want to delete the message from '${message.from}'?`}
          onClose={() => setIsOpen(false)}
          onConfirm={onConfirmDelete}
        />
      </Card>
    </fetcher.Form>
  );
}
