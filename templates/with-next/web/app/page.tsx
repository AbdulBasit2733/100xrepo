import React from "react";
import { client } from "@repo/db/postgres";
import { connectDB } from "@repo/mongodb";

(async () => {
  await connectDB();
})();

const Main = async () => {
  const user = await client.user.findFirst();
  return (
    <div>
      {user?.username}W{user?.password}
    </div>
  );
};

export default Main;
