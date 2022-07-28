import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const posts = {};

const handleEvents = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, commentStatus } = data;

    const post = posts[postId];
    post.comments.push({ id, content, commentStatus });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, commentStatus } = data;
    const post = posts[postId];
    const comment = posts.comments.find((comment) => {
      return comment.id === id;
    });
    comment.commentStatus = commentStatus;
    comment.content = content;
  }
};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  handleEvents(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log(`Server on the running PORT http://localhost:${4002}`);
  try {
    const res = await axios.get("http://localhost:4005/events");

    for (let event of res.data) {
      console.log("Processing event:", event.type);

      handleEvents(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});
