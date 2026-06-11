// import mongoose from "mongoose";
// export const connectMongoDatabase = () => {
//   const DB = process.env.DATABASE.replace(
//     "<db_password>",
//     process.env.DATABASE_PASSWORD
//   );
//   mongoose
//     .connect(DB)
//     .then(() => console.log("DB connection successful"))
//     .catch((err) => console.log(err.message));
// };

// db.js
import mongoose from "mongoose";

export const connectMongoDatabase = async () => {
  const DB = process.env.DATABASE.replace(
    "<db_password>",
    process.env.DATABASE_PASSWORD
  );

  // Await the connection directly
  await mongoose.connect(DB);
  console.log("DB connection successful");
};
