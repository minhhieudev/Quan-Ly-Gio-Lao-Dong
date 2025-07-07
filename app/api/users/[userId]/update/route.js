import User from "@models/User";
import { connectToDB } from "@mongodb";

export const POST = async (req, { params }) => {
  try {
    await connectToDB();

    const { userId } = params;
    const body = await req.json();
    const { username, profileImage } = body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          username,
          profileImage,
        }
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedUser) {
      return new Response("User not found", { status: 404 });
    }

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (err) {
    console.log('Error:', err);
    return new Response("Failed to update user", { status: 500 });
  }
};
