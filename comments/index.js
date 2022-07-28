import express from "express";
import { randomBytes } from "crypto";
import cors from "cors";
import axios from "axios";
import { type } from "os";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, commentStatus: "pending" });

  commentsByPostId[req.params.id] = comments;

  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      commentStatus: "pending",
    },
  });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  console.log("Event Received", req.body.type);

  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { postId, id, commentStatus, content } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => {
      return comment.id === id;
    });
    comment.commentStatus = commentStatus;

    await axios.post(`http://localhost:4005`, {
      type: "CommentUpdated",
      data: {
        id,
        commentStatus,
        postId,
        content,
      },
    });
  }
  res.send({});
});

app.listen(4001, () => {
  console.log(`Server on the running PORT http://localhost:${4001}`);
});
