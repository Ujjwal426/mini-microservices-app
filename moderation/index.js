import express from "express";
import axios from "axios";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  if (type === "CommentCreated") {
    const status = data.content.includes("orange") ? "rejected" : "approved";
    await axios.post(`http://localhost:4005/events`, {
      type: "CommentModerated",
      data: {
        id: data.id,
        postId: data.postId,
        commentStatus: status,
        content: data.content,
      },
    });
  }
  res.send({});
});

app.listen(4003, () => {
  console.log(`Server running on the PORT http://localhost:${4003}`);
});
