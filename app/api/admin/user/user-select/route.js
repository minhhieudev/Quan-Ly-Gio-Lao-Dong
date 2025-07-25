import User from "@models/User";
import { connectToDB } from "@mongodb";


// GET all users
export const GET = async (req, res) => {
  try {
    await connectToDB();

    const allUsers = await User.find({ role: { $ne: 'admin' } });

    return new Response(JSON.stringify(allUsers), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to get all users", { status: 500 });
  }
};
