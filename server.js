require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log("failed to connect");
  });

const dataSchema = new mongoose.Schema({
  id: Number,
  first_name: String,
  last_name: String,
  email: String,
  gender: String,
  income: String,
  city: String,
  car: String,
  quote: String,
  phone_price: Number,
});

const Data = mongoose.model("Data", dataSchema);

app.get("/api/data", (req, res) => {
  Data.find()
    .exec()
    .then((data) => {
      const filteredData1 = data.filter(
        (Data) =>
          Number(Data.income.slice(1)) < 5 &&
          (Data.car === "BMW" || Data.car === "Mercedes-Benz")
      );
      const filteredData2 = data.filter(
        (Data) => Data.gender === "Male" && Data.phone_price > 10000
      );
      const filteredData3 = data.filter(
        (Data) =>
          Data.last_name.charAt(0) === "M" &&
          Data.quote.length > 15 &&
          Data.email.includes(Data.last_name.toLowerCase())
      );
      const filteredData4 = data.filter(
        (Data) =>
          (Data.car === "BMW" ||
            Data.car === "Mercedes-Benz" ||
            Data.car === "Audi") &&
          !/\d/.test(Data.email)
      );
      const userData = {};
      for (let user of data) {
        if (userData[user.city]) {
          userData[user.city].count++;
          userData[user.city].income += Number(user.income.slice(1));
        } else {
          userData[user.city] = {
            count: 1,
            income: Number(user.income.slice(1)),
          };
        }
      }
      const sortedData = Object.keys(userData).sort((a, b) => {
        if (userData[b].count === userData[a].count) {
          return (
            userData[b].income / userData[b].count -
            userData[a].income / userData[b].count
          );
        }
        return userData[b].count - userData[a].count;
      });

      const sortedCities = sortedData.slice(0, 10);

      const filteredData5 = [];

      for (let city of sortedCities) {
        const cityUsers = data.filter((Data) => Data.city === city);
        const sortedUsers = cityUsers.sort(
          (a, b) => Number(b.income.slice(1)) - Number(a.income.slice(1))
        );
        for (let i in sortedUsers) {
          filteredData5.push(sortedUsers[i]);
        }
      }

      res.json([
        filteredData1,
        filteredData2,
        filteredData3,
        filteredData4,
        filteredData5,
      ]);
    })
    .catch((err) => {
      console.error("Error fetching data from database: " + err.stack);
      return res
        .status(500)
        .json({ error: "Failed to fetch data from database" });
    });
});

app.get("/api/view", (req, res) => {
  Data.find({ id: 1 })
    .exec()
    .then((data) => {
      console.log("Get id: 1");
      res.json(data);
    })
    .catch((err) => {
      console.error("Error fetching data from database: " + err.stack);
      return res
        .status(500)
        .json({ error: "Failed to fetch data from database" });
    });
});

app.get("/api/users", function (req, res) {
  const users = [
    { id: 1, first_name: "John", last_name: "Doe" },
    { id: 2, first_name: "Jane", last_name: "Carter" },
    { id: 3, first_name: "Bob", last_name: "Pitt" },
  ];
  res.json(users);
});

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});
